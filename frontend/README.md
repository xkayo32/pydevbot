# Typebot Clone - Frontend

Este é o frontend da aplicação Typebot Clone, construído com React, TypeScript, Material UI e React Flow.

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+ 
- npm

### Instalação das dependências
```bash
npm install
```

### Executar em modo de desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para produção
```bash
npm run build
```

### Preview do build
```bash
npm run preview
```

## 🛠️ Tecnologias utilizadas

- **React 18** - Biblioteca para interface de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **Material UI** - Biblioteca de componentes React
- **React Flow** - Biblioteca para criação de diagramas e fluxos
- **ESLint** - Linter para JavaScript/TypeScript

## 📁 Estrutura do projeto

```
src/
├── main.tsx          # Ponto de entrada da aplicação
├── App.tsx           # Componente principal
├── index.css         # Estilos globais
└── components/       # Componentes reutilizáveis (a ser criado)
```

## ✨ Funcionalidades implementadas

- [x] Configuração básica do React Flow
- [x] Interface com Material UI
- [x] Tema customizado
- [x] Nós e conexões básicas
- [x] Controles e mini-mapa

## 🔧 Próximos passos

- [ ] Criar tipos customizados de nós
- [ ] Implementar painel lateral de propriedades
- [ ] Sistema de drag & drop de componentes
- [ ] Salvamento e carregamento de fluxos
- [ ] Integração com backend 