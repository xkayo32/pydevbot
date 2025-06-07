import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

interface StartNodeData {
  label: string;
}

const StartNode = ({ data, selected }: NodeProps<StartNodeData>) => {
  return (
    <Card 
      sx={{ 
        minWidth: 180,
        border: selected ? '2px solid #4caf50' : '1px solid #e0e0e0',
        boxShadow: selected ? 3 : 1,
        backgroundColor: '#f1f8e9',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlayArrow sx={{ mr: 1, color: '#4caf50', fontSize: 24 }} />
          <Typography variant="subtitle2" color="#4caf50" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
      </CardContent>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#4caf50',
          width: 10,
          height: 10,
        }}
      />
    </Card>
  );
};

export default memo(StartNode); 