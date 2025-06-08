# 🌿 GitFlow - Typebot Clone

## 📋 Visão Geral
Este projeto segue a metodologia **GitFlow** para controle de versão, garantindo organização, rastreabilidade e qualidade do código.

## 🌳 Estrutura de Branches

### Branches Principais

#### `main`
- **Propósito**: Código estável em produção
- **Política**: Somente merges de `release/` ou `hotfix/`
- **Proteção**: Requires pull request reviews
- **Status**: ✅ Criada

#### `develop`
- **Propósito**: Integração de desenvolvimento
- **Política**: Merges de `feature/` branches
- **Base para**: `release/` e `feature/` branches
- **Status**: 📅 A ser criada

### Branches de Apoio

#### `feature/*`
- **Nomenclatura**: `feature/nome-da-funcionalidade`
- **Base**: `develop`
- **Merge para**: `develop`
- **Exemplos**:
  - `feature/frontend-setup`
  - `feature/custom-nodes`
  - `feature/sidebar-component`
  - `feature/backend-api`

#### `release/*`
- **Nomenclatura**: `release/v1.0.0`
- **Base**: `develop`
- **Merge para**: `main` e `develop`
- **Propósito**: Preparação para release de produção

#### `hotfix/*`
- **Nomenclatura**: `hotfix/nome-da-correcao`
- **Base**: `main`
- **Merge para**: `main` e `develop`
- **Propósito**: Correções urgentes em produção

## 🚀 Fluxo de Trabalho

### 1. Nova Funcionalidade
```bash
# Criar feature branch
git checkout develop
git pull origin develop
git checkout -b feature/nova-funcionalidade

# Desenvolver...
git add .
git commit -m "feat: implementar nova funcionalidade"

# Finalizar feature
git checkout develop
git merge --no-ff feature/nova-funcionalidade
git branch -d feature/nova-funcionalidade
git push origin develop
```

### 2. Release
```bash
# Criar release branch
git checkout develop
git checkout -b release/v1.0.0

# Ajustes finais e testes...
git commit -m "chore: preparar release v1.0.0"

# Finalizar release
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"

git checkout develop
git merge --no-ff release/v1.0.0
git branch -d release/v1.0.0
```

### 3. Hotfix
```bash
# Criar hotfix branch
git checkout main
git checkout -b hotfix/correcao-critica

# Corrigir...
git commit -m "fix: corrigir problema crítico"

# Finalizar hotfix
git checkout main
git merge --no-ff hotfix/correcao-critica
git tag -a v1.0.1 -m "Hotfix v1.0.1"

git checkout develop
git merge --no-ff hotfix/correcao-critica
git branch -d hotfix/correcao-critica
```

## 📝 Convenção de Commits

### Formato
```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

### Tipos
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação (não afeta o código)
- **refactor**: Refatoração
- **test**: Testes
- **chore**: Tarefas de build, CI, etc.

### Exemplos
```bash
feat(frontend): adicionar componente de nó personalizado
fix(sidebar): corrigir drag and drop no Firefox
docs(readme): atualizar instruções de instalação
refactor(api): reorganizar estrutura de controllers
test(nodes): adicionar testes unitários para TextNode
chore(deps): atualizar dependências do React
```

## 📊 Status Atual do Projeto

### Commits Realizados
- **Commit Inicial**: Setup do projeto frontend
- **Branch**: `main`
- **Próximos Passos**:
  1. Criar branch `develop`
  2. Criar `feature/frontend-setup` para organizar código atual
  3. Fazer commit atômico das funcionalidades implementadas

### Funcionalidades para Organizar em Features
1. **feature/project-structure** - Estrutura inicial do projeto
2. **feature/react-flow-setup** - Configuração básica do React Flow
3. **feature/custom-nodes** - Componentes de nós personalizados
4. **feature/sidebar-component** - Painel lateral com drag & drop
5. **feature/ui-components** - Interface Material UI

## 🎯 Roadmap de Branches

### Fase 1: Organização Atual
- [ ] Criar `develop` branch
- [ ] Criar `feature/frontend-setup`
- [ ] Commit atômico das funcionalidades atuais
- [ ] Merge para `develop`

### Fase 2: Próximas Features
- [ ] `feature/node-properties-panel`
- [ ] `feature/save-load-system`
- [ ] `feature/additional-node-types`
- [ ] `feature/backend-integration`

### Fase 3: Release
- [ ] `release/v1.0.0-beta`
- [ ] Testes integrados
- [ ] Merge para `main`
- [ ] Tag de release

---

**Última atualização**: 07/06/2025  
**Responsável**: IA Assistant seguindo cursor_rules_context 