from rest_framework import serializers
from .models import spotter_users, Trip, DriverLog, Stop, DailyHOSSummary

class spotter_usersSerializer(serializers.ModelSerializer):
    class Meta:
        model = spotter_users
        fields = ['user_id', 'username', 'email', 'password', 'name', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class DriverLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'

class DriverLogCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLog
        fields = '__all__'
        read_only_fields = ['log_id', 'created_at']

class StopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stop
        fields = '__all__'

class DailyHOSSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyHOSSummary
        fields = '__all__'

class TripWithLogsSerializer(serializers.ModelSerializer):
    logs = serializers.SerializerMethodField()
    stops = serializers.SerializerMethodField()
    
    class Meta:
        model = Trip
        fields = '__all__'
    
    def get_logs(self, obj):
        logs = DriverLog.objects.filter(trip=obj).order_by('log_time')
        return DriverLogSerializer(logs, many=True).data
    
    def get_stops(self, obj):
        stops = Stop.objects.filter(trip=obj).order_by('stop_time')
        return StopSerializer(stops, many=True).data

class TripCreateSerializer(serializers.ModelSerializer):
    logs = DriverLogCreateSerializer(many=True, required=False)
    stops = StopSerializer(many=True, required=False)
    
    class Meta:
        model = Trip
        fields = '__all__'
    
    def create(self, validated_data):
        logs_data = validated_data.pop('logs', [])
        stops_data = validated_data.pop('stops', [])
        
        trip = Trip.objects.create(**validated_data)
        
        for log_data in logs_data:
            DriverLog.objects.create(trip=trip, user=trip.user, **log_data)
        
        for stop_data in stops_data:
            Stop.objects.create(trip=trip, user=trip.user, **stop_data)
        
        # Update daily HOS summary
        self._update_hos_summary(trip, logs_data)
        
        return trip
    
    def _update_hos_summary(self, trip, logs_data):
        from django.db.models import Sum
        from django.utils import timezone
        import datetime
        
        user = trip.user
        today = timezone.now().date()
        
        # Get or create today's summary
        summary, created = DailyHOSSummary.objects.get_or_create(
            user=user,
            log_date=today,
            defaults={
                'total_drive_time': 0,
                'total_duty_time': 0,
                'total_rest_time': 0,
                'available_drive_time': 11,
                'available_duty_time': 14
            }
        )
        
        # Calculate time spent in each status
        drive_time = trip.driving_time
        duty_time = trip.total_hos_used
        rest_time = trip.rest_time
        
        # Update summary
        summary.total_drive_time += drive_time
        summary.total_duty_time += duty_time
        summary.total_rest_time += rest_time
        summary.available_drive_time = max(0, 11 - summary.total_drive_time)
        summary.available_duty_time = max(0, 14 - summary.total_duty_time)
        summary.save()