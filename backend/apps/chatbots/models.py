"""
Modelos para gerenciamento de chatbots
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class Chatbot(models.Model):
    """
    Modelo principal para um chatbot
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nome")
    description = models.TextField(blank=True, verbose_name="Descrição")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chatbots')
    
    # Configurações visuais
    theme = models.CharField(
        max_length=20,
        choices=[
            ('light', 'Claro'),
            ('dark', 'Escuro'),
            ('auto', 'Automático')
        ],
        default='light'
    )
    primary_color = models.CharField(max_length=7, default='#0042DA')  # Hex color
    
    # Status e configurações
    is_published = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Configurações de comportamento
    settings = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Chatbot"
        verbose_name_plural = "Chatbots"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def publish(self):
        """Publica o chatbot"""
        self.is_published = True
        self.published_at = timezone.now()
        self.save()
    
    def unpublish(self):
        """Despublica o chatbot"""
        self.is_published = False
        self.published_at = None
        self.save()


class ChatbotVersion(models.Model):
    """
    Versionamento de chatbots para permitir rollback
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chatbot = models.ForeignKey(Chatbot, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    name = models.CharField(max_length=255)
    
    # Snapshot dos dados
    flow_data = models.JSONField()
    settings_data = models.JSONField()
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Versão do Chatbot"
        verbose_name_plural = "Versões dos Chatbots"
        ordering = ['-version_number']
        unique_together = ['chatbot', 'version_number']
    
    def __str__(self):
        return f"{self.chatbot.name} v{self.version_number}"


class ChatbotAnalytics(models.Model):
    """
    Analytics básicos para chatbots
    """
    chatbot = models.OneToOneField(Chatbot, on_delete=models.CASCADE, related_name='analytics')
    
    # Contadores
    total_conversations = models.PositiveIntegerField(default=0)
    total_messages = models.PositiveIntegerField(default=0)
    unique_users = models.PositiveIntegerField(default=0)
    
    # Métricas de engajamento
    avg_conversation_length = models.FloatField(default=0.0)
    completion_rate = models.FloatField(default=0.0)  # Porcentagem que chegou ao fim
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Analytics do Chatbot"
        verbose_name_plural = "Analytics dos Chatbots"
    
    def __str__(self):
        return f"Analytics: {self.chatbot.name}" 