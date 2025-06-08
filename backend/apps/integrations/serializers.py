from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Integration, Webhook, ApiConnection, IntegrationLog, IntegrationTemplate


class WebhookSerializer(serializers.ModelSerializer):
    """Serializer para webhooks"""
    
    class Meta:
        model = Webhook
        fields = [
            'url', 'method', 'headers', 'secret_token',
            'verify_ssl', 'max_retries', 'retry_delay'
        ]


class ApiConnectionSerializer(serializers.ModelSerializer):
    """Serializer para conexões API"""
    
    class Meta:
        model = ApiConnection
        fields = [
            'base_url', 'auth_type', 'api_key', 'api_secret',
            'access_token', 'refresh_token', 'default_headers', 'timeout'
        ]
        extra_kwargs = {
            'api_secret': {'write_only': True},
            'access_token': {'write_only': True},
            'refresh_token': {'write_only': True},
        }


class IntegrationSerializer(serializers.ModelSerializer):
    """Serializer para integrações"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    webhook = WebhookSerializer(read_only=True)
    api_connection = ApiConnectionSerializer(read_only=True)
    logs_count = serializers.SerializerMethodField()
    chatbots_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Integration
        fields = [
            'id', 'name', 'description', 'type', 'status',
            'config', 'owner', 'owner_name', 'chatbots',
            'created_at', 'updated_at', 'last_used',
            'webhook', 'api_connection', 'logs_count', 'chatbots_count'
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at', 'last_used')
        extra_kwargs = {
            'credentials': {'write_only': True},
        }
    
    def get_logs_count(self, obj):
        return obj.logs.count()
    
    def get_chatbots_count(self, obj):
        return obj.chatbots.count()
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class IntegrationCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de integrações"""
    webhook_data = WebhookSerializer(required=False)
    api_data = ApiConnectionSerializer(required=False)
    
    class Meta:
        model = Integration
        fields = [
            'name', 'description', 'type', 'config', 'credentials',
            'webhook_data', 'api_data'
        ]
    
    def create(self, validated_data):
        webhook_data = validated_data.pop('webhook_data', None)
        api_data = validated_data.pop('api_data', None)
        
        validated_data['owner'] = self.context['request'].user
        integration = super().create(validated_data)
        
        # Criar webhook se fornecido
        if webhook_data and integration.type == 'webhook':
            Webhook.objects.create(integration=integration, **webhook_data)
        
        # Criar conexão API se fornecido
        if api_data and integration.type == 'api':
            ApiConnection.objects.create(integration=integration, **api_data)
        
        return integration
    
    def validate(self, attrs):
        integration_type = attrs.get('type')
        webhook_data = attrs.get('webhook_data')
        api_data = attrs.get('api_data')
        
        if integration_type == 'webhook' and not webhook_data:
            raise serializers.ValidationError(
                "Dados do webhook são obrigatórios para integrações do tipo webhook."
            )
        
        if integration_type == 'api' and not api_data:
            raise serializers.ValidationError(
                "Dados da API são obrigatórios para integrações do tipo API."
            )
        
        return attrs


class IntegrationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de integrações"""
    webhook_data = WebhookSerializer(required=False)
    api_data = ApiConnectionSerializer(required=False)
    
    class Meta:
        model = Integration
        fields = [
            'name', 'description', 'status', 'config', 'credentials',
            'chatbots', 'webhook_data', 'api_data'
        ]
        extra_kwargs = {
            'credentials': {'write_only': True},
        }
    
    def update(self, instance, validated_data):
        webhook_data = validated_data.pop('webhook_data', None)
        api_data = validated_data.pop('api_data', None)
        
        # Atualizar integração
        instance = super().update(instance, validated_data)
        
        # Atualizar webhook se fornecido
        if webhook_data and instance.type == 'webhook':
            if hasattr(instance, 'webhook'):
                for attr, value in webhook_data.items():
                    setattr(instance.webhook, attr, value)
                instance.webhook.save()
            else:
                Webhook.objects.create(integration=instance, **webhook_data)
        
        # Atualizar API se fornecido
        if api_data and instance.type == 'api':
            if hasattr(instance, 'api_connection'):
                for attr, value in api_data.items():
                    setattr(instance.api_connection, attr, value)
                instance.api_connection.save()
            else:
                ApiConnection.objects.create(integration=instance, **api_data)
        
        return instance


class IntegrationLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de integração"""
    integration_name = serializers.CharField(source='integration.name', read_only=True)
    
    class Meta:
        model = IntegrationLog
        fields = [
            'id', 'integration', 'integration_name', 'execution_id',
            'action', 'level', 'message', 'request_data',
            'response_data', 'status_code', 'duration', 'timestamp'
        ]
        read_only_fields = ('id', 'timestamp')


class IntegrationTemplateSerializer(serializers.ModelSerializer):
    """Serializer para templates de integração"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = IntegrationTemplate
        fields = [
            'id', 'name', 'description', 'category', 'type',
            'config_template', 'credentials_template', 'icon',
            'documentation_url', 'is_public', 'usage_count',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ('id', 'created_by', 'created_at', 'usage_count')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class IntegrationFromTemplateSerializer(serializers.Serializer):
    """Serializer para criar integração a partir de template"""
    template_id = serializers.UUIDField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    config = serializers.JSONField(required=False)
    credentials = serializers.JSONField(required=False)
    
    def validate_template_id(self, value):
        try:
            template = IntegrationTemplate.objects.get(id=value)
            if not template.is_public and template.created_by != self.context['request'].user:
                raise serializers.ValidationError("Template não encontrado.")
            return value
        except IntegrationTemplate.DoesNotExist:
            raise serializers.ValidationError("Template não encontrado.")


class IntegrationTestSerializer(serializers.Serializer):
    """Serializer para teste de integrações"""
    test_data = serializers.JSONField(required=False)
    
    def validate(self, attrs):
        integration = self.instance
        
        if integration.status == 'inactive':
            raise serializers.ValidationError(
                "Integração deve estar ativa para ser testada."
            )
        
        if integration.type == 'webhook' and not hasattr(integration, 'webhook'):
            raise serializers.ValidationError(
                "Webhook não configurado para esta integração."
            )
        
        if integration.type == 'api' and not hasattr(integration, 'api_connection'):
            raise serializers.ValidationError(
                "Conexão API não configurada para esta integração."
            )
        
        return attrs


class IntegrationStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas de integrações"""
    total_integrations = serializers.IntegerField()
    active_integrations = serializers.IntegerField()
    inactive_integrations = serializers.IntegerField()
    error_integrations = serializers.IntegerField()
    
    # Por tipo
    integrations_by_type = serializers.DictField()
    
    # Logs recentes
    recent_logs = IntegrationLogSerializer(many=True)
    
    # Mais usadas
    most_used = IntegrationSerializer(many=True)


class BulkIntegrationSerializer(serializers.Serializer):
    """Serializer para operações em lote"""
    integration_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        max_length=50
    )
    action = serializers.ChoiceField(choices=['activate', 'deactivate', 'delete'])
    
    def validate_integration_ids(self, value):
        user = self.context['request'].user
        existing_count = Integration.objects.filter(
            id__in=value,
            owner=user
        ).count()
        
        if existing_count != len(value):
            raise serializers.ValidationError("Algumas integrações não foram encontradas.")
        
        return value 