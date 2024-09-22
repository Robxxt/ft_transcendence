from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from backend_app.models import User, TableMatch, UserMetric
from backend_app.api.serializer import UserSerializer
from backend_app.api.serializer import RegisterSerializer, TableMatchSerializer, UserMetricSerializer
from rest_framework import viewsets

@api_view(['POST'])
def register(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'error': 0}, status=status.HTTP_201_CREATED)
        return Response({'error': 2, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


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
