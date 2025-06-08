import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { Schedule, MoreHoriz } from '@mui/icons-material';

interface DelayNodeData {
  label: string;
  duration?: number; // em segundos
  showTypingIndicator?: boolean;
  message?: string;
}

const DelayNode = ({ data, selected }: NodeProps<DelayNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card 
      sx={{ 
        minWidth: 180,
        border: selected ? `2px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: isDark ? '#3f2e1e' : '#fff3e0',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Schedule sx={{ mr: 1, color: theme.palette.warning.main, fontSize: 20 }} />
          <Typography variant="subtitle2" color={theme.palette.warning.main} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.duration && (
          <Box sx={{ 
            backgroundColor: isDark ? '#4f3d2d' : '#ffe0b2', 
            p: 1.5, 
            borderRadius: 2,
            mb: 1,
            textAlign: 'center',
            border: `2px solid ${isDark ? '#6d5a3d' : '#ffb74d'}`
          }}>
            <Typography variant="h6" color={isDark ? '#ffb74d' : '#f57c00'} fontWeight="bold">
              {formatDuration(data.duration)}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {data.showTypingIndicator && (
            <Chip 
              icon={<MoreHoriz sx={{ fontSize: 14 }} />}
              label="Digitando..." 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.duration && data.duration > 10 && (
            <Chip 
              label="Longo" 
              size="small" 
              color="warning"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        
        {data.message && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {data.message}
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: theme.palette.warning.main,
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: theme.palette.warning.main,
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(DelayNode); 