from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    ProfileDetailView,
    ChangePasswordView,
    logout_view,
    user_stats_view,
)

app_name = 'authentication'

urlpatterns = [
    # Autenticação
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Perfil do usuário
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/details/', ProfileDetailView.as_view(), name='profile_details'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Estatísticas
    path('stats/', user_stats_view, name='user_stats'),
] 