import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { Image, Visibility, Link, BrokenImage } from '@mui/icons-material';

interface ImageNodeData {
  label: string;
  imageUrl?: string;
  altText?: string;
  caption?: string;
  width?: number;
  height?: number;
  clickable?: boolean;
}

const ImageNode = ({ data, selected }: NodeProps<ImageNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [imageError, setImageError] = useState(false);

  return (
    <Card 
      sx={{ 
        minWidth: 200,
        border: selected ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: isDark ? '#3d1e2e' : '#fce4ec',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Image sx={{ mr: 1, color: theme.palette.secondary.main, fontSize: 20 }} />
          <Typography variant="subtitle2" color={theme.palette.secondary.main} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.imageUrl && (
          <Box sx={{ 
            backgroundColor: isDark ? '#4a2d3d' : '#f8bbd9', 
            p: 1, 
            borderRadius: 1,
            mb: 1,
            textAlign: 'center',
            border: `1px solid ${theme.palette.secondary.main}`
          }}>
            {!imageError ? (
              <Box 
                component="img"
                src={data.imageUrl}
                onError={() => setImageError(true)}
                sx={{
                  width: 60,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: 1,
                  mb: 0.5,
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            ) : (
              <Box sx={{ 
                width: 60, 
                height: 40, 
                backgroundColor: isDark ? '#6d4c57' : '#ad1457',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 0.5
              }}>
                <BrokenImage sx={{ color: 'white', fontSize: 16 }} />
              </Box>
            )}
            <Typography variant="caption" color="text.secondary">
              {data.imageUrl.length > 25 ? `${data.imageUrl.substring(0, 25)}...` : data.imageUrl}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {data.width && data.height && (
            <Chip 
              label={`${data.width}x${data.height}`} 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.clickable && (
            <Chip 
              icon={<Link sx={{ fontSize: 14 }} />}
              label="Clicável" 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
        
        {data.altText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Alt: {data.altText}
          </Typography>
        )}
        
        {data.caption && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontStyle: 'italic' }}>
            "{data.caption}"
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: theme.palette.secondary.main,
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(ImageNode); 