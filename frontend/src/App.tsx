import { useCallback, useState, DragEvent } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import { Box, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

// Import custom nodes
import TextNode from './components/nodes/TextNode';
import InputNode from './components/nodes/InputNode';
import StartNode from './components/nodes/StartNode';
import Sidebar from './components/Sidebar';

import 'reactflow/dist/style.css';

// Define custom node types
const nodeTypes = {
  start: StartNode,
  text: TextNode,
  input: InputNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    data: { label: 'Início' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    type: 'text',
    data: { 
      label: 'Mensagem de Boas-vindas',
      message: 'Olá! Bem-vindo ao nosso chatbot. Como posso ajudá-lo hoje?'
    },
    position: { x: 100, y: 150 },
  },
  {
    id: '3',
    type: 'input',
    data: { 
      label: 'Pergunta do Nome',
      placeholder: 'Digite seu nome...',
      inputType: 'text'
    },
    position: { x: 400, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

let id = 0;
const getId = () => `dndnode_${id++}`;

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = {
        x: event.clientX - (sidebarOpen ? 280 : 0) - 100,
        y: event.clientY - 64 - 50,
      };

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: getDefaultNodeData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, sidebarOpen],
  );

  const getDefaultNodeData = (type: string) => {
    switch (type) {
      case 'start':
        return { label: 'Início' };
      case 'text':
        return { 
          label: 'Nova Mensagem',
          message: 'Digite sua mensagem aqui...'
        };
      case 'input':
        return { 
          label: 'Nova Entrada',
          placeholder: 'Digite aqui...',
          inputType: 'text'
        };
      default:
        return { label: 'Novo Nó' };
    }
  };

  return (
    <ReactFlowProvider>
      <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" sx={{ zIndex: 1000 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Typebot Clone - Editor de Fluxo
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ display: 'flex', flexGrow: 1, height: 'calc(100vh - 64px)' }}>
          <Sidebar open={sidebarOpen} />
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              marginLeft: sidebarOpen ? '280px' : 0,
              transition: 'margin-left 0.3s ease',
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </Box>
        </Box>
      </Box>
    </ReactFlowProvider>
  );
}

export default App; 