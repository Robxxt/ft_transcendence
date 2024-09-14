from django.urls import path, include
from backend_app.api import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'matches', views.TableMatchViewSet)
router.register(r'usermetrics', views.UserMetricViewSet)

urlpatterns = [
    path('users/', views.UserListCreate.as_view(), name='userListCreate'),
    path('users/<int:pk>/', views.UserDetail.as_view(), name='userDetail'),
    path('register/', views.register, name='register'),
    path('', include(router.urls)),
] 