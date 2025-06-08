"""
Modelos para componentes dos chatbots
"""
from django.db import models
from django.contrib.auth.models import User
import uuid


class ComponentCategory(models.Model):
    """
    Categorias dos componentes
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50)  # Nome do ícone
    color = models.CharField(max_length=7)  # Cor hexadecimal
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Categoria de Componente"
        verbose_name_plural = "Categorias de Componentes"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class ComponentTemplate(models.Model):
    """
    Templates de componentes disponíveis
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(ComponentCategory, on_delete=models.CASCADE, related_name='templates')
    
    # Dados do componente
    component_type = models.CharField(max_length=50)  # start, message, input, etc.
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7)
    
    # Configuração padrão
    default_data = models.JSONField(default=dict)
    default_settings = models.JSONField(default=dict)
    
    # Handles padrão
    input_handles = models.JSONField(default=list)  # Lista de handles de entrada
    output_handles = models.JSONField(default=list)  # Lista de handles de saída
    
    # Validação
    validation_schema = models.JSONField(default=dict)  # JSON Schema para validação
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Template de Componente"
        verbose_name_plural = "Templates de Componentes"
        ordering = ['category__order', 'name']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"


class ComponentInstance(models.Model):
    """
    Instâncias de componentes usadas nos fluxos
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey('flows.Flow', on_delete=models.CASCADE, related_name='components')
    template = models.ForeignKey(ComponentTemplate, on_delete=models.CASCADE)
    
    # Dados da instância
    node_id = models.CharField(max_length=255)  # ID único no React Flow
    position = models.JSONField(default=dict)  # {x: 0, y: 0}
    data = models.JSONField(default=dict)  # Dados específicos do componente
    
    # Configurações da instância
    settings = models.JSONField(default=dict)
    variables = models.JSONField(default=dict)  # Variáveis associadas
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Instância de Componente"
        verbose_name_plural = "Instâncias de Componentes"
        unique_together = ['flow', 'node_id']
    
    def __str__(self):
        return f"{self.template.name} - {self.flow.name}"


class ComponentConnection(models.Model):
    """
    Conexões entre componentes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey('flows.Flow', on_delete=models.CASCADE, related_name='connections')
    
    # Componentes conectados
    source_component = models.ForeignKey(
        ComponentInstance, 
        on_delete=models.CASCADE, 
        related_name='outgoing_connections'
    )
    target_component = models.ForeignKey(
        ComponentInstance, 
        on_delete=models.CASCADE, 
        related_name='incoming_connections'
    )
    
    # Handles da conexão
    source_handle = models.CharField(max_length=255)
    target_handle = models.CharField(max_length=255)
    
    # Dados da conexão (condições, etc.)
    connection_data = models.JSONField(default=dict)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Conexão de Componente"
        verbose_name_plural = "Conexões de Componentes"
        unique_together = ['source_component', 'target_component', 'source_handle', 'target_handle']
    
    def __str__(self):
        return f"{self.source_component.template.name} → {self.target_component.template.name}"


class ComponentVariable(models.Model):
    """
    Variáveis dos componentes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey('flows.Flow', on_delete=models.CASCADE, related_name='variables')
    
    # Dados da variável
    name = models.CharField(max_length=255)
    variable_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('number', 'Número'),
            ('boolean', 'Booleano'),
            ('date', 'Data'),
            ('file', 'Arquivo'),
            ('array', 'Lista'),
            ('object', 'Objeto')
        ],
        default='text'
    )
    
    # Valor padrão
    default_value = models.JSONField(null=True, blank=True)
    
    # Configurações
    is_required = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Variável do Componente"
        verbose_name_plural = "Variáveis dos Componentes"
        unique_together = ['flow', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.variable_type})" 