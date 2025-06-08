import { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Fade,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';

interface NodeHoverActionsProps {
  nodeId: string;
  onEdit: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onTest: (nodeId: string) => void;
  visible: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

const NodeHoverActions = ({ 
  nodeId, 
  onEdit, 
  onDelete, 
  onTest, 
  visible,
  position = 'top-right'
}: NodeHoverActionsProps) => {
  const [expanded, setExpanded] = useState(false);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: -8, right: -8 };
      case 'top-left':
        return { ...baseStyles, top: -8, left: -8 };
      case 'bottom-right':
        return { ...baseStyles, bottom: -8, right: -8 };
      case 'bottom-left':
        return { ...baseStyles, bottom: -8, left: -8 };
      default:
        return { ...baseStyles, top: -8, right: -8 };
    }
  };

  const handleEdit = () => {
    onEdit(nodeId);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja deletar este bloco?')) {
      onDelete(nodeId);
    }
  };

  const handleTest = () => {
    onTest(nodeId);
  };

  return (
    <Fade in={visible} timeout={200}>
      <Box sx={getPositionStyles()}>
        {!expanded ? (
          <Paper
            elevation={3}
            sx={{
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            <Tooltip title="Ações do Bloco">
              <IconButton
                size="small"
                onClick={() => setExpanded(true)}
                sx={{ 
                  color: 'white',
                  p: 0.5
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              p: 0.5,
              display: 'flex',
              gap: 0.5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}
            onMouseLeave={() => setExpanded(false)}
          >
            <Tooltip title="Editar Bloco">
              <IconButton
                size="small"
                onClick={handleEdit}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Testar Bloco">
              <IconButton
                size="small"
                onClick={handleTest}
                sx={{ 
                  color: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.light',
                    color: 'white'
                  }
                }}
              >
                <TestIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Deletar Bloco">
              <IconButton
                size="small"
                onClick={handleDelete}
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'white'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        )}
      </Box>
    </Fade>
  );
};

export default NodeHoverActions; 