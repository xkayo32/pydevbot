// Análise completa de todos os componentes para verificar se estão prontos para o fluxo

export interface ComponentStatus {
  name: string;
  type: string;
  flowExecutorSupported: boolean;
  chatInterfaceSupported: boolean;
  fieldsComplete: boolean;
  themeImplemented: boolean;
  issues: string[];
  readyForFlow: boolean;
}

export const COMPONENT_ANALYSIS: Record<string, ComponentStatus> = {
  'start': {
    name: 'StartNode',
    type: 'start',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'message': {
    name: 'MessageNode',
    type: 'message',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'user-input': {
    name: 'UserInputNode',
    type: 'user-input',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'choice': {
    name: 'ChoiceNode',
    type: 'choice',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: false,
    themeImplemented: true,
    issues: [
      'Múltiplas saídas não implementadas corretamente',
      'Campo allowMultiple faltando',
      'Campo randomizeOrder faltando',
      'Handles de saída incorretos - deveria ter uma para cada opção'
    ],
    readyForFlow: false
  },
  
  'conditional': {
    name: 'ConditionalNode',
    type: 'conditional',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: false,
    themeImplemented: true,
    issues: [
      'Handles True/False específicos não implementados',
      'Lógica condicional precisa de melhorias',
      'Interface de condições pode ser melhorada',
      'Não aparece no chat (é invisível ao usuário)'
    ],
    readyForFlow: false
  },
  
  'delay': {
    name: 'DelayNode',
    type: 'delay',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'image': {
    name: 'ImageNode',
    type: 'image',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'video': {
    name: 'VideoNode',
    type: 'video',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'end': {
    name: 'EndNode',
    type: 'end',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [],
    readyForFlow: true
  },
  
  'variable': {
    name: 'VariableNode',
    type: 'variable',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Não aparece no chat (é invisível ao usuário)',
      'Funciona apenas internamente no fluxo'
    ],
    readyForFlow: true
  },
  
  'ai-response': {
    name: 'AiResponseNode',
    type: 'ai-response',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Não implementado no DesktopChatInterface',
      'Falta renderização no chat',
      'Simulação funcionando no executor'
    ],
    readyForFlow: false
  },
  
  'api-request': {
    name: 'ApiRequestNode',
    type: 'api-request',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Não implementado no DesktopChatInterface',
      'Falta renderização no chat',
      'Simulação funcionando no executor',
      'Handles de sucesso/erro não implementados'
    ],
    readyForFlow: false
  },
  
  'script': {
    name: 'ScriptNode',
    type: 'script',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Não implementado no DesktopChatInterface',
      'Falta renderização no chat',
      'Simulação funcionando no executor'
    ],
    readyForFlow: false
  },
  
  'database': {
    name: 'DatabaseNode',
    type: 'database',
    flowExecutorSupported: true,
    chatInterfaceSupported: false,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Não implementado no DesktopChatInterface',
      'Falta renderização no chat',
      'Simulação funcionando no executor'
    ],
    readyForFlow: false
  },
  
  'file-upload': {
    name: 'FileNode',
    type: 'file-upload',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: true,
    themeImplemented: true,
    issues: [
      'Upload real de arquivo não implementado',
      'Apenas simulação no chat'
    ],
    readyForFlow: true
  },
  
  // Componentes legados/duplicados
  'text': {
    name: 'TextNode (Legado)',
    type: 'text',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: false,
    themeImplemented: false,
    issues: [
      'Componente legado - usar MessageNode',
      'Falta implementação de tema escuro',
      'Funcionalidade duplicada'
    ],
    readyForFlow: false
  },
  
  'input': {
    name: 'InputNode (Legado)',
    type: 'input',
    flowExecutorSupported: true,
    chatInterfaceSupported: true,
    fieldsComplete: false,
    themeImplemented: false,
    issues: [
      'Componente legado - usar UserInputNode',
      'Falta implementação de tema escuro',
      'Funcionalidade duplicada'
    ],
    readyForFlow: false
  }
};

// Função para obter status de um componente
export const getComponentStatus = (type: string): ComponentStatus | null => {
  return COMPONENT_ANALYSIS[type] || null;
};

// Função para obter componentes que precisam de correção
export const getComponentsNeedingFix = (): ComponentStatus[] => {
  return Object.values(COMPONENT_ANALYSIS).filter(comp => !comp.readyForFlow);
};

// Função para obter componentes prontos
export const getReadyComponents = (): ComponentStatus[] => {
  return Object.values(COMPONENT_ANALYSIS).filter(comp => comp.readyForFlow);
};

// Função para obter estatísticas
export const getComponentStats = () => {
  const all = Object.values(COMPONENT_ANALYSIS);
  const ready = all.filter(comp => comp.readyForFlow);
  const needsFix = all.filter(comp => !comp.readyForFlow);
  
  return {
    total: all.length,
    ready: ready.length,
    needsFix: needsFix.length,
    readyPercentage: Math.round((ready.length / all.length) * 100)
  };
};

// Ícones para indicar status
export const getStatusIcon = (type: string): string => {
  const status = getComponentStatus(type);
  if (!status) return '❓'; // Desconhecido
  
  if (status.readyForFlow) return '✅'; // Pronto
  if (status.issues.length > 0) return '⚠️'; // Precisa de correção
  return '❌'; // Problema crítico
};

// Função para debug - mostra todos os status
export const debugComponentStatus = () => {
  console.table(COMPONENT_ANALYSIS);
  console.log('Stats:', getComponentStats());
}; 