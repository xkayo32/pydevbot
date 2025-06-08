import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Chip,
  Divider,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

export interface BlockGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  nodeIds: string[];
  collapsed: boolean;
}

interface BlockGroupManagerProps {
  open: boolean;
  onClose: () => void;
  groups: BlockGroup[];
  onGroupsChange: (groups: BlockGroup[]) => void;
  nodes: any[];
}

const BlockGroupManager: React.FC<BlockGroupManagerProps> = ({
  open,
  onClose,
  groups,
  onGroupsChange,
  nodes
}) => {
  const { darkMode } = useTheme();
  const [editingGroup, setEditingGroup] = useState<BlockGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#2196f3');

  const predefinedColors = [
    '#2196f3', '#4caf50', '#ff9800', '#f44336', 
    '#9c27b0', '#00bcd4', '#795548', '#607d8b'
  ];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: BlockGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      color: newGroupColor,
      order: groups.length,
      nodeIds: [],
      collapsed: false
    };

    onGroupsChange([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor('#2196f3');
  };

  const handleDeleteGroup = (groupId: string) => {
    onGroupsChange(groups.filter(g => g.id !== groupId));
  };

  const handleEditGroup = (group: BlockGroup) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description || '');
    setNewGroupColor(group.color);
  };

  const handleUpdateGroup = () => {
    if (!editingGroup || !newGroupName.trim()) return;

    const updatedGroups = groups.map(g => 
      g.id === editingGroup.id 
        ? { ...g, name: newGroupName.trim(), description: newGroupDescription.trim(), color: newGroupColor }
        : g
    );

    onGroupsChange(updatedGroups);
    setEditingGroup(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor('#2196f3');
  };

  const handleMoveGroup = (groupId: string, direction: 'up' | 'down') => {
    const currentIndex = groups.findIndex(g => g.id === groupId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= groups.length) return;

    const newGroups = [...groups];
    [newGroups[currentIndex], newGroups[newIndex]] = [newGroups[newIndex], newGroups[currentIndex]];
    
    // Atualizar ordem
    newGroups.forEach((group, index) => {
      group.order = index;
    });

    onGroupsChange(newGroups);
  };

  const getUnassignedNodes = () => {
    const assignedNodeIds = new Set(groups.flatMap(g => g.nodeIds));
    return nodes.filter(node => !assignedNodeIds.has(node.id));
  };

  const backgroundColor = darkMode ? '#1e1e1e' : '#ffffff';
  const paperColor = darkMode ? '#2e2e2e' : '#f5f5f5';

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { backgroundColor, minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FolderIcon />
        Gerenciar Grupos de Blocos
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Criar/Editar Grupo */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: paperColor }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingGroup ? 'Editar Grupo' : 'Criar Novo Grupo'}
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nome do Grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              fullWidth
              size="small"
            />
            
            <TextField
              label="Descrição (opcional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>Cor do Grupo:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {predefinedColors.map(color => (
                  <Box
                    key={color}
                    onClick={() => setNewGroupColor(color)}
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: color,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: newGroupColor === color ? '3px solid #fff' : '1px solid #ccc',
                      boxShadow: newGroupColor === color ? '0 0 0 2px #1976d2' : 'none'
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                disabled={!newGroupName.trim()}
                startIcon={editingGroup ? <EditIcon /> : <AddIcon />}
              >
                {editingGroup ? 'Atualizar' : 'Criar'} Grupo
              </Button>
              
              {editingGroup && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingGroup(null);
                    setNewGroupName('');
                    setNewGroupDescription('');
                    setNewGroupColor('#2196f3');
                  }}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* Lista de Grupos */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Grupos Existentes ({groups.length})
        </Typography>

        {groups.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: paperColor }}>
            <Typography color="text.secondary">
              Nenhum grupo criado ainda. Crie seu primeiro grupo acima!
            </Typography>
          </Paper>
        ) : (
          <List>
            {groups
              .sort((a, b) => a.order - b.order)
              .map((group, index) => (
                <ListItem
                  key={group.id}
                  sx={{
                    border: `1px solid ${group.color}`,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: `${group.color}10`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        backgroundColor: group.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                  </Box>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {group.name}
                        </Typography>
                        <Chip
                          label={`${group.nodeIds.length} nós`}
                          size="small"
                          sx={{ backgroundColor: group.color, color: 'white' }}
                        />
                      </Box>
                    }
                    secondary={group.description}
                  />
                  
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveGroup(group.id, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleMoveGroup(group.id, 'down')}
                        disabled={index === groups.length - 1}
                      >
                        ↓
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEditGroup(group)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteGroup(group.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        )}

        {/* Nós não atribuídos */}
        {getUnassignedNodes().length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Nós sem Grupo ({getUnassignedNodes().length})
            </Typography>
            <Paper sx={{ p: 2, backgroundColor: paperColor }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getUnassignedNodes().map(node => (
                  <Chip
                    key={node.id}
                    label={node.data?.label || node.id}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockGroupManager; 