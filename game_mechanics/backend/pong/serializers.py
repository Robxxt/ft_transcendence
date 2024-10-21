from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, GameRoom

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'games_played', 'games_won', 'state']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

# class GameRoomSerializer(serializers.ModelSerializer):
#     current_user = serializers.SerializerMethodField()
#     class Meta:
#         model = GameRoom
#         fields = ['id', 'player1', 'player2', 'state', 'current_user']
    
#     def get_current_user(self, obj):
#         request = self.context.get('request')
#         if request and hasattr(request, 'user'):
#             return {
#                 'id': request.user.id,
#                 'username': request.user.username,
#             }
#         return None

class GameRoomSerializer(serializers.ModelSerializer):
    current_user = serializers.SerializerMethodField()
    player_number = serializers.SerializerMethodField()

    class Meta:
        model = GameRoom
        fields = ['id', 'player1', 'player2', 'state', 'current_user', 'player_number']

    def get_current_user(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_profile = request.user.user_profile
            player_number = self.get_player_number(obj)
            return {
                'id': request.user.id,
                'username': request.user.username,
                'player_number': player_number
            }
        return None

    def get_player_number(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user_profile = request.user.user_profile
            if obj.player1 == user_profile:
                if obj.isAiPlay:
                    return 3
                else:
                    return 1
            elif obj.player2 == user_profile:
                return 2
        return None
