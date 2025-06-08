from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ChatSessionViewSet,
    ChatMessageViewSet,
    ExecutionLogViewSet,
    WebhookEventViewSet,
    UserInputViewSet,
    execution_dashboard,
)

app_name = 'executions'

# Router principal
router = DefaultRouter()
router.register(r'sessions', ChatSessionViewSet, basename='chat-session')
router.register(r'messages', ChatMessageViewSet, basename='chat-message')
router.register(r'logs', ExecutionLogViewSet, basename='execution-log')
router.register(r'webhooks', WebhookEventViewSet, basename='webhook-event')
router.register(r'inputs', UserInputViewSet, basename='user-input')

urlpatterns = [
    # Rotas do router
    path('', include(router.urls)),
    
    # Dashboard
    path('dashboard/', execution_dashboard, name='execution-dashboard'),
] 