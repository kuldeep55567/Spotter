from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from django.db import IntegrityError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import spotter_users, Trip, DriverLog, Stop, DailyHOSSummary
from .serializers import (
    spotter_usersSerializer,
    TripSerializer,
    DriverLogSerializer,
    DailyHOSSummarySerializer,
    TripWithLogsSerializer,
    TripCreateSerializer,
    DriverLogCreateSerializer,
)
import json
import logging
import traceback
import re
from datetime import datetime

logger = logging.getLogger(__name__)


class GetUserView(APIView):
    def get(self, request, user_id):
        try:
            user = spotter_users.objects.get(user_id=user_id)
            serializer = spotter_usersSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class SignupView(APIView):
    def post(self, request):
        try:
            # Extract data from request
            data = request.data
            # Validate required fields
            required_fields = ["username", "email", "password", "name"]
            for field in required_fields:
                if not data.get(field):
                    return Response(
                        {"error": f"{field} is required"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Validate email format
            try:
                validate_email(data["email"])
            except ValidationError:
                return Response(
                    {"error": "Invalid email format"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if username or email already exists
            if spotter_users.objects.filter(username=data["username"]).exists():
                return Response(
                    {"error": "Username already exists"},
                    status=status.HTTP_409_CONFLICT,
                )

            if spotter_users.objects.filter(email=data["email"]).exists():
                return Response(
                    {"error": "Email already exists"}, status=status.HTTP_409_CONFLICT
                )

            # Validate password strength
            if len(data["password"]) < 8:
                return Response(
                    {"error": "Password must be at least 8 characters long"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Password strength regex (at least one uppercase, one lowercase, one digit)
            password_pattern = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")
            if not password_pattern.match(data["password"]):
                return Response(
                    {
                        "error": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Create new user
            current_time = datetime.now()
            new_user = spotter_users(
                username=data["username"],
                email=data["email"],
                password=make_password(data["password"]),  # Hash the password
                name=data["name"],
                created_at=current_time,
                updated_at=current_time,
            )
            new_user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(new_user)
            tokens = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }

            # Prepare response
            serializer = spotter_usersSerializer(new_user)
            response_data = {
                "user": serializer.data,
                "tokens": tokens,
                "message": "User registered successfully",
            }

            # Remove password from response
            if "password" in response_data["user"]:
                del response_data["user"]["password"]

            return Response(response_data, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            logger.error(f"Database integrity error: {str(e)}")
            return Response(
                {"error": "An error occurred while creating the user"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            logger.error(f"Signup error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    def post(self, request):
        try:
            # Extract credentials
            data = request.data

            # Validate required fields
            if not data.get("username") and not data.get("email"):
                return Response(
                    {"error": "Either username or email is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not data.get("password"):
                return Response(
                    {"error": "Password is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Find user by username or email
            try:
                if data.get("username"):
                    user = spotter_users.objects.get(username=data["username"])
                else:
                    user = spotter_users.objects.get(email=data["email"])
            except spotter_users.DoesNotExist:
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            # Verify password
            if not check_password(data["password"], user.password):
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Update last login time
            user.updated_at = datetime.now()
            user.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }

            # Prepare response
            serializer = spotter_usersSerializer(user)
            response_data = {
                "user": serializer.data,
                "tokens": tokens,
                "message": "Login successful",
            }

            # Remove password from response
            if "password" in response_data["user"]:
                del response_data["user"]["password"]

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TripListCreateView(APIView):
    def get(self, request, user_id):
        try:
            # Verify user exists
            user = spotter_users.objects.get(user_id=user_id)

            # Get query parameters
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")

            # Filter trips by date range if provided
            trips = Trip.objects.filter(user=user).order_by("-start_time")

            if start_date:
                try:
                    start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
                    trips = trips.filter(start_time__gte=start_datetime)
                except ValueError:
                    return Response(
                        {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            if end_date:
                try:
                    end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                    # Add one day to include the end date
                    end_datetime = end_datetime + timedelta(days=1)
                    trips = trips.filter(start_time__lt=end_datetime)
                except ValueError:
                    return Response(
                        {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = TripSerializer(trips, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, user_id):
        try:
            # Verify user exists
            user = spotter_users.objects.get(user_id=user_id)

            # Add user to data
            data = request.data
            data["user"] = user_id

            serializer = TripCreateSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class TripDetailView(APIView):
    def get(self, request, trip_id):
        try:
            trip = Trip.objects.get(trip_id=trip_id)
            serializer = TripWithLogsSerializer(trip)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DriverLogCreateBulkView(APIView):
    def post(self, request, trip_id):
        try:
            # Log the raw request data for debugging
            logger.info(
                f"Raw request data for trip {trip_id}: {request.body.decode('utf-8')}"
            )

            # Get the trip
            try:
                trip = Trip.objects.get(trip_id=trip_id)
            except Trip.DoesNotExist:
                logger.error(f"Trip with ID {trip_id} not found")
                return Response(
                    {"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND
                )

            # Extract logs data from request
            try:
                # Try to parse the data - handle both JSON string and direct data
                if hasattr(request, "data"):
                    logs_data = request.data
                else:
                    logs_data = json.loads(request.body.decode("utf-8"))
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}")
                return Response(
                    {"error": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Validate it's a list
            if not isinstance(logs_data, list):
                logger.error(f"Expected a list of logs, got: {type(logs_data)}")
                return Response(
                    {"error": f"Expected a list of logs, got: {type(logs_data)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info(f"Processing {len(logs_data)} logs for trip {trip_id}")

            created_logs = []
            errors = []

            # Process each log entry
            for i, log_data in enumerate(logs_data):
                try:
                    # Ensure log_data is a dictionary
                    if not isinstance(log_data, dict):
                        errors.append(
                            {
                                "index": i,
                                "error": f"Expected a dictionary, got {type(log_data)}",
                            }
                        )
                        continue

                    # Add required fields
                    log_data["trip"] = trip_id
                    log_data["user"] = trip.user.user_id

                    # Handle optional fields - ensure they exist with appropriate defaults
                    if "latitude" not in log_data or log_data["latitude"] is None:
                        log_data["latitude"] = None
                    if "longitude" not in log_data or log_data["longitude"] is None:
                        log_data["longitude"] = None
                    if (
                        "miles_remaining" not in log_data
                        or log_data["miles_remaining"] is None
                    ):
                        log_data["miles_remaining"] = None

                    # Log the processed data
                    logger.info(f"Processing log entry {i}: {log_data}")

                    serializer = DriverLogCreateSerializer(data=log_data)
                    if serializer.is_valid():
                        log = serializer.save()
                        created_logs.append(DriverLogSerializer(log).data)
                    else:
                        error_detail = {
                            "index": i,
                            "data": log_data,
                            "errors": serializer.errors,
                        }
                        logger.error(f"Validation error for log {i}: {error_detail}")
                        errors.append(error_detail)
                except Exception as e:
                    logger.error(f"Error processing log {i}: {str(e)}")
                    logger.error(traceback.format_exc())
                    errors.append({"index": i, "error": str(e)})

            # If we have errors but also created some logs, continue
            if errors and created_logs:
                logger.warning(
                    f"Created {len(created_logs)} logs with {len(errors)} errors"
                )
                self._update_hos_summary(trip)
                return Response(
                    {"created": created_logs, "errors": errors},
                    status=status.HTTP_207_MULTI_STATUS,
                )

            # If we have only errors, return a 400
            elif errors:
                logger.error(f"Failed to create any logs, {len(errors)} errors")
                return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

            # If everything succeeded
            logger.info(f"Successfully created {len(created_logs)} logs")
            self._update_hos_summary(trip)
            return Response(created_logs, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": f"Server error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _update_hos_summary(self, trip):
        try:
            from django.db.models import Sum

            user = trip.user
            logs = DriverLog.objects.filter(trip=trip)

            # Group logs by date
            log_dates = logs.values_list("log_time__date", flat=True).distinct()
            logger.info(
                f"Updating HOS summary for trip {trip.trip_id}, {len(log_dates)} dates"
            )

            for log_date in log_dates:
                # Calculate time spent in each status for this date
                day_logs = logs.filter(log_time__date=log_date)

                drive_logs = day_logs.filter(status="Driving")
                drive_time = 0
                for log in drive_logs:
                    # Extract minutes from description
                    import re

                    match = re.search(r"Driving for (\d+) minutes", log.description)
                    if match:
                        drive_time += int(match.group(1)) / 60  # Convert to hours

                rest_logs = day_logs.filter(Q(status="Resting") | Q(status="Off Duty"))
                rest_time = 0
                for log in rest_logs:
                    if "Resting" in log.status:
                        rest_time += 0.5  # 30 minutes
                    elif "10-hour" in log.description:
                        rest_time += 10
                    elif "34-hour" in log.description:
                        rest_time += 34

                duty_time = (
                    drive_time
                    + len(day_logs.filter(status="Pickup"))
                    + len(day_logs.filter(status="Dropoff"))
                )

                # Get or create summary for this date
                summary, created = DailyHOSSummary.objects.get_or_create(
                    user=user,
                    log_date=log_date,
                    defaults={
                        "total_drive_time": 0,
                        "total_duty_time": 0,
                        "total_rest_time": 0,
                        "available_drive_time": 11,
                        "available_duty_time": 14,
                    },
                )

                # Update summary
                summary.total_drive_time += drive_time
                summary.total_duty_time += duty_time
                summary.total_rest_time += rest_time
                summary.available_drive_time = max(0, 11 - summary.total_drive_time)
                summary.available_duty_time = max(0, 14 - summary.total_duty_time)
                summary.save()

                logger.info(
                    f"Updated HOS summary for {log_date}: drive={drive_time:.2f}h, duty={duty_time:.2f}h, rest={rest_time:.2f}h"
                )
        except Exception as e:
            logger.error(f"Error updating HOS summary: {str(e)}")
            logger.error(traceback.format_exc())
            # Continue execution even if HOS update fails


class UserLogsView(APIView):
    def get(self, request, user_id):
        try:
            user = spotter_users.objects.get(user_id=user_id)

            # Get query parameters
            date = request.query_params.get("date")
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")

            logs = DriverLog.objects.filter(user=user).order_by("-created_at")

            # Filter by specific date or date range
            if date:
                try:
                    date_obj = datetime.strptime(date, "%Y-%m-%d").date()
                    logs = logs.filter(log_time__date=date_obj)
                except ValueError:
                    return Response(
                        {"error": "Invalid date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            elif start_date:
                try:
                    start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
                    logs = logs.filter(log_time__gte=start_datetime)

                    if end_date:
                        try:
                            end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
                            # Add one day to include the end date
                            end_datetime = end_datetime + timedelta(days=1)
                            logs = logs.filter(log_time__lt=end_datetime)
                        except ValueError:
                            return Response(
                                {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                except ValueError:
                    return Response(
                        {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = DriverLogSerializer(logs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

class UserHOSSummaryView(APIView):
    def get(self, request, user_id):
        try:
            user = spotter_users.objects.get(user_id=user_id)

            # Get query parameters
            date = request.query_params.get("date")
            start_date = request.query_params.get("start_date")
            end_date = request.query_params.get("end_date")

            summaries = DailyHOSSummary.objects.filter(user=user).order_by("-log_date")

            if date:
                try:
                    date_obj = datetime.strptime(date, "%Y-%m-%d").date()
                    summaries = summaries.filter(log_date=date_obj)
                except ValueError:
                    return Response(
                        {"error": "Invalid date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            elif start_date:
                try:
                    start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
                    summaries = summaries.filter(log_date__gte=start_date_obj)

                    if end_date:
                        try:
                            end_date_obj = datetime.strptime(
                                end_date, "%Y-%m-%d"
                            ).date()
                            summaries = summaries.filter(log_date__lte=end_date_obj)
                        except ValueError:
                            return Response(
                                {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                except ValueError:
                    return Response(
                        {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            serializer = DailyHOSSummarySerializer(summaries, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )


class UpdateHOSView(APIView):
    def post(self, request, user_id):
        try:
            user = spotter_users.objects.get(user_id=user_id)

            date = request.data.get("date")
            if not date:
                return Response(
                    {"error": "Date is required"}, status=status.HTTP_400_BAD_REQUEST
                )

            try:
                date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            hos_data = {"user": user_id, "log_date": date_obj}

            for field in [
                "total_drive_time",
                "total_duty_time",
                "total_rest_time",
                "available_drive_time",
                "available_duty_time",
            ]:
                if field in request.data:
                    hos_data[field] = request.data[field]

            summary, created = DailyHOSSummary.objects.update_or_create(
                user=user, log_date=date_obj, defaults=hos_data
            )

            serializer = DailyHOSSummarySerializer(summary)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except spotter_users.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )
