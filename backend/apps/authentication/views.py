from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from drf_spectacular.utils import extend_schema

from .models import UserProfile
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer
)


class RegisterView(generics.CreateAPIView):
    """View para registro de novos usuários"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Registrar novo usuário",
        description="Criar uma nova conta de usuário",
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Criar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            # Criar perfil do usuário
            UserProfile.objects.create(user=user)
            
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """View para login de usuários"""
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        request=UserLoginSerializer,
        summary="Login de usuário",
        description="Autenticar usuário e retornar tokens JWT",
    )
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Criar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """View para visualizar e atualizar perfil do usuário"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    @extend_schema(
        summary="Obter perfil do usuário",
        description="Retorna os dados do perfil do usuário autenticado",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar perfil do usuário",
        description="Atualiza os dados do perfil do usuário autenticado",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """View para gerenciar detalhes do perfil do usuário"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    @extend_schema(
        summary="Obter detalhes do perfil",
        description="Retorna os detalhes do perfil do usuário",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar detalhes do perfil",
        description="Atualiza os detalhes do perfil do usuário",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ChangePasswordView(APIView):
    """View para mudança de senha"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        request=PasswordChangeSerializer,
        summary="Alterar senha",
        description="Altera a senha do usuário autenticado",
    )
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Manter a sessão ativa após mudança de senha
            update_session_auth_hash(request, user)
            
            return Response({
                'message': 'Senha alterada com sucesso.'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """View para logout (blacklist do refresh token)"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response({'message': 'Logout realizado com sucesso.'})
    except Exception as e:
        return Response(
            {'error': 'Erro ao realizar logout.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats_view(request):
    """View para estatísticas do usuário"""
    user = request.user
    
    stats = {
        'chatbots_count': user.chatbots.count(),
        'active_chatbots': user.chatbots.filter(is_active=True).count(),
        'published_chatbots': user.chatbots.filter(is_published=True).count(),
        'total_executions': sum(
            flow.executions.count()
            for chatbot in user.chatbots.all()
            for flow in chatbot.flows.all()
        ),
        'member_since': user.date_joined,
    }
    
    return Response(stats) 