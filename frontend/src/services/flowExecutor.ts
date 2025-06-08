export interface ExecutionContext {
  variables: Record<string, any>;
  currentNodeId: string | null;
  userId: string;
  sessionId: string;
  history: Array<{
    nodeId: string;
    timestamp: Date;
    userInput?: any;
    nodeOutput?: any;
  }>;
}

export interface FlowNode {
  id: string;
  type: string;
  data: any;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface ExecutionResult {
  success: boolean;
  nextNodeId: string | null;
  output?: any;
  requiresInput?: boolean;
  inputType?: string;
  prompt?: string;
  choices?: Array<{ label: string; value: any; nextNodeId?: string }>;
  error?: string;
  finished?: boolean;
}

export class FlowExecutor {
  private nodes: FlowNode[];
  private edges: FlowEdge[];
  private context: ExecutionContext;

  constructor(nodes: FlowNode[], edges: FlowEdge[], userId: string) {
    this.nodes = nodes;
    this.edges = edges;
    this.context = {
      variables: {},
      currentNodeId: null,
      userId,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      history: []
    };
  }

  // Iniciar execução do fluxo
  async startExecution(): Promise<ExecutionResult> {
    const startNode = this.nodes.find(node => node.type === 'start');
    if (!startNode) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nenhum nó de início encontrado'
      };
    }

    this.context.currentNodeId = startNode.id;
    return this.executeNode(startNode);
  }

  // Continuar execução com input do usuário
  async continueExecution(userInput: any): Promise<ExecutionResult> {
    if (!this.context.currentNodeId) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nenhum nó atual para continuar'
      };
    }

    const currentNode = this.nodes.find(node => node.id === this.context.currentNodeId);
    if (!currentNode) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nó atual não encontrado'
      };
    }

    // Se userInput é null, significa que é continuação automática - vá direto para próximo nó
    if (userInput === null) {
      return this.continueExecutionAuto();
    }

    // Registrar input do usuário no histórico
    this.context.history.push({
      nodeId: currentNode.id,
      timestamp: new Date(),
      userInput
    });

    // Processar input baseado no tipo do nó
    const result = await this.processUserInput(currentNode, userInput);
    
    if (result.success && result.nextNodeId) {
      const nextNode = this.nodes.find(node => node.id === result.nextNodeId);
      if (nextNode) {
        this.context.currentNodeId = result.nextNodeId;
        return this.executeNode(nextNode);
      }
    }

    return result;
  }

  // Continuar execução automaticamente (sem input do usuário)
  async continueExecutionAuto(): Promise<ExecutionResult> {
    console.log('🔄 continueExecutionAuto iniciado, currentNodeId:', this.context.currentNodeId);
    
    if (!this.context.currentNodeId) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nenhum nó atual para continuar automaticamente'
      };
    }

    // Buscar próximo nó diretamente
    const nextNodeId = this.getNextNodeId(this.context.currentNodeId);
    console.log('📍 Próximo nó encontrado:', nextNodeId);
    
    if (!nextNodeId) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nenhum próximo nó encontrado para continuação automática'
      };
    }

    const nextNode = this.nodes.find(node => node.id === nextNodeId);
    if (!nextNode) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Próximo nó não encontrado'
      };
    }

    console.log('⚡ Executando próximo nó:', nextNode.type, nextNode.id);
    this.context.currentNodeId = nextNodeId;
    return this.executeNode(nextNode);
  }

  // Executar um nó específico
  private async executeNode(node: FlowNode): Promise<ExecutionResult> {
    try {
      this.context.history.push({
        nodeId: node.id,
        timestamp: new Date()
      });

      let result: ExecutionResult;

      switch (node.type) {
        case 'start':
          result = this.executeStartNode(node);
          break;
        case 'text':
        case 'message':
          result = this.executeMessageNode(node);
          break;
        case 'input':
        case 'user-input':
          result = this.executeUserInputNode(node);
          break;
        case 'choice':
          result = this.executeChoiceNode(node);
          break;
        case 'conditional':
          result = this.executeConditionalNode(node);
          break;
        case 'delay':
          result = await this.executeDelayNode(node);
          break;
        case 'variable':
          result = this.executeVariableNode(node);
          break;
        case 'end':
          result = this.executeEndNode(node);
          break;
        case 'image':
          result = this.executeImageNode(node);
          break;
        case 'video':
          result = this.executeVideoNode(node);
          break;
        case 'ai-response':
          result = await this.executeAiResponseNode(node);
          break;
        case 'api-request':
          result = await this.executeApiRequestNode(node);
          break;
        case 'script':
          result = await this.executeScriptNode(node);
          break;
        case 'file-upload':
          result = this.executeFileUploadNode(node);
          break;
        case 'database':
          result = await this.executeDatabaseNode(node);
          break;
        default:
          result = {
            success: false,
            nextNodeId: null,
            error: `Tipo de nó não implementado: ${node.type}`
          };
      }

      // Registrar output no histórico
      this.context.history[this.context.history.length - 1].nodeOutput = result.output;

      return result;
    } catch (error) {
      return {
        success: false,
        nextNodeId: null,
        error: `Erro ao executar nó ${node.type}: ${error}`
      };
    }
  }

  // Implementações específicas para cada tipo de nó
  private executeStartNode(node: FlowNode): ExecutionResult {
    const nextNodeId = this.getNextNodeId(node.id);
    return {
      success: true,
      nextNodeId,
      requiresInput: false,
      output: null
    };
  }

  private executeMessageNode(node: FlowNode): ExecutionResult {
    // Suportar tanto 'text' quanto 'message' para compatibilidade
    const message = this.replaceVariables(
      node.data.text || 
      node.data.message || 
      node.data.label || 
      'Mensagem não configurada'
    );
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      requiresInput: false,
      output: {
        type: 'message',
        message,
        avatar: node.data.avatar,
        typingDelay: node.data.typingDelay || 1000
      }
    };
  }

  private executeUserInputNode(node: FlowNode): ExecutionResult {
    const placeholder = this.replaceVariables(node.data.placeholder || 'Digite sua resposta:');
    const inputType = node.data.inputType || 'text';
    
    console.log('📝 Executando UserInputNode:', {
      nodeId: node.id,
      placeholder,
      inputType,
      required: node.data.required,
      variableName: node.data.variableName
    });

    return {
      success: true,
      nextNodeId: null, // Será definido após o usuário fornecer input
      requiresInput: true,
      inputType: inputType,
      prompt: placeholder,
      output: {
        type: 'user-input',
        placeholder: placeholder,
        required: node.data.required || false,
        inputType: inputType,
        variableName: node.data.variableName
      }
    };
  }

  private executeChoiceNode(node: FlowNode): ExecutionResult {
    const choices = (node.data.choices || []).map((choice: any, index: number) => ({
      label: this.replaceVariables(choice.label || `Opção ${index + 1}`),
      value: choice.value || choice.label,
      nextNodeId: this.getNextNodeIdFromHandle(node.id, `choice-${index}`)
    }));

    return {
      success: true,
      nextNodeId: null,
      requiresInput: true,
      inputType: 'choice',
      choices,
      output: {
        type: 'choice',
        choices,
        allowMultiple: node.data.allowMultiple || false
      }
    };
  }

  private executeConditionalNode(node: FlowNode): ExecutionResult {
    const variable = node.data.variable;
    const operator = node.data.operator || '==';
    const value = node.data.value;
    
    if (!variable) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Variável não especificada no nó condicional'
      };
    }

    const variableValue = this.context.variables[variable];
    let condition = false;

    switch (operator) {
      case '==':
        condition = variableValue == value;
        break;
      case '!=':
        condition = variableValue != value;
        break;
      case '>':
        condition = Number(variableValue) > Number(value);
        break;
      case '<':
        condition = Number(variableValue) < Number(value);
        break;
      case '>=':
        condition = Number(variableValue) >= Number(value);
        break;
      case '<=':
        condition = Number(variableValue) <= Number(value);
        break;
      case 'contains':
        condition = String(variableValue).includes(String(value));
        break;
      default:
        condition = false;
    }

    const handle = condition ? 'true' : 'false';
    const nextNodeId = this.getNextNodeIdFromHandle(node.id, handle);

    return {
      success: true,
      nextNodeId,
      output: {
        type: 'conditional',
        condition,
        variable,
        operator,
        value,
        result: condition
      }
    };
  }

  private async executeDelayNode(node: FlowNode): Promise<ExecutionResult> {
    const duration = node.data.duration || 1000;
    const message = node.data.message;
    
    // Simular delay (em implementação real, seria apenas um timeout)
    await new Promise(resolve => setTimeout(resolve, Math.min(duration, 3000))); // Max 3s para demo
    
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'delay',
        duration,
        message: message ? this.replaceVariables(message) : undefined,
        showTypingIndicator: node.data.showTypingIndicator
      }
    };
  }

  private executeVariableNode(node: FlowNode): ExecutionResult {
    const operation = node.data.operation || 'set';
    const variable = node.data.variable;
    const value = this.replaceVariables(node.data.value || '');

    if (!variable) {
      return {
        success: false,
        nextNodeId: null,
        error: 'Nome da variável não especificado'
      };
    }

    switch (operation) {
      case 'set':
        this.context.variables[variable] = value;
        break;
      case 'get':
        // Não faz nada, apenas continua
        break;
      case 'increment':
        this.context.variables[variable] = (Number(this.context.variables[variable]) || 0) + (Number(value) || 1);
        break;
      case 'decrement':
        this.context.variables[variable] = (Number(this.context.variables[variable]) || 0) - (Number(value) || 1);
        break;
      case 'append':
        this.context.variables[variable] = (this.context.variables[variable] || '') + value;
        break;
      case 'clear':
        this.context.variables[variable] = '';
        break;
    }

    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'variable',
        operation,
        variable,
        value: this.context.variables[variable]
      }
    };
  }

  private executeEndNode(node: FlowNode): ExecutionResult {
    return {
      success: true,
      nextNodeId: null,
      finished: true,
      output: {
        type: 'end',
        message: this.replaceVariables(node.data.message || 'Conversa finalizada!'),
        ctaLabel: node.data.ctaLabel,
        ctaUrl: node.data.ctaUrl,
        showRating: node.data.showRating
      }
    };
  }

  private executeImageNode(node: FlowNode): ExecutionResult {
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'image',
        url: this.replaceVariables(node.data.url || ''),
        altText: this.replaceVariables(node.data.altText || ''),
        caption: this.replaceVariables(node.data.caption || ''),
        width: node.data.width,
        height: node.data.height
      }
    };
  }

  private executeVideoNode(node: FlowNode): ExecutionResult {
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'video',
        url: this.replaceVariables(node.data.url || ''),
        platform: node.data.platform || 'youtube',
        autoplay: node.data.autoplay || false,
        controls: node.data.controls !== false,
        muted: node.data.muted || false
      }
    };
  }

  private executeFileUploadNode(node: FlowNode): ExecutionResult {
    return {
      success: true,
      nextNodeId: null,
      requiresInput: true,
      inputType: 'file',
      prompt: this.replaceVariables(node.data.label || 'Envie um arquivo:'),
      output: {
        type: 'file-upload',
        allowedTypes: node.data.allowedTypes || [],
        maxSize: node.data.maxSize || 10,
        multiple: node.data.multiple || false
      }
    };
  }

  private async executeAiResponseNode(node: FlowNode): Promise<ExecutionResult> {
    // Simular resposta de IA
    const prompt = this.replaceVariables(node.data.promptTemplate || 'Gere uma resposta');
    const model = node.data.model || 'gpt-3.5-turbo';
    
    // Simulação de resposta (em implementação real, faria chamada para API)
    const mockResponse = `Resposta simulada da IA (${model}) para: "${prompt.substring(0, 50)}..."`;
    
    if (node.data.storeIn) {
      this.context.variables[node.data.storeIn] = mockResponse;
    }

    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'ai-response',
        response: mockResponse,
        model,
        prompt
      }
    };
  }

  private async executeApiRequestNode(node: FlowNode): Promise<ExecutionResult> {
    // Simular requisição API
    const url = this.replaceVariables(node.data.url || '');
    const method = node.data.method || 'GET';
    
    // Simulação de resposta (em implementação real, faria requisição HTTP)
    const mockResponse = {
      status: 200,
      data: { message: `Resposta simulada de ${method} ${url}` }
    };
    
    if (node.data.storeResponseIn) {
      this.context.variables[node.data.storeResponseIn] = mockResponse.data;
    }

    const nextNodeId = this.getNextNodeId(node.id, 'success');
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'api-request',
        response: mockResponse,
        method,
        url
      }
    };
  }

  private async executeScriptNode(node: FlowNode): Promise<ExecutionResult> {
    // Simular execução de script
    const script = node.data.script || '';
    const language = node.data.language || 'javascript';
    
    // Em implementação real, executaria o script de forma segura
    const mockResult = `Script ${language} executado com sucesso`;
    
    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'script',
        result: mockResult,
        language
      }
    };
  }

  private async executeDatabaseNode(node: FlowNode): Promise<ExecutionResult> {
    // Simular consulta no banco
    const query = this.replaceVariables(node.data.query || '');
    const operation = node.data.operation || 'select';
    
    // Simulação de resultado
    const mockResult = {
      rows: [{ id: 1, name: 'Resultado simulado' }],
      rowCount: 1
    };
    
    if (node.data.storeResultIn) {
      this.context.variables[node.data.storeResultIn] = mockResult;
    }

    const nextNodeId = this.getNextNodeId(node.id);
    
    return {
      success: true,
      nextNodeId,
      output: {
        type: 'database',
        result: mockResult,
        query,
        operation
      }
    };
  }

  // Processar input do usuário
  private async processUserInput(node: FlowNode, userInput: any): Promise<ExecutionResult> {
    switch (node.type) {
      case 'input':
      case 'user-input':
        if (node.data.variableName) {
          this.context.variables[node.data.variableName] = userInput;
        }
        
        // Validar input se necessário
        if (node.data.required && (!userInput || userInput.trim() === '')) {
          return {
            success: false,
            nextNodeId: null,
            error: 'Este campo é obrigatório'
          };
        }

        const nextNodeId = this.getNextNodeId(node.id);
        return {
          success: true,
          nextNodeId,
          output: { type: 'user-input-response', value: userInput }
        };

      case 'choice':
        const selectedChoice = userInput;
        if (selectedChoice && selectedChoice.nextNodeId) {
          return {
            success: true,
            nextNodeId: selectedChoice.nextNodeId,
            output: { type: 'choice-response', choice: selectedChoice }
          };
        }
        break;

      case 'file-upload':
        if (node.data.storeFileIn) {
          this.context.variables[node.data.storeFileIn] = userInput;
        }
        
        const fileNextNodeId = this.getNextNodeId(node.id);
        return {
          success: true,
          nextNodeId: fileNextNodeId,
          output: { type: 'file-upload-response', file: userInput }
        };
    }

    return {
      success: false,
      nextNodeId: null,
      error: 'Tipo de input não suportado'
    };
  }

  // Utilitários
  private getNextNodeId(sourceNodeId: string, handle?: string): string | null {
    const edge = this.edges.find(edge => 
      edge.source === sourceNodeId && 
      (!handle || edge.sourceHandle === handle)
    );
    return edge ? edge.target : null;
  }

  private getNextNodeIdFromHandle(sourceNodeId: string, handle: string): string | null {
    const edge = this.edges.find(edge => 
      edge.source === sourceNodeId && edge.sourceHandle === handle
    );
    return edge ? edge.target : null;
  }

  private replaceVariables(text: string): string {
    if (!text) return '';
    
    return text.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      return this.context.variables[variableName] || match;
    });
  }

  // Getters para acesso ao contexto
  getContext(): ExecutionContext {
    return { ...this.context };
  }

  getVariables(): Record<string, any> {
    return { ...this.context.variables };
  }

  getHistory(): ExecutionContext['history'] {
    return [...this.context.history];
  }
} 