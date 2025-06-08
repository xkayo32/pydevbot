from django.contrib import admin
from .models import Integration, Webhook, ApiConnection, IntegrationLog, IntegrationTemplate


@admin.register(Integration)
class IntegrationAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'status', 'owner', 'created_at', 'last_used')
    list_filter = ('type', 'status', 'created_at', 'last_used')
    search_fields = ('name', 'description', 'owner__username')
    readonly_fields = ('created_at', 'updated_at', 'last_used')
    filter_horizontal = ('chatbots',)
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'type', 'status', 'owner')
        }),
        ('Configuração', {
            'fields': ('config', 'credentials'),
            'classes': ('collapse',)
        }),
        ('Relacionamentos', {
            'fields': ('chatbots',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_used'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Webhook)
class WebhookAdmin(admin.ModelAdmin):
    list_display = ('integration', 'url', 'method', 'verify_ssl', 'max_retries')
    list_filter = ('method', 'verify_ssl')
    search_fields = ('integration__name', 'url')
    
    fieldsets = (
        ('Configuração Básica', {
            'fields': ('integration', 'url', 'method', 'headers')
        }),
        ('Segurança', {
            'fields': ('secret_token', 'verify_ssl')
        }),
        ('Retry', {
            'fields': ('max_retries', 'retry_delay')
        }),
    )


@admin.register(ApiConnection)
class ApiConnectionAdmin(admin.ModelAdmin):
    list_display = ('integration', 'base_url', 'auth_type', 'timeout')
    list_filter = ('auth_type',)
    search_fields = ('integration__name', 'base_url')
    
    fieldsets = (
        ('Configuração Básica', {
            'fields': ('integration', 'base_url', 'auth_type', 'timeout')
        }),
        ('Autenticação', {
            'fields': ('api_key', 'api_secret', 'access_token', 'refresh_token'),
            'classes': ('collapse',)
        }),
        ('Headers', {
            'fields': ('default_headers',),
            'classes': ('collapse',)
        }),
    )


@admin.register(IntegrationLog)
class IntegrationLogAdmin(admin.ModelAdmin):
    list_display = ('integration', 'action', 'level', 'status_code', 'duration', 'timestamp')
    list_filter = ('level', 'action', 'timestamp')
    search_fields = ('integration__name', 'action', 'message')
    readonly_fields = ('timestamp',)
    
    fieldsets = (
        ('Log Básico', {
            'fields': ('integration', 'execution_id', 'action', 'level', 'message')
        }),
        ('Dados Técnicos', {
            'fields': ('status_code', 'duration'),
        }),
        ('Dados da Requisição', {
            'fields': ('request_data', 'response_data'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )


@admin.register(IntegrationTemplate)
class IntegrationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'category', 'is_public', 'usage_count', 'created_by', 'created_at')
    list_filter = ('type', 'category', 'is_public', 'created_at')
    search_fields = ('name', 'description', 'created_by__username')
    readonly_fields = ('created_at', 'usage_count')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'type', 'category', 'created_by')
        }),
        ('Template', {
            'fields': ('config_template', 'credentials_template'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('icon', 'documentation_url', 'is_public')
        }),
        ('Estatísticas', {
            'fields': ('usage_count', 'created_at'),
            'classes': ('collapse',)
        }),
    ) 