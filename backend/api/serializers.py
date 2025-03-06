from rest_framework import serializers
from .models import spotter_users

class spotter_usersSerializer(serializers.ModelSerializer):
    class Meta:
        model = spotter_users
        fields = ['user_id', 'username', 'email','password' ,'name', 'created_at', 'updated_at']