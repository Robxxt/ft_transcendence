from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from backend_app.models import User, TableMatch, UserMetric, GameRoom

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=20)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'won', 'lost']
        
    def create(self, validated_data):
        won = validated_data.get('won', 0)
        lost = validated_data.get('lost', 0)
        user = User(
            username=validated_data['username'],
            won=won,
            lost=lost,
        )
        user.password = make_password(validated_data['password'])
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

class GameRoomSerializer(serializers.ModelSerializer):
    current_user = serializers.SerializerMethodField()
    player_number = serializers.SerializerMethodField()

    class Meta:
        model = GameRoom
        fields = ['id', 'player1', 'player2', 'state', 'current_user', 'player_number']

    def get_current_user(self, obj):
        print(f"self.context: {self.context}")
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
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
            user_profile = request.user
            if obj.player1 == user_profile:
                if obj.isAiPlay:
                    return 3
                else:
                    return 1
            elif obj.player2 == user_profile:
                return 2
        return None

class ChangePasswordSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        print(f"=====ALLLLE\n {model} \n=====")
        fields = ['user', 'currentPassword', 'newPassword']
    

        