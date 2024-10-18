from django.shortcuts import render
from .models import PongGame, UserProfile, GameRoom
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .serializers import LoginSerializer, UserSerializer, UserProfileSerializer, GameRoomSerializer
from django.contrib.auth.models import User

# Create your views here.
def pong_view(request):
    context = {
        'game': PongGame.objects.first(),
    }
    return render(request, 'pong/pong_gameplay/gameplay.html', context)

def start_view(request):
    context = {
        'game': PongGame.objects.first(),
    }
    return render(request, 'pong/base.html', context)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            UserProfile.objects.create(user=user)
            token, created = Token.objects.get_or_create(user=user)
            user.user_profile.state = UserProfile.State.ONLINE
            user.user_profile.save()
            return Response({
                'token': token.key,
                'username': user.username,
                'profile': UserProfileSerializer(user.user_profile).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(username=serializer.validated_data['username'],
                                password=serializer.validated_data['password'])
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                user.user_profile.state = UserProfile.State.ONLINE
                user.user_profile.save()
                return Response({
                    'token': token.key,
                    'username': user.username,
                    'profile': UserProfileSerializer(user.user_profile).data
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        print(f"Logout request from user: {request.user}, Token: {request.auth}")
        user = request.user
        user.user_profile.state = UserProfile.State.OFFLINE
        user.user_profile.save()
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

class GameRoomView(APIView):
    def post(self, request):
        # Set var for aiPlay
        aiPlay = request.data["aiPlay"]

        # Find an available room, or create a new one if none exists
        if not aiPlay:
            room = GameRoom.objects.filter(state=GameRoom.State.WAITING).first()
        else:
            room = None
        
        if not room:
            room = GameRoom.objects.create(player1=request.user.user_profile)
        elif not room.player2 and not aiPlay:
            room.player2 = request.user.user_profile
            room.state = GameRoom.State.FULL

        # Set second player as AI
        if aiPlay:
            ai_user = User.objects.get(username='game_ai')
            room.player2 = UserProfile.objects.get(user=ai_user)
            room.isAiPlay = True
            room.state = GameRoom.State.FULL

        try:
            room.save()  # This triggers validation, including the clean() method
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        print(f"Room: {room}")
        # Use the serializer to return the room data
        serializer = GameRoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get(self, request, room_id):
        try:
            room = GameRoom.objects.get(id=room_id)
            # Use the serializer to return the room data
            serializer = GameRoomSerializer(room, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GameRoom.DoesNotExist:
            return Response({'error': 'Game room not found'}, status=status.HTTP_404_NOT_FOUND)


