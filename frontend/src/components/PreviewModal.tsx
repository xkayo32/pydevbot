import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Smartphone as PhoneIcon,
  Tablet as TabletIcon,
  Computer as DesktopIcon,
  SmartToy
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { ChatInterface } from './ChatInterface';
import { Node, Edge } from 'reactflow';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  projectName?: string;
  variables: Record<string, any>;
  darkMode: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  nodes,
  edges,
  projectName = 'Bot Preview',
  variables,
  darkMode
}) => {
  const theme = useTheme();
  const [deviceMode, setDeviceMode] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  // Converter nodes e edges para o formato do executor
  const flowNodes = nodes.map(node => ({
    id: node.id,
    type: node.type || 'unknown',
    data: node.data || {},
    position: node.position
  }));

  const flowEdges = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined
  }));

  // Obter dimensões baseadas no dispositivo
  const getDeviceDimensions = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: 375, height: 667 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'desktop':
        return { width: 1200, height: 800 };
      default:
        return { width: 375, height: 667 };
    }
  };

  const dimensions = getDeviceDimensions();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          width: '90vw',
          height: '90vh',
          maxWidth: 'none',
          bgcolor: theme.palette.background.default
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid ${darkMode ? '#333' : '#e0e0e0'}`,
        backgroundColor: darkMode ? '#1e1e1e' : '#f8f9fa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToy sx={{ color: darkMode ? '#90caf9' : '#1976d2', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ 
              color: darkMode ? '#ffffff' : '#000000',
              fontWeight: 600 
            }}>
              Preview do Bot
            </Typography>
            <Typography variant="caption" sx={{ 
              color: darkMode ? '#9e9e9e' : '#666666' 
            }}>
              {nodes.length} nós • Teste interativo
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`${Object.keys(variables || {}).length} variáveis`}
            size="small" 
            sx={{ 
              backgroundColor: darkMode ? '#333' : '#e3f2fd',
              color: darkMode ? '#90caf9' : '#1976d2'
            }}
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Conteúdo do Modal */}
      <DialogContent
        sx={{
          p: 0,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
        }}
      >
        {nodes.length === 0 ? (
          /* Estado vazio */
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <PlayIcon sx={{ fontSize: 64, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum fluxo para testar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione alguns nós ao canvas para poder testar o bot
            </Typography>
          </Box>
        ) : !nodes.some(node => node.type === 'start') ? (
          /* Sem nó de início */
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <PlayIcon sx={{ fontSize: 64, color: theme.palette.warning.main, mb: 2 }} />
            <Typography variant="h6" color="warning.main" gutterBottom>
              Nó de início necessário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione um nó de "Início" ao fluxo para poder executar o bot
            </Typography>
          </Box>
        ) : (
          /* Simulador de dispositivo */
          <Box
            sx={{
              width: dimensions.width,
              height: dimensions.height,
              bgcolor: theme.palette.background.paper,
              borderRadius: deviceMode === 'mobile' ? 4 : 2,
              boxShadow: theme.shadows[8],
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              position: 'relative',
              ...(deviceMode === 'mobile' && {
                borderRadius: 6,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 60,
                  height: 4,
                  bgcolor: theme.palette.text.disabled,
                  borderRadius: 2,
                  zIndex: 1
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 40,
                  height: 40,
                  border: `2px solid ${theme.palette.text.disabled}`,
                  borderRadius: '50%',
                  zIndex: 1
                }
              })
            }}
          >
            {/* Barra de status do dispositivo móvel */}
            {deviceMode === 'mobile' && (
              <Box
                sx={{
                  height: 24,
                  bgcolor: theme.palette.background.paper,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 2,
                  fontSize: 12,
                  color: theme.palette.text.secondary,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <span>9:41</span>
                <span>🔋 100%</span>
              </Box>
            )}

            {/* Interface do Chat */}
            <Box
              sx={{
                height: deviceMode === 'mobile' ? 'calc(100% - 24px)' : '100%',
                overflow: 'hidden'
              }}
            >
              <ChatInterface
                nodes={flowNodes}
                edges={flowEdges}
                onClose={undefined} // Não mostrar botão fechar interno
              />
            </Box>
          </Box>
        )}

        {/* Informações de debug */}
        {nodes.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              p: 1,
              boxShadow: theme.shadows[2],
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Modo: {deviceMode} • {dimensions.width}x{dimensions.height}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}; 