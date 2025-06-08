from rest_framework import generics, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.db.models import Count, Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
import requests
import time

from .models import Integration, IntegrationLog, IntegrationTemplate
from .serializers import (
    IntegrationSerializer,
    IntegrationCreateSerializer,
    IntegrationUpdateSerializer,
    IntegrationLogSerializer,
    IntegrationTemplateSerializer,
    IntegrationFromTemplateSerializer,
    IntegrationTestSerializer,
    IntegrationStatsSerializer,
    BulkIntegrationSerializer,
)


class IntegrationViewSet(ModelViewSet):
    """ViewSet para gerenciamento de integrações"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Integration.objects.filter(owner=self.request.user).order_by('-updated_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return IntegrationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return IntegrationUpdateSerializer
        elif self.action == 'from_template':
            return IntegrationFromTemplateSerializer
        elif self.action == 'test':
            return IntegrationTestSerializer
        elif self.action == 'bulk_action':
            return BulkIntegrationSerializer
        return IntegrationSerializer
    
    @extend_schema(
        summary="Listar integrações",
        description="Retorna todas as integrações do usuário",
    )
    def list(self, request, *args, **kwargs):
        # Filtros opcionais
        integration_type = request.query_params.get('type')
        status_filter = request.query_params.get('status')
        
        queryset = self.get_queryset()
        
        if integration_type:
            queryset = queryset.filter(type=integration_type)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Criar integração",
        description="Cria uma nova integração",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        summary="Obter detalhes da integração",
        description="Retorna os detalhes de uma integração específica",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Atualizar integração",
        description="Atualiza uma integração existente",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Deletar integração",
        description="Remove uma integração permanentemente",
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        summary="Criar a partir de template",
        description="Cria uma integração baseada em um template",
    )
    def from_template(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            template = IntegrationTemplate.objects.get(
                id=serializer.validated_data['template_id']
            )
            
            # Mesclar configurações do template com as fornecidas
            config = template.config_template.copy()
            config.update(serializer.validated_data.get('config', {}))
            
            credentials = template.credentials_template.copy()
            credentials.update(serializer.validated_data.get('credentials', {}))
            
            # Criar integração
            integration = Integration.objects.create(
                owner=request.user,
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', template.description),
                type=template.type,
                config=config,
                credentials=credentials
            )
            
            # Incrementar contador de uso do template
            template.usage_count += 1
            template.save()
            
            response_serializer = IntegrationSerializer(integration, context={'request': request})
            return Response({
                'message': 'Integração criada a partir do template com sucesso.',
                'integration': response_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    @extend_schema(
        summary="Testar integração",
        description="Executa um teste da integração",
    )
    def test(self, request, pk=None):
        integration = self.get_object()
        serializer = self.get_serializer(integration, data=request.data)
        
        if serializer.is_valid():
            test_data = serializer.validated_data.get('test_data', {})
            
            # Executar teste baseado no tipo
            try:
                start_time = time.time()
                
                if integration.type == 'webhook':
                    result = self._test_webhook(integration, test_data)
                elif integration.type == 'api':
                    result = self._test_api(integration, test_data)
                else:
                    result = {
                        'success': False,
                        'message': f'Teste não implementado para tipo {integration.type}'
                    }
                
                duration = time.time() - start_time
                
                # Criar log do teste
                IntegrationLog.objects.create(
                    integration=integration,
                    action='test',
                    level='info' if result['success'] else 'error',
                    message=result['message'],
                    request_data=test_data,
                    response_data=result.get('response_data'),
                    status_code=result.get('status_code'),
                    duration=duration
                )
                
                # Atualizar status da integração
                if result['success']:
                    integration.status = 'active'
                    integration.last_used = timezone.now()
                else:
                    integration.status = 'error'
                
                integration.save()
                
                return Response({
                    'success': result['success'],
                    'message': result['message'],
                    'duration': duration,
                    'status_code': result.get('status_code'),
                    'response_data': result.get('response_data')
                })
                
            except Exception as e:
                # Criar log de erro
                IntegrationLog.objects.create(
                    integration=integration,
                    action='test',
                    level='error',
                    message=f'Erro durante teste: {str(e)}',
                    request_data=test_data
                )
                
                integration.status = 'error'
                integration.save()
                
                return Response({
                    'success': False,
                    'message': f'Erro durante teste: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _test_webhook(self, integration, test_data):
        """Testa um webhook"""
        webhook = integration.webhook
        
        try:
            response = requests.request(
                method=webhook.method,
                url=webhook.url,
                json=test_data or {'test': True, 'timestamp': timezone.now().isoformat()},
                headers=webhook.headers,
                verify=webhook.verify_ssl,
                timeout=30
            )
            
            return {
                'success': response.status_code < 400,
                'message': f'Webhook testado. Status: {response.status_code}',
                'status_code': response.status_code,
                'response_data': response.text[:1000]  # Limitar tamanho
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'message': f'Erro na requisição: {str(e)}'
            }
    
    def _test_api(self, integration, test_data):
        """Testa uma conexão API"""
        api = integration.api_connection
        
        try:
            headers = api.default_headers.copy()
            
            # Adicionar autenticação
            if api.auth_type == 'bearer' and api.access_token:
                headers['Authorization'] = f'Bearer {api.access_token}'
            elif api.auth_type == 'api_key' and api.api_key:
                headers['X-API-Key'] = api.api_key
            
            # Fazer requisição de teste (GET para endpoint base)
            response = requests.get(
                api.base_url,
                headers=headers,
                timeout=api.timeout
            )
            
            return {
                'success': response.status_code < 400,
                'message': f'API testada. Status: {response.status_code}',
                'status_code': response.status_code,
                'response_data': response.text[:1000]  # Limitar tamanho
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'message': f'Erro na conexão: {str(e)}'
            }
    
    @action(detail=False, methods=['post'])
    @extend_schema(
        summary="Ações em lote",
        description="Executa ações em múltiplas integrações",
    )
    def bulk_action(self, request):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            integration_ids = serializer.validated_data['integration_ids']
            action = serializer.validated_data['action']
            
            integrations = Integration.objects.filter(
                id__in=integration_ids,
                owner=request.user
            )
            
            updated_count = 0
            for integration in integrations:
                try:
                    if action == 'activate':
                        integration.status = 'active'
                        integration.save()
                        updated_count += 1
                    elif action == 'deactivate':
                        integration.status = 'inactive'
                        integration.save()
                        updated_count += 1
                    elif action == 'delete':
                        integration.delete()
                        updated_count += 1
                except Exception:
                    continue
            
            return Response({
                'message': f'{updated_count} integrações processadas com sucesso.',
                'processed_count': updated_count,
                'total_count': len(integration_ids)
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    @extend_schema(
        summary="Estatísticas de integrações",
        description="Retorna estatísticas das integrações do usuário",
    )
    def stats(self, request):
        queryset = self.get_queryset()
        
        # Estatísticas gerais
        total_integrations = queryset.count()
        active_integrations = queryset.filter(status='active').count()
        inactive_integrations = queryset.filter(status='inactive').count()
        error_integrations = queryset.filter(status='error').count()
        
        # Por tipo
        integrations_by_type = dict(
            queryset.values('type').annotate(count=Count('id')).values_list('type', 'count')
        )
        
        # Logs recentes
        recent_logs = IntegrationLog.objects.filter(
            integration__owner=request.user
        ).order_by('-timestamp')[:10]
        
        # Mais usadas
        most_used = queryset.filter(
            last_used__isnull=False
        ).order_by('-last_used')[:5]
        
        stats_data = {
            'total_integrations': total_integrations,
            'active_integrations': active_integrations,
            'inactive_integrations': inactive_integrations,
            'error_integrations': error_integrations,
            'integrations_by_type': integrations_by_type,
            'recent_logs': recent_logs,
            'most_used': most_used,
        }
        
        serializer = IntegrationStatsSerializer(stats_data)
        return Response(serializer.data)


class IntegrationTemplateViewSet(ModelViewSet):
    """ViewSet para templates de integração"""
    serializer_class = IntegrationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return IntegrationTemplate.objects.filter(
            Q(is_public=True) | Q(created_by=self.request.user)
        ).order_by('-usage_count', 'name')
    
    @extend_schema(
        summary="Listar templates",
        description="Retorna templates públicos e do usuário",
    )
    def list(self, request, *args, **kwargs):
        # Filtros opcionais
        category = request.query_params.get('category')
        integration_type = request.query_params.get('type')
        
        queryset = self.get_queryset()
        
        if category:
            queryset = queryset.filter(category=category)
        
        if integration_type:
            queryset = queryset.filter(type=integration_type)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Criar template",
        description="Cria um novo template de integração",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
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


class IntegrationLogViewSet(ModelViewSet):
    """ViewSet para logs de integração"""
    serializer_class = IntegrationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'head', 'options']  # Apenas leitura
    
    def get_queryset(self):
        integration_id = self.kwargs.get('integration_pk')
        return IntegrationLog.objects.filter(
            integration_id=integration_id,
            integration__owner=self.request.user
        ).order_by('-timestamp')
    
    @extend_schema(
        summary="Listar logs da integração",
        description="Retorna todos os logs de uma integração específica",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Obter detalhes do log",
        description="Retorna os detalhes de um log específico",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@extend_schema(
    summary="Listar tipos de integração",
    description="Retorna todos os tipos de integração disponíveis",
)
def list_integration_types(request):
    """View pública para listar tipos de integração"""
    types = [
        {'value': choice[0], 'label': choice[1]}
        for choice in Integration.INTEGRATION_TYPES
    ]
    
    return Response({
        'types': types,
        'count': len(types)
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@extend_schema(
    summary="Listar categorias de templates",
    description="Retorna todas as categorias de templates disponíveis",
)
def list_template_categories(request):
    """View pública para listar categorias de templates"""
    categories = [
        {'value': choice[0], 'label': choice[1]}
        for choice in IntegrationTemplate.CATEGORY_CHOICES
    ]
    
    return Response({
        'categories': categories,
        'count': len(categories)
    }) 