from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from backend_app.models import User, TableMatch, UserMetric, GameRoom, TictacGame, PongGame
from backend_app.api.serializer import (RegisterSerializer, 
                                        TableMatchSerializer, 
                                        UserMetricSerializer, 
                                        UserSerializer, 
                                        GameRoomSerializer, 
                                        ChangePasswordSerializer,
                                        ChangeAvatarSerialzer,
                                        WinLossSerializer,
                                        TictacGameSerializer,
                                        PongGameSerializer)

from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
import json

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"User created: {user}, ID: {user.id}")
            token = Token.objects.create(user=user)
            return Response({'token': 0, 'token': token.key}, status=status.HTTP_201_CREATED)
        return Response({'error': 2, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({"detail": "Not Found!"}, status=status.HTTP_401_UNAUTHORIZED)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    print(f"User exist: {user}, ID: {user.id}")
    return Response({"token": token.key, "user": serializer.data})

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def logout(request):
    try:
        token = Token.objects.get(user=request.user)
        print(request.user, token)
        token.delete()
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({"detail": "Token not found."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def changePassword(request):
    serializer = ChangePasswordSerializer(data=request.data, context={'request' : request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message' : 'Password has been changed'}, status=status.HTTP_200_OK)
    print("Validation errors:", serializer.errors)
    return Response({'error': 2, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def changeAvatar(request):
    user = request.user
    serializer = ChangeAvatarSerialzer(data=request.data)
    if serializer.is_valid():
        serializer.update(user, serializer.validated_data)
        return Response({'message:' 'Avatar Updated'}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def winLossRecord(request):
    user = request.user
    serializer = WinLossSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def gameList(request):
    user = request.user
    queryset = PongGame.objects.all()
    serializer = PongGameSerializer(queryset, many=True)
    print(serializer.data)
    return Response(serializer.data, status=status.HTTP_200_OK)

class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Corrected attribute name

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class TableMatchViewSet(viewsets.ModelViewSet):
    queryset = TableMatch.objects.all()
    serializer_class = TableMatchSerializer

class UserMetricViewSet(viewsets.ModelViewSet):
    queryset = UserMetric.objects.all()
    serializer_class = UserMetricSerializer

class GameRoomView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]
    def post(self, request):
        try:
            aiPlay = request.data["aiPlay"]
            # username = request.data["username"]
            username = get_object_or_404(User, username=request.data['username'])
            if username is None:
                return Response({"error": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = get_object_or_404(User, username=username)

            if not aiPlay:
                room = GameRoom.objects.filter(state=GameRoom.State.WAITING).first()
            else:
                room = None

            if not room:
                room = GameRoom.objects.create(player1=user)
            elif not room.player2 and not aiPlay:
                room.player2 = user
                room.state = GameRoom.State.FULL

            if aiPlay:
                ai_user = User.objects.get(username='game_ai')
                room.player2 = ai_user
                room.isAiPlay = True
                room.state = GameRoom.State.FULL

            room.save()
            serializer = GameRoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, room_id):
        try:
            room = GameRoom.objects.get(id=room_id)
            serializer = GameRoomSerializer(room, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GameRoom.DoesNotExist:
            return Response({'error': 'Game room not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def save_tictac_result(request):

    try:
        data = json.loads(request.body)

        player1 = data.get('player1')
        print("player1 in tictac: ", player1)
        player2 = data.get('player2')
        winner = data.get('winner')
        is_draw = data.get('is_draw')

        user = get_object_or_404(User, username=player1)
        print("user in tictac: ", user)

        game = TictacGame.objects.create(player1=user)

        if is_draw:
            game.is_draw = is_draw
        else:
            game.winner = winner
            if player2:
                game.player2 = player2
        game.save()
        game_serializer = TictacGameSerializer(game)
        return Response({'status': 'success', 'data': game_serializer.data}, status=status.HTTP_200_OK)

    except json.JSONDecodeError:
        return Response({'status': 'error', 'message': 'Invalid JSON format'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
