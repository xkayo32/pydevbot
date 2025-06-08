import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { DataObject } from '@mui/icons-material';

interface VariableNodeData {
  label: string;
  operation?: 'set' | 'get' | 'increment' | 'decrement' | 'append' | 'clear';
  variableName?: string;
  value?: string;
  dataType?: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

const VariableNode = ({ data, selected }: NodeProps<VariableNodeData>) => {
  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'set': return '#2196f3';
      case 'get': return '#4caf50';
      case 'increment': return '#ff9800';
      case 'decrement': return '#f44336';
      case 'append': return '#9c27b0';
      case 'clear': return '#757575';
      default: return '#424242';
    }
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'string': return '#00bcd4';
      case 'number': return '#3f51b5';
      case 'boolean': return '#4caf50';
      case 'array': return '#ff5722';
      case 'object': return '#795548';
      default: return '#607d8b';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 200,
        border: selected ? '2px solid #673ab7' : '1px solid #e0e0e0',
        boxShadow: selected ? 3 : 1,
        backgroundColor: '#ede7f6',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DataObject sx={{ mr: 1, color: '#673ab7', fontSize: 20 }} />
          <Typography variant="subtitle2" color="#673ab7" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={data.operation || 'set'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getOperationColor(data.operation || 'set'),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          {data.dataType && (
            <Chip 
              label={data.dataType} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                backgroundColor: getDataTypeColor(data.dataType),
                color: 'white'
              }}
            />
          )}
        </Box>
        
        {data.variableName && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Variável: <strong>{data.variableName}</strong>
          </Typography>
        )}
        
        {data.value && (
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 1, 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            border: '1px solid #e0e0e0'
          }}>
            {data.value.length > 30 ? `${data.value.substring(0, 30)}...` : data.value}
          </Box>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#673ab7',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#673ab7',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(VariableNode); 