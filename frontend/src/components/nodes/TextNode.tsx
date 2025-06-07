import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ChatBubbleOutline } from '@mui/icons-material';

interface TextNodeData {
  label: string;
  message?: string;
}

const TextNode = ({ data, selected }: NodeProps<TextNodeData>) => {
  return (
    <Card 
      sx={{ 
        minWidth: 200,
        border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        boxShadow: selected ? 3 : 1,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ChatBubbleOutline sx={{ mr: 1, color: '#1976d2', fontSize: 20 }} />
          <Typography variant="subtitle2" color="primary" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.message && (
          <Typography variant="body2" color="text.secondary">
            {data.message}
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#1976d2',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#1976d2',
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(TextNode); 