from rest_framework import serializers
from django.utils import timezone
from .models import ChatSession, ChatMessage, ExecutionLog, WebhookEvent, UserInput


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer para sessões de chat"""
    chatbot_name = serializers.CharField(source='chatbot.name', read_only=True)
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    duration_seconds = serializers.SerializerMethodField()
    messages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'chatbot', 'chatbot_name', 'flow', 'flow_name',
            'user_id', 'user_data', 'current_node_id', 'status',
            'variables', 'context', 'message_count', 'start_time',
            'last_activity', 'end_time', 'ip_address', 'user_agent',
            'referrer', 'duration_seconds', 'messages_count'
        ]
        read_only_fields = ('id', 'start_time', 'last_activity', 'message_count')
    
    def get_duration_seconds(self, obj):
        return obj.duration()
    
    def get_messages_count(self, obj):
        return obj.messages.count()


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensagens de chat"""
    session_user_id = serializers.CharField(source='session.user_id', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'session_user_id', 'node_id', 'message_type',
            'content', 'content_type', 'is_read', 'sent_at',
            'delivered_at', 'read_at'
        ]
        read_only_fields = ('id', 'sent_at', 'delivered_at', 'read_at')
    
    def validate_content(self, value):
        """Valida se o conteúdo é válido"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Conteúdo deve ser um objeto JSON válido.")
        return value


class ExecutionLogSerializer(serializers.ModelSerializer):
    """Serializer para logs de execução"""
    session_user_id = serializers.CharField(source='session.user_id', read_only=True)
    
    class Meta:
        model = ExecutionLog
        fields = [
            'id', 'session', 'session_user_id', 'node_id', 'component_type',
            'status', 'input_data', 'output_data', 'error_message',
            'execution_time', 'started_at', 'completed_at'
        ]
        read_only_fields = ('id', 'started_at', 'completed_at')
    
    def validate_input_data(self, value):
        """Valida se os dados de entrada são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dados de entrada devem ser um objeto JSON válido.")
        return value
    
    def validate_output_data(self, value):
        """Valida se os dados de saída são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dados de saída devem ser um objeto JSON válido.")
        return value


class WebhookEventSerializer(serializers.ModelSerializer):
    """Serializer para eventos de webhook"""
    session_user_id = serializers.CharField(source='session.user_id', read_only=True)
    
    class Meta:
        model = WebhookEvent
        fields = [
            'id', 'session', 'session_user_id', 'event_type', 'webhook_url',
            'payload', 'headers', 'status', 'response_status', 'response_data',
            'error_message', 'retry_count', 'max_retries', 'created_at',
            'sent_at', 'next_retry'
        ]
        read_only_fields = ('id', 'created_at', 'sent_at')
    
    def validate_payload(self, value):
        """Valida se o payload é válido"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Payload deve ser um objeto JSON válido.")
        return value
    
    def validate_headers(self, value):
        """Valida se os headers são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Headers devem ser um objeto JSON válido.")
        return value


class UserInputSerializer(serializers.ModelSerializer):
    """Serializer para entradas de usuário"""
    session_user_id = serializers.CharField(source='session.user_id', read_only=True)
    message_content = serializers.JSONField(source='message.content', read_only=True)
    
    class Meta:
        model = UserInput
        fields = [
            'id', 'session', 'session_user_id', 'message', 'message_content',
            'input_type', 'raw_value', 'processed_value', 'variable_name',
            'is_valid', 'validation_errors', 'collected_at'
        ]
        read_only_fields = ('id', 'collected_at')
    
    def validate_processed_value(self, value):
        """Valida se o valor processado é válido"""
        # O valor processado pode ser de qualquer tipo JSON válido
        return value
    
    def validate_validation_errors(self, value):
        """Valida se os erros de validação são válidos"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Erros de validação devem ser uma lista.")
        return value


class ChatSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de sessões de chat"""
    
    class Meta:
        model = ChatSession
        fields = [
            'chatbot', 'flow', 'user_id', 'user_data', 'variables',
            'context', 'ip_address', 'user_agent', 'referrer'
        ]
    
    def create(self, validated_data):
        validated_data['status'] = 'active'
        validated_data['current_node_id'] = None  # Será definido pelo primeiro nó
        return super().create(validated_data)


class ChatSessionStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas de sessões"""
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    abandoned_sessions = serializers.IntegerField()
    avg_duration_seconds = serializers.FloatField()
    sessions_today = serializers.IntegerField()
    sessions_this_week = serializers.IntegerField()


class ExecutionDashboardSerializer(serializers.Serializer):
    """Serializer para dashboard de execuções"""
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    completed_sessions = serializers.IntegerField()
    sessions_by_chatbot = serializers.ListField(child=serializers.DictField())
    recent_activity = serializers.ListField(child=serializers.DictField())
    common_input_types = serializers.ListField(child=serializers.DictField()) 