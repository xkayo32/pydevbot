# 📋 Comandos Git para GitFlow - Typebot Clone

## 🚀 Setup Inicial do GitFlow

### 1. Verificar Status Atual
```bash
git status
git branch -a
git log --oneline -5
```

### 2. Criar Branch Develop
```bash
# Criar e trocar para branch develop
git checkout -b develop
git push -u origin develop
```

### 3. Criar Feature Branch para Organizar Código Atual
```bash
# Voltar para develop
git checkout develop

# Criar feature branch
git checkout -b feature/frontend-setup
```

## 📦 Commits Atômicos para Organizar Código Atual

### 1. Commit da Estrutura Base
```bash
git add progresso.md GITFLOW.md .gitignore
git commit -m "docs: adicionar documentação do projeto e GitFlow

- Criar progresso.md com roadmap do projeto
- Adicionar GITFLOW.md com metodologia de branches
- Configurar .gitignore para Node.js/React"
```

### 2. Commit da Configuração Frontend
```bash
git add frontend/package.json frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.node.json frontend/index.html
git commit -m "feat(frontend): configurar estrutura base do React com Vite

- Configurar package.json com dependências React Flow e Material UI
- Setup Vite com TypeScript
- Configurar tsconfig para desenvolvimento e build
- Criar HTML base da aplicação"
```

### 3. Commit dos Arquivos de Entrada
```bash
git add frontend/src/main.tsx frontend/src/index.css
git commit -m "feat(frontend): implementar ponto de entrada da aplicação

- Configurar main.tsx com Material UI ThemeProvider
- Adicionar estilos globais básicos
- Setup CssBaseline para normalização"
```

### 4. Commit dos Componentes de Nós
```bash
git add frontend/src/components/nodes/
git commit -m "feat(nodes): implementar componentes de nós personalizados

- Criar StartNode para início do fluxo
- Implementar TextNode para mensagens
- Adicionar InputNode para captura de dados
- Usar Material UI para design consistente
- Adicionar handles de conexão customizados"
```

### 5. Commit do Sidebar
```bash
git add frontend/src/components/Sidebar.tsx
git commit -m "feat(sidebar): implementar painel lateral drag & drop

- Criar componente Sidebar com lista de nós disponíveis
- Implementar sistema drag and drop
- Adicionar ícones e descrições para cada tipo de nó
- Interface responsiva com Material UI Drawer"
```

### 6. Commit do App Principal
```bash
git add frontend/src/App.tsx
git commit -m "feat(app): integrar React Flow com componentes customizados

- Configurar ReactFlowProvider
- Implementar sistema de drop para adicionar nós
- Integrar sidebar retrátil
- Adicionar AppBar com controles
- Configurar nodeTypes customizados
- Implementar conexões entre nós"
```

### 7. Commit da Documentação Frontend
```bash
git add frontend/README.md frontend/public/
git commit -m "docs(frontend): adicionar documentação e assets

- Criar README com instruções de uso
- Adicionar ícone SVG do Vite
- Documentar tecnologias utilizadas
- Listar funcionalidades implementadas"
```

## 🔄 Finalizar Feature e Merge

### 1. Finalizar Feature Branch
```bash
# Verificar que todos os arquivos estão commitados
git status

# Voltar para develop
git checkout develop

# Merge da feature (no-fast-forward para manter histórico)
git merge --no-ff feature/frontend-setup

# Deletar feature branch
git branch -d feature/frontend-setup

# Push para o repositório remoto
git push origin develop
```

### 2. Atualizar Main Branch
```bash
# Se estivermos prontos para release
git checkout main
git merge --no-ff develop
git tag -a v0.1.0 -m "Release v0.1.0 - Frontend básico funcional"
git push origin main --tags
```

## 🏷️ Convenção de Tags

### Versionamento Semântico
- **v0.1.0** - Setup inicial com frontend básico
- **v0.2.0** - Painel de propriedades
- **v0.3.0** - Sistema de salvamento
- **v1.0.0** - Release completo com backend

### Formato das Tags
```bash
git tag -a v0.1.0 -m "Release v0.1.0

Funcionalidades:
- ✅ React Flow configurado
- ✅ Componentes de nós customizados
- ✅ Sistema drag & drop
- ✅ Interface Material UI
- ✅ Sidebar retrátil

Próximas features:
- 📅 Painel de propriedades
- 📅 Salvamento local
- 📅 Mais tipos de nós"
```

## 📊 Status Atual

### Branches Existentes
- ✅ `main` - Código atual (não organizado)
- ⏳ `develop` - A ser criada
- ⏳ `feature/frontend-setup` - Para organizar commits

### Próximos Passos
1. Executar comandos acima em sequência
2. Verificar que todas as funcionalidades funcionam
3. Atualizar progresso.md
4. Planejar próximas features

---

**Nota**: Execute estes comandos em um terminal com Git instalado ou através de uma interface gráfica Git. 