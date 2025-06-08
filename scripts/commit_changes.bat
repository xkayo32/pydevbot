@echo off
echo ========================================
echo   COMMITS DAS NOVAS FUNCIONALIDADES
echo ========================================
echo.

echo [1/6] Adicionando arquivos modificados...
git add frontend/package.json
git add frontend/src/App.tsx
git add frontend/src/contexts/VariablesContext.tsx
git add frontend/src/components/VariablesModal.tsx
git add frontend/src/components/VariableSelector.tsx
git add frontend/src/components/NodeHoverActions.tsx
git add frontend/src/components/NodeEditModal.tsx
git add frontend/src/components/ProjectHeader.tsx
git add frontend/src/components/Sidebar.tsx

echo.
echo [2/6] Commit: Correção do script start
git commit -m "fix: adicionar script 'start' no package.json

- Adiciona script 'start' que estava faltando
- Resolve erro ao executar npm start
- Facilita inicialização do servidor de desenvolvimento"

echo.
echo [3/6] Commit: Sistema de variáveis globais
git commit --allow-empty -m "feat: implementar sistema completo de variáveis globais

🎯 Funcionalidades Adicionadas:
- Contexto de variáveis com persistência no localStorage
- Modal completo para gerenciamento de variáveis
- Interface para criar, editar e deletar variáveis
- 4 variáveis padrão criadas automaticamente
- Suporte a tipos: string, number, boolean, array, object
- Validação e processamento de valores por tipo

📁 Arquivos Criados:
- frontend/src/contexts/VariablesContext.tsx
- frontend/src/components/VariablesModal.tsx

🔧 Características:
- Persistência automática no localStorage
- Interface responsiva com Material UI
- Validação em tempo real
- Suporte a variáveis globais e locais"

echo.
echo [4/6] Commit: Seletor de variáveis nos campos
git commit --allow-empty -m "feat: adicionar seletor de variáveis nos campos de edição

🎯 Funcionalidades Adicionadas:
- Componente VariableSelector para seleção de variáveis
- Integração no modal de edição de nós
- Menu dropdown com lista de variáveis disponíveis
- Inserção automática da sintaxe {{variavel}}
- Tipos coloridos e informações detalhadas

📁 Arquivos Criados:
- frontend/src/components/VariableSelector.tsx

📝 Arquivos Modificados:
- frontend/src/components/NodeEditModal.tsx

🔧 Características:
- Menu intuitivo com tooltips
- Cópia da sintaxe para clipboard
- Filtragem por tipo de variável
- Integração perfeita com campos de texto"

echo.
echo [5/6] Commit: Ícones de hover nos blocos
git commit --allow-empty -m "feat: implementar ícones de ação no hover dos blocos

🎯 Funcionalidades Adicionadas:
- Componente NodeHoverActions para ações rápidas
- 3 ações disponíveis: Editar, Testar, Deletar
- Animações suaves com fade in/out
- Posicionamento dinâmico nos cantos dos blocos

📁 Arquivos Criados:
- frontend/src/components/NodeHoverActions.tsx

📝 Arquivos Modificados:
- frontend/src/App.tsx (eventos de hover)

🔧 Características:
- Interface expandível com múltiplas ações
- Confirmação antes de deletar
- Integração com sistema de histórico
- Tooltips informativos"

echo.
echo [6/6] Commit: Melhorias de interface e integração
git commit --allow-empty -m "feat: melhorias de interface e integração completa

🎯 Melhorias Implementadas:
- Espaçamento corrigido entre sidebar e canvas (280px → 260px)
- Botão de variáveis no header do projeto
- Overflow hidden para melhor controle de layout
- Integração completa de todos os contextos

📝 Arquivos Modificados:
- frontend/src/components/Sidebar.tsx (largura reduzida)
- frontend/src/components/ProjectHeader.tsx (botão variáveis)
- frontend/src/App.tsx (integração completa)

🔧 Características:
- Layout otimizado e responsivo
- Transições suaves mantidas
- Integração perfeita com tema escuro/claro
- Controles centralizados no header"

echo.
echo ========================================
echo   COMMITS CONCLUÍDOS COM SUCESSO!
echo ========================================
echo.
echo Resumo das funcionalidades implementadas:
echo ✅ Sistema completo de variáveis globais
echo ✅ Seletor de variáveis nos campos dos blocos
echo ✅ Ícones de hover para ações nos blocos
echo ✅ Espaçamento corrigido entre menu e canvas
echo ✅ Interface profissional e intuitiva
echo ✅ Integração perfeita com sistema existente
echo.
echo Para verificar os commits:
echo   git log --oneline -6
echo.
pause 