from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ComponentCategoryViewSet,
    ComponentTemplateViewSet,
    ComponentInstanceViewSet,
    ComponentConnectionViewSet,
    ComponentVariableViewSet,
    validate_component,
    get_component_schema,
    list_component_types,
    list_component_categories,
)

app_name = 'components'

# Router principal
router = DefaultRouter()
router.register(r'categories', ComponentCategoryViewSet, basename='component-category')
router.register(r'templates', ComponentTemplateViewSet, basename='component-template')
router.register(r'instances', ComponentInstanceViewSet, basename='component-instance')
router.register(r'connections', ComponentConnectionViewSet, basename='component-connection')
router.register(r'variables', ComponentVariableViewSet, basename='component-variable')

urlpatterns = [
    # Rotas do router
    path('', include(router.urls)),
    
    # Rotas específicas
    path('validate/', validate_component, name='validate-component'),
    path('schema/<uuid:template_id>/', get_component_schema, name='component-schema'),
    path('types/', list_component_types, name='component-types'),
    path('categories-list/', list_component_categories, name='component-categories-list'),
] 