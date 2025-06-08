from django.contrib import admin
from .models import ChatSession, ChatMessage, ExecutionLog, WebhookEvent, UserInput


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('chatbot', 'user_id', 'status', 'message_count', 'start_time', 'last_activity')
    list_filter = ('status', 'start_time', 'chatbot')
    search_fields = ('chatbot__name', 'user_id', 'flow__name')
    readonly_fields = ('id', 'start_time', 'last_activity', 'duration')
    
    fieldsets = (
        ('Sessão', {
            'fields': ('chatbot', 'flow', 'user_id', 'status')
        }),
        ('Estado', {
            'fields': ('current_node_id', 'variables', 'context')
        }),
        ('Métricas', {
            'fields': ('message_count', 'start_time', 'last_activity', 'end_time'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('ip_address', 'user_agent', 'referrer'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'message_type', 'content_type', 'sent_at', 'is_read')
    list_filter = ('message_type', 'content_type', 'is_read', 'sent_at')
    search_fields = ('session__user_id', 'session__chatbot__name')
    readonly_fields = ('id', 'sent_at', 'delivered_at', 'read_at')
    
    fieldsets = (
        ('Mensagem', {
            'fields': ('session', 'node_id', 'message_type', 'content_type')
        }),
        ('Conteúdo', {
            'fields': ('content',)
        }),
        ('Estado', {
            'fields': ('is_read', 'sent_at', 'delivered_at', 'read_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ExecutionLog)
class ExecutionLogAdmin(admin.ModelAdmin):
    list_display = ('session', 'component_type', 'status', 'started_at', 'execution_time')
    list_filter = ('component_type', 'status', 'started_at')
    search_fields = ('session__user_id', 'component_type', 'node_id')
    readonly_fields = ('id', 'started_at', 'completed_at')
    
    fieldsets = (
        ('Execução', {
            'fields': ('session', 'node_id', 'component_type', 'status')
        }),
        ('Dados', {
            'fields': ('input_data', 'output_data', 'error_message')
        }),
        ('Métricas', {
            'fields': ('execution_time', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ('session', 'event_type', 'status', 'response_status', 'retry_count', 'created_at')
    list_filter = ('status', 'event_type', 'created_at')
    search_fields = ('session__user_id', 'event_type', 'webhook_url')
    readonly_fields = ('id', 'created_at', 'sent_at')
    
    fieldsets = (
        ('Webhook', {
            'fields': ('session', 'event_type', 'webhook_url', 'status')
        }),
        ('Dados', {
            'fields': ('payload', 'headers')
        }),
        ('Resposta', {
            'fields': ('response_status', 'response_data', 'error_message')
        }),
        ('Retry', {
            'fields': ('retry_count', 'max_retries', 'next_retry')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'sent_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserInput)
class UserInputAdmin(admin.ModelAdmin):
    list_display = ('session', 'input_type', 'variable_name', 'is_valid', 'collected_at')
    list_filter = ('input_type', 'is_valid', 'collected_at')
    search_fields = ('session__user_id', 'variable_name', 'raw_value')
    readonly_fields = ('id', 'collected_at')
    
    fieldsets = (
        ('Entrada', {
            'fields': ('session', 'message', 'input_type', 'variable_name')
        }),
        ('Valor', {
            'fields': ('raw_value', 'processed_value')
        }),
        ('Validação', {
            'fields': ('is_valid', 'validation_errors')
        }),
        ('Timestamp', {
            'fields': ('collected_at',),
            'classes': ('collapse',)
        }),
    ) 