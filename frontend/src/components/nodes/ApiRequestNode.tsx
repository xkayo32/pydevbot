import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Http } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface ApiRequestNodeData {
  label: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  responseVariable?: string;
}

const ApiRequestNode = ({ data, selected }: NodeProps<ApiRequestNodeData>) => {
  const { darkMode } = useTheme();
  
  // Cores adaptáveis ao tema
  const primaryColor = darkMode ? '#4dd0e1' : '#00bcd4';
  const backgroundColor = darkMode ? '#1e1e1e' : '#e0f2f1';
  const borderColor = darkMode ? '#424242' : '#e0e0e0';
  const urlBackgroundColor = darkMode ? '#2e2e2e' : '#f5f5f5';
  
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#4caf50';
      case 'POST': return '#2196f3';
      case 'PUT': return '#ff9800';
      case 'DELETE': return '#f44336';
      case 'PATCH': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 220,
        border: selected ? `2px solid ${primaryColor}` : `1px solid ${borderColor}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: backgroundColor,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Http sx={{ mr: 1, color: primaryColor, fontSize: 20 }} />
          <Typography variant="subtitle2" color={primaryColor} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip 
            label={data.method || 'GET'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getMethodColor(data.method || 'GET'),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
        
        {data.url && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              backgroundColor: urlBackgroundColor,
              p: 0.5,
              borderRadius: 0.5,
              wordBreak: 'break-all'
            }}
          >
            {data.url.length > 30 ? `${data.url.substring(0, 30)}...` : data.url}
          </Typography>
        )}
        
        {data.responseVariable && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Salvar em: <strong>{data.responseVariable}</strong>
            </Typography>
          </Box>
        )}
        
        {data.headers && Object.keys(data.headers).length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Headers: {Object.keys(data.headers).length} configurado(s)
            </Typography>
          </Box>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: primaryColor,
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

export default memo(ApiRequestNode); 