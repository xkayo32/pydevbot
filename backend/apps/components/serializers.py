from rest_framework import serializers
from .models import (
    ComponentCategory, 
    ComponentTemplate, 
    ComponentInstance, 
    ComponentConnection, 
    ComponentVariable
)


class ComponentCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorias de componentes"""
    
    class Meta:
        model = ComponentCategory
        fields = ['id', 'name', 'description', 'icon', 'color', 'order']


class ComponentTemplateSerializer(serializers.ModelSerializer):
    """Serializer para templates de componentes"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = ComponentTemplate
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'component_type', 'icon', 'color', 'default_data', 'default_settings',
            'input_handles', 'output_handles', 'validation_schema',
            'is_active', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_default_data(self, value):
        """Valida se os dados padrão são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dados padrão devem ser um objeto JSON válido.")
        return value
    
    def validate_default_settings(self, value):
        """Valida se as configurações padrão são válidas"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Configurações padrão devem ser um objeto JSON válido.")
        return value
    
    def validate_input_handles(self, value):
        """Valida se os handles de entrada são válidos"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Handles de entrada devem ser uma lista.")
        return value
    
    def validate_output_handles(self, value):
        """Valida se os handles de saída são válidos"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Handles de saída devem ser uma lista.")
        return value


class ComponentInstanceSerializer(serializers.ModelSerializer):
    """Serializer para instâncias de componentes"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_type = serializers.CharField(source='template.component_type', read_only=True)
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    
    class Meta:
        model = ComponentInstance
        fields = [
            'id', 'flow', 'flow_name', 'template', 'template_name', 'template_type',
            'node_id', 'position', 'data', 'settings', 'variables',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_position(self, value):
        """Valida se a posição é válida"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Posição deve ser um objeto JSON válido.")
        
        required_fields = ['x', 'y']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Posição deve conter o campo '{field}'.")
        
        return value
    
    def validate_data(self, value):
        """Valida se os dados são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dados devem ser um objeto JSON válido.")
        return value
    
    def validate_settings(self, value):
        """Valida se as configurações são válidas"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Configurações devem ser um objeto JSON válido.")
        return value


class ComponentConnectionSerializer(serializers.ModelSerializer):
    """Serializer para conexões entre componentes"""
    source_template_name = serializers.CharField(source='source_component.template.name', read_only=True)
    target_template_name = serializers.CharField(source='target_component.template.name', read_only=True)
    
    class Meta:
        model = ComponentConnection
        fields = [
            'id', 'flow', 'source_component', 'target_component',
            'source_template_name', 'target_template_name',
            'source_handle', 'target_handle', 'connection_data',
            'created_at'
        ]
        read_only_fields = ('id', 'created_at')
    
    def validate_connection_data(self, value):
        """Valida se os dados da conexão são válidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Dados da conexão devem ser um objeto JSON válido.")
        return value


class ComponentVariableSerializer(serializers.ModelSerializer):
    """Serializer para variáveis dos componentes"""
    flow_name = serializers.CharField(source='flow.name', read_only=True)
    
    class Meta:
        model = ComponentVariable
        fields = [
            'id', 'flow', 'flow_name', 'name', 'variable_type',
            'default_value', 'is_required', 'description',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def validate_name(self, value):
        """Valida se o nome da variável é válido"""
        if not value.replace('_', '').isalnum():
            raise serializers.ValidationError(
                "Nome da variável deve conter apenas letras, números e underscore."
            )
        return value


class ComponentValidationSerializer(serializers.Serializer):
    """Serializer para validação de componentes"""
    template_id = serializers.UUIDField()
    data = serializers.JSONField()
    
    def validate(self, attrs):
        try:
            template = ComponentTemplate.objects.get(id=attrs['template_id'], is_active=True)
        except ComponentTemplate.DoesNotExist:
            raise serializers.ValidationError("Template de componente não encontrado.")
        
        # Aqui você pode implementar validação usando o validation_schema do template
        # Por enquanto, apenas verifica se os dados são um dict válido
        data = attrs['data']
        if not isinstance(data, dict):
            raise serializers.ValidationError("Dados devem ser um objeto JSON válido.")
        
        attrs['template'] = template
        return attrs


class BulkComponentInstanceSerializer(serializers.Serializer):
    """Serializer para operações em lote de instâncias de componentes"""
    instances = ComponentInstanceSerializer(many=True)
    
    def create(self, validated_data):
        instances_data = validated_data['instances']
        instances = []
        
        for instance_data in instances_data:
            instance = ComponentInstance.objects.create(**instance_data)
            instances.append(instance)
        
        return {'instances': instances} 