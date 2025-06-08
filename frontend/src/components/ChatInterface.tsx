import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Avatar,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Link
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Code as CodeIcon,
  Storage as DatabaseIcon,
  Api as ApiIcon,
  Psychology as AiIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { FlowExecutor, ExecutionResult, FlowNode, FlowEdge } from '../services/flowExecutor';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system' | 'error';
  content: any;
  timestamp: Date;
  isTyping?: boolean;
  nodeType?: string;
}

interface ChatInterfaceProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ nodes, edges, onClose }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<ExecutionResult | null>(null);
  const [executor, setExecutor] = useState<FlowExecutor | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [autoExecutionCount, setAutoExecutionCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const executorRef = useRef<FlowExecutor | null>(null);

  // Scroll para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inicializar executor e começar fluxo - executar apenas uma vez
  useEffect(() => {
    if (nodes.length > 0 && !isInitialized && !executorRef.current) {
      console.log('🔧 Inicializando executor...');
      setIsInitialized(true);
      
      const userId = `user_${Date.now()}`;
      const flowExecutor = new FlowExecutor(nodes, edges, userId);
      executorRef.current = flowExecutor;
      setExecutor(flowExecutor);
      
      setTimeout(() => {
        startFlow(flowExecutor);
      }, 300);
    }
  }, [nodes, edges, isInitialized]);

  // Iniciar o fluxo
  const startFlow = async (executor: FlowExecutor) => {
    try {
      console.log('🚀 Iniciando fluxo...');
      const result = await executor.startExecution();
      console.log('✅ Resultado inicial:', result);
      await handleExecutionResult(result);
      setVariables(executor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao iniciar fluxo:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao iniciar conversa: ${error}` },
        nodeType: 'error'
      });
    }
  };

  // Processar resultado da execução
  const handleExecutionResult = async (result: ExecutionResult) => {
    console.log('🔄 Resultado da execução:', {
      success: result.success,
      requiresInput: result.requiresInput,
      nextNodeId: result.nextNodeId,
      outputType: result.output?.type,
      autoExecutionCount
    });

    setCurrentExecution(result);

    if (!result.success) {
      addMessage({
        type: 'error',
        content: { message: result.error || 'Erro desconhecido' },
        nodeType: 'error'
      });
      return;
    }

    if (result.finished) {
      setIsFinished(true);
      if (result.output) {
        await addBotMessage(result.output);
      }
      return;
    }

    if (result.output) {
      await addBotMessage(result.output);
    }

    // Se não requer input E tem próximo nó, continuar automaticamente
    const currentExecutor = executorRef.current || executor;
    if (result.requiresInput === false && result.nextNodeId && currentExecutor && !isLoading && autoExecutionCount < 5) {
      console.log('⚡ Continuando automaticamente para próximo nó:', result.nextNodeId);
      
      setAutoExecutionCount(prev => prev + 1);
      setIsLoading(true);
      
      setTimeout(async () => {
        try {
          console.log('🚀 Executando continueExecutionAuto...');
          const nextResult = await currentExecutor.continueExecutionAuto();
          console.log('✅ Resultado da continuação automática:', nextResult);
          await handleExecutionResult(nextResult);
          setVariables(currentExecutor.getVariables());
        } catch (error) {
          console.error('❌ Erro na continuação automática:', error);
          addMessage({
            type: 'error',
            content: { message: `Erro na continuação automática: ${error}` },
            nodeType: 'error'
          });
        } finally {
          setIsLoading(false);
        }
      }, 1000);
      
    } else {
      console.log('⏸️ Não continuar automaticamente');
      
      if (autoExecutionCount >= 5) {
        addMessage({
          type: 'error',
          content: { message: 'Loop infinito detectado! Execução automática interrompida.' },
          nodeType: 'error'
        });
      } else if (result.requiresInput === true) {
        console.log('⏸️ Fluxo pausado - aguardando input do usuário');
        setIsLoading(false);
      }
    }
  };

  const addBotMessage = async (output: any) => {
    const message = {
      type: 'bot' as const,
      content: output,
      nodeType: output.type
    };
    addMessage(message);
  };

  // Adicionar mensagem à lista
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random()}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Enviar mensagem do usuário
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !currentExecution?.requiresInput) return;

    const userMessage = inputValue.trim();
    
    // Adicionar mensagem do usuário
    addMessage({
      type: 'user',
      content: { text: userMessage },
      nodeType: 'user'
    });

    setInputValue('');
    setIsLoading(true);
    setAutoExecutionCount(0);

    try {
      const currentExecutor = executorRef.current || executor;
      if (!currentExecutor) {
        throw new Error('Executor não encontrado');
      }

      console.log('📤 Enviando mensagem do usuário:', userMessage);
      const result = await currentExecutor.continueExecution(userMessage);
      console.log('✅ Resultado após input do usuário:', result);
      await handleExecutionResult(result);
      setVariables(currentExecutor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao processar mensagem: ${error}` },
        nodeType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clique em opção de escolha
  const handleChoiceClick = async (choice: any) => {
    if (isLoading) return;

    addMessage({
      type: 'user',
      content: { text: choice.label || choice.value || choice },
      nodeType: 'choice'
    });

    setIsLoading(true);
    setAutoExecutionCount(0);

    try {
      const currentExecutor = executorRef.current || executor;
      if (!currentExecutor) {
        throw new Error('Executor não encontrado');
      }

      const result = await currentExecutor.continueExecution(choice.value || choice);
      await handleExecutionResult(result);
      setVariables(currentExecutor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao processar escolha:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao processar escolha: ${error}` },
        nodeType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || isLoading) return;

    const file = files[0];
    
    addMessage({
      type: 'user',
      content: { text: `📎 ${file.name}`, file: file },
      nodeType: 'file'
    });

    setIsLoading(true);
    setAutoExecutionCount(0);

    try {
      const currentExecutor = executorRef.current || executor;
      if (!currentExecutor) {
        throw new Error('Executor não encontrado');
      }

      const result = await currentExecutor.continueExecution({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        file: file
      });
      await handleExecutionResult(result);
      setVariables(currentExecutor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao processar arquivo: ${error}` },
        nodeType: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar mensagem individual
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    const isError = message.type === 'error';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        {!isUser && !isSystem && !isError && (
          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.primary.main }}>
            <BotIcon sx={{ fontSize: 20 }} />
          </Avatar>
        )}
        
        <Box
          sx={{
            maxWidth: '70%',
            bgcolor: isUser 
              ? theme.palette.primary.main 
              : isError 
                ? theme.palette.error.light 
                : isSystem 
                  ? theme.palette.grey[100] 
                  : theme.palette.background.paper,
            color: isUser 
              ? theme.palette.primary.contrastText 
              : isError 
                ? theme.palette.error.contrastText 
                : isSystem 
                  ? theme.palette.text.secondary 
                  : theme.palette.text.primary,
            borderRadius: 2,
            p: 1.5,
            boxShadow: 1,
          }}
        >
          {renderMessageContent(message)}
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 0.5, 
              opacity: 0.7,
              fontSize: '0.7rem'
            }}
          >
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Box>
        
        {isUser && (
          <Avatar sx={{ width: 32, height: 32, ml: 1, bgcolor: theme.palette.grey[500] }}>
            <UserIcon sx={{ fontSize: 20 }} />
          </Avatar>
        )}
      </Box>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    const content = message.content;

    if (typeof content === 'string') {
      return <Typography variant="body2">{content}</Typography>;
    }

    if (!content) {
      return <Typography variant="body2">Mensagem vazia</Typography>;
    }

    switch (content.type) {
      case 'text':
      case 'message':
        return (
          <Typography variant="body2">
            {content.text || content.message || content.content}
          </Typography>
        );

      case 'choices':
      case 'choice':
        const choices = content.choices || content.options || [];
        return (
          <Box>
            {content.text && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {content.text}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
              {choices.map((choice: any, index: number) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleChoiceClick(choice)}
                  disabled={isLoading}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {choice.label || choice.value || choice}
                </Button>
              ))}
            </Box>
          </Box>
        );

      case 'input':
      case 'user-input':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {content.text || content.message || content.placeholder || 'Digite sua resposta:'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              💡 Use o campo de entrada abaixo para responder
            </Typography>
          </Box>
        );

      case 'file':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {content.text || 'Envie um arquivo:'}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Selecionar arquivo
            </Button>
          </Box>
        );

      case 'user-input-response':
        return (
          <Typography variant="body2">
            Resposta recebida: {content.value}
          </Typography>
        );

      default:
        return (
          <Typography variant="body2">
            {content.text || content.message || JSON.stringify(content)}
          </Typography>
        );
    }
  };

  // Verificar se deve mostrar campo de entrada
  const shouldShowInput = () => {
    return currentExecution?.requiresInput === true && 
           ['input', 'user-input', 'text', 'message'].includes(currentExecution?.output?.type);
  };

  // Verificar se deve mostrar opções
  const shouldShowChoices = () => {
    return currentExecution?.requiresInput === true && 
           ['choices', 'choice'].includes(currentExecution?.output?.type);
  };

  // Verificar se deve mostrar upload de arquivo
  const shouldShowFileUpload = () => {
    return currentExecution?.requiresInput === true && 
           currentExecution?.output?.type === 'file';
  };

  return (
    <Paper 
      sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        bgcolor: theme.palette.background.default
      }}
    >
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Chat Preview</Typography>
        {onClose && (
          <IconButton onClick={onClose}>
            <Typography>✕</Typography>
          </IconButton>
        )}
      </Box>

      {/* Área de mensagens */}
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
        {messages.map((message, index) => renderMessage(message, index))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Campo de entrada */}
      {shouldShowInput() && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              currentExecution?.output?.placeholder || 
              'Digite sua mensagem...'
            }
            variant="outlined"
            disabled={isLoading}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            color="primary"
          >
            <SendIcon />
          </IconButton>
        </Box>
      )}

      {/* Opções de escolha */}
      {shouldShowChoices() && currentExecution?.output?.choices && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {currentExecution.output.choices.map((choice: any, index: number) => (
            <Button
              key={index}
              variant="outlined"
              onClick={() => handleChoiceClick(choice)}
              disabled={isLoading}
            >
              {choice.label || choice.value || choice}
            </Button>
          ))}
        </Box>
      )}

      {/* Upload de arquivo */}
      {shouldShowFileUpload() && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Selecionar arquivo
          </Button>
        </Box>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept="*/*"
      />
    </Paper>
  );
}; 