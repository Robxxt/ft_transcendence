from rest_framework import generics
from backend_app.models import User
from backend_app.api.serializer import UserSerializer  # Corrected import

class UserListCreate(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Corrected attribute name

class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer 
