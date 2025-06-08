"""
Modelos para autenticação e perfis de usuário
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid


class UserProfile(models.Model):
    """
    Perfil estendido do usuário
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Informações adicionais
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    company = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    
    # Configurações de usuário
    theme_preference = models.CharField(
        max_length=20,
        choices=[
            ('light', 'Claro'),
            ('dark', 'Escuro'),
            ('auto', 'Automático')
        ],
        default='auto'
    )
    language = models.CharField(max_length=10, default='pt-br')
    timezone = models.CharField(max_length=50, default='America/Sao_Paulo')
    
    # Notificações
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    # Plano/Subscription
    plan_type = models.CharField(
        max_length=20,
        choices=[
            ('free', 'Gratuito'),
            ('pro', 'Profissional'),
            ('enterprise', 'Empresarial')
        ],
        default='free'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Perfil do Usuário"
        verbose_name_plural = "Perfis dos Usuários"
    
    def __str__(self):
        return f"Perfil: {self.user.username}"


class APIKey(models.Model):
    """
    Chaves de API para integração externa
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=255, verbose_name="Nome da Chave")
    key = models.CharField(max_length=255, unique=True)
    
    # Permissões
    permissions = models.JSONField(default=list)  # Lista de permissões
    
    # Status
    is_active = models.BooleanField(default=True)
    last_used = models.DateTimeField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Chave de API"
        verbose_name_plural = "Chaves de API"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    def is_expired(self):
        """Verifica se a chave expirou"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False


class UserSession(models.Model):
    """
    Sessões de usuário para controle de acesso
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    
    # Dados da sessão
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    device_info = models.JSONField(default=dict)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = "Sessão do Usuário"
        verbose_name_plural = "Sessões dos Usuários"
        ordering = ['-last_activity']
    
    def __str__(self):
        return f"{self.user.username} - {self.ip_address}"
    
    def is_expired(self):
        """Verifica se a sessão expirou"""
        return timezone.now() > self.expires_at 