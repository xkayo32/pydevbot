import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { Input } from '@mui/icons-material';

interface InputNodeData {
  label: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'number';
}

const InputNode = ({ data, selected }: NodeProps<InputNodeData>) => {
  return (
    <Card 
      sx={{ 
        minWidth: 200,
        border: selected ? '2px solid #dc004e' : '1px solid #e0e0e0',
        boxShadow: selected ? 3 : 1,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Input sx={{ mr: 1, color: '#dc004e', fontSize: 20 }} />
          <Typography variant="subtitle2" color="secondary" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.placeholder && (
          <Typography variant="body2" color="text.secondary">
            Placeholder: {data.placeholder}
          </Typography>
        )}
        
        <Typography variant="caption" color="text.disabled">
          Tipo: {data.inputType || 'text'}
        </Typography>
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#dc004e',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#dc004e',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(InputNode); 