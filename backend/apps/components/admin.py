from django.contrib import admin
from .models import (
    ComponentCategory, 
    ComponentTemplate, 
    ComponentInstance, 
    ComponentConnection, 
    ComponentVariable
)


@admin.register(ComponentCategory)
class ComponentCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'color', 'order')
    list_filter = ('order',)
    search_fields = ('name', 'description')
    ordering = ('order', 'name')


@admin.register(ComponentTemplate)
class ComponentTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'component_type', 'is_active', 'created_at')
    list_filter = ('category', 'component_type', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'component_type')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'description', 'category', 'component_type', 'is_active')
        }),
        ('Aparência', {
            'fields': ('icon', 'color')
        }),
        ('Configuração', {
            'fields': ('default_data', 'default_settings', 'validation_schema')
        }),
        ('Handles', {
            'fields': ('input_handles', 'output_handles')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ComponentInstance)
class ComponentInstanceAdmin(admin.ModelAdmin):
    list_display = ('template', 'flow', 'node_id', 'created_at')
    list_filter = ('template__category', 'template__component_type', 'created_at')
    search_fields = ('template__name', 'flow__name', 'node_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Configuração', {
            'fields': ('flow', 'template', 'node_id', 'position')
        }),
        ('Dados', {
            'fields': ('data', 'settings', 'variables')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ComponentConnection)
class ComponentConnectionAdmin(admin.ModelAdmin):
    list_display = ('source_component', 'target_component', 'source_handle', 'target_handle', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('source_component__template__name', 'target_component__template__name')
    readonly_fields = ('id', 'created_at')


@admin.register(ComponentVariable)
class ComponentVariableAdmin(admin.ModelAdmin):
    list_display = ('name', 'variable_type', 'flow', 'is_required', 'created_at')
    list_filter = ('variable_type', 'is_required', 'created_at')
    search_fields = ('name', 'description', 'flow__name')
    readonly_fields = ('id', 'created_at', 'updated_at') 