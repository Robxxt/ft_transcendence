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
	path('logout_user/', views.logout_user, name="logout_user"),
    path('register/', views.register, name='register'),
    path('gameList/', views.gameList, name='gameList'),
    path('getDisplayName/', views.getDisplayName, name='getDisplayName'),
    path('setDisplayName/', views.setDisplayName, name='setDisplayName'),
    path('join-game-room/', views.GameRoomView.as_view(), name='game_room'),
    path('game-room/<int:room_id>/', views.GameRoomView.as_view(), name='get_game_room'),
    path('changePassword/', views.changePassword, name='changePassword'),
    path('changeAvatar/', views.changeAvatar, name='changeAvatar'),
    path('getPng/', views.getPng, name='getPng'),
    path('winLossRecord/', views.winLossRecord, name='winLossRecord'),
    path('userList/', views.userList, name='userList'),
    path('friendList/', views.friendList, name='friendList'),
    path('addFriend/', views.addFriend, name='addFriend'),
    path('removeFriend/', views.removeFriend, name='removeFriend'),
	path('tictac/save-result/', views.save_tictac_result, name='save_tictac_result'),
    path('tournaments/', views.TournamentListView.as_view(), name='tournament-list'),
    path('', include(router.urls))
]