import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Psychology, AutoAwesome, Memory } from '@mui/icons-material';

interface AiResponseNodeData {
  label: string;
  promptTemplate?: string;
  model?: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'claude' | 'groq' | 'gemini' | 'deepseek' | 'ollama' | 'custom';
  maxTokens?: number;
  temperature?: number;
  storeIn?: string;
  useContext?: boolean;
  apiKey?: string;
  customEndpoint?: string;
}

const AiResponseNode = ({ data, selected }: NodeProps<AiResponseNodeData>) => {
  const getModelColor = (model: string) => {
    switch (model) {
      case 'gpt-4':
      case 'gpt-4-turbo': return '#00a67e';
      case 'gpt-3.5-turbo': return '#74aa9c';
      case 'claude': return '#cc785c';
      case 'groq': return '#f55036';
      case 'gemini': return '#4285f4';
      case 'deepseek': return '#1a1a1a';
      case 'ollama': return '#0969da';
      default: return '#757575';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp <= 0.3) return '#2196f3'; // Azul para baixa criatividade
    if (temp <= 0.7) return '#ff9800'; // Laranja para média criatividade
    return '#f44336'; // Vermelho para alta criatividade
  };

  return (
    <Card 
      sx={{ 
        minWidth: 240,
        border: selected ? '2px solid #9c27b0' : '1px solid #e0e0e0',
        boxShadow: selected ? 3 : 1,
        backgroundColor: '#f3e5f5',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Psychology sx={{ mr: 1, color: '#9c27b0', fontSize: 20 }} />
          <Typography variant="subtitle2" color="#9c27b0" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.promptTemplate && (
          <Box sx={{ 
            backgroundColor: '#e1bee7', 
            p: 1.5, 
            borderRadius: 1,
            mb: 1,
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            maxHeight: 60,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid #9c27b0'
          }}>
            {data.promptTemplate.length > 80 ? `${data.promptTemplate.substring(0, 80)}...` : data.promptTemplate}
            {data.promptTemplate.length > 80 && (
              <Box sx={{ 
                position: 'absolute', 
                bottom: 0, 
                right: 0, 
                background: 'linear-gradient(to right, transparent, #e1bee7)',
                px: 1
              }}>
                ...
              </Box>
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
          {data.model && (
            <Chip 
              label={data.model} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                backgroundColor: getModelColor(data.model),
                color: 'white',
                height: 20
              }}
            />
          )}
          
          {data.temperature !== undefined && (
            <Chip 
              icon={<AutoAwesome sx={{ fontSize: 14 }} />}
              label={`T:${data.temperature}`} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                backgroundColor: getTemperatureColor(data.temperature),
                color: 'white',
                height: 20
              }}
            />
          )}
          
          {data.maxTokens && (
            <Chip 
              label={`${data.maxTokens} tokens`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {data.useContext && (
            <Chip 
              icon={<Memory sx={{ fontSize: 14 }} />}
              label="Com contexto" 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.storeIn && (
            <Chip 
              label={`→ ${data.storeIn}`} 
              size="small" 
              color="secondary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#9c27b0',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        style={{
          background: '#4caf50',
          width: 8,
          height: 8,
          left: '25%',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        style={{
          background: '#f44336',
          width: 8,
          height: 8,
          left: '75%',
        }}
      />
      
      {/* Labels para as saídas */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: -20, 
        left: 0, 
        right: 0, 
        display: 'flex', 
        justifyContent: 'space-around',
        fontSize: '0.6rem',
        color: 'text.secondary'
      }}>
        <Typography variant="caption" sx={{ color: '#4caf50' }}>Sucesso</Typography>
        <Typography variant="caption" sx={{ color: '#f44336' }}>Erro</Typography>
      </Box>
    </Card>
  );
};

export default memo(AiResponseNode); 