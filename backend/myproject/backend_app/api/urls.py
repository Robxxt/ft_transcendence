from django.urls import path, include
from backend_app.api import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'matches', views.TableMatchViewSet)
router.register(r'usermetrics', views.UserMetricViewSet)

urlpatterns = [
    path('users/', views.UserListCreate.as_view(), name='userListCreate'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='userDetail'),
	  path('login/', views.login, name="login"),
    path('register/', views.register, name='register'),
    path('join-game-room/', views.GameRoomView.as_view(), name='game_room'),
    path('game-room/<int:room_id>/', views.GameRoomView.as_view(), name='get_game_room'),
    path('', include(router.urls)),
    path('changePassword/<int:pk>/', views.ChangePasswordViewSet.as_view(), name='change_password'),

]