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
  Divider,
  Badge
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { FlowExecutor, ExecutionResult, FlowNode, FlowEdge } from '../services/flowExecutor';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system' | 'error';
  content: any;
  timestamp: Date;
  isTyping?: boolean;
  nodeType?: string;
}

interface DesktopChatInterfaceProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onClose?: () => void;
  projectName?: string;
}

export const DesktopChatInterface: React.FC<DesktopChatInterfaceProps> = ({ 
  nodes, 
  edges, 
  onClose,
  projectName = 'Bot Preview'
}) => {
  const { darkMode } = useTheme();
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

  // Reiniciar chat
  const restartChat = () => {
    setMessages([]);
    setCurrentExecution(null);
    setExecutor(null);
    setIsFinished(false);
    setVariables({});
    setIsInitialized(false);
    setAutoExecutionCount(0);
    setInputValue('');
    setIsLoading(false);
    executorRef.current = null;
  };

  // Inicializar executor e começar fluxo
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

    // Continuação automática
    const currentExecutor = executorRef.current || executor;
    if (result.requiresInput === false && result.nextNodeId && currentExecutor && !isLoading && autoExecutionCount < 5) {
      setAutoExecutionCount(prev => prev + 1);
      setIsLoading(true);
      
      setTimeout(async () => {
        try {
          const nextResult = await currentExecutor.continueExecutionAuto();
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
      setIsLoading(false);
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
    if (!inputValue.trim() || isLoading || !executor) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    addMessage({
      type: 'user',
      content: userMessage
    });

    setIsLoading(true);

    try {
      const result = await executor.continueExecution(userMessage);
      await handleExecutionResult(result);
      setVariables(executor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao processar mensagem: ${error}` }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar mensagem
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
          mb: 3,
          alignItems: 'flex-start'
        }}
      >
        {!isUser && (
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 2,
              bgcolor: isError ? 'error.main' : 'primary.main',
              mt: 0.5
            }}
          >
            <BotIcon sx={{ fontSize: 24 }} />
          </Avatar>
        )}
        
        <Paper
          elevation={2}
          sx={{
            maxWidth: '65%',
            minWidth: '200px',
            bgcolor: isUser 
              ? (darkMode ? '#1976d2' : '#2196f3')
              : isError 
                ? (darkMode ? '#d32f2f' : '#f44336')
                : (darkMode ? '#2e2e2e' : '#ffffff'),
            color: isUser || isError 
              ? '#ffffff'
              : (darkMode ? '#ffffff' : '#000000'),
            borderRadius: 3,
            p: 2,
            position: 'relative',
            '&::before': !isUser ? {
              content: '""',
              position: 'absolute',
              top: 12,
              left: -6,
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: `6px solid ${isError 
                ? (darkMode ? '#d32f2f' : '#f44336')
                : (darkMode ? '#2e2e2e' : '#ffffff')}`
            } : {
              content: '""',
              position: 'absolute',
              top: 12,
              right: -6,
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: `6px solid ${darkMode ? '#1976d2' : '#2196f3'}`
            }
          }}
        >
          {renderMessageContent(message)}
          
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.8,
              fontSize: '0.75rem',
              textAlign: 'right'
            }}
          >
            {message.timestamp.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Paper>
        
        {isUser && (
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              ml: 2,
              bgcolor: darkMode ? '#424242' : '#757575',
              mt: 0.5
            }}
          >
            <UserIcon sx={{ fontSize: 24 }} />
          </Avatar>
        )}
      </Box>
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    const content = message.content;

    if (typeof content === 'string') {
      return <Typography variant="body1" sx={{ lineHeight: 1.5 }}>{content}</Typography>;
    }

    if (!content) {
      return <Typography variant="body1">Mensagem vazia</Typography>;
    }

    switch (content.type) {
      case 'text':
      case 'message':
        return (
          <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
            {content.text || content.message || content.content}
          </Typography>
        );

      case 'input':
      case 'user-input':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, lineHeight: 1.5 }}>
              {content.text || content.message || content.placeholder || 'Digite sua resposta:'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
              💡 Use o campo de entrada abaixo para responder
            </Typography>
          </Box>
        );

      case 'choices':
      case 'choice':
        const choices = content.choices || content.options || [];
        return (
          <Box>
            {content.text && (
              <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.5 }}>
                {content.text}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {choices.map((choice: any, index: number) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleChoiceClick(choice)}
                  disabled={isLoading}
                  sx={{ 
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.2)'
                    }
                  }}
                >
                  {choice.label || choice.value || choice}
                </Button>
              ))}
            </Box>
          </Box>
        );

      default:
        return (
          <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
            {content.text || content.message || JSON.stringify(content)}
          </Typography>
        );
    }
  };

  // Lidar com clique em escolha
  const handleChoiceClick = async (choice: any) => {
    if (isLoading || !executor) return;

    const choiceValue = choice.value || choice.label || choice;
    
    addMessage({
      type: 'user',
      content: choiceValue
    });

    setIsLoading(true);

    try {
      const result = await executor.continueExecution(choiceValue);
      await handleExecutionResult(result);
      setVariables(executor.getVariables());
    } catch (error) {
      console.error('❌ Erro ao processar escolha:', error);
      addMessage({
        type: 'error',
        content: { message: `Erro ao processar escolha: ${error}` }
      });
    } finally {
      setIsLoading(false);
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

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: darkMode ? '#121212' : '#f5f5f5'
      }}
    >
      {/* Header do Chat */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
          borderRadius: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <BotIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {messages.length} mensagens • {Object.keys(variables).length} variáveis
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={restartChat} title="Reiniciar chat">
            <RefreshIcon />
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} title="Fechar">
              ✕
            </IconButton>
          )}
        </Box>
      </Paper>

      {/* Área de mensagens */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1,
            textAlign: 'center'
          }}>
            <Box>
              <BotIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Olá! Eu sou seu bot assistente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A conversa começará automaticamente...
              </Typography>
            </Box>
          </Box>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        
        {isLoading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-start',
            alignItems: 'center',
            mb: 3
          }}>
            <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main' }}>
              <BotIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                bgcolor: darkMode ? '#2e2e2e' : '#ffffff',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Digitando...
              </Typography>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Área de input */}
      {shouldShowInput() && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
            borderRadius: 0
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                currentExecution?.output?.placeholder || 
                'Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)'
              }
              variant="outlined"
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3
                }
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              color="primary"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&:disabled': {
                  bgcolor: 'action.disabled'
                },
                mb: 0.5
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

      {/* Opções de escolha */}
      {shouldShowChoices() && currentExecution?.output?.choices && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
            borderRadius: 0
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Escolha uma opção:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentExecution.output.choices.map((choice: any, index: number) => (
              <Button
                key={index}
                variant="outlined"
                onClick={() => handleChoiceClick(choice)}
                disabled={isLoading}
                sx={{ borderRadius: 2 }}
              >
                {choice.label || choice.value || choice}
              </Button>
            ))}
          </Box>
        </Paper>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="*/*"
      />
    </Box>
  );
}; 