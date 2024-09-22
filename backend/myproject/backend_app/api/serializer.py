from rest_framework import serializers
from backend_app.models import User, TableMatch, UserMetric

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=20)

    class Meta:
        model = User
        fields = ['username', 'password']
    
    def validate_username(self, value):
        if not value.isalnum():
            raise serializers.ValidationError("Username must be alphanumeric.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def create(self, validate_data):
        user = User(
            username=validate_data['username'],
        )
        user.set_password(validate_data['password'])
        user.save()
        return user
    
class TableMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableMatch
        fields = '__all__'

class UserMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMetric
        fields = '__all__'
        