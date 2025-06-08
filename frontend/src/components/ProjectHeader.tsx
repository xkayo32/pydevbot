import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Add as AddIcon,
  PlayArrow,
  Save,
  Download,
  Upload,
  ViewModule,
  Undo,
  Redo,
  Clear,
  DarkMode,
  LightMode,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  nodeCount: number;
}

interface ProjectHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentProject: Project | null;
  projects: Project[];
  onProjectChange: (projectId: string) => void;
  onNewProject: (name: string, description?: string) => void;
  onSaveProject: () => void;
  onPreviewBot: () => void;
  onGenerateAllNodes?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onClearAll?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenVariables?: () => void;
}

const ProjectHeader = ({
  sidebarOpen,
  onToggleSidebar,
  currentProject,
  projects,
  onProjectChange,
  onNewProject,
  onSaveProject,
  onPreviewBot,
  onGenerateAllNodes,
  onUndo,
  onRedo,
  onClearAll,
  canUndo = false,
  canRedo = false,
  onOpenVariables
}: ProjectHeaderProps) => {
  const [newProjectDialog, setNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const { darkMode, toggleDarkMode } = useTheme();

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onNewProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectDialog(false);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ zIndex: 1000 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onToggleSidebar}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ mr: 3 }}>
            Typebot Clone
          </Typography>

          {/* Seletor de Projeto */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={currentProject?.id || ''}
                onChange={(e) => onProjectChange(e.target.value)}
                displayEmpty
                sx={{
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '.MuiSvgIcon-root': {
                    color: 'white',
                  }
                }}
              >
                <MenuItem value="" disabled>
                  Selecione um projeto
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {project.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.nodeCount} nós • Modificado {project.lastModified.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              color="inherit"
              onClick={() => setNewProjectDialog(true)}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <AddIcon />
            </IconButton>

            {currentProject && (
              <Chip
                label={`${currentProject.nodeCount} nós`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>

          {/* Ações */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              startIcon={<Save />}
              onClick={onSaveProject}
              disabled={!currentProject}
              sx={{ textTransform: 'none' }}
            >
              Salvar
            </Button>
            
            <Button
              color="inherit"
              startIcon={<PlayArrow />}
              onClick={onPreviewBot}
              disabled={!currentProject}
              sx={{ 
                textTransform: 'none',
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(76, 175, 80, 0.3)',
                }
              }}
            >
              Testar Bot
            </Button>

            {onGenerateAllNodes && (
              <Button
                color="inherit"
                startIcon={<ViewModule />}
                onClick={onGenerateAllNodes}
                sx={{ 
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 152, 0, 0.3)',
                  }
                }}
              >
                Ver Todos
              </Button>
            )}

            {/* Controles de Undo/Redo */}
            {onUndo && (
              <IconButton 
                color="inherit" 
                onClick={onUndo}
                disabled={!canUndo}
                title="Desfazer (Ctrl+Z)"
              >
                <Undo />
              </IconButton>
            )}
            {onRedo && (
              <IconButton 
                color="inherit" 
                onClick={onRedo}
                disabled={!canRedo}
                title="Refazer (Ctrl+Y)"
              >
                <Redo />
              </IconButton>
            )}

            {/* Botão Limpar Tudo */}
            {onClearAll && (
              <IconButton 
                color="inherit" 
                onClick={onClearAll}
                title="Limpar Tudo"
              >
                <Clear />
              </IconButton>
            )}

            {/* Botão Variáveis */}
            {onOpenVariables && (
              <IconButton 
                color="inherit" 
                onClick={onOpenVariables}
                title="Gerenciar Variáveis"
                sx={{ 
                  bgcolor: 'rgba(156, 39, 176, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(156, 39, 176, 0.3)',
                  }
                }}
              >
                <SettingsIcon />
              </IconButton>
            )}

            {/* Toggle Dark Mode */}
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode}
              title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>

            <IconButton color="inherit">
              <Download />
            </IconButton>
            <IconButton color="inherit">
              <Upload />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Dialog para Novo Projeto */}
      <Dialog 
        open={newProjectDialog} 
        onClose={() => setNewProjectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Criar Novo Projeto</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Nome do Projeto"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Ex: Chatbot de Atendimento"
          />
          <TextField
            margin="normal"
            label="Descrição (opcional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            placeholder="Descreva o que este chatbot fará..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProjectName.trim()}
          >
            Criar Projeto
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectHeader; 