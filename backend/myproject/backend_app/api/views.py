from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authtoken.models import Token
from django.contrib.auth import logout
from django.utils.dateparse import parse_datetime
from django.http import JsonResponse
from backend_app.models import (User, 
                                TableMatch, 
                                UserMetric, 
                                GameRoom, 
                                TictacGame, PongGame, Tournament)
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
                                        TournamentCreateSerializer,
                                        TournamentListSerializer,
                                        PlayerAddSerializer)

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
    print(request.data)
    serializer = UserDisplayNameSetSerializer(instance=user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(status.HTTP_409_CONFLICT)

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
    queryset = PongGame.objects.filter(room__player1=user) | PongGame.objects.filter(room__player2=user)
    serializer = PongGameSerializer(queryset, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

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

class TournamentCreateView(generics.CreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentCreateSerializer


    def create(self, request, *args, **kwargs):
        player_name = request.data.get('player_name')
        if not player_name:
            raise ValidationError({"detail": "Player name is required to create a tournament."})

        try:
            user = User.objects.get(username=player_name)
        except User.DoesNotExist:
            raise ValidationError({"detail": "User not found."})
        
        tournament_name = request.data.get('tournament_name')
        if Tournament.objects.filter(
                tournament_name=tournament_name,
                state__in=[Tournament.State.WAITING, Tournament.State.FULL]
            ).exists():
            # Return a custom error message and a 409 Conflict status
            return Response({"detail": "A tournament with this name already exists and is not finished."}, status=status.HTTP_409_CONFLICT)


        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(player1=user)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TournamentListView(generics.ListAPIView):
    queryset = Tournament.objects.exclude(state=Tournament.State.FINISHED).order_by('-created_at')
    serializer_class = TournamentListSerializer



class TournamentAddPlayerView(generics.GenericAPIView):
    serializer_class = PlayerAddSerializer

    def post(self, request, tournament_id, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        try:
            tournament = Tournament.objects.get(id=tournament_id, state=Tournament.State.WAITING)
        except Tournament.DoesNotExist:
            raise ValidationError({"detail": "Tournament not found or it is not in a waiting state."})

        # Check if the user is already part of the tournament
        if user == tournament.player1 or user == tournament.player2 or user == tournament.player3 or user == tournament.player4:
            raise ValidationError({"detail": "Player is already part of the tournament."})

        # Add player to the tournament
        if not tournament.player2:
            tournament.player2 = user
        elif not tournament.player3:
            tournament.player3 = user
        elif not tournament.player4:
            tournament.player4 = user
        else:
            raise ValidationError({"detail": "Tournament is already full."})

        tournament.save()

        return Response({"detail": f"Player {user.username} has been added to the tournament '{tournament.tournament_name}'."},
                        status=status.HTTP_200_OK)

class PongGameDetailView(generics.RetrieveAPIView):
    serializer_class = PongGameSerializer

    def get_object(self):
        room_id = self.kwargs.get('room_id')
        return get_object_or_404(PongGame, room__id=room_id)

class CheckGameStateView(APIView):

    def post(self, request):
        # Extract data from the request
        tournament_id = request.data.get('tournament_id')
        player_name = request.data.get('player_name')

        # Validate input data
        if not tournament_id or not player_name:
            return Response({"error": "tournament_id and player_name are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the tournament instance
        tournament = get_object_or_404(Tournament, id=tournament_id)

        # Determine which game to check based on player_name
        if player_name == tournament.player1.username or player_name == tournament.player2.username:
            game_room = tournament.game1
        elif player_name == tournament.player3.username or player_name == tournament.player4.username:
            game_room = tournament.game2
        else:
            return Response({"error": "Player not part of this tournament."}, status=status.HTTP_400_BAD_REQUEST)

        # Check the state of the game room
        if not game_room:
            return Response({"error": "Game room does not exist."}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Check if a PongGame exists for the game room
            pong_game = PongGame.objects.get(room=game_room)
            if pong_game.winner is None:
                # PongGame exists but has no winner
                return Response({"game_room_id": game_room.id}, status=status.HTTP_200_OK)

        except PongGame.DoesNotExist:
            # PongGame does not exist; return game room ID
            return Response({"game_room_id": game_room.id}, status=status.HTTP_200_OK)

        # Default response (placeholder for future logic)
        return Response({"message": "Winner already exists. Logic will be implemented later."}, status=status.HTTP_200_OK)

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