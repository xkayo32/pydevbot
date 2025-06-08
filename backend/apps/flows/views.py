from rest_framework import generics, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from apps.chatbots.models import Chatbot
from .models import Flow, FlowTemplate, FlowExecution, FlowMessage
from .serializers import (
    FlowSerializer,
    FlowCreateSerializer,
    FlowUpdateSerializer,
    FlowTemplateSerializer,
    FlowExecutionSerializer,
    FlowExecutionDetailSerializer,
    FlowMessageSerializer,
    FlowFromTemplateSerializer,
    FlowCloneSerializer,
)


class FlowViewSet(ModelViewSet):
    """ViewSet para gerenciamento de fluxos"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        chatbot_id = self.kwargs.get('chatbot_pk')
        return Flow.objects.filter(
            chatbot_id=chatbot_id,
            chatbot__owner=self.request.user
        ).order_by('-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FlowCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return FlowUpdateSerializer
        elif self.action == 'from_template':
            return FlowFromTemplateSerializer
        elif self.action == 'clone':
            return FlowCloneSerializer
        return FlowSerializer
    
    @extend_schema(
        summary="Listar fluxos do chatbot",
        description="Retorna todos os fluxos de um chatbot específico",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Criar novo fluxo",
        description="Cria um novo fluxo para o chatbot",
    )
    def create(self, request, *args, **kwargs):
        chatbot_id = self.kwargs.get('chatbot_pk')
        chatbot = get_object_or_404(Chatbot, id=chatbot_id, owner=request.user)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            flow = serializer.save(chatbot=chatbot)
            
            # Retornar dados completos
            response_serializer = FlowSerializer(flow, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Obter detalhes do fluxo",
        description="Retorna os detalhes completos de um fluxo específico",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar fluxo",
        description="Atualiza as informações de um fluxo",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Deletar fluxo",
        description="Remove um fluxo permanentemente",
    )
    def destroy(self, request, *args, **kwargs):
        flow = self.get_object()
        
        # Verificar se não é o único fluxo principal
        if flow.is_main_flow:
            other_flows = Flow.objects.filter(
                chatbot=flow.chatbot
            ).exclude(id=flow.id)
            
            if not other_flows.exists():
                return Response(
                    {'error': 'Não é possível excluir o único fluxo do chatbot.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        summary="Criar fluxo a partir de template",
        description="Cria um novo fluxo baseado em um template existente",
    )
    def from_template(self, request, chatbot_pk=None):
        chatbot = get_object_or_404(Chatbot, id=chatbot_pk, owner=request.user)
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            template = FlowTemplate.objects.get(id=serializer.validated_data['template_id'])
            
            # Criar fluxo a partir do template
            flow = Flow.objects.create(
                chatbot=chatbot,
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', ''),
                is_main_flow=serializer.validated_data.get('is_main_flow', False),
                nodes=template.template_nodes.copy(),
                edges=template.template_edges.copy(),
                viewport={'x': 0, 'y': 0, 'zoom': 1},
                settings=template.template_settings.copy(),
                created_by=request.user
            )
            
            # Incrementar contador de uso do template
            template.usage_count += 1
            template.save()
            
            response_serializer = FlowSerializer(flow, context={'request': request})
            return Response({
                'message': 'Fluxo criado a partir do template com sucesso.',
                'flow': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Clonar fluxo",
        description="Cria uma cópia de um fluxo existente",
    )
    def clone(self, request, pk=None, chatbot_pk=None):
        original_flow = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Criar clone do fluxo
            cloned_flow = Flow.objects.create(
                chatbot=original_flow.chatbot,
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', ''),
                is_main_flow=False,  # Clone nunca é fluxo principal
                nodes=original_flow.nodes.copy(),
                edges=original_flow.edges.copy(),
                viewport=original_flow.viewport.copy(),
                settings=original_flow.settings.copy(),
                created_by=request.user
            )
            
            response_serializer = FlowSerializer(cloned_flow, context={'request': request})
            return Response({
                'message': 'Fluxo clonado com sucesso.',
                'flow': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Validar fluxo",
        description="Valida a estrutura e configuração do fluxo",
    )
    def validate(self, request, pk=None, chatbot_pk=None):
        flow = self.get_object()
        errors = flow.validate_flow()
        
        return Response({
            'is_valid': len(errors) == 0,
            'errors': errors
        })


class FlowTemplateViewSet(ModelViewSet):
    """ViewSet para gerenciamento de templates de fluxos"""
    serializer_class = FlowTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FlowTemplate.objects.filter(
            models.Q(is_public=True) | models.Q(created_by=self.request.user)
        ).order_by('-usage_count', 'name')
    
    @extend_schema(
        summary="Listar templates de fluxos",
        description="Retorna templates públicos e do usuário",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Criar template de fluxo",
        description="Cria um novo template de fluxo",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        summary="Obter detalhes do template",
        description="Retorna os detalhes de um template específico",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar template",
        description="Atualiza um template (apenas o criador)",
    )
    def update(self, request, *args, **kwargs):
        template = self.get_object()
        if template.created_by != request.user:
            return Response(
                {'error': 'Você não tem permissão para editar este template.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Deletar template",
        description="Remove um template (apenas o criador)",
    )
    def destroy(self, request, *args, **kwargs):
        template = self.get_object()
        if template.created_by != request.user:
            return Response(
                {'error': 'Você não tem permissão para excluir este template.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class FlowExecutionViewSet(ModelViewSet):
    """ViewSet para execuções de fluxos"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        flow_id = self.kwargs.get('flow_pk')
        return FlowExecution.objects.filter(
            flow_id=flow_id,
            flow__chatbot__owner=self.request.user
        ).order_by('-started_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FlowExecutionDetailSerializer
        return FlowExecutionSerializer
    
    @extend_schema(
        summary="Listar execuções do fluxo",
        description="Retorna todas as execuções de um fluxo específico",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Obter detalhes da execução",
        description="Retorna os detalhes completos de uma execução",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


class PublicFlowExecutionView(generics.CreateAPIView):
    """View pública para iniciar execução de fluxo"""
    serializer_class = FlowExecutionSerializer
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Iniciar execução pública",
        description="Inicia a execução de um fluxo publicado",
    )
    def post(self, request, chatbot_id):
        # Verificar se o chatbot está publicado
        chatbot = get_object_or_404(
            Chatbot,
            id=chatbot_id,
            is_published=True,
            is_active=True
        )
        
        # Obter fluxo principal
        main_flow = chatbot.flows.filter(is_main_flow=True, is_active=True).first()
        if not main_flow:
            return Response(
                {'error': 'Chatbot não possui fluxo principal ativo.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar execução
        execution = FlowExecution.objects.create(
            flow=main_flow,
            user_id=request.data.get('user_id', f'anonymous_{timezone.now().timestamp()}'),
            user_data=request.data.get('user_data', {}),
            current_node_id=main_flow.get_start_node()['id'] if main_flow.get_start_node() else None
        )
        
        serializer = FlowExecutionDetailSerializer(execution, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED) 