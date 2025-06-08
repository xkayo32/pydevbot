import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, alpha } from '@mui/material';
import { EditNote, CheckCircle, ErrorOutline, Person, Email, Phone, Lock } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface UserInputNodeData {
  label: string;
  placeholder?: string;
  variableName?: string;
  validationRule?: string;
  inputType?: 'text' | 'email' | 'phone' | 'number' | 'password';
  required?: boolean;
}

const UserInputNode = ({ data, selected }: NodeProps<UserInputNodeData>) => {
  const { darkMode } = useTheme();
  
  const getInputTypeColor = (type: string) => {
    switch (type) {
      case 'email': return '#3b82f6';
      case 'phone': return '#10b981';
      case 'number': return '#8b5cf6';
      case 'password': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getInputTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Email sx={{ fontSize: 14 }} />;
      case 'phone': return <Phone sx={{ fontSize: 14 }} />;
      case 'password': return <Lock sx={{ fontSize: 14 }} />;
      default: return <Person sx={{ fontSize: 14 }} />;
    }
  };

  const isNameInput = data.placeholder?.toLowerCase().includes('nome') || 
                     data.label?.toLowerCase().includes('nome') ||
                     data.variableName?.toLowerCase().includes('name');

  return (
    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Card 
        sx={{ 
          minWidth: 240,
          maxWidth: 280,
          border: selected ? 
            `2px solid ${darkMode ? '#3b82f6' : '#2563eb'}` : 
            `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
          boxShadow: selected ? 
            `0 4px 20px ${alpha('#3b82f6', 0.25)}` : 
            '0 2px 8px rgba(0,0,0,0.08)',
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          {/* Cabeçalho */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ 
              p: 0.8, 
              borderRadius: 1.5, 
              bgcolor: darkMode ? alpha('#3b82f6', 0.2) : alpha('#3b82f6', 0.1),
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EditNote sx={{ 
                color: darkMode ? '#60a5fa' : '#3b82f6', 
                fontSize: 20 
              }} />
            </Box>
            <Typography 
              variant="subtitle1" 
              sx={{
                color: darkMode ? '#f9fafb' : '#111827',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {data.label}
            </Typography>
          </Box>
          
          {/* Preview do campo */}
          {data.placeholder && (
            <Box sx={{ 
              backgroundColor: darkMode ? alpha('#3b82f6', 0.1) : '#f0f9ff',
              color: darkMode ? '#93c5fd' : '#1e40af',
              p: 2, 
              borderRadius: 2,
              mb: 2,
              fontSize: '0.85rem',
              fontWeight: 500,
              border: `1px solid ${darkMode ? '#374151' : '#dbeafe'}`,
              position: 'relative',
              '&::before': {
                content: isNameInput ? '"👤"' : '"💬"',
                position: 'absolute',
                top: -10,
                left: 10,
                fontSize: '16px',
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                px: 0.5,
                borderRadius: 1
              }
            }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                "{data.placeholder}"
              </Typography>
            </Box>
          )}
          
          {/* Chips informativos */}
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
            {data.inputType && (
              <Chip 
                icon={getInputTypeIcon(data.inputType)}
                label={data.inputType.charAt(0).toUpperCase() + data.inputType.slice(1)} 
                size="small" 
                sx={{ 
                  fontSize: '0.7rem',
                  backgroundColor: alpha(getInputTypeColor(data.inputType), 0.1),
                  color: getInputTypeColor(data.inputType),
                  border: `1px solid ${alpha(getInputTypeColor(data.inputType), 0.3)}`,
                  height: 24,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: getInputTypeColor(data.inputType)
                  }
                }}
              />
            )}
            
            {data.variableName && (
              <Chip 
                label={`→ ${data.variableName}`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 24,
                  fontWeight: 500,
                  borderColor: darkMode ? '#4b5563' : '#d1d5db',
                  color: darkMode ? '#d1d5db' : '#6b7280'
                }}
              />
            )}
          </Box>

          {/* Status indicators */}
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {data.required && (
              <Chip 
                icon={<ErrorOutline sx={{ fontSize: 14 }} />}
                label="Obrigatório" 
                size="small" 
                sx={{
                  fontSize: '0.7rem', 
                  height: 24,
                  backgroundColor: alpha('#ef4444', 0.1),
                  color: '#dc2626',
                  border: `1px solid ${alpha('#ef4444', 0.3)}`,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: '#dc2626'
                  }
                }}
              />
            )}
            
            {data.validationRule && (
              <Chip 
                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                label="Validação" 
                size="small" 
                sx={{
                  fontSize: '0.7rem', 
                  height: 24,
                  backgroundColor: alpha('#10b981', 0.1),
                  color: '#059669',
                  border: `1px solid ${alpha('#10b981', 0.3)}`,
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: '#059669'
                  }
                }}
              />
            )}
          </Box>
          
          {data.validationRule && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1.5, 
                display: 'block',
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontFamily: 'monospace', 
                fontSize: '0.75rem',
                backgroundColor: darkMode ? alpha('#374151', 0.5) : '#f9fafb',
                p: 1,
                borderRadius: 1,
                border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}`
              }}
            >
              Regex: {data.validationRule.length > 25 ? `${data.validationRule.substring(0, 25)}...` : data.validationRule}
            </Typography>
          )}
        </CardContent>
        
        {/* Handles */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: darkMode ? '#3b82f6' : '#2563eb',
            width: 10,
            height: 10,
            zIndex: 10,
            border: `2px solid ${darkMode ? '#1f2937' : '#ffffff'}`
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="valid"
          style={{
            background: '#10b981',
            width: 10,
            height: 10,
            left: '30%',
            zIndex: 10,
            border: `2px solid ${darkMode ? '#1f2937' : '#ffffff'}`
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="invalid"
          style={{
            background: '#ef4444',
            width: 10,
            height: 10,
            left: '70%',
            zIndex: 10,
            border: `2px solid ${darkMode ? '#1f2937' : '#ffffff'}`
          }}
        />
        
        {/* Labels para handles */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: -20,
            left: '25%',
            fontSize: '0.6rem',
            color: '#10b981',
            fontWeight: 600,
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            px: 0.5,
            borderRadius: 0.5
          }}
        >
          Válido
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: -20,
            right: '25%',
            fontSize: '0.6rem',
            color: '#ef4444',
            fontWeight: 600,
            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
            px: 0.5,
            borderRadius: 0.5
          }}
        >
          Inválido
        </Typography>
      </Card>
    </Box>
  );
};

export default memo(UserInputNode); 