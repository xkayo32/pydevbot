from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    FlowViewSet,
    FlowTemplateViewSet,
    FlowExecutionViewSet,
    PublicFlowExecutionView,
)

app_name = 'flows'

# Router principal para templates
templates_router = DefaultRouter()
templates_router.register(r'templates', FlowTemplateViewSet, basename='flow-template')

# Router aninhado para fluxos dentro de chatbots
# Este será usado no chatbots/urls.py
flows_router = DefaultRouter()
flows_router.register(r'', FlowViewSet, basename='chatbot-flow')

# Router aninhado para execuções dentro de fluxos
executions_router = DefaultRouter()
executions_router.register(r'executions', FlowExecutionViewSet, basename='flow-execution')

urlpatterns = [
    # Templates públicos
    path('', include(templates_router.urls)),
    
    # Fluxos e execuções (requer contexto de chatbot)
    # Estas rotas serão incluídas no chatbots/urls.py
    
    # Execução pública de chatbot
    path('public/<uuid:chatbot_id>/start/', PublicFlowExecutionView.as_view(), name='public-start'),
] 