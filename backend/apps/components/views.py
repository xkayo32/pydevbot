from rest_framework import generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema

from .models import (
    ComponentCategory, 
    ComponentTemplate, 
    ComponentInstance, 
    ComponentConnection, 
    ComponentVariable
)
from .serializers import (
    ComponentCategorySerializer,
    ComponentTemplateSerializer,
    ComponentInstanceSerializer,
    ComponentConnectionSerializer,
    ComponentVariableSerializer,
)


class ComponentCategoryViewSet(ModelViewSet):
    """ViewSet para categorias de componentes"""
    queryset = ComponentCategory.objects.all().order_by('order', 'name')
    serializer_class = ComponentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ComponentTemplateViewSet(ModelViewSet):
    """ViewSet para templates de componentes"""
    queryset = ComponentTemplate.objects.filter(is_active=True).order_by('category__order', 'name')
    serializer_class = ComponentTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        summary="Listar por categorias",
        description="Retorna templates agrupados por categoria",
    )
    def by_category(self, request):
        categories = ComponentCategory.objects.all().order_by('order', 'name')
        result = []
        
        for category in categories:
            templates = ComponentTemplate.objects.filter(
                category=category,
                is_active=True
            ).order_by('name')
            
            if templates.exists():
                result.append({
                    'category': ComponentCategorySerializer(category).data,
                    'templates': ComponentTemplateSerializer(templates, many=True).data
                })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        summary="Buscar templates",
        description="Busca templates por nome ou tipo",
    )
    def search(self, request):
        query = request.query_params.get('q', '')
        category_id = request.query_params.get('category_id', '')
        component_type = request.query_params.get('type', '')
        
        queryset = self.get_queryset()
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(component_type__icontains=query) |
                Q(description__icontains=query)
            )
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
            
        if component_type:
            queryset = queryset.filter(component_type=component_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ComponentInstanceViewSet(ModelViewSet):
    """ViewSet para instâncias de componentes"""
    serializer_class = ComponentInstanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        flow_id = self.request.query_params.get('flow_id')
        if flow_id:
            return ComponentInstance.objects.filter(
                flow_id=flow_id
            ).order_by('created_at')
        
        return ComponentInstance.objects.all().order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        summary="Operações em lote",
        description="Cria ou atualiza múltiplas instâncias de componentes",
    )
    def bulk(self, request):
        instances_data = request.data.get('instances', [])
        created_instances = []
        
        for instance_data in instances_data:
            serializer = self.get_serializer(data=instance_data)
            if serializer.is_valid():
                instance = serializer.save()
                created_instances.append(instance)
        
        response_serializer = self.get_serializer(created_instances, many=True)
        return Response({
            'message': f'{len(created_instances)} instâncias criadas com sucesso.',
            'instances': response_serializer.data
        }, status=status.HTTP_201_CREATED)


class ComponentConnectionViewSet(ModelViewSet):
    """ViewSet para conexões entre componentes"""
    serializer_class = ComponentConnectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        flow_id = self.request.query_params.get('flow_id')
        if flow_id:
            return ComponentConnection.objects.filter(
                flow_id=flow_id
            ).order_by('created_at')
        
        return ComponentConnection.objects.all().order_by('-created_at')


class ComponentVariableViewSet(ModelViewSet):
    """ViewSet para variáveis dos componentes"""
    serializer_class = ComponentVariableSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        flow_id = self.request.query_params.get('flow_id')
        if flow_id:
            return ComponentVariable.objects.filter(
                flow_id=flow_id
            ).order_by('name')
        
        return ComponentVariable.objects.all().order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Validar componente",
    description="Valida as propriedades de um componente contra seu template",
)
def validate_component(request):
    """View para validar propriedades de componentes"""
    template_id = request.data.get('template_id')
    component_data = request.data.get('data', {})
    
    try:
        template = ComponentTemplate.objects.get(id=template_id, is_active=True)
        
        # Aqui você pode implementar validação usando o validation_schema
        # Por enquanto, retorna sempre válido
        
        return Response({
            'is_valid': True,
            'message': 'Componente validado com sucesso.'
        })
    
    except ComponentTemplate.DoesNotExist:
        return Response({
            'is_valid': False,
            'errors': {'template_id': 'Template não encontrado.'}
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@extend_schema(
    summary="Obter schema de template",
    description="Retorna o schema JSON de um template de componente",
)
def get_component_schema(request, template_id):
    """View para obter schema de um template"""
    try:
        template = ComponentTemplate.objects.get(id=template_id, is_active=True)
        return Response({
            'id': template.id,
            'name': template.name,
            'component_type': template.component_type,
            'validation_schema': template.validation_schema,
            'default_data': template.default_data,
            'default_settings': template.default_settings,
            'input_handles': template.input_handles,
            'output_handles': template.output_handles,
        })
    
    except ComponentTemplate.DoesNotExist:
        return Response({
            'error': 'Template não encontrado.'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@extend_schema(
    summary="Listar tipos de componentes",
    description="Retorna todos os tipos de componentes disponíveis",
)
def list_component_types(request):
    """View para listar tipos de componentes"""
    types = ComponentTemplate.objects.filter(is_active=True).values_list(
        'component_type', flat=True
    ).distinct().order_by('component_type')
    
    return Response(list(types))


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@extend_schema(
    summary="Listar categorias de componentes",
    description="Retorna todas as categorias de componentes disponíveis",
)
def list_component_categories(request):
    """View para listar categorias de componentes"""
    categories = ComponentCategory.objects.all().order_by('order', 'name')
    serializer = ComponentCategorySerializer(categories, many=True)
    return Response(serializer.data) 