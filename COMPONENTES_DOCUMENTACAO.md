# 📚 Documentação Completa dos Componentes

## 🎯 Visão Geral
Este arquivo documenta todos os tipos de nós/componentes disponíveis no sistema, suas características, campos editáveis, opções de variáveis e sugestões de melhorias para maior flexibilidade.

---

## 🚀 **1. COMPONENTES DE FLUXO BÁSICO**

### 🟢 **StartNode - Nó de Início**
**Categoria:** Fluxo Básico  
**Cor:** Verde (#4caf50)  
**Ícone:** PlayArrow

#### **Campos Editáveis:**
- `label`: Nome do nó (String)

#### **Características:**
- Ponto de entrada do fluxo
- Apenas uma saída
- Não possui entradas
- Nó obrigatório em todo fluxo

#### **Opções de Variáveis:**
- ❌ Não suporta inserção de variáveis
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Adicionar campo "Mensagem de Boas-vindas"
- ✅ Opção de delay inicial
- ✅ Configurar fusos horários para início
- ✅ Condições de ativação (horário, dia da semana)

---

### 🔵 **TextNode - Mensagem Simples**
**Categoria:** Fluxo Básico  
**Cor:** Azul (#2196f3)  
**Ícone:** ChatBubbleOutline

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `message`: Texto da mensagem (String)

#### **Características:**
- Exibe texto simples
- Uma entrada, uma saída
- Componente básico de comunicação

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no campo `message`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Suporte a Markdown
- ✅ Emojis e formatação rica
- ✅ Links clicáveis
- ✅ Botões de ação rápida
- ✅ Delay entre mensagens

---

### 🟣 **InputNode - Entrada Simples**
**Categoria:** Fluxo Básico  
**Cor:** Rosa (#e91e63)  
**Ícone:** Input

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `placeholder`: Texto de exemplo (String)
- `inputType`: Tipo de entrada (text, number, email, etc.)

#### **Características:**
- Captura entrada do usuário
- Uma entrada, uma saída
- Validação básica por tipo

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no `placeholder`
- ✅ **Salva resultado como:** variável definida pelo usuário

#### **Melhorias Sugeridas:**
- ✅ Validação regex personalizada
- ✅ Máscara de entrada (CPF, telefone, etc.)
- ✅ Limites de caracteres (min/max)
- ✅ Mensagens de erro customizadas
- ✅ Campo obrigatório/opcional

---

## 💬 **2. COMPONENTES DE CONVERSA**

### 💙 **MessageNode - Mensagem Avançada**
**Categoria:** Conversa  
**Cor:** Azul claro (#03a9f4)  
**Ícone:** Message

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `text`: Texto da mensagem (String)
- `typingDelay`: Delay de digitação em segundos (Number)
- `supportMarkdown`: Suporte a Markdown (Boolean)

#### **Características:**
- Mensagem com formatação avançada
- Simulação de digitação
- Suporte a Markdown e emojis

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no campo `text`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Avatar personalizado do bot
- ✅ Sons de notificação
- ✅ Botões de ação inline
- ✅ Carrossel de cards
- ✅ Anexos de mídia

---

### 📝 **UserInputNode - Entrada de Usuário**
**Categoria:** Conversa  
**Cor:** Verde azulado (#009688)  
**Ícone:** Edit

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `placeholder`: Texto de exemplo (String)
- `variableName`: Nome da variável para salvar (String)
- `inputType`: Tipo de entrada (String)
- `required`: Campo obrigatório (Boolean)

#### **Características:**
- Entrada avançada com validação
- Salva automaticamente em variável
- Múltiplos tipos de entrada

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no `placeholder`
- ✅ **Salva resultado como:** valor em `variableName`

#### **Melhorias Sugeridas:**
- ✅ Validação em tempo real
- ✅ Auto-complete/sugestões
- ✅ Upload de arquivos
- ✅ Entrada por voz
- ✅ Captura de localização

---

### 🔘 **ChoiceNode - Múltipla Escolha**
**Categoria:** Conversa  
**Cor:** Roxo (#673ab7)  
**Ícone:** RadioButtonChecked

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `choices`: Array de opções (Array)
  - `label`: Texto da opção (String)
  - `value`: Valor da opção (String)
- `allowMultiple`: Permitir múltiplas seleções (Boolean)

#### **Características:**
- Botões de escolha para usuário
- Múltiplas saídas (uma para cada opção)
- Suporte a seleção única ou múltipla

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `choices.label`
- ✅ **Salva resultado como:** variável com valor selecionado

#### **Melhorias Sugeridas:**
- ✅ Ícones para cada opção
- ✅ Cores personalizadas
- ✅ Limite de seleções múltiplas
- ✅ Opção "Outro" com campo livre
- ✅ Randomizar ordem das opções

---

### ⏳ **DelayNode - Pausa/Atraso**
**Categoria:** Conversa  
**Cor:** Laranja (#ff9800)  
**Ícone:** Schedule

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `duration`: Duração em segundos (Number)
- `showTypingIndicator`: Mostrar indicador de digitação (Boolean)
- `message`: Mensagem durante espera (String)

#### **Características:**
- Pausa na conversa
- Indicador visual de digitação
- Mensagem personalizada durante espera

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no campo `message`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Delay variável baseado em condições
- ✅ Cancelar delay com interação
- ✅ Múltiplas animações de digitação
- ✅ Som durante espera
- ✅ Progresso visual do delay

---

## 🎨 **3. COMPONENTES DE MÍDIA**

### 🖼️ **ImageNode - Exibição de Imagem**
**Categoria:** Mídia  
**Cor:** Verde escuro (#4caf50)  
**Ícone:** Image

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `imageUrl`: URL da imagem (String)
- `altText`: Texto alternativo (String)
- `clickable`: Imagem clicável (Boolean)

#### **Características:**
- Exibe imagens na conversa
- Suporte a diferentes formatos
- Opção de imagem clicável

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `imageUrl` e `altText`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Galeria de imagens
- ✅ Zoom e fullscreen
- ✅ Legenda personalizada
- ✅ Carregamento lazy
- ✅ Fallback para erro de carregamento

---

### 🎥 **VideoNode - Reprodução de Vídeo**
**Categoria:** Mídia  
**Cor:** Vermelho (#f44336)  
**Ícone:** PlayCircleOutline

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `videoUrl`: URL do vídeo (String)
- `platform`: Plataforma (youtube, vimeo, upload) (String)
- `autoplay`: Reproduzir automaticamente (Boolean)
- `controls`: Mostrar controles (Boolean)

#### **Características:**
- Reprodução de vídeos
- Suporte a múltiplas plataformas
- Controles personalizáveis

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `videoUrl`
- ✅ **Salva resultado como:** tempo assistido, completou vídeo

#### **Melhorias Sugeridas:**
- ✅ Marcadores de tempo
- ✅ Velocidade de reprodução
- ✅ Subtítulos
- ✅ Análise de engajamento
- ✅ Playlist de vídeos

---

## 🤖 **4. COMPONENTES DE IA**

### 🧠 **AiResponseNode - Resposta de IA**
**Categoria:** IA  
**Cor:** Roxo escuro (#9c27b0)  
**Ícone:** Psychology

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `promptTemplate`: Template do prompt (String)
- `model`: Modelo de IA (gpt-3.5-turbo, gpt-4, etc.) (String)
- `temperature`: Criatividade (0-1) (Number)
- `maxTokens`: Máximo de tokens (Number)
- `storeIn`: Variável para salvar resposta (String)
- `useContext`: Usar contexto da conversa (Boolean)

#### **Características:**
- Integração com IA generativa
- Múltiplos modelos disponíveis
- Configuração avançada de parâmetros

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `promptTemplate`
- ✅ **Salva resultado como:** valor em `storeIn`

#### **Melhorias Sugeridas:**
- ✅ Histórico de conversas
- ✅ Múltiplos prompts por nó
- ✅ Fallback para erro de IA
- ✅ Análise de sentimento
- ✅ Moderação de conteúdo

---

## 🔗 **5. COMPONENTES DE INTEGRAÇÃO**

### 🌐 **ApiRequestNode - Requisição HTTP**
**Categoria:** Integrações  
**Cor:** Ciano (#00bcd4)  
**Ícone:** Http

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `method`: Método HTTP (GET, POST, PUT, DELETE, PATCH) (String)
- `url`: URL da API (String)
- `headers`: Cabeçalhos HTTP (Object)
- `body`: Corpo da requisição (String/Object)
- `responseVariable`: Variável para resposta (String)
- `timeout`: Timeout em segundos (Number)

#### **Características:**
- Chamadas para APIs externas
- Múltiplos métodos HTTP
- Configuração avançada de headers

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `url`, `headers`, `body`
- ✅ **Salva resultado como:** valor em `responseVariable`

#### **Melhorias Sugeridas:**
- ✅ Autenticação (Bearer, Basic, OAuth)
- ✅ Retry automático para falhas
- ✅ Transformação de resposta
- ✅ Cache de requisições
- ✅ Rate limiting

---

### 🗄️ **DatabaseNode - Consulta de Banco**
**Categoria:** Integrações  
**Cor:** Marrom (#795548)  
**Ícone:** Storage

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `dbType`: Tipo de banco (mysql, postgresql, mongodb, sqlite, redis) (String)
- `operation`: Operação (SELECT, INSERT, UPDATE, DELETE, FIND, COUNT) (String)
- `query`: Query SQL/NoSQL (String)
- `parameters`: Parâmetros da query (Array)
- `resultVariable`: Variável para resultado (String)

#### **Características:**
- Conexão com múltiplos bancos
- Operações CRUD completas
- Suporte SQL e NoSQL

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `query` e `parameters`
- ✅ **Salva resultado como:** valor em `resultVariable`

#### **Melhorias Sugeridas:**
- ✅ Pool de conexões
- ✅ Transações
- ✅ Query builder visual
- ✅ Backup automático
- ✅ Análise de performance

---

### 📁 **FileNode - Gestão de Arquivos**
**Categoria:** Integrações  
**Cor:** Azul acinzentado (#607d8b)  
**Ícone:** AttachFile

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `operation`: Operação (upload, read, download, delete) (String)
- `fileType`: Tipo permitido (image, document, csv, json, xml, any) (String)
- `maxSize`: Tamanho máximo em MB (Number)
- `resultVariable`: Variável para resultado (String)
- `storage`: Local de armazenamento (local, s3, drive) (String)

#### **Características:**
- Upload e gerenciamento de arquivos
- Múltiplos tipos de storage
- Validação de tipos e tamanhos

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `storage` paths
- ✅ **Salva resultado como:** valor em `resultVariable`

#### **Melhorias Sugeridas:**
- ✅ Processamento de imagens
- ✅ OCR para documentos
- ✅ Compressão automática
- ✅ Análise de vírus
- ✅ Versionamento de arquivos

---

## 🔧 **6. COMPONENTES DE LÓGICA**

### ❓ **ConditionalNode - Condição/Se**
**Categoria:** Lógica e Condições  
**Cor:** Laranja (#ff5722)  
**Ícone:** AccountTree

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `condition`: Descrição da condição (String)
- `variable`: Variável a ser testada (String)
- `operator`: Operador (equals, not_equals, contains, greater, less, exists) (String)
- `value`: Valor para comparação (String/Number)

#### **Características:**
- Lógica condicional if/else
- Múltiplas saídas (verdadeiro/falso)
- Operadores de comparação diversos

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `variable` e `value`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Múltiplas condições (AND/OR)
- ✅ Condições aninhadas
- ✅ Operadores avançados (regex, range)
- ✅ Switch/case múltiplo
- ✅ Condições temporais

---

### 📊 **VariableNode - Gestão de Variáveis**
**Categoria:** Dados e Variáveis  
**Cor:** Roxo profundo (#673ab7)  
**Ícone:** DataObject

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `operation`: Operação (set, get, increment, decrement, append, clear) (String)
- `variableName`: Nome da variável (String)
- `value`: Valor a ser definido (String/Number/Boolean)
- `dataType`: Tipo de dados (string, number, boolean, array, object) (String)

#### **Características:**
- Manipulação de variáveis globais
- Múltiplas operações disponíveis
- Suporte a diferentes tipos de dados

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `value`
- ✅ **Salva resultado como:** valor em `variableName`

#### **Melhorias Sugeridas:**
- ✅ Operações matemáticas avançadas
- ✅ Manipulação de arrays/objetos
- ✅ Persistência de variáveis
- ✅ Escopo de variáveis (global/local)
- ✅ Criptografia de dados sensíveis

---

### 🔄 **ScriptNode - Execução de Código**
**Categoria:** Automação  
**Cor:** Roxo (#9c27b0)  
**Ícone:** Code

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `language`: Linguagem (javascript, python) (String)
- `script`: Código a ser executado (String)
- `variables`: Variáveis disponíveis no script (Array)
- `timeout`: Timeout de execução em segundos (Number)

#### **Características:**
- Execução de código personalizado
- Múltiplas linguagens
- Acesso a variáveis do fluxo

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** no `script`
- ✅ **Salva resultado como:** return do script

#### **Melhorias Sugeridas:**
- ✅ Sandbox de segurança
- ✅ Bibliotecas pré-instaladas
- ✅ Debug e logs
- ✅ Versionamento de scripts
- ✅ Templates de código comum

---

## 🏁 **7. COMPONENTES DE FINALIZAÇÃO**

### 🎯 **EndNode - Fim da Conversa**
**Categoria:** Finalização  
**Cor:** Vermelho escuro (#d32f2f)  
**Ícone:** Stop

#### **Campos Editáveis:**
- `label`: Nome do nó (String)
- `message`: Mensagem de despedida (String)
- `ctaLabel`: Texto do botão de ação (String)
- `ctaUrl`: URL do botão de ação (String)
- `redirectUrl`: URL de redirecionamento (String)

#### **Características:**
- Finaliza a conversa
- Call-to-action opcional
- Redirecionamento automático

#### **Opções de Variáveis:**
- ✅ **Suporta inserção de variáveis** em `message`, `ctaUrl`
- ❌ Não salva resultado em variável

#### **Melhorias Sugeridas:**
- ✅ Múltiplos CTAs
- ✅ Pesquisa de satisfação
- ✅ Compartilhamento social
- ✅ Download de conversa
- ✅ Agendamento de follow-up

---

## 📈 **ANÁLISE DE FLEXIBILIDADE POR CATEGORIA**

### 🟢 **Altamente Flexíveis (90-100%)**
- **AiResponseNode**: Configuração completa de IA
- **ApiRequestNode**: Integrações completas
- **ScriptNode**: Código personalizado ilimitado

### 🟡 **Moderadamente Flexíveis (70-89%)**
- **DatabaseNode**: Boas opções de query
- **ConditionalNode**: Operadores diversos
- **FileNode**: Múltiplos storages e tipos

### 🟠 **Básicos mas Funcionais (50-69%)**
- **ChoiceNode**: Opções limitadas mas úteis
- **UserInputNode**: Validação básica
- **VariableNode**: Operações essenciais

### 🔴 **Precisam de Melhorias (30-49%)**
- **TextNode**: Muito básico
- **DelayNode**: Funcionalidade limitada
- **StartNode**: Apenas ponto de entrada

---

## 🚀 **ROADMAP DE MELHORIAS GERAIS**

### **Fase 1: Melhorias Básicas**
1. ✅ Suporte a variáveis em todos os campos de texto
2. ✅ Validação avançada de campos
3. ✅ Tooltips explicativos
4. ✅ Preview em tempo real

### **Fase 2: Funcionalidades Avançadas**
1. 🔄 Templates de componentes
2. 🔄 Componentes personalizados
3. 🔄 Marketplace de plugins
4. 🔄 Webhooks e integrações

### **Fase 3: IA e Automação**
1. 🔄 Auto-geração de fluxos
2. 🔄 Sugestões inteligentes
3. 🔄 Otimização automática
4. 🔄 Análise de performance

---

## 📊 **ESTATÍSTICAS FINAIS**

- **Total de Componentes:** 17
- **Categorias:** 7
- **Suporte a Variáveis:** 14/17 (82%)
- **Salvam em Variáveis:** 10/17 (59%)
- **Nível de Flexibilidade Médio:** 68%

**🎯 Meta:** Alcançar 90% de flexibilidade em todos os componentes até o final do desenvolvimento. 