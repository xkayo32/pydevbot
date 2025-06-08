from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    IntegrationViewSet,
    IntegrationTemplateViewSet,
    IntegrationLogViewSet,
    list_integration_types,
    list_template_categories,
)

app_name = 'integrations'

# Router principal
router = DefaultRouter()
router.register(r'', IntegrationViewSet, basename='integration')
router.register(r'templates', IntegrationTemplateViewSet, basename='integration-template')

# Router aninhado para logs
logs_router = routers.NestedDefaultRouter(router, r'', lookup='integration')
logs_router.register(r'logs', IntegrationLogViewSet, basename='integration-logs')

urlpatterns = [
    # Integrações
    path('', include(router.urls)),
    path('', include(logs_router.urls)),
    
    # Rotas específicas
    path('types/', list_integration_types, name='integration-types'),
    path('templates/categories/', list_template_categories, name='template-categories'),
] 