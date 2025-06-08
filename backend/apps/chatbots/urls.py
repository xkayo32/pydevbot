from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import ChatbotViewSet, ChatbotVersionViewSet, PublicChatbotView
from apps.flows.views import FlowViewSet, FlowExecutionViewSet

app_name = 'chatbots'

# Router principal
router = DefaultRouter()
router.register(r'', ChatbotViewSet, basename='chatbot')

# Router aninhado para versões
versions_router = routers.NestedDefaultRouter(router, r'', lookup='chatbot')
versions_router.register(r'versions', ChatbotVersionViewSet, basename='chatbot-versions')

# Router aninhado para fluxos
flows_router = routers.NestedDefaultRouter(router, r'', lookup='chatbot')
flows_router.register(r'flows', FlowViewSet, basename='chatbot-flows')

# Router aninhado para execuções de fluxos
executions_router = routers.NestedDefaultRouter(flows_router, r'flows', lookup='flow')
executions_router.register(r'executions', FlowExecutionViewSet, basename='flow-executions')

urlpatterns = [
    # Chatbots privados (autenticados)
    path('', include(router.urls)),
    path('', include(versions_router.urls)),
    path('', include(flows_router.urls)),
    path('', include(executions_router.urls)),
    
    # Chatbot público (sem autenticação)
    path('public/<uuid:id>/', PublicChatbotView.as_view(), name='public-chatbot'),
] 