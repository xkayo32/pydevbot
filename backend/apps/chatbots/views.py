from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema

from .models import Chatbot, ChatbotVersion, ChatbotAnalytics
from .serializers import (
    ChatbotSerializer,
    ChatbotCreateSerializer,
    ChatbotUpdateSerializer,
    ChatbotDetailSerializer,
    ChatbotVersionSerializer,
    ChatbotAnalyticsSerializer,
    ChatbotPublishSerializer,
    ChatbotCloneSerializer,
)


class ChatbotViewSet(ModelViewSet):
    """ViewSet para gerenciamento de chatbots"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Chatbot.objects.filter(owner=self.request.user).order_by('-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatbotCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ChatbotUpdateSerializer
        elif self.action == 'retrieve':
            return ChatbotDetailSerializer
        elif self.action == 'publish':
            return ChatbotPublishSerializer
        elif self.action == 'clone':
            return ChatbotCloneSerializer
        return ChatbotSerializer
    
    @extend_schema(
        summary="Listar chatbots do usuário",
        description="Retorna todos os chatbots do usuário autenticado",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Criar novo chatbot",
        description="Cria um novo chatbot para o usuário autenticado",
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            chatbot = serializer.save()
            
            # Criar analytics iniciais
            ChatbotAnalytics.objects.create(chatbot=chatbot)
            
            # Retornar dados completos
            response_serializer = ChatbotSerializer(chatbot, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Obter detalhes do chatbot",
        description="Retorna os detalhes completos de um chatbot específico",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar chatbot",
        description="Atualiza as informações de um chatbot",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Deletar chatbot",
        description="Remove um chatbot permanentemente",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Publicar/Despublicar chatbot",
        description="Publica ou despublica um chatbot",
    )
    def publish(self, request, pk=None):
        chatbot = self.get_object()
        serializer = self.get_serializer(chatbot, data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            
            if action == 'publish':
                chatbot.publish()
                message = "Chatbot publicado com sucesso."
            else:
                chatbot.unpublish()
                message = "Chatbot despublicado com sucesso."
            
            response_serializer = ChatbotSerializer(chatbot, context={'request': request})
            return Response({
                'message': message,
                'chatbot': response_serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Clonar chatbot",
        description="Cria uma cópia de um chatbot existente",
    )
    def clone(self, request, pk=None):
        original_chatbot = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                # Criar novo chatbot
                new_chatbot = Chatbot.objects.create(
                    owner=request.user,
                    name=serializer.validated_data['name'],
                    description=serializer.validated_data.get('description', ''),
                    theme=original_chatbot.theme,
                    primary_color=original_chatbot.primary_color,
                    settings=original_chatbot.settings.copy()
                )
                
                # Clonar fluxos
                from apps.flows.models import Flow
                for flow in original_chatbot.flows.all():
                    Flow.objects.create(
                        chatbot=new_chatbot,
                        name=flow.name,
                        description=flow.description,
                        is_main_flow=flow.is_main_flow,
                        nodes=flow.nodes.copy(),
                        edges=flow.edges.copy(),
                        viewport=flow.viewport.copy(),
                        settings=flow.settings.copy(),
                        created_by=request.user
                    )
                
                # Criar analytics
                ChatbotAnalytics.objects.create(chatbot=new_chatbot)
                
                # Copiar analytics se solicitado
                if serializer.validated_data.get('include_analytics', False):
                    if hasattr(original_chatbot, 'analytics'):
                        original_analytics = original_chatbot.analytics
                        new_chatbot.analytics.total_conversations = original_analytics.total_conversations
                        new_chatbot.analytics.total_messages = original_analytics.total_messages
                        new_chatbot.analytics.unique_users = original_analytics.unique_users
                        new_chatbot.analytics.avg_conversation_length = original_analytics.avg_conversation_length
                        new_chatbot.analytics.completion_rate = original_analytics.completion_rate
                        new_chatbot.analytics.save()
                
                response_serializer = ChatbotSerializer(new_chatbot, context={'request': request})
                return Response({
                    'message': 'Chatbot clonado com sucesso.',
                    'chatbot': response_serializer.data
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    @extend_schema(
        summary="Obter analytics do chatbot",
        description="Retorna as estatísticas de uso do chatbot",
    )
    def analytics(self, request, pk=None):
        chatbot = self.get_object()
        analytics, created = ChatbotAnalytics.objects.get_or_create(chatbot=chatbot)
        
        serializer = ChatbotAnalyticsSerializer(analytics)
        return Response(serializer.data)


class ChatbotVersionViewSet(ModelViewSet):
    """ViewSet para gerenciamento de versões de chatbots"""
    serializer_class = ChatbotVersionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        chatbot_id = self.kwargs.get('chatbot_pk')
        return ChatbotVersion.objects.filter(
            chatbot_id=chatbot_id,
            chatbot__owner=self.request.user
        ).order_by('-version_number')
    
    @extend_schema(
        summary="Listar versões do chatbot",
        description="Retorna todas as versões de um chatbot específico",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Criar nova versão",
        description="Cria uma nova versão do chatbot com snapshot dos dados atuais",
    )
    def create(self, request, *args, **kwargs):
        chatbot_id = self.kwargs.get('chatbot_pk')
        chatbot = get_object_or_404(Chatbot, id=chatbot_id, owner=request.user)
        
        # Preparar dados da versão
        request.data['chatbot'] = chatbot.id
        request.data['flow_data'] = {
            'flows': [
                {
                    'id': str(flow.id),
                    'name': flow.name,
                    'description': flow.description,
                    'is_main_flow': flow.is_main_flow,
                    'nodes': flow.nodes,
                    'edges': flow.edges,
                    'viewport': flow.viewport,
                    'settings': flow.settings,
                }
                for flow in chatbot.flows.all()
            ]
        }
        request.data['settings_data'] = chatbot.settings
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Restaurar versão",
        description="Restaura o chatbot para uma versão específica",
    )
    def restore(self, request, pk=None, chatbot_pk=None):
        version = self.get_object()
        chatbot = version.chatbot
        
        with transaction.atomic():
            # Restaurar configurações do chatbot
            chatbot.settings = version.settings_data
            chatbot.save()
            
            # Limpar fluxos atuais
            chatbot.flows.all().delete()
            
            # Restaurar fluxos da versão
            from apps.flows.models import Flow
            for flow_data in version.flow_data.get('flows', []):
                Flow.objects.create(
                    chatbot=chatbot,
                    name=flow_data['name'],
                    description=flow_data['description'],
                    is_main_flow=flow_data['is_main_flow'],
                    nodes=flow_data['nodes'],
                    edges=flow_data['edges'],
                    viewport=flow_data['viewport'],
                    settings=flow_data['settings'],
                    created_by=request.user
                )
        
        return Response({
            'message': f'Chatbot restaurado para versão {version.version_number}.'
        })


class PublicChatbotView(generics.RetrieveAPIView):
    """View pública para acessar chatbots publicados"""
    serializer_class = ChatbotDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    
    def get_queryset(self):
        return Chatbot.objects.filter(is_published=True, is_active=True)
    
    @extend_schema(
        summary="Obter chatbot público",
        description="Acessa um chatbot publicado sem autenticação",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs) 