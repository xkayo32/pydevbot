from rest_framework import generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema

from .models import ChatSession, ChatMessage, ExecutionLog, WebhookEvent, UserInput
from .serializers import (
    ChatSessionSerializer,
    ChatMessageSerializer,
    ExecutionLogSerializer,
    WebhookEventSerializer,
    UserInputSerializer,
)


class ChatSessionViewSet(ModelViewSet):
    """ViewSet para gerenciamento de sessões de chat"""
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Filtrar sessões dos chatbots do usuário
        return ChatSession.objects.filter(
            chatbot__owner=self.request.user
        ).order_by('-start_time')
    
    @extend_schema(
        summary="Listar sessões de chat",
        description="Retorna todas as sessões de chat dos chatbots do usuário",
    )
    def list(self, request, *args, **kwargs):
        # Filtros opcionais
        status_filter = request.query_params.get('status')
        chatbot_id = request.query_params.get('chatbot_id')
        user_id = request.query_params.get('user_id')
        
        queryset = self.get_queryset()
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if chatbot_id:
            queryset = queryset.filter(chatbot_id=chatbot_id)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Paginação
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Finalizar sessão",
        description="Finaliza uma sessão de chat ativa",
    )
    def finish(self, request, pk=None):
        session = self.get_object()
        
        if session.status != 'active':
            return Response(
                {'error': 'Sessão já foi finalizada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.status = 'completed'
        session.end_time = timezone.now()
        session.save()
        
        serializer = self.get_serializer(session)
        return Response({
            'message': 'Sessão finalizada com sucesso.',
            'session': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        summary="Estatísticas de sessões",
        description="Retorna estatísticas das sessões do usuário",
    )
    def stats(self, request):
        queryset = self.get_queryset()
        
        # Estatísticas básicas
        total_sessions = queryset.count()
        active_sessions = queryset.filter(status='active').count()
        completed_sessions = queryset.filter(status='completed').count()
        abandoned_sessions = queryset.filter(status='abandoned').count()
        
        # Duração média
        completed_queryset = queryset.filter(status='completed', end_time__isnull=False)
        avg_duration = 0
        if completed_queryset.exists():
            durations = [session.duration() for session in completed_queryset]
            avg_duration = sum(durations) / len(durations)
        
        # Sessões por período
        today = timezone.now().date()
        sessions_today = queryset.filter(start_time__date=today).count()
        sessions_week = queryset.filter(
            start_time__gte=today - timedelta(days=7)
        ).count()
        
        return Response({
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
            'completed_sessions': completed_sessions,
            'abandoned_sessions': abandoned_sessions,
            'avg_duration_seconds': avg_duration,
            'sessions_today': sessions_today,
            'sessions_this_week': sessions_week,
        })


class ChatMessageViewSet(ModelViewSet):
    """ViewSet para mensagens de chat"""
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return ChatMessage.objects.filter(
                session_id=session_id,
                session__chatbot__owner=self.request.user
            ).order_by('sent_at')
        
        return ChatMessage.objects.filter(
            session__chatbot__owner=self.request.user
        ).order_by('-sent_at')


class ExecutionLogViewSet(ModelViewSet):
    """ViewSet para logs de execução"""
    serializer_class = ExecutionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return ExecutionLog.objects.filter(
                session_id=session_id,
                session__chatbot__owner=self.request.user
            ).order_by('started_at')
        
        return ExecutionLog.objects.filter(
            session__chatbot__owner=self.request.user
        ).order_by('-started_at')


class WebhookEventViewSet(ModelViewSet):
    """ViewSet para eventos de webhook"""
    serializer_class = WebhookEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WebhookEvent.objects.filter(
            session__chatbot__owner=self.request.user
        ).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Reenviar webhook",
        description="Reenvia um evento de webhook que falhou",
    )
    def retry(self, request, pk=None):
        webhook_event = self.get_object()
        
        if webhook_event.status == 'sent':
            return Response(
                {'error': 'Webhook já foi enviado com sucesso.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if webhook_event.retry_count >= webhook_event.max_retries:
            return Response(
                {'error': 'Número máximo de tentativas excedido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Aqui você implementaria a lógica de reenvio do webhook
        webhook_event.status = 'pending'
        webhook_event.retry_count += 1
        webhook_event.next_retry = timezone.now() + timedelta(minutes=5)
        webhook_event.save()
        
        serializer = self.get_serializer(webhook_event)
        return Response({
            'message': 'Webhook agendado para reenvio.',
            'webhook_event': serializer.data
        })


class UserInputViewSet(ModelViewSet):
    """ViewSet para entradas de usuário"""
    serializer_class = UserInputSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return UserInput.objects.filter(
                session_id=session_id,
                session__chatbot__owner=self.request.user
            ).order_by('collected_at')
        
        return UserInput.objects.filter(
            session__chatbot__owner=self.request.user
        ).order_by('-collected_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Dashboard de execuções",
    description="Retorna dados para dashboard de execuções",
)
def execution_dashboard(request):
    """View para dashboard de execuções"""
    user = request.user
    
    # Sessões do usuário
    sessions = ChatSession.objects.filter(chatbot__owner=user)
    
    # Estatísticas básicas
    total_sessions = sessions.count()
    active_sessions = sessions.filter(status='active').count()
    completed_sessions = sessions.filter(status='completed').count()
    
    # Sessões por chatbot
    sessions_by_chatbot = sessions.values('chatbot__name').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    # Atividade recente (últimos 30 dias)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_activity = sessions.filter(
        start_time__gte=thirty_days_ago
    ).extra(
        select={'day': 'date(start_time)'}
    ).values('day').annotate(
        count=Count('id')
    ).order_by('day')
    
    # Tipos de entrada mais comuns
    common_inputs = UserInput.objects.filter(
        session__chatbot__owner=user
    ).values('input_type').annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    return Response({
        'total_sessions': total_sessions,
        'active_sessions': active_sessions,
        'completed_sessions': completed_sessions,
        'sessions_by_chatbot': list(sessions_by_chatbot),
        'recent_activity': list(recent_activity),
        'common_input_types': list(common_inputs),
    }) 