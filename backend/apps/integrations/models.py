"""
Modelos para integrações externas
"""
from django.db import models
from django.contrib.auth.models import User
import uuid


class Integration(models.Model):
    """
    Modelo base para integrações
    """
    INTEGRATION_TYPES = [
        ('webhook', 'Webhook'),
        ('api', 'API Externa'),
        ('database', 'Banco de Dados'),
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('slack', 'Slack'),
        ('discord', 'Discord'),
        ('zapier', 'Zapier'),
        ('make', 'Make (Integromat)'),
        ('custom', 'Personalizada'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Ativo'),
        ('inactive', 'Inativo'),
        ('error', 'Erro'),
        ('testing', 'Testando'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    type = models.CharField(max_length=20, choices=INTEGRATION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    
    # Configurações da integração
    config = models.JSONField(default=dict, verbose_name="Configurações")
    credentials = models.JSONField(default=dict, verbose_name="Credenciais")
    
    # Relacionamentos
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='integrations')
    chatbots = models.ManyToManyField('chatbots.Chatbot', blank=True, related_name='integrations')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Integração"
        verbose_name_plural = "Integrações"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Webhook(models.Model):
    """
    Modelo específico para webhooks
    """
    METHOD_CHOICES = [
        ('GET', 'GET'),
        ('POST', 'POST'),
        ('PUT', 'PUT'),
        ('PATCH', 'PATCH'),
        ('DELETE', 'DELETE'),
    ]
    
    integration = models.OneToOneField(Integration, on_delete=models.CASCADE, related_name='webhook')
    url = models.URLField(verbose_name="URL do Webhook")
    method = models.CharField(max_length=10, choices=METHOD_CHOICES, default='POST')
    headers = models.JSONField(default=dict, verbose_name="Headers HTTP")
    
    # Configurações de segurança
    secret_token = models.CharField(max_length=255, blank=True, verbose_name="Token Secreto")
    verify_ssl = models.BooleanField(default=True, verbose_name="Verificar SSL")
    
    # Configurações de retry
    max_retries = models.PositiveIntegerField(default=3, verbose_name="Máximo de Tentativas")
    retry_delay = models.PositiveIntegerField(default=60, verbose_name="Delay entre Tentativas (segundos)")
    
    class Meta:
        verbose_name = "Webhook"
        verbose_name_plural = "Webhooks"
    
    def __str__(self):
        return f"Webhook: {self.url}"


class ApiConnection(models.Model):
    """
    Modelo para conexões com APIs externas
    """
    AUTH_TYPES = [
        ('none', 'Nenhuma'),
        ('basic', 'Basic Auth'),
        ('bearer', 'Bearer Token'),
        ('api_key', 'API Key'),
        ('oauth2', 'OAuth 2.0'),
        ('custom', 'Personalizada'),
    ]
    
    integration = models.OneToOneField(Integration, on_delete=models.CASCADE, related_name='api_connection')
    base_url = models.URLField(verbose_name="URL Base da API")
    auth_type = models.CharField(max_length=20, choices=AUTH_TYPES, default='none')
    
    # Configurações de autenticação
    api_key = models.CharField(max_length=255, blank=True, verbose_name="API Key")
    api_secret = models.CharField(max_length=255, blank=True, verbose_name="API Secret")
    access_token = models.TextField(blank=True, verbose_name="Access Token")
    refresh_token = models.TextField(blank=True, verbose_name="Refresh Token")
    
    # Headers padrão
    default_headers = models.JSONField(default=dict, verbose_name="Headers Padrão")
    
    # Configurações de timeout
    timeout = models.PositiveIntegerField(default=30, verbose_name="Timeout (segundos)")
    
    class Meta:
        verbose_name = "Conexão API"
        verbose_name_plural = "Conexões API"
    
    def __str__(self):
        return f"API: {self.base_url}"


class IntegrationLog(models.Model):
    """
    Log de execuções de integrações
    """
    LEVEL_CHOICES = [
        ('debug', 'Debug'),
        ('info', 'Info'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('critical', 'Critical'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(Integration, on_delete=models.CASCADE, related_name='logs')
    
    # Dados da execução
    execution_id = models.UUIDField(null=True, blank=True, verbose_name="ID da Execução")
    action = models.CharField(max_length=100, verbose_name="Ação")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='info')
    message = models.TextField(verbose_name="Mensagem")
    
    # Dados técnicos
    request_data = models.JSONField(null=True, blank=True, verbose_name="Dados da Requisição")
    response_data = models.JSONField(null=True, blank=True, verbose_name="Dados da Resposta")
    status_code = models.PositiveIntegerField(null=True, blank=True, verbose_name="Código de Status")
    duration = models.FloatField(null=True, blank=True, verbose_name="Duração (segundos)")
    
    # Timestamp
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Log de Integração"
        verbose_name_plural = "Logs de Integrações"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.integration.name} - {self.action} ({self.level})"


class IntegrationTemplate(models.Model):
    """
    Templates pré-configurados para integrações
    """
    CATEGORY_CHOICES = [
        ('communication', 'Comunicação'),
        ('crm', 'CRM'),
        ('ecommerce', 'E-commerce'),
        ('analytics', 'Analytics'),
        ('automation', 'Automação'),
        ('storage', 'Armazenamento'),
        ('payment', 'Pagamento'),
        ('social', 'Redes Sociais'),
        ('productivity', 'Produtividade'),
        ('other', 'Outros'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nome")
    description = models.TextField(verbose_name="Descrição")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=20, choices=Integration.INTEGRATION_TYPES)
    
    # Template de configuração
    config_template = models.JSONField(verbose_name="Template de Configuração")
    credentials_template = models.JSONField(verbose_name="Template de Credenciais")
    
    # Metadados
    icon = models.CharField(max_length=100, blank=True, verbose_name="Ícone")
    documentation_url = models.URLField(blank=True, verbose_name="URL da Documentação")
    is_public = models.BooleanField(default=True, verbose_name="Público")
    
    # Estatísticas
    usage_count = models.PositiveIntegerField(default=0, verbose_name="Contador de Uso")
    
    # Relacionamentos
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Template de Integração"
        verbose_name_plural = "Templates de Integrações"
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name 