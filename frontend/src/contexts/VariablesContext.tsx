import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Variable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  value: any;
  description?: string;
  isGlobal: boolean;
  createdAt: Date;
}

interface VariablesContextType {
  variables: Variable[];
  addVariable: (variable: Omit<Variable, 'id' | 'createdAt'>) => void;
  updateVariable: (id: string, updates: Partial<Variable>) => void;
  deleteVariable: (id: string) => void;
  getVariableByName: (name: string) => Variable | undefined;
  getGlobalVariables: () => Variable[];
  getAllVariableNames: () => string[];
}

const VariablesContext = createContext<VariablesContextType>({
  variables: [],
  addVariable: () => {},
  updateVariable: () => {},
  deleteVariable: () => {},
  getVariableByName: () => undefined,
  getGlobalVariables: () => [],
  getAllVariableNames: () => [],
});

export const useVariables = () => useContext(VariablesContext);

interface VariablesProviderProps {
  children: ReactNode;
}

export const VariablesProvider = ({ children }: VariablesProviderProps) => {
  const [variables, setVariables] = useState<Variable[]>(() => {
    const saved = localStorage.getItem('projectVariables');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((v: any) => ({
          ...v,
          createdAt: new Date(v.createdAt)
        }));
      } catch {
        return [];
      }
    }
    
    // Variáveis padrão
    return [
      {
        id: 'var_1',
        name: 'userName',
        type: 'string' as const,
        value: '',
        description: 'Nome do usuário',
        isGlobal: true,
        createdAt: new Date()
      },
      {
        id: 'var_2',
        name: 'userEmail',
        type: 'string' as const,
        value: '',
        description: 'Email do usuário',
        isGlobal: true,
        createdAt: new Date()
      },
      {
        id: 'var_3',
        name: 'userAge',
        type: 'number' as const,
        value: 0,
        description: 'Idade do usuário',
        isGlobal: true,
        createdAt: new Date()
      },
      {
        id: 'var_4',
        name: 'isAuthenticated',
        type: 'boolean' as const,
        value: false,
        description: 'Status de autenticação',
        isGlobal: true,
        createdAt: new Date()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('projectVariables', JSON.stringify(variables));
  }, [variables]);

  const addVariable = (variableData: Omit<Variable, 'id' | 'createdAt'>) => {
    const newVariable: Variable = {
      ...variableData,
      id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    setVariables(prev => [...prev, newVariable]);
  };

  const updateVariable = (id: string, updates: Partial<Variable>) => {
    setVariables(prev => prev.map(variable => 
      variable.id === id ? { ...variable, ...updates } : variable
    ));
  };

  const deleteVariable = (id: string) => {
    setVariables(prev => prev.filter(variable => variable.id !== id));
  };

  const getVariableByName = (name: string) => {
    return variables.find(variable => variable.name === name);
  };

  const getGlobalVariables = () => {
    return variables.filter(variable => variable.isGlobal);
  };

  const getAllVariableNames = () => {
    return variables.map(variable => variable.name);
  };

  return (
    <VariablesContext.Provider value={{
      variables,
      addVariable,
      updateVariable,
      deleteVariable,
      getVariableByName,
      getGlobalVariables,
      getAllVariableNames
    }}>
      {children}
    </VariablesContext.Provider>
  );
}; 