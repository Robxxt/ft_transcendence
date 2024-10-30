from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token
from backend_app.models import User, TableMatch, UserMetric, GameRoom
from backend_app.api.serializer import RegisterSerializer, TableMatchSerializer, UserMetricSerializer, UserSerializer, GameRoomSerializer, WinLossSerializer
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework import status

@api_view(['GET'])
def win_loss_record(request):
    username = request.query_params.get('username', None)
    
    if not username:
        return Response({"error": "Username query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = WinLossSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

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
