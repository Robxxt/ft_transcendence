from django.urls import path
from backend_app.api import views

urlpatterns = [
    path('users/', views.UserListCreate.as_view(), name='userListCreate'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='userDetail'),
]