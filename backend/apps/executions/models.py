"""
Modelos para execução em tempo real dos chatbots
"""
from django.db import models
from django.utils import timezone
import uuid


class ChatSession(models.Model):
    """
    Sessão de chat com um usuário
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chatbot = models.ForeignKey('chatbots.Chatbot', on_delete=models.CASCADE, related_name='chat_sessions')
    flow = models.ForeignKey('flows.Flow', on_delete=models.CASCADE, related_name='chat_sessions')
    
    # Identificação do usuário
    user_id = models.CharField(max_length=255)  # ID único da sessão
    user_data = models.JSONField(default=dict)  # Dados coletados
    
    # Estado da sessão
    current_node_id = models.CharField(max_length=255, null=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Ativo'),
            ('waiting', 'Aguardando'),
            ('completed', 'Concluído'),
            ('abandoned', 'Abandonado'),
            ('error', 'Erro')
        ],
        default='active'
    )
    
    # Contexto da conversa
    variables = models.JSONField(default=dict)  # Variáveis do fluxo
    context = models.JSONField(default=dict)  # Contexto adicional
    
    # Métricas
    message_count = models.PositiveIntegerField(default=0)
    start_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True)
    
    class Meta:
        verbose_name = "Sessão de Chat"
        verbose_name_plural = "Sessões de Chat"
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.chatbot.name} - {self.user_id}"
    
    def duration(self):
        """Duração da sessão em segundos"""
        if self.end_time:
            return (self.end_time - self.start_time).total_seconds()
        return (timezone.now() - self.start_time).total_seconds()


class ChatMessage(models.Model):
    """
    Mensagens trocadas na sessão
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    
    # Dados da mensagem
    node_id = models.CharField(max_length=255, null=True)  # Componente que gerou
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('bot', 'Bot'),
            ('user', 'Usuário'),
            ('system', 'Sistema')
        ]
    )
    
    # Conteúdo
    content = models.JSONField()  # Conteúdo da mensagem
    content_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('image', 'Imagem'),
            ('video', 'Vídeo'),
            ('file', 'Arquivo'),
            ('choice', 'Escolha'),
            ('input', 'Entrada'),
            ('system', 'Sistema')
        ],
        default='text'
    )
    
    # Estado
    is_read = models.BooleanField(default=False)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Mensagem do Chat"
        verbose_name_plural = "Mensagens do Chat"
        ordering = ['sent_at']
    
    def __str__(self):
        return f"{self.message_type}: {self.session.user_id}"


class ExecutionLog(models.Model):
    """
    Log de execução dos componentes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='execution_logs')
    
    # Dados da execução
    node_id = models.CharField(max_length=255)
    component_type = models.CharField(max_length=50)
    
    # Status da execução
    status = models.CharField(
        max_length=20,
        choices=[
            ('started', 'Iniciado'),
            ('completed', 'Concluído'),
            ('failed', 'Falhou'),
            ('skipped', 'Pulado')
        ]
    )
    
    # Dados da execução
    input_data = models.JSONField(default=dict)
    output_data = models.JSONField(default=dict)
    error_message = models.TextField(blank=True)
    
    # Métricas
    execution_time = models.FloatField(null=True)  # Tempo em ms
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Log de Execução"
        verbose_name_plural = "Logs de Execução"
        ordering = ['started_at']
    
    def __str__(self):
        return f"{self.component_type} - {self.status}"


class WebhookEvent(models.Model):
    """
    Eventos de webhook para integração externa
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='webhook_events')
    
    # Dados do webhook
    event_type = models.CharField(max_length=100)
    webhook_url = models.URLField()
    
    # Dados enviados
    payload = models.JSONField()
    headers = models.JSONField(default=dict)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pendente'),
            ('sent', 'Enviado'),
            ('failed', 'Falhou'),
            ('retrying', 'Tentando Novamente')
        ],
        default='pending'
    )
    
    # Resposta
    response_status = models.PositiveIntegerField(null=True)
    response_data = models.JSONField(null=True)
    error_message = models.TextField(blank=True)
    
    # Tentativas
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    next_retry = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Evento de Webhook"
        verbose_name_plural = "Eventos de Webhook"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.status}"


class UserInput(models.Model):
    """
    Entradas de usuário coletadas
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='user_inputs')
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE)
    
    # Dados da entrada
    input_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Texto'),
            ('number', 'Número'),
            ('email', 'Email'),
            ('phone', 'Telefone'),
            ('choice', 'Escolha'),
            ('file', 'Arquivo'),
            ('date', 'Data')
        ]
    )
    
    # Valor coletado
    raw_value = models.TextField()  # Valor original
    processed_value = models.JSONField()  # Valor processado
    variable_name = models.CharField(max_length=255, null=True)  # Variável associada
    
    # Validação
    is_valid = models.BooleanField(default=True)
    validation_errors = models.JSONField(default=list)
    
    # Timestamps
    collected_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Entrada do Usuário"
        verbose_name_plural = "Entradas dos Usuários"
        ordering = ['collected_at']
    
    def __str__(self):
        return f"{self.input_type}: {self.raw_value}" 