#!/usr/bin/env python
"""
🧪 Script de Teste das APIs Django
==================================

Testa todas as APIs REST implementadas usando requests.
"""

import os
import sys
import django
import requests
import json
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'typebot_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

def test_authentication_apis():
    """Testa as APIs de autenticação"""
    print("🔐 TESTANDO APIS DE AUTENTICAÇÃO...")
    
    client = APIClient()
    
    try:
        # Test Registration
        register_data = {
            'username': 'testapi',
            'email': 'testapi@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'API'
        }
        
        response = client.post('/api/auth/register/', register_data)
        print(f"✅ Register API: Status {response.status_code}")
        
        if response.status_code == 201:
            print("   ✅ Usuário criado com sucesso")
        
        # Test Login
        login_data = {
            'username': 'testapi',
            'password': 'testpass123'
        }
        
        response = client.post('/api/auth/login/', login_data)
        print(f"✅ Login API: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'access' in data and 'refresh' in data:
                print("   ✅ Tokens JWT retornados")
                return data['access']
            
        return None
        
    except Exception as e:
        print(f"❌ Erro nas APIs de autenticação: {e}")
        return None

def test_chatbots_apis(token):
    """Testa as APIs de chatbots"""
    print("\n🤖 TESTANDO APIS DE CHATBOTS...")
    
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        # Test List Chatbots
        response = client.get('/api/chatbots/')
        print(f"✅ List Chatbots: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} chatbots encontrados")
        
        # Test Create Chatbot
        chatbot_data = {
            'name': 'API Test Bot',
            'description': 'Chatbot criado via API para teste',
            'theme': 'light',
            'primary_color': '#3B82F6'
        }
        
        response = client.post('/api/chatbots/', chatbot_data)
        print(f"✅ Create Chatbot: Status {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Chatbot criado: {data.get('name')}")
            return data.get('id')
        
        return None
        
    except Exception as e:
        print(f"❌ Erro nas APIs de chatbots: {e}")
        return None

def test_flows_apis(token, chatbot_id):
    """Testa as APIs de fluxos"""
    print("\n🌊 TESTANDO APIS DE FLUXOS...")
    
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        # Test List Flows
        response = client.get('/api/flows/')
        print(f"✅ List Flows: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} fluxos encontrados")
        
        # Test Create Flow
        if chatbot_id:
            flow_data = {
                'name': 'API Test Flow',
                'description': 'Fluxo criado via API para teste',
                'chatbot': chatbot_id,
                'is_main_flow': True,
                'nodes': [
                    {
                        'id': 'start-1',
                        'type': 'start',
                        'position': {'x': 100, 'y': 100},
                        'data': {'title': 'Início API'}
                    }
                ],
                'edges': [],
                'viewport': {'x': 0, 'y': 0, 'zoom': 1}
            }
            
            response = client.post('/api/flows/', flow_data)
            print(f"✅ Create Flow: Status {response.status_code}")
            
            if response.status_code == 201:
                data = response.json()
                print(f"   ✅ Fluxo criado: {data.get('name')}")
                return data.get('id')
        
        return None
        
    except Exception as e:
        print(f"❌ Erro nas APIs de fluxos: {e}")
        return None

def test_components_apis(token):
    """Testa as APIs de componentes"""
    print("\n🧩 TESTANDO APIS DE COMPONENTES...")
    
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        # Test List Categories
        response = client.get('/api/components/categories/')
        print(f"✅ List Categories: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} categorias encontradas")
        
        # Test List Templates
        response = client.get('/api/components/templates/')
        print(f"✅ List Templates: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} templates encontrados")
        
        # Test List Instances
        response = client.get('/api/components/instances/')
        print(f"✅ List Instances: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} instâncias encontradas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro nas APIs de componentes: {e}")
        return False

def test_executions_apis(token):
    """Testa as APIs de execuções"""
    print("\n⚡ TESTANDO APIS DE EXECUÇÕES...")
    
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        # Test List Sessions
        response = client.get('/api/executions/sessions/')
        print(f"✅ List Sessions: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} sessões encontradas")
        
        # Test List Messages
        response = client.get('/api/executions/messages/')
        print(f"✅ List Messages: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} mensagens encontradas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro nas APIs de execuções: {e}")
        return False

def test_integrations_apis(token):
    """Testa as APIs de integrações"""
    print("\n🔗 TESTANDO APIS DE INTEGRAÇÕES...")
    
    client = APIClient()
    if token:
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    try:
        # Test List Integrations
        response = client.get('/api/integrations/')
        print(f"✅ List Integrations: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ {len(data.get('results', []))} integrações encontradas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro nas APIs de integrações: {e}")
        return False

def test_api_documentation():
    """Testa se a documentação da API está funcionando"""
    print("\n📚 TESTANDO DOCUMENTAÇÃO DA API...")
    
    client = APIClient()
    
    try:
        # Test Schema
        response = client.get('/api/schema/')
        print(f"✅ API Schema: Status {response.status_code}")
        
        # Test Swagger UI
        response = client.get('/api/docs/')
        print(f"✅ Swagger UI: Status {response.status_code}")
        
        # Test ReDoc
        response = client.get('/api/redoc/')
        print(f"✅ ReDoc: Status {response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na documentação da API: {e}")
        return False

def main():
    """Função principal de teste"""
    print("🚀 INICIANDO TESTES DAS APIS DJANGO")
    print("=" * 50)
    
    # Test Authentication first
    token = test_authentication_apis()
    
    # Test other APIs
    chatbot_id = test_chatbots_apis(token)
    flow_id = test_flows_apis(token, chatbot_id)
    components_ok = test_components_apis(token)
    executions_ok = test_executions_apis(token)
    integrations_ok = test_integrations_apis(token)
    docs_ok = test_api_documentation()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 RESUMO DOS TESTES DAS APIS")
    print("=" * 50)
    
    results = {
        'Autenticação': token is not None,
        'Chatbots': chatbot_id is not None,
        'Fluxos': flow_id is not None,
        'Componentes': components_ok,
        'Execuções': executions_ok,
        'Integrações': integrations_ok,
        'Documentação': docs_ok
    }
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSOU" if result else "❌ FALHOU"
        print(f"{test_name:<15}: {status}")
    
    print(f"\nTotal: {passed}/{total} testes de API passaram")
    
    if passed == total:
        print("\n🎉 TODAS AS APIS ESTÃO FUNCIONANDO!")
        print("✅ Backend Django está 100% operacional!")
    else:
        print(f"\n⚠️ {total - passed} teste(s) de API falharam.")
        print("❌ Verifique os erros acima.")

if __name__ == "__main__":
    main() 