import { DragEvent, useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { 
  ChatBubbleOutline, 
  Input, 
  PlayArrow,
  HelpOutline,
  ExpandMore,
  AccountTree,
  Code,
  Http,
  Storage,
  AttachFile,
  DataObject,
  EditNote,
  RadioButtonChecked,
  Schedule,
  Image,
  PlayCircleOutline,
  Psychology,
  Flag,
  Repeat
} from '@mui/icons-material';

const SIDEBAR_WIDTH = 260;

interface SidebarProps {
  open: boolean;
}

interface NodeType {
  type: string;
  label: string;
  icon: JSX.Element;
  description: string;
}

interface NodeCategory {
  name: string;
  icon: JSX.Element;
  color: string;
  nodes: NodeType[];
}

const nodeCategories: NodeCategory[] = [
  {
    name: 'Fluxo Básico',
    icon: <PlayArrow />,
    color: '#4caf50',
    nodes: [
      {
        type: 'start',
        label: 'Início',
        icon: <PlayArrow sx={{ color: '#4caf50' }} />,
        description: 'Ponto de início do fluxo'
      },
      {
        type: 'end',
        label: 'Finalizar',
        icon: <Flag sx={{ color: '#4caf50' }} />,
        description: 'Finalizar conversa com CTA'
      }
    ]
  },
  {
    name: 'Comunicação',
    icon: <ChatBubbleOutline />,
    color: '#1976d2',
    nodes: [
      {
        type: 'message',
        label: 'Mensagem',
        icon: <ChatBubbleOutline sx={{ color: '#1976d2' }} />,
        description: 'Mensagem do bot com markdown'
      },
      {
        type: 'image',
        label: 'Imagem',
        icon: <Image sx={{ color: '#e91e63' }} />,
        description: 'Exibir imagem no chat'
      },
      {
        type: 'video',
        label: 'Vídeo',
        icon: <PlayCircleOutline sx={{ color: '#3f51b5' }} />,
        description: 'Vídeo YouTube, Vimeo ou direto'
      }
    ]
  },
  {
    name: 'Interação',
    icon: <EditNote />,
    color: '#dc004e',
    nodes: [
      {
        type: 'user-input',
        label: 'Entrada de Texto',
        icon: <EditNote sx={{ color: '#dc004e' }} />,
        description: 'Capturar texto do usuário'
      },
      {
        type: 'choice',
        label: 'Escolha Múltipla',
        icon: <RadioButtonChecked sx={{ color: '#8bc34a' }} />,
        description: 'Botões de opções'
      },
      {
        type: 'file-upload',
        label: 'Upload de Arquivo',
        icon: <AttachFile sx={{ color: '#607d8b' }} />,
        description: 'Upload de arquivos'
      }
    ]
  },
  {
    name: 'Lógica e Fluxo',
    icon: <AccountTree />,
    color: '#ff9800',
    nodes: [
      {
        type: 'conditional',
        label: 'Condicional',
        icon: <AccountTree sx={{ color: '#ff9800' }} />,
        description: 'Fluxo condicional (if/else)'
      },
      {
        type: 'delay',
        label: 'Atraso',
        icon: <Schedule sx={{ color: '#ff9800' }} />,
        description: 'Pausa com indicador de digitação'
      },
      {
        type: 'loop',
        label: 'Loop',
        icon: <Repeat sx={{ color: '#795548' }} />,
        description: 'Repetir bloco de nós'
      }
    ]
  },
  {
    name: 'Dados e Variáveis',
    icon: <DataObject />,
    color: '#673ab7',
    nodes: [
      {
        type: 'variable',
        label: 'Variável',
        icon: <DataObject sx={{ color: '#673ab7' }} />,
        description: 'Gerenciar variáveis'
      }
    ]
  },
  {
    name: 'Automação e IA',
    icon: <Psychology />,
    color: '#9c27b0',
    nodes: [
      {
        type: 'script',
        label: 'Script',
        icon: <Code sx={{ color: '#9c27b0' }} />,
        description: 'Código JavaScript/Python'
      },
      {
        type: 'ai-response',
        label: 'IA/ChatGPT',
        icon: <Psychology sx={{ color: '#9c27b0' }} />,
        description: 'Integração com LLM'
      }
    ]
  },
  {
    name: 'Integrações',
    icon: <Http />,
    color: '#00bcd4',
    nodes: [
      {
        type: 'api-request',
        label: 'Requisição API',
        icon: <Http sx={{ color: '#00bcd4' }} />,
        description: 'Chamadas HTTP'
      },
      {
        type: 'database',
        label: 'Banco de Dados',
        icon: <Storage sx={{ color: '#795548' }} />,
        description: 'Consultas SQL/NoSQL'
      }
    ]
  }
];

const onDragStart = (event: DragEvent, nodeType: string) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.effectAllowed = 'move';
};

const Sidebar = ({ open }: SidebarProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Fluxo Básico']);

  const handleCategoryToggle = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          top: 64, // Height of AppBar
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
          transform: open ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Componentes
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Arraste os componentes para o canvas
        </Typography>
        <Chip 
          label={`${nodeCategories.reduce((total, cat) => total + cat.nodes.length, 0)} componentes`}
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      </Box>
      
      <Divider />
      
      <Box sx={{ px: 1 }}>
        {nodeCategories.map((category) => (
          <Accordion
            key={category.name}
            expanded={expandedCategories.includes(category.name)}
            onChange={() => handleCategoryToggle(category.name)}
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 }
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: 48,
                '&.Mui-expanded': { minHeight: 48 },
                px: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: category.color }}>
                  {category.icon}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {category.name}
                </Typography>
                <Chip 
                  label={category.nodes.length} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.6rem',
                    height: 16,
                    backgroundColor: category.color,
                    color: 'white'
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: 1 }}>
              <List dense sx={{ py: 0 }}>
                {category.nodes.map((node: NodeType) => (
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
                      mb: 0.5,
                      borderRadius: 1,
                      py: 0.5,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {node.icon}
                    </ListItemIcon>
                    <Box>
                      <ListItemText 
                        primary={node.label}
                        secondary={node.description}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      
      <Divider sx={{ mt: 2 }} />
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <HelpOutline sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Dica
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Conecte os nós arrastando das bolinhas de conexão. Use as categorias para organizar melhor seu fluxo.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 