from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.utils.dateparse import parse_datetime
from django.http import JsonResponse
from django.db import transaction
from backend_app.models import (User, 
                                TableMatch, 
                                UserMetric, 
                                GameRoom, 
                                TictacGame, PongGame)
from backend_app.api.serializer import (RegisterSerializer,
                                        TableMatchSerializer,
                                        UserMetricSerializer,
                                        UserSerializer,
                                        GameRoomSerializer,
                                        ChangePasswordSerializer,
                                        ChangeAvatarSerialzer,
                                        WinLossSerializer,
                                        TictacGameSerializer,
                                        UserNameSerializer,
                                        PongGameSerializer,
                                        UserDisplayNameGetSerializer,
                                        UserDisplayNameSetSerializer,
                                        TictacGameResultSerializer)

from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
import json
from django.http import FileResponse, Http404
import os
from django.conf import settings
from django.utils.decorators import method_decorator

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            print(f"User created: {user}, ID: {user.id}")
            token = Token.objects.create(user=user)
            return Response({'error': 0, 'token': token.key}, status=status.HTTP_201_CREATED)
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def logout_user(request):
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
        logout(request)
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
        return Response(status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
def getDisplayName(request):
    foreign_username = request.query_params.get('foreignusername', None)
    if foreign_username:
        try:
            user = User.objects.get(username=foreign_username)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        user = request.user
    
    serializer = UserDisplayNameGetSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def setDisplayName(request):
    user = request.user
    if request.data["newDisplayName"] == user.username:
        return Response(status=status.HTTP_200_OK)
    serializer = UserDisplayNameSetSerializer(instance=user, data=request.data, partial=True, context={'request' : request})
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status=status.HTTP_409_CONFLICT)

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
def userList(request):
    users = User.objects.filter(is_staff=False, is_superuser=False)
    serializer = UserNameSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def friendList(request):
    user = request.user
    friends = user.friends.all()
    serializer = UserNameSerializer(friends, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def addFriend(request):
    user1 = request.user
    friend = request.data.get("friend")
    try:
        user2 = User.objects.get(username=friend)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    user1.friends.add(user2)
    return Response({"detail": "test"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def removeFriend(request):
    user = request.user
    friend = request.data.get("friend")
    try:
        user_friend = User.objects.get(username=friend)
        user.friends.remove(user_friend)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def gameList(request):
    user = request.user
    queryset_pong = PongGame.objects.filter(room__player1=user) | PongGame.objects.filter(room__player2=user)
    serializer_pong = PongGameSerializer(queryset_pong, many=True)
    queryset_tictactoe = TictacGame.objects.filter(player1=user)
    serializer_tictactoe = TictacGameResultSerializer(queryset_tictactoe, many=True)
    return Response(serializer_pong.data + serializer_tictactoe.data, status=status.HTTP_200_OK)

class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

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
        player2 = data.get('player2')
        winner = data.get('winner')
        is_draw = data.get('is_draw')

        user = get_object_or_404(User, username=player1)

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


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
def getPng(request):
    user_id = request.user.id  # Adjust according to how the user ID is retrieved
    avatar_path = os.path.join(settings.MEDIA_ROOT, "avatar", f"{user_id}.png")
    default_avatar_path = os.path.join(settings.MEDIA_ROOT, "avatar", "default.png")

    if os.path.exists(avatar_path):
        file_path = avatar_path
    elif os.path.exists(default_avatar_path):
        file_path = default_avatar_path
    else:
        raise Http404("Avatar not found")
    return FileResponse(open(file_path, 'rb'), content_type='image/png')


class PongGameDetailView(generics.RetrieveAPIView):
    serializer_class = PongGameSerializer

    def get_object(self):
        room_id = self.kwargs.get('room_id')
        return get_object_or_404(PongGame, room__id=room_id)

@csrf_exempt
def save_local_game(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Get required data from request
        challenger_name = data.get('challenger_name')
        opponent_name = data.get('opponent_name')
        winner_name = data.get('winner_name')
        challenger_score = data.get('challenger_score')
        opponent_score = data.get('opponent_score')
        timestamp_created = parse_datetime(data.get('timestamp_created'))
        timestamp_finish = parse_datetime(data.get('timestamp_finish'))

        # Validate required fields
        if not all([challenger_name, opponent_name, winner_name, 
                   challenger_score is not None, opponent_score is not None,
                   timestamp_created, timestamp_finish]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Get User objects
        try:
            challenger = User.objects.get(username=challenger_name)
            opponent = User.objects.get(username=opponent_name)
        except User.DoesNotExist:
            return JsonResponse({'error': 'One or both users not found'}, status=404)

        # Create GameRoom
        game_room = GameRoom.objects.create(
            player1=challenger,
            player2=opponent,
            state=GameRoom.State.FULL,
            created_at=timestamp_created,
            started_at=timestamp_created,
            finished_at=timestamp_finish,
            isAiPlay=False
        )

        # Create PongGame
        pong_game = PongGame.objects.create(
            room=game_room,
            score1=challenger_score,
            score2=opponent_score,
            is_active=False,
            game_state=PongGame.State.FINISHED,
            winner=winner_name,
            created_at=timestamp_created,
            started_at=timestamp_created,
            finished_at=timestamp_finish
        )

        return JsonResponse({
            'success': True,
            'game_room_id': game_room.id,
            'pong_game_id': pong_game.id
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def update_win_loss(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        winner_name = data.get('winner_name')
        loser_name = data.get('loser_name')

        # Validate required fields
        if not all([winner_name, loser_name]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Update both users atomically
        with transaction.atomic():
            try:
                winner = User.objects.select_for_update().get(username=winner_name)
                loser = User.objects.select_for_update().get(username=loser_name)
                
                winner.won += 1
                loser.lost += 1
                
                winner.save()
                loser.save()

            except User.DoesNotExist:
                return JsonResponse({'error': 'One or both users not found'}, status=404)

        return JsonResponse({
            'success': True,
            'winner_stats': {'won': winner.won},
            'loser_stats': {'lost': loser.lost}
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)