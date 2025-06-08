#!/usr/bin/env python
"""
🧪 Script de Teste do Backend Django
====================================

Testa todas as funcionalidades implementadas sem precisar do servidor web.
"""

import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'typebot_backend.settings')
django.setup()

from django.contrib.auth.models import User
from apps.authentication.models import UserProfile
from apps.chatbots.models import Chatbot, ChatbotVersion
from apps.flows.models import Flow, FlowTemplate
from apps.components.models import ComponentCategory, ComponentTemplate, ComponentInstance
from apps.executions.models import ChatSession, ChatMessage
from apps.integrations.models import Integration

def test_models():
    """Testa se todos os modelos estão funcionando"""
    print("🧪 TESTANDO MODELOS...")
    
    try:
        # Test User and UserProfile
        user_count = User.objects.count()
        profile_count = UserProfile.objects.count()
        print(f"✅ Users: {user_count}, Profiles: {profile_count}")
        
        # Test Chatbots
        chatbot_count = Chatbot.objects.count()
        print(f"✅ Chatbots: {chatbot_count}")
        
        # Test Flows
        flow_count = Flow.objects.count()
        template_count = FlowTemplate.objects.count()
        print(f"✅ Flows: {flow_count}, Templates: {template_count}")
        
        # Test Components
        category_count = ComponentCategory.objects.count()
        comp_template_count = ComponentTemplate.objects.count()
        instance_count = ComponentInstance.objects.count()
        print(f"✅ Component Categories: {category_count}")
        print(f"✅ Component Templates: {comp_template_count}")
        print(f"✅ Component Instances: {instance_count}")
        
        # Test Executions
        session_count = ChatSession.objects.count()
        message_count = ChatMessage.objects.count()
        print(f"✅ Chat Sessions: {session_count}")
        print(f"✅ Chat Messages: {message_count}")
        
        # Test Integrations
        integration_count = Integration.objects.count()
        print(f"✅ Integrations: {integration_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar modelos: {e}")
        return False

def create_test_data():
    """Cria dados de teste"""
    print("\n🔧 CRIANDO DADOS DE TESTE...")
    
    try:
        # Criar usuário de teste
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        
        if created:
            user.set_password('testpass123')
            user.save()
            print("✅ Usuário de teste criado")
        else:
            print("ℹ️ Usuário de teste já existe")
        
        # Criar perfil se não existir
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'bio': 'Usuário de teste para validação do sistema',
                'timezone': 'America/Sao_Paulo'
            }
        )
        
        if created:
            print("✅ Perfil de teste criado")
        else:
            print("ℹ️ Perfil de teste já existe")
        
        # Criar categorias de componentes se não existirem
        categories = [
            {'name': 'Fluxo Básico', 'description': 'Componentes de início e fim', 'icon': 'play', 'color': '#10B981', 'order': 1},
            {'name': 'Comunicação', 'description': 'Mensagens e mídia', 'icon': 'message', 'color': '#3B82F6', 'order': 2},
            {'name': 'Interação', 'description': 'Entrada de dados do usuário', 'icon': 'cursor', 'color': '#EF4444', 'order': 3},
            {'name': 'Lógica', 'description': 'Condições e fluxo de controle', 'icon': 'branch', 'color': '#F59E0B', 'order': 4},
            {'name': 'Dados', 'description': 'Manipulação de variáveis', 'icon': 'database', 'color': '#8B5CF6', 'order': 5},
            {'name': 'IA', 'description': 'Inteligência artificial', 'icon': 'brain', 'color': '#EC4899', 'order': 6},
            {'name': 'Integrações', 'description': 'APIs e webhooks', 'icon': 'link', 'color': '#06B6D4', 'order': 7},
        ]
        
        created_count = 0
        for cat_data in categories:
            category, created = ComponentCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults=cat_data
            )
            if created:
                created_count += 1
        
        print(f"✅ {created_count} categorias de componentes criadas")
        
        # Criar templates de componentes se não existirem
        templates = [
            {
                'name': 'Start',
                'description': 'Início do fluxo',
                'component_type': 'start',
                'category': ComponentCategory.objects.get(name='Fluxo Básico'),
                'icon': 'play',
                'color': '#10B981',
                'default_data': {'title': 'Início'},
                'default_settings': {},
                'input_handles': [],
                'output_handles': [{'id': 'default', 'label': 'Próximo'}],
                'validation_schema': {'type': 'object', 'properties': {'title': {'type': 'string'}}},
                'is_active': True,
                'created_by': user
            },
            {
                'name': 'Message',
                'description': 'Enviar mensagem de texto',
                'component_type': 'message',
                'category': ComponentCategory.objects.get(name='Comunicação'),
                'icon': 'message',
                'color': '#3B82F6',
                'default_data': {'text': 'Olá! Como posso ajudar?'},
                'default_settings': {'typingDelay': 1000, 'supportMarkdown': True},
                'input_handles': [{'id': 'default', 'label': 'Entrada'}],
                'output_handles': [{'id': 'default', 'label': 'Próximo'}],
                'validation_schema': {'type': 'object', 'properties': {'text': {'type': 'string'}}},
                'is_active': True,
                'created_by': user
            },
            {
                'name': 'User Input',
                'description': 'Capturar entrada do usuário',
                'component_type': 'input',
                'category': ComponentCategory.objects.get(name='Interação'),
                'icon': 'edit',
                'color': '#EF4444',
                'default_data': {'placeholder': 'Digite sua resposta...', 'variableName': 'userInput'},
                'default_settings': {'inputType': 'text', 'required': True},
                'input_handles': [{'id': 'default', 'label': 'Entrada'}],
                'output_handles': [
                    {'id': 'valid', 'label': 'Válido'},
                    {'id': 'invalid', 'label': 'Inválido'}
                ],
                'validation_schema': {'type': 'object', 'properties': {'placeholder': {'type': 'string'}, 'variableName': {'type': 'string'}}},
                'is_active': True,
                'created_by': user
            },
        ]
        
        created_count = 0
        for template_data in templates:
            template, created = ComponentTemplate.objects.get_or_create(
                name=template_data['name'],
                component_type=template_data['component_type'],
                defaults=template_data
            )
            if created:
                created_count += 1
        
        print(f"✅ {created_count} templates de componentes criados")
        
        # Criar chatbot de teste
        chatbot, created = Chatbot.objects.get_or_create(
            name='Chatbot de Teste',
            owner=user,
            defaults={
                'description': 'Chatbot criado automaticamente para testes',
                'theme': 'light',
                'primary_color': '#3B82F6',
                'is_published': False,
                'is_active': True,
                'settings': {
                    'welcomeMessage': 'Olá! Bem-vindo ao chatbot de teste!',
                    'fontFamily': 'Inter'
                }
            }
        )
        
        if created:
            print("✅ Chatbot de teste criado")
        else:
            print("ℹ️ Chatbot de teste já existe")
        
        # Criar fluxo de teste
        flow, created = Flow.objects.get_or_create(
            name='Fluxo de Teste',
            chatbot=chatbot,
            defaults={
                'description': 'Fluxo simples para testes',
                'is_main_flow': True,
                'is_active': True,
                'nodes': [
                    {
                        'id': 'start-1',
                        'type': 'start',
                        'position': {'x': 100, 'y': 100},
                        'data': {'title': 'Início do Teste'}
                    },
                    {
                        'id': 'message-1',
                        'type': 'message',
                        'position': {'x': 300, 'y': 100},
                        'data': {'text': 'Bem-vindo ao teste!'}
                    }
                ],
                'edges': [
                    {
                        'id': 'e1',
                        'source': 'start-1',
                        'target': 'message-1',
                        'sourceHandle': 'default',
                        'targetHandle': 'default'
                    }
                ],
                'viewport': {'x': 0, 'y': 0, 'zoom': 1},
                'settings': {'autoSave': True, 'variables': {'userName': '', 'userEmail': ''}},
                'created_by': user
            }
        )
        
        if created:
            print("✅ Fluxo de teste criado")
        else:
            print("ℹ️ Fluxo de teste já existe")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar dados de teste: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_relationships():
    """Testa os relacionamentos entre modelos"""
    print("\n🔗 TESTANDO RELACIONAMENTOS...")
    
    try:
        # Testar relação User -> UserProfile
        users_with_profiles = User.objects.filter(profile__isnull=False).count()
        print(f"✅ Usuários com perfil: {users_with_profiles}")
        
        # Testar relação User -> Chatbots
        users_with_chatbots = User.objects.filter(chatbots__isnull=False).distinct().count()
        total_chatbots = Chatbot.objects.count()
        print(f"✅ Usuários com chatbots: {users_with_chatbots}, Total de chatbots: {total_chatbots}")
        
        # Testar relação Chatbot -> Flows
        chatbots_with_flows = Chatbot.objects.filter(flows__isnull=False).distinct().count()
        total_flows = Flow.objects.count()
        print(f"✅ Chatbots com fluxos: {chatbots_with_flows}, Total de fluxos: {total_flows}")
        
        # Testar Categories -> Templates
        categories_with_templates = ComponentCategory.objects.filter(templates__isnull=False).distinct().count()
        total_templates = ComponentTemplate.objects.count()
        print(f"✅ Categorias com templates: {categories_with_templates}, Total de templates: {total_templates}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar relacionamentos: {e}")
        return False

def test_api_imports():
    """Testa se todos os serializers e views podem ser importados"""
    print("\n📡 TESTANDO IMPORTS DAS APIS...")
    
    try:
        # Test Authentication
        from apps.authentication.serializers import UserRegistrationSerializer, UserLoginSerializer
        from apps.authentication.views import RegisterView, LoginView
        print("✅ Authentication - Serializers e Views OK")
        
        # Test Chatbots
        from apps.chatbots.serializers import ChatbotSerializer, ChatbotVersionSerializer
        from apps.chatbots.views import ChatbotViewSet, ChatbotVersionViewSet
        print("✅ Chatbots - Serializers e Views OK")
        
        # Test Flows
        from apps.flows.serializers import FlowSerializer, FlowTemplateSerializer
        from apps.flows.views import FlowViewSet, FlowTemplateViewSet
        print("✅ Flows - Serializers e Views OK")
        
        # Test Components
        from apps.components.serializers import ComponentCategorySerializer, ComponentTemplateSerializer
        from apps.components.views import ComponentCategoryViewSet, ComponentTemplateViewSet
        print("✅ Components - Serializers e Views OK")
        
        # Test Executions
        from apps.executions.serializers import ChatSessionSerializer, ChatMessageSerializer
        from apps.executions.views import ChatSessionViewSet, ChatMessageViewSet
        print("✅ Executions - Serializers e Views OK")
        
        # Test Integrations
        from apps.integrations.serializers import IntegrationSerializer
        from apps.integrations.views import IntegrationViewSet
        print("✅ Integrations - Serializers e Views OK")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao importar APIs: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Função principal de teste"""
    print("🚀 INICIANDO TESTES DO BACKEND DJANGO")
    print("=" * 50)
    
    tests = [
        ("Modelos", test_models),
        ("Dados de Teste", create_test_data),
        ("Relacionamentos", test_relationships),
        ("APIs", test_api_imports),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{test_name.upper()}")
        print("-" * 30)
        results[test_name] = test_func()
    
    # Resumo final
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name:<20}: {status}")
    
    print(f"\nTotal: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Backend Django está funcionando corretamente!")
    else:
        print(f"\n⚠️ {total - passed} teste(s) falharam.")
        print("❌ Verifique os erros acima.")

if __name__ == "__main__":
    main() 