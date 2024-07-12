from rest_framework import serializers
from user_auth.models import User 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'