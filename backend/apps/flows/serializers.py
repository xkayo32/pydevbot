from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Flow, FlowTemplate, FlowExecution, FlowMessage


class FlowSerializer(serializers.ModelSerializer):
    """Serializer para fluxos"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    chatbot_name = serializers.CharField(source='chatbot.name', read_only=True)
    validation_errors = serializers.SerializerMethodField()
    
    class Meta:
        model = Flow
        fields = [
            'id', 'chatbot', 'chatbot_name', 'name', 'description',
            'is_main_flow', 'is_active', 'nodes', 'edges', 'viewport',
            'settings', 'created_at', 'updated_at', 'created_by',
            'created_by_name', 'validation_errors'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')
    
    def get_validation_errors(self, obj):
        return obj.validate_flow()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, attrs):
        # Garantir que só há um fluxo principal por chatbot
        if attrs.get('is_main_flow', False):
            chatbot = attrs['chatbot']
            existing_main = Flow.objects.filter(
                chatbot=chatbot,
                is_main_flow=True
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_main.exists():
                raise serializers.ValidationError(
                    "Chatbot já possui um fluxo principal. Desative o atual primeiro."
                )
        
        return attrs


class FlowCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para criação de fluxos"""
    
    class Meta:
        model = Flow
        fields = ['name', 'description', 'is_main_flow']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        
        # Adicionar nó inicial por padrão
        validated_data['nodes'] = [
            {
                'id': 'start-1',
                'type': 'start',
                'position': {'x': 250, 'y': 250},
                'data': {
                    'label': 'Início',
                    'title': 'Início da Conversa'
                }
            }
        ]
        validated_data['edges'] = []
        validated_data['viewport'] = {
            'x': 0,
            'y': 0,
            'zoom': 1
        }
        
        return super().create(validated_data)


class FlowUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de fluxos"""
    
    class Meta:
        model = Flow
        fields = [
            'name', 'description', 'is_main_flow', 'is_active',
            'nodes', 'edges', 'viewport', 'settings'
        ]
    
    def validate(self, attrs):
        # Garantir que só há um fluxo principal por chatbot
        if attrs.get('is_main_flow', False):
            chatbot = self.instance.chatbot
            existing_main = Flow.objects.filter(
                chatbot=chatbot,
                is_main_flow=True
            ).exclude(id=self.instance.id)
            
            if existing_main.exists():
                raise serializers.ValidationError(
                    "Chatbot já possui um fluxo principal. Desative o atual primeiro."
                )
        
        return attrs


class FlowTemplateSerializer(serializers.ModelSerializer):
    """Serializer para templates de fluxos"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = FlowTemplate
        fields = [
            'id', 'name', 'description', 'category', 'template_nodes',
            'template_edges', 'template_settings', 'is_public',
            'created_by', 'created_by_name', 'created_at', 'usage_count'
        ]
        read_only_fields = ('id', 'created_by', 'created_at', 'usage_count')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FlowExecutionSerializer(serializers.ModelSerializer):
    """Serializer para execuções de fluxos"""
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    messages_count = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = FlowExecution
        fields = [
            'id', 'flow', 'flow_name', 'user_id', 'user_data',
            'current_node_id', 'status', 'variables', 'started_at',
            'last_activity', 'completed_at', 'messages_count', 'duration'
        ]
        read_only_fields = ('id', 'started_at', 'last_activity')
    
    def get_messages_count(self, obj):
        return obj.messages.count()
    
    def get_duration(self, obj):
        if obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None


class FlowMessageSerializer(serializers.ModelSerializer):
    """Serializer para mensagens de fluxos"""
    
    class Meta:
        model = FlowMessage
        fields = [
            'id', 'execution', 'node_id', 'message_type',
            'content', 'sent_at'
        ]
        read_only_fields = ('id', 'sent_at')


class FlowExecutionDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para execução de fluxo"""
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    messages = FlowMessageSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = FlowExecution
        fields = [
            'id', 'flow', 'flow_name', 'user_id', 'user_data',
            'current_node_id', 'status', 'variables', 'started_at',
            'last_activity', 'completed_at', 'messages', 'duration'
        ]
        read_only_fields = ('id', 'started_at', 'last_activity')
    
    def get_duration(self, obj):
        if obj.completed_at:
            delta = obj.completed_at - obj.started_at
            return delta.total_seconds()
        return None


class FlowFromTemplateSerializer(serializers.Serializer):
    """Serializer para criar fluxo a partir de template"""
    template_id = serializers.UUIDField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    is_main_flow = serializers.BooleanField(default=False)
    
    def validate_template_id(self, value):
        try:
            template = FlowTemplate.objects.get(id=value)
            if not template.is_public and template.created_by != self.context['request'].user:
                raise serializers.ValidationError("Template não encontrado.")
            return value
        except FlowTemplate.DoesNotExist:
            raise serializers.ValidationError("Template não encontrado.")
    
    def validate(self, attrs):
        # Garantir que só há um fluxo principal por chatbot
        if attrs.get('is_main_flow', False):
            chatbot_id = self.context['view'].kwargs.get('chatbot_pk')
            existing_main = Flow.objects.filter(
                chatbot_id=chatbot_id,
                is_main_flow=True
            )
            
            if existing_main.exists():
                raise serializers.ValidationError(
                    "Chatbot já possui um fluxo principal. Desative o atual primeiro."
                )
        
        return attrs


class FlowCloneSerializer(serializers.Serializer):
    """Serializer para clonagem de fluxos"""
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_name(self, value):
        chatbot_id = self.context['view'].kwargs.get('chatbot_pk')
        if Flow.objects.filter(chatbot_id=chatbot_id, name=value).exists():
            raise serializers.ValidationError(
                "Já existe um fluxo com este nome neste chatbot."
            )
        return value 