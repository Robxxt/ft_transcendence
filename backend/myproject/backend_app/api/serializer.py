from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
<<<<<<< HEAD
from backend_app.models import User, TableMatch, UserMetric, GameRoom, TictacGame
from rest_framework.authtoken.models import Token
=======
from backend_app.models import User, TableMatch, UserMetric, GameRoom, TictacGame, PongGame
>>>>>>> Implemented the endpoint for gameHistory div

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class UserNameSerializer(serializers.ModelSerializer):
    isLoggedIn = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["username", "isLoggedIn"]
    
    def get_isLoggedIn(self, obj):
        return Token.objects.filter(user=obj).exists()

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

class ChangePasswordSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(required=True)
    newPassword = serializers.CharField(required=True, min_length=8, max_length=20)

    def validate(self, attrs):
        user = self.context['request'].user
        currentPassword = attrs['currentPassword']
        if not check_password(currentPassword, user.password):
            raise serializers.ValidationError({'message': 'your new password is the same', })
        return attrs

    def save(self):
        user = self.context['request'].user
        user.password = make_password(self.validated_data['newPassword'])
        user.save()
    
class WinLossSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['won', 'lost']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return {
            "wins": representation["won"],
            "losses": representation["lost"]
        }

class PongGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PongGame
        fields = ['score1', 'score2', 'winner', 'finished_at', 'room']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["date"] = instance.finished_at.date().isoformat()
        data["time"] = instance.finished_at.time().strftime('%H:%M')
        data.pop("finished_at")
        data["result"] = str(instance.score1) + ":" + str(instance.score2)
        data.pop("score1")
        data.pop("score2")
        data['player1'] = instance.room.player1.username
        data['player2'] = instance.room.player2.username
        data.pop('room')
        return data

class ChangeAvatarSerialzer(serializers.Serializer):
    avatar = serializers.ImageField(required=True)

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.save()
        return instance
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

class TictacGameSerializer(serializers.ModelSerializer):

    class Meta:
        model = TictacGame
        fields = '__all__'
