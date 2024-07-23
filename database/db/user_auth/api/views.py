from rest_framework import generics
from user_auth.models import User
from user_auth.api.serializer import UserSerializer  # Corrected import

class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Corrected attribute name

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer 
