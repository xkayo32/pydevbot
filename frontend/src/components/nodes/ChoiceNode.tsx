import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { RadioButtonChecked, ArrowForward } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface Choice {
  label: string;
  value: string;
  nextNodeId?: string;
}

interface ChoiceNodeData {
  label: string;
  choices?: Choice[];
  allowMultiple?: boolean;
  randomizeOrder?: boolean;
}

const ChoiceNode = ({ data, selected }: NodeProps<ChoiceNodeData>) => {
  const { darkMode } = useTheme();
  
  // Cores adaptáveis ao tema
  const primaryColor = darkMode ? '#a5d6a7' : '#8bc34a';
  const backgroundColor = darkMode ? '#1e1e1e' : '#f1f8e9';
  const borderColor = darkMode ? '#424242' : '#e0e0e0';
  const optionBgColor = darkMode ? '#2e2e2e' : '#dcedc8';
  const optionIconColor = darkMode ? '#81c784' : '#689f38';
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Card 
        sx={{ 
          minWidth: 240,
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
          <RadioButtonChecked sx={{ mr: 1, color: primaryColor, fontSize: 20 }} />
          <Typography variant="subtitle2" color={primaryColor} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          {data.allowMultiple && (
            <Chip 
              label="Múltipla escolha" 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.randomizeOrder && (
            <Chip 
              label="Ordem aleatória" 
              size="small" 
              color="secondary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          <Chip 
            label={`${data.choices?.length || 0} opções`} 
            size="small" 
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
        </Box>
        
        {data.choices && data.choices.length > 0 && (
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {data.choices.slice(0, 3).map((choice, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: optionBgColor, 
                  p: 0.5, 
                  borderRadius: 1,
                  fontSize: '0.75rem'
                }}
              >
                <RadioButtonChecked sx={{ fontSize: 12, mr: 0.5, color: optionIconColor }} />
                <Typography variant="caption" sx={{ flexGrow: 1 }}>
                  {choice.label.length > 20 ? `${choice.label.substring(0, 20)}...` : choice.label}
                </Typography>
                {choice.nextNodeId && (
                  <ArrowForward sx={{ fontSize: 10, color: optionIconColor }} />
                )}
              </Box>
            ))}
            {data.choices.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                +{data.choices.length - 3} mais opções...
              </Typography>
            )}
          </Stack>
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
      
      {/* Múltiplas saídas para cada escolha */}
      {data.choices && data.choices.slice(0, 4).map((_, index) => (
        <Handle
          key={index}
          type="source"
          position={Position.Bottom}
          id={`choice-${index}`}
          style={{
            background: primaryColor,
            width: 6,
            height: 6,
            left: `${20 + (index * 60 / Math.min(data.choices!.length, 4))}%`,
          }}
        />
      ))}
      
      {/* Labels para as saídas */}
      {data.choices && data.choices.length <= 4 && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: -25, 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'space-around',
          fontSize: '0.6rem',
          color: 'text.secondary'
        }}>
          {data.choices.slice(0, 4).map((choice, index) => (
            <Typography key={index} variant="caption" sx={{ color: primaryColor, fontSize: '0.6rem' }}>
              {choice.label.length > 8 ? `${choice.label.substring(0, 8)}...` : choice.label}
            </Typography>
          ))}
        </Box>
      )}
      </Card>
    </Box>
  );
};

export default memo(ChoiceNode); 