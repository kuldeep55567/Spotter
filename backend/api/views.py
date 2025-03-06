from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import spotter_users
from .serializers import spotter_usersSerializer

class GetUserView(APIView):
    def get(self, request, user_id):
        try:
            user = spotter_users.objects.get(user_id=user_id)
            serializer = spotter_usersSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except spotter_users.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)