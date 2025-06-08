import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { AttachFile, Cloud, Folder, CloudUpload } from '@mui/icons-material';

interface FileNodeData {
  label: string;
  operation?: 'upload' | 'read' | 'download' | 'delete';
  fileType?: 'image' | 'document' | 'csv' | 'json' | 'xml' | 'video' | 'audio' | 'any';
  maxSize?: number;
  resultVariable?: string;
  storage?: 'local' | 'minio' | 'google-drive' | 'onedrive' | 's3' | 'custom';
  bucketName?: string;
  accessKey?: string;
}

const FileNode = ({ data, selected }: NodeProps<FileNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Cores adaptáveis ao tema
  const primaryColor = '#607d8b';
  const backgroundColor = isDark ? '#1e1e1e' : '#eceff1';
  const borderColor = isDark ? '#424242' : '#e0e0e0';
  
  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'upload': return '#2196f3';
      case 'read': return '#4caf50';
      case 'download': return '#ff9800';
      case 'delete': return '#f44336';
      default: return '#757575';
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image': return '#e91e63';
      case 'document': return '#673ab7';
      case 'csv': return '#009688';
      case 'json': return '#ff5722';
      case 'xml': return '#795548';
      case 'video': return '#3f51b5';
      case 'audio': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  const getStorageIcon = (storage: string) => {
    switch (storage) {
      case 'local': return <Folder sx={{ fontSize: 14 }} />;
      case 'minio': return <CloudUpload sx={{ fontSize: 14 }} />;
      case 'google-drive': return <Cloud sx={{ fontSize: 14 }} />;
      case 'onedrive': return <Cloud sx={{ fontSize: 14 }} />;
      case 's3': return <CloudUpload sx={{ fontSize: 14 }} />;
      default: return <AttachFile sx={{ fontSize: 14 }} />;
    }
  };

  const getStorageColor = (storage: string) => {
    switch (storage) {
      case 'local': return '#424242';
      case 'minio': return '#c62d42';
      case 'google-drive': return '#4285f4';
      case 'onedrive': return '#0078d4';
      case 's3': return '#ff9900';
      default: return '#607d8b';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 200,
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
          <AttachFile sx={{ mr: 1, color: '#607d8b', fontSize: 20 }} />
          <Typography variant="subtitle2" color="#607d8b" fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={data.operation || 'upload'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getOperationColor(data.operation || 'upload'),
              color: 'white',
              fontWeight: 'bold',
              height: 20
            }}
          />
          <Chip 
            label={data.fileType || 'any'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getFileTypeColor(data.fileType || 'any'),
              color: 'white',
              height: 20
            }}
          />
          {data.storage && (
            <Chip 
              icon={getStorageIcon(data.storage)}
              label={data.storage} 
              size="small" 
              sx={{ 
                fontSize: '0.7rem',
                backgroundColor: getStorageColor(data.storage),
                color: 'white',
                height: 20
              }}
            />
          )}
        </Box>
        
        {data.maxSize && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Tamanho máx: <strong>{data.maxSize}MB</strong>
          </Typography>
        )}
        
        {data.resultVariable && (
          <Typography variant="caption" color="text.secondary">
            Salvar em: <strong>{data.resultVariable}</strong>
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#607d8b',
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
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
        id="error"
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
        <Typography variant="caption" sx={{ color: '#4caf50' }}>Sucesso</Typography>
        <Typography variant="caption" sx={{ color: '#f44336' }}>Erro</Typography>
      </Box>
    </Card>
  );
};

export default memo(FileNode); 