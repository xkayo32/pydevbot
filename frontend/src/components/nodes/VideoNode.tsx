import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { PlayCircleOutline, YouTube, VideoLibrary } from '@mui/icons-material';

interface VideoNodeData {
  label: string;
  videoUrl?: string;
  platform?: 'youtube' | 'vimeo' | 'direct';
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  thumbnail?: string;
}

const VideoNode = ({ data, selected }: NodeProps<VideoNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <YouTube sx={{ fontSize: 14 }} />;
      case 'vimeo': return <VideoLibrary sx={{ fontSize: 14 }} />;
      default: return <PlayCircleOutline sx={{ fontSize: 14 }} />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return '#ff0000';
      case 'vimeo': return '#1ab7ea';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 220,
        border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: isDark ? '#1e2a3f' : '#e8eaf6',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PlayCircleOutline sx={{ mr: 1, color: theme.palette.primary.main, fontSize: 20 }} />
          <Typography variant="subtitle2" color={theme.palette.primary.main} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        {data.videoUrl && (
          <Box sx={{ 
            backgroundColor: isDark ? '#2d3a4f' : '#c5cae9', 
            p: 1.5, 
            borderRadius: 1,
            mb: 1,
            textAlign: 'center',
            border: `1px solid ${theme.palette.primary.main}`,
            position: 'relative'
          }}>
            <Box sx={{ 
              width: '100%', 
              height: 50, 
              backgroundColor: isDark ? '#0d1421' : '#1a237e',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5,
              position: 'relative'
            }}>
              <PlayCircleOutline sx={{ color: 'white', fontSize: 24 }} />
              <Box sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: 0.5,
                px: 0.5,
                py: 0.2
              }}>
                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                  16:9
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {data.videoUrl.length > 30 ? `${data.videoUrl.substring(0, 30)}...` : data.videoUrl}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {data.platform && (
            <Chip 
              icon={getPlatformIcon(data.platform)}
              label={data.platform} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                backgroundColor: getPlatformColor(data.platform),
                color: 'white',
                height: 20
              }}
            />
          )}
          
          {data.autoplay && (
            <Chip 
              label="Autoplay" 
              size="small" 
              color="primary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {data.muted && (
            <Chip 
              label="Mudo" 
              size="small" 
              color="secondary"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          
          {!data.controls && (
            <Chip 
              label="Sem controles" 
              size="small" 
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: theme.palette.primary.main,
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: theme.palette.primary.main,
          width: 8,
          height: 8,
        }}
      />
    </Card>
  );
};

export default memo(VideoNode); 