from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Chatbot, ChatbotVersion, ChatbotAnalytics


class ChatbotSerializer(serializers.ModelSerializer):
    """Serializer para chatbots"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    flows_count = serializers.SerializerMethodField()
    latest_version = serializers.SerializerMethodField()
    
    class Meta:
        model = Chatbot
        fields = [
            'id', 'name', 'description', 'owner', 'owner_name',
            'theme', 'primary_color', 'is_published', 'is_active',
            'settings', 'created_at', 'updated_at', 'published_at',
            'flows_count', 'latest_version'
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at', 'published_at')
    
    def get_flows_count(self, obj):
        return obj.flows.count()
    
    def get_latest_version(self, obj):
        latest = obj.versions.first()
        if latest:
            return {
                'version_number': latest.version_number,
                'created_at': latest.created_at,
            }
        return None
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ChatbotCreateSerializer(serializers.ModelSerializer):
    """Serializer simplificado para criação de chatbots"""
    
    class Meta:
        model = Chatbot
        fields = ['name', 'description', 'theme', 'primary_color']
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class ChatbotUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de chatbots"""
    
    class Meta:
        model = Chatbot
        fields = [
            'name', 'description', 'theme', 'primary_color', 
            'is_active', 'settings'
        ]


class ChatbotVersionSerializer(serializers.ModelSerializer):
    """Serializer para versões de chatbots"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = ChatbotVersion
        fields = [
            'id', 'chatbot', 'version_number', 'name',
            'flow_data', 'settings_data', 'created_by', 'created_by_name',
            'created_at', 'notes'
        ]
        read_only_fields = ('id', 'created_by', 'created_at', 'version_number')
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        
        # Auto-incrementar número da versão
        chatbot = validated_data['chatbot']
        last_version = chatbot.versions.first()
        validated_data['version_number'] = (last_version.version_number + 1) if last_version else 1
        
        return super().create(validated_data)


class ChatbotAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer para analytics de chatbots"""
    
    class Meta:
        model = ChatbotAnalytics
        fields = [
            'total_conversations', 'total_messages', 'unique_users',
            'avg_conversation_length', 'completion_rate', 'last_updated'
        ]
        read_only_fields = ('last_updated',)


class ChatbotDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para um chatbot específico"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    flows = serializers.SerializerMethodField()
    analytics = ChatbotAnalyticsSerializer(read_only=True)
    recent_versions = serializers.SerializerMethodField()
    
    class Meta:
        model = Chatbot
        fields = [
            'id', 'name', 'description', 'owner', 'owner_name',
            'theme', 'primary_color', 'is_published', 'is_active',
            'settings', 'created_at', 'updated_at', 'published_at',
            'flows', 'analytics', 'recent_versions'
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'updated_at', 'published_at')
    
    def get_flows(self, obj):
        from apps.flows.serializers import FlowSerializer
        return FlowSerializer(obj.flows.all(), many=True, context=self.context).data
    
    def get_recent_versions(self, obj):
        recent = obj.versions.all()[:5]
        return ChatbotVersionSerializer(recent, many=True, context=self.context).data


class ChatbotPublishSerializer(serializers.Serializer):
    """Serializer para publicação/despublicação de chatbots"""
    action = serializers.ChoiceField(choices=['publish', 'unpublish'])
    
    def validate(self, attrs):
        chatbot = self.instance
        action = attrs['action']
        
        if action == 'publish':
            # Validar se o chatbot pode ser publicado
            if not chatbot.flows.filter(is_main_flow=True).exists():
                raise serializers.ValidationError(
                    "Chatbot deve ter pelo menos um fluxo principal para ser publicado."
                )
            
            # Verificar se há nós no fluxo principal
            main_flow = chatbot.flows.filter(is_main_flow=True).first()
            if not main_flow.nodes:
                raise serializers.ValidationError(
                    "Fluxo principal deve ter pelo menos um nó para publicação."
                )
        
        return attrs


class ChatbotCloneSerializer(serializers.Serializer):
    """Serializer para clonagem de chatbots"""
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    include_analytics = serializers.BooleanField(default=False)
    
    def validate_name(self, value):
        user = self.context['request'].user
        if user.chatbots.filter(name=value).exists():
            raise serializers.ValidationError(
                "Você já possui um chatbot com este nome."
            )
        return value 