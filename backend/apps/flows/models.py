"""
Modelos para fluxos conversacionais
"""
from django.db import models
from django.contrib.auth.models import User
import uuid


class Flow(models.Model):
    """
    Modelo para um fluxo conversacional
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chatbot = models.ForeignKey('chatbots.Chatbot', on_delete=models.CASCADE, related_name='flows')
    name = models.CharField(max_length=255, verbose_name="Nome do Fluxo")
    description = models.TextField(blank=True, verbose_name="Descrição")
    
    # Configurações do fluxo
    is_main_flow = models.BooleanField(default=False)  # Fluxo principal do chatbot
    is_active = models.BooleanField(default=True)
    
    # Dados do React Flow
    nodes = models.JSONField(default=list)  # Array de nodes
    edges = models.JSONField(default=list)  # Array de connections
    viewport = models.JSONField(default=dict)  # Posição e zoom do canvas
    
    # Configurações específicas
    settings = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    class Meta:
        verbose_name = "Fluxo"
        verbose_name_plural = "Fluxos"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.chatbot.name} - {self.name}"
    
    def get_start_node(self):
        """Retorna o nó inicial do fluxo"""
        for node in self.nodes:
            if node.get('type') == 'start':
                return node
        return None
    
    def validate_flow(self):
        """Valida se o fluxo está correto"""
        errors = []
        
        # Verificar se tem nó inicial
        start_node = self.get_start_node()
        if not start_node:
            errors.append("Fluxo deve ter um nó inicial")
        
        # Verificar se todos os nós têm conexões válidas
        node_ids = {node['id'] for node in self.nodes}
        for edge in self.edges:
            if edge['source'] not in node_ids:
                errors.append(f"Conexão inválida: nó origem {edge['source']} não existe")
            if edge['target'] not in node_ids:
                errors.append(f"Conexão inválida: nó destino {edge['target']} não existe")
        
        return errors


class FlowTemplate(models.Model):
    """
    Templates de fluxos pré-definidos
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=50,
        choices=[
            ('customer_service', 'Atendimento ao Cliente'),
            ('lead_generation', 'Geração de Leads'),
            ('survey', 'Pesquisa'),
            ('faq', 'FAQ'),
            ('booking', 'Agendamento'),
            ('ecommerce', 'E-commerce'),
            ('other', 'Outros')
        ]
    )
    
    # Template data
    template_nodes = models.JSONField()
    template_edges = models.JSONField()
    template_settings = models.JSONField(default=dict)
    
    # Metadata
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    usage_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Template de Fluxo"
        verbose_name_plural = "Templates de Fluxos"
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name


class FlowExecution(models.Model):
    """
    Execução de um fluxo por um usuário
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name='executions')
    
    # Identificação do usuário (pode ser anônimo)
    user_id = models.CharField(max_length=255)  # ID único do usuário/sessão
    user_data = models.JSONField(default=dict)  # Dados coletados do usuário
    
    # Estado da execução
    current_node_id = models.CharField(max_length=255, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Ativo'),
            ('completed', 'Concluído'),
            ('abandoned', 'Abandonado'),
            ('error', 'Erro')
        ],
        default='active'
    )
    
    # Variáveis do fluxo
    variables = models.JSONField(default=dict)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Execução de Fluxo"
        verbose_name_plural = "Execuções de Fluxos"
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.flow.name} - {self.user_id}"


class FlowMessage(models.Model):
    """
    Mensagens trocadas durante a execução de um fluxo
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    execution = models.ForeignKey(FlowExecution, on_delete=models.CASCADE, related_name='messages')
    
    # Dados da mensagem
    node_id = models.CharField(max_length=255)
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('bot', 'Bot'),
            ('user', 'Usuário'),
            ('system', 'Sistema')
        ]
    )
    content = models.JSONField()  # Conteúdo da mensagem (texto, imagem, etc.)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Mensagem do Fluxo"
        verbose_name_plural = "Mensagens dos Fluxos"
        ordering = ['sent_at']
    
    def __str__(self):
        return f"{self.message_type}: {self.execution.user_id}" 