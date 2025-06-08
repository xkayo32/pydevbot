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
import { DesktopChatInterface } from './DesktopChatInterface';
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
          /* Interface do Chat Desktop */
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: theme.palette.background.paper,
              overflow: 'hidden'
            }}
          >
            <DesktopChatInterface
              nodes={flowNodes}
              edges={flowEdges}
              onClose={undefined} // Não mostrar botão fechar interno
              projectName={projectName}
            />
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}; 