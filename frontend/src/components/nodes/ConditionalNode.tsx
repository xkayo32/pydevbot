import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { AccountTree } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface ConditionalNodeData {
  label: string;
  condition?: string;
  variable?: string;
  operator?: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less';
  value?: string;
}

const ConditionalNode = ({ data, selected }: NodeProps<ConditionalNodeData>) => {
  const { darkMode } = useTheme();
  
  // Cores adaptáveis ao tema
  const primaryColor = darkMode ? '#ffb74d' : '#ff9800';
  const backgroundColor = darkMode ? '#1e1e1e' : '#fff3e0';
  const borderColor = darkMode ? '#424242' : '#e0e0e0';
  const textSecondary = darkMode ? '#b0b0b0' : 'text.secondary';
  
  return (
    <Box sx={{ position: 'relative' }}>
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
          <AccountTree sx={{ mr: 1, color: primaryColor, fontSize: 20 }} />
          <Typography variant="subtitle2" color={primaryColor} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.condition && (
          <Typography variant="body2" color={textSecondary} sx={{ mb: 1 }}>
            {data.condition}
          </Typography>
        )}
        
        {data.variable && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip 
              label={data.variable} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label={data.operator || 'equals'} 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label={data.value || '""'} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
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
        id="true"
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
        id="false"
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
        <Typography variant="caption" sx={{ color: '#4caf50' }}>Sim</Typography>
        <Typography variant="caption" sx={{ color: '#f44336' }}>Não</Typography>
      </Box>
      </Card>
    </Box>
  );
};

export default memo(ConditionalNode); 