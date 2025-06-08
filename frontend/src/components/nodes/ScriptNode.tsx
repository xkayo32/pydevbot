import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { Code, CheckCircle, Error } from '@mui/icons-material';

interface ScriptNodeData {
  label: string;
  language?: 'javascript' | 'python';
  script?: string;
  variables?: string[];
  timeout?: number;
  resultVariable?: string;
}

const ScriptNode = ({ data, selected }: NodeProps<ScriptNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Cores adaptáveis ao tema
  const primaryColor = '#9c27b0';
  const backgroundColor = isDark ? '#2d1b3d' : '#f3e5f5';
  const borderColor = isDark ? '#424242' : '#e0e0e0';
  const codeBackgroundColor = isDark ? '#1a1a1a' : '#424242';
  
  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'javascript': return '#f7df1e';
      case 'python': return '#3776ab';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 200,
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
          <Code sx={{ mr: 1, color: primaryColor, fontSize: 20 }} />
          <Typography variant="subtitle2" color={primaryColor} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={data.language || 'javascript'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getLanguageColor(data.language || 'javascript'),
              color: data.language === 'javascript' ? '#000' : '#fff',
              height: 20
            }}
          />
          
          {data.timeout && (
            <Chip 
              label={`${data.timeout}s timeout`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.resultVariable && (
            <Chip 
              label={`→ ${data.resultVariable}`} 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        
        {data.script && (
          <Box sx={{ 
            backgroundColor: codeBackgroundColor, 
            color: '#fff', 
            p: 1, 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxHeight: 60,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            border: `1px solid ${primaryColor}`,
            position: 'relative'
          }}>
            {data.script.length > 50 ? `${data.script.substring(0, 50)}...` : data.script}
            <Box sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 0.5,
              px: 0.5,
              py: 0.2
            }}>
              <Typography variant="caption" sx={{ color: '#4caf50', fontSize: '0.6rem' }}>
                ✓ Sintaxe OK
              </Typography>
            </Box>
          </Box>
        )}
        
        {data.variables && data.variables.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Variáveis: {data.variables.join(', ')}
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

export default memo(ScriptNode); 