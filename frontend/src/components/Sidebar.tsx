import { DragEvent } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  Box 
} from '@mui/material';
import { 
  ChatBubbleOutline, 
  Input, 
  PlayArrow,
  HelpOutline 
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 280;

interface SidebarProps {
  open: boolean;
}

const nodeTypes = [
  {
    type: 'start',
    label: 'Início',
    icon: <PlayArrow sx={{ color: '#4caf50' }} />,
    description: 'Ponto de início do fluxo'
  },
  {
    type: 'text',
    label: 'Mensagem de Texto',
    icon: <ChatBubbleOutline sx={{ color: '#1976d2' }} />,
    description: 'Enviar uma mensagem para o usuário'
  },
  {
    type: 'input',
    label: 'Entrada de Dados',
    icon: <Input sx={{ color: '#dc004e' }} />,
    description: 'Capturar informações do usuário'
  },
];

const onDragStart = (event: DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const Sidebar = ({ open }: SidebarProps) => {
  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          top: 64, // Height of AppBar
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Componentes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Arraste os componentes para o canvas
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {nodeTypes.map((node) => (
          <ListItem
            key={node.type}
            draggable
            onDragStart={(event) => onDragStart(event, node.type)}
            sx={{
              cursor: 'grab',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:active': {
                cursor: 'grabbing',
              },
              mb: 1,
              mx: 1,
              borderRadius: 1,
            }}
          >
            <ListItemIcon>
              {node.icon}
            </ListItemIcon>
            <Box>
              <ListItemText 
                primary={node.label}
                secondary={node.description}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </Box>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mt: 2 }} />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <HelpOutline sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Dica
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Conecte os nós arrastando das bolinhas de conexão
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 