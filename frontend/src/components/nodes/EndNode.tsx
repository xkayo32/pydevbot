import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { Flag, CallToAction, OpenInNew } from '@mui/icons-material';

interface EndNodeData {
  label: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  showRating?: boolean;
  redirectAfter?: number;
}

const EndNode = ({ data, selected }: NodeProps<EndNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Card 
      sx={{ 
        minWidth: 220,
        border: selected ? `2px solid ${theme.palette.success.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: isDark ? '#1e3d2e' : '#e8f5e8',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Flag sx={{ mr: 1, color: theme.palette.success.main, fontSize: 20 }} />
          <Typography variant="subtitle2" color={theme.palette.success.main} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.message && (
          <Box sx={{ 
            backgroundColor: isDark ? '#2d4a3d' : '#c8e6c9', 
            p: 1.5, 
            borderRadius: 2,
            mb: 1,
            fontSize: '0.85rem',
            lineHeight: 1.4,
            border: `2px solid ${isDark ? '#4a6b5a' : '#81c784'}`,
            color: theme.palette.text.primary
          }}>
            {data.message.length > 100 ? `${data.message.substring(0, 100)}...` : data.message}
          </Box>
        )}
        
        {data.ctaLabel && data.ctaUrl && (
          <Box sx={{ 
            backgroundColor: theme.palette.primary.main, 
            color: theme.palette.primary.contrastText,
            p: 1, 
            borderRadius: 1,
            mb: 1,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5
          }}>
            <CallToAction sx={{ fontSize: 16 }} />
            <Typography variant="body2" fontWeight="bold">
              {data.ctaLabel}
            </Typography>
            <OpenInNew sx={{ fontSize: 12 }} />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {data.showRating && (
            <Chip 
              label="Avaliação" 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.redirectAfter && (
            <Chip 
              label={`Redirecionar em ${data.redirectAfter}s`} 
              size="small" 
              color="warning"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          <Chip 
            label="Final" 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: theme.palette.success.main,
              color: theme.palette.success.contrastText,
              height: 20
            }}
          />
        </Box>
        
        {data.ctaUrl && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            URL: {data.ctaUrl.length > 30 ? `${data.ctaUrl.substring(0, 30)}...` : data.ctaUrl}
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: theme.palette.success.main,
          width: 8,
          height: 8,
        }}
      />
      
      {/* Nó final não tem saída */}
    </Card>
  );
};

export default memo(EndNode); 