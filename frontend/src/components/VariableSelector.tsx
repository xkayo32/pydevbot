import { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Code as VariableIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useVariables } from '../contexts/VariablesContext';

interface VariableSelectorProps {
  onSelectVariable: (variableName: string) => void;
  size?: 'small' | 'medium';
}

const VariableSelector = ({ onSelectVariable, size = 'small' }: VariableSelectorProps) => {
  const { variables, getGlobalVariables } = useVariables();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectVariable = (variableName: string) => {
    onSelectVariable(`{{${variableName}}}`);
    handleClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'string': return '#2196f3';
      case 'number': return '#ff9800';
      case 'boolean': return '#4caf50';
      case 'array': return '#9c27b0';
      case 'object': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <>
      <Tooltip title="Inserir Variável">
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'white'
            }
          }}
        >
          <VariableIcon fontSize={size} />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            minWidth: 300,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            Variáveis Disponíveis
          </Typography>
          <Typography variant="caption">
            Clique para inserir no campo
          </Typography>
        </Box>
        
        <Divider />
        
        {variables.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Nenhuma variável criada
            </Typography>
          </MenuItem>
        ) : (
          variables.map((variable) => (
            <MenuItem
              key={variable.id}
              onClick={() => handleSelectVariable(variable.name)}
              sx={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" fontWeight="medium">
                  {variable.name}
                </Typography>
                <Chip
                  label={variable.type}
                  size="small"
                  sx={{
                    bgcolor: getTypeColor(variable.type),
                    color: 'white',
                    fontWeight: 'bold',
                    height: 20,
                    fontSize: '0.7rem'
                  }}
                />
                {variable.isGlobal && (
                  <Chip
                    label="Global"
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Copiar sintaxe">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`{{${variable.name}}}`);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {variable.description && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {variable.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: 'monospace',
                    bgcolor: 'grey.100',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.7rem'
                  }}
                >
                  {`{{${variable.name}}}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ← Clique para inserir
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
        
        <Divider />
        
        <MenuItem 
          onClick={handleClose}
          sx={{ 
            justifyContent: 'center',
            fontStyle: 'italic',
            color: 'text.secondary'
          }}
        >
          <Typography variant="caption">
            Fechar
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default VariableSelector; 