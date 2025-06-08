import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { ChatBubbleOutline, Timer, Face } from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageNodeData {
  label: string;
  text?: string;
  typingDelay?: number;
  avatar?: string;
  supportMarkdown?: boolean;
}

const MessageNode = ({ data, selected }: NodeProps<MessageNodeData>) => {
  const { darkMode } = useTheme();
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Card 
        sx={{ 
          minWidth: 220,
          border: selected ? `2px solid ${darkMode ? '#64b5f6' : '#1976d2'}` : `1px solid ${darkMode ? '#424242' : '#e0e0e0'}`,
          boxShadow: selected ? 3 : 1,
          backgroundColor: darkMode ? '#1e1e1e' : '#e3f2fd',
          '&:hover': {
            boxShadow: 2
          }
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <ChatBubbleOutline sx={{ 
              mr: 1, 
              color: darkMode ? '#64b5f6' : '#1976d2', 
              fontSize: 20 
            }} />
            <Typography 
              variant="subtitle2" 
              color={darkMode ? '#64b5f6' : '#1976d2'} 
              fontWeight="bold"
            >
              {data.label}
            </Typography>
          </Box>
          
          {data.text && (
            <Box sx={{ 
              backgroundColor: darkMode ? '#333333' : '#bbdefb', 
              color: darkMode ? '#ffffff' : '#000000',
              p: 1.5, 
              borderRadius: 2,
              mb: 1,
              fontSize: '0.85rem',
              lineHeight: 1.4,
              maxHeight: 80,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {data.text.length > 100 ? `${data.text.substring(0, 100)}...` : data.text}
              {data.text.length > 100 && (
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  right: 0, 
                  background: `linear-gradient(to right, transparent, ${darkMode ? '#333333' : '#bbdefb'})`,
                  px: 1,
                  color: darkMode ? '#ffffff' : '#000000'
                }}>
                  ...
                </Box>
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {data.typingDelay && (
              <Chip 
                icon={<Timer sx={{ fontSize: 14 }} />}
                label={`${data.typingDelay}s`} 
                size="small" 
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 20,
                  borderColor: darkMode ? '#64b5f6' : '#1976d2',
                  color: darkMode ? '#64b5f6' : '#1976d2'
                }}
              />
            )}
            
            {data.avatar && (
              <Chip 
                icon={<Face sx={{ fontSize: 14 }} />}
                label="Avatar" 
                size="small" 
                color="primary"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
            
            {data.supportMarkdown && (
              <Chip 
                label="MD" 
                size="small" 
                color="secondary"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        </CardContent>
        
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: darkMode ? '#64b5f6' : '#1976d2',
            width: 8,
            height: 8,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: darkMode ? '#64b5f6' : '#1976d2',
            width: 8,
            height: 8,
          }}
        />
      </Card>
    </Box>
  );
};

export default memo(MessageNode); 