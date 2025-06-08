import { useCallback, useState, DragEvent, useEffect } from 'react';
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
  useReactFlow,
} from 'reactflow';
import { Box, Snackbar, Alert, Paper, IconButton, Typography, Tooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

// Import custom nodes
import TextNode from './components/nodes/TextNode';
import InputNode from './components/nodes/InputNode';
import StartNode from './components/nodes/StartNode';
import ConditionalNode from './components/nodes/ConditionalNode';
import ScriptNode from './components/nodes/ScriptNode';
import ApiRequestNode from './components/nodes/ApiRequestNode';
import DatabaseNode from './components/nodes/DatabaseNode';
import FileNode from './components/nodes/FileNode';
import VariableNode from './components/nodes/VariableNode';
import MessageNode from './components/nodes/MessageNode';
import UserInputNode from './components/nodes/UserInputNode';
import ChoiceNode from './components/nodes/ChoiceNode';
import DelayNode from './components/nodes/DelayNode';
import ImageNode from './components/nodes/ImageNode';
import VideoNode from './components/nodes/VideoNode';
import AiResponseNode from './components/nodes/AiResponseNode';
import EndNode from './components/nodes/EndNode';
import Sidebar from './components/Sidebar';
import ProjectHeader from './components/ProjectHeader';
import NodeEditModal from './components/NodeEditModal';
import VariablesModal from './components/VariablesModal';
import { PreviewModal } from './components/PreviewModal';

import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { VariablesProvider } from './contexts/VariablesContext';

import 'reactflow/dist/style.css';

// Define custom node types
const nodeTypes = {
  start: StartNode,
  text: TextNode,
  input: UserInputNode, // Usar UserInputNode para padronizar
  conditional: ConditionalNode,
  script: ScriptNode,
  'api-request': ApiRequestNode,
  database: DatabaseNode,
  file: FileNode,
  variable: VariableNode,
  message: MessageNode,
  'user-input': UserInputNode,
  choice: ChoiceNode,
  delay: DelayNode,
  image: ImageNode,
  video: VideoNode,
  'ai-response': AiResponseNode,
  'file-upload': FileNode,
  loop: ConditionalNode, // Reusando conditional por agora
  end: EndNode,
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
    type: 'message',
    data: { 
      label: 'Mensagem de Boas-vindas',
      text: 'Olá! Bem-vindo ao nosso chatbot. Como posso ajudá-lo hoje?'
    },
    position: { x: 100, y: 150 },
  },
  {
    id: '3',
    type: 'user-input',
    data: { 
      label: 'Pergunta do Nome',
      placeholder: 'Digite seu nome...',
      inputType: 'text',
      variableName: 'userName',
      required: true
    },
    position: { x: 400, y: 150 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

// Interface para Projeto
interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  nodeCount: number;
  nodes: Node[];
  edges: Edge[];
}

let id = 0;
const getId = () => `dndnode_${id++}`;

// Componente interno com acesso ao tema
const AppContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estados para múltiplos projetos
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Estados para novas funcionalidades
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const { darkMode } = useTheme();

  // Componente interno para controles de zoom customizados
  const ZoomControls = () => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    // Definir zoom padrão quando o ReactFlow for inicializado
    useEffect(() => {
      if (reactFlowInstance) {
        // Definir zoom inicial para 100%
        reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 1 });
        setZoomLevel(100);

        const updateZoom = () => {
          try {
            const viewport = reactFlowInstance.getViewport();
            setZoomLevel(Math.round(viewport.zoom * 100));
          } catch (error) {
            // ReactFlow ainda não está inicializado
            console.log('Erro ao obter zoom:', error);
          }
        };

        const interval = setInterval(updateZoom, 200);
        updateZoom(); // Primeira atualização imediata

        return () => clearInterval(interval);
      }
    }, [reactFlowInstance]);

    const handleZoomIn = useCallback(() => {
      try {
        zoomIn();
        setTimeout(() => {
          if (reactFlowInstance) {
            const viewport = reactFlowInstance.getViewport();
            setZoomLevel(Math.round(viewport.zoom * 100));
          }
        }, 100);
      } catch (error) {
        console.log('Erro no zoom in:', error);
      }
    }, [zoomIn, reactFlowInstance]);

    const handleZoomOut = useCallback(() => {
      try {
        zoomOut();
        setTimeout(() => {
          if (reactFlowInstance) {
            const viewport = reactFlowInstance.getViewport();
            setZoomLevel(Math.round(viewport.zoom * 100));
          }
        }, 100);
      } catch (error) {
        console.log('Erro no zoom out:', error);
      }
    }, [zoomOut, reactFlowInstance]);

    const handleFitView = useCallback(() => {
      try {
        fitView();
        setTimeout(() => {
          if (reactFlowInstance) {
            const viewport = reactFlowInstance.getViewport();
            setZoomLevel(Math.round(viewport.zoom * 100));
          }
        }, 300);
      } catch (error) {
        console.log('Erro no fit view:', error);
      }
    }, [fitView, reactFlowInstance]);

    return (
      <Paper
        elevation={2}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
          border: darkMode ? '1px solid #333' : '1px solid #ddd',
          borderRadius: '8px',
          gap: 1,
        }}
      >
        <Tooltip title="Reduzir zoom">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOut fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Typography
          variant="caption"
          sx={{
            minWidth: '40px',
            textAlign: 'center',
            fontWeight: 500,
            color: darkMode ? '#ffffff' : '#000000',
          }}
        >
          {zoomLevel}%
        </Typography>
        
        <Tooltip title="Aumentar zoom">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomIn fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Ajustar à tela">
          <IconButton size="small" onClick={handleFitView}>
            <FitScreen fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    );
  };

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
        x: event.clientX - (sidebarOpen ? 320 : 0) - 100,
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
          inputType: 'text',
          variableName: 'userInput',
          required: true
        };
      case 'message':
        return {
          label: 'Nova Mensagem',
          text: 'Olá! Como posso ajudá-lo hoje? 😊',
          typingDelay: 2,
          supportMarkdown: true
        };
      case 'user-input':
        return {
          label: 'Entrada de Texto',
          placeholder: 'Digite sua resposta...',
          variableName: 'userResponse',
          inputType: 'text',
          required: true
        };
      case 'choice':
        return {
          label: 'Escolha uma opção',
          choices: [
            { label: 'Sim', value: 'yes' },
            { label: 'Não', value: 'no' },
            { label: 'Talvez', value: 'maybe' }
          ],
          allowMultiple: false
        };
      case 'delay':
        return {
          label: 'Aguardar',
          duration: 3,
          showTypingIndicator: true,
          message: 'Bot está digitando...'
        };
      case 'image':
        return {
          label: 'Nova Imagem',
          imageUrl: 'https://via.placeholder.com/300x200',
          altText: 'Imagem de exemplo',
          clickable: false
        };
      case 'video':
        return {
          label: 'Novo Vídeo',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          platform: 'youtube',
          autoplay: false,
          controls: true
        };
      case 'ai-response':
        return {
          label: 'Resposta IA',
          promptTemplate: 'Você é um assistente útil. Responda: {{userMessage}}',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 150,
          storeIn: 'aiResponse',
          useContext: true
        };
      case 'end':
        return {
          label: 'Fim da Conversa',
          message: 'Obrigado por conversar conosco! 🙏',
          ctaLabel: 'Fale Conosco',
          ctaUrl: 'https://exemplo.com/contato'
        };
      case 'conditional':
        return {
          label: 'Nova Condição',
          condition: 'Se variável for igual a valor',
          variable: 'userName',
          operator: 'equals',
          value: 'admin'
        };
      case 'script':
        return {
          label: 'Novo Script',
          language: 'javascript',
          script: '// Seu código aqui\nconsole.log("Hello World!");',
          variables: []
        };
      case 'api-request':
        return {
          label: 'Nova Requisição',
          method: 'GET',
          url: 'https://api.exemplo.com/dados',
          responseVariable: 'response'
        };
      case 'database':
        return {
          label: 'Consulta DB',
          dbType: 'mysql',
          operation: 'SELECT',
          query: 'SELECT * FROM usuarios',
          resultVariable: 'result'
        };
      case 'file':
      case 'file-upload':
        return {
          label: 'Upload de Arquivo',
          operation: 'upload',
          fileType: 'any',
          maxSize: 10,
          resultVariable: 'uploadedFile',
          storage: 'local'
        };
      case 'variable':
        return {
          label: 'Nova Variável',
          operation: 'set',
          variableName: 'myVariable',
          value: 'valor inicial',
          dataType: 'string'
        };
      case 'loop':
        return {
          label: 'Repetir',
          condition: 'Para cada item em lista',
          variable: 'items',
          operator: 'in',
          value: 'itemsList'
        };
      default:
        return { label: 'Novo Nó' };
    }
  };

  // Funções para gerenciamento de projetos
  const handleNewProject = useCallback((name: string, description?: string) => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      name,
      description,
      createdAt: new Date(),
      lastModified: new Date(),
      nodeCount: nodes.length,
      nodes: [...nodes],
      edges: [...edges]
    };
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    setSnackbar({
      open: true,
      message: `Projeto "${name}" criado com sucesso!`,
      severity: 'success'
    });
  }, [nodes, edges]);

  const handleProjectChange = useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      setNodes(project.nodes);
      setEdges(project.edges);
      setSnackbar({
        open: true,
        message: `Projeto "${project.name}" carregado!`,
        severity: 'info'
      });
    }
  }, [projects, setNodes, setEdges]);

  const handleSaveProject = useCallback(() => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        lastModified: new Date(),
        nodeCount: nodes.length,
        nodes: [...nodes],
        edges: [...edges]
      };
      
      setProjects(prev => prev.map(p => 
        p.id === currentProject.id ? updatedProject : p
      ));
      setCurrentProject(updatedProject);
      setSnackbar({
        open: true,
        message: 'Projeto salvo com sucesso!',
        severity: 'success'
      });
    }
  }, [currentProject, nodes, edges]);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const handlePreviewBot = useCallback(() => {
    setPreviewModalOpen(true);
  }, []);

  // Função para deletar uma conexão
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    setSnackbar({
      open: true,
      message: 'Conexão removida!',
      severity: 'info'
    });
  }, []);

  // Função para gerar todos os tipos de nós na tela
  const generateAllNodes = useCallback(() => {
    const nodeTypesToGenerate = [
      'start', 'message', 'user-input', 'choice', 'delay', 'image', 'video',
      'conditional', 'script', 'ai-response', 'api-request', 'database',
      'variable', 'file-upload', 'end'
    ];

    const newNodes: Node[] = nodeTypesToGenerate.map((type, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      
      return {
        id: `demo_${type}_${Date.now()}_${index}`,
        type,
        position: {
          x: col * 280 + 50,
          y: row * 200 + 50
        },
        data: getDefaultNodeData(type),
      };
    });

    addToHistory(newNodes, []);
    setNodes(newNodes);
    setEdges([]); // Limpar conexões
    setSnackbar({
      open: true,
      message: `${nodeTypesToGenerate.length} componentes gerados para demonstração!`,
      severity: 'success'
    });
  }, []);

  // Funções para histórico (undo/redo)
  const addToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(prevIndex);
      setSnackbar({
        open: true,
        message: 'Ação desfeita!',
        severity: 'info'
      });
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(nextIndex);
      setSnackbar({
        open: true,
        message: 'Ação refeita!',
        severity: 'info'
      });
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Função para limpar tudo
  const clearAll = useCallback(() => {
    addToHistory([], []);
    setNodes([]);
    setEdges([]);
    setSnackbar({
      open: true,
      message: 'Canvas limpo!',
      severity: 'success'
    });
  }, [addToHistory, setNodes, setEdges]);

  // Funções para edição de nós
  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setEditModalOpen(true);
  }, []);

  const handleNodeEdit = useCallback((nodeId: string, newData: any) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, data: newData } : node
    );
    addToHistory(updatedNodes, edges);
    setNodes(updatedNodes);
    setSnackbar({
      open: true,
      message: 'Nó atualizado com sucesso!',
      severity: 'success'
    });
  }, [nodes, edges, addToHistory, setNodes]);



  // Função para deletar nós (tecla Delete)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      const selectedNodes = nodes.filter(node => node.selected);
      const selectedEdges = edges.filter(edge => edge.selected);
      
      if (selectedNodes.length > 0 || selectedEdges.length > 0) {
        const newNodes = nodes.filter(node => !node.selected);
        const newEdges = edges.filter(edge => !edge.selected);
        
        addToHistory(newNodes, newEdges);
        setNodes(newNodes);
        setEdges(newEdges);
        
        setSnackbar({
          open: true,
          message: `${selectedNodes.length} nó(s) e ${selectedEdges.length} conexão(ões) removido(s)!`,
          severity: 'info'
        });
      }
    }
    
    // Atalhos de teclado
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.key === 'z' && event.shiftKey || event.key === 'y') {
        event.preventDefault();
        redo();
      }
    }
  }, [nodes, edges, addToHistory, setNodes, setEdges, undo, redo]);

  // Adicionar listener para teclas
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Criar projeto inicial se não houver nenhum
  useEffect(() => {
    if (projects.length === 0) {
      handleNewProject('Meu Primeiro Bot', 'Projeto de demonstração criado automaticamente');
    }
  }, [projects.length, handleNewProject]);

  // Atualizar contagem de nós do projeto atual
  useEffect(() => {
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        nodeCount: nodes.length
      };
      setCurrentProject(updatedProject);
    }
  }, [nodes.length, currentProject]);

  return (
    <ReactFlowProvider>
      <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ProjectHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentProject={currentProject}
          projects={projects}
          onProjectChange={handleProjectChange}
          onNewProject={handleNewProject}
          onSaveProject={handleSaveProject}
          onPreviewBot={handlePreviewBot}
          onGenerateAllNodes={generateAllNodes}
          onUndo={undo}
          onRedo={redo}
          onClearAll={clearAll}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onOpenVariables={() => setVariablesModalOpen(true)}
        />
        
        <Box sx={{ display: 'flex', flexGrow: 1, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
          <Sidebar open={sidebarOpen} />
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              backgroundColor: darkMode ? '#121212' : '#ffffff',
              position: 'relative',
              height: '100%',
              overflow: 'hidden',
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
              onEdgeClick={onEdgeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              nodeTypes={nodeTypes}
              fitView
              onInit={setReactFlowInstance}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              style={{
                backgroundColor: darkMode ? '#121212' : '#ffffff',
              }}
            >
              <Controls />
              <MiniMap 
                style={{
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                }}
              />
              <Background 
                variant={BackgroundVariant.Dots} 
                gap={12} 
                size={1} 
                color={darkMode ? '#333' : '#ddd'}
              />
              <ZoomControls />
            </ReactFlow>
          </Box>
        </Box>
        
        {/* Snackbar para notificações */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Modal de edição */}
        <NodeEditModal
          open={editModalOpen}
          node={selectedNode}
          onClose={() => setEditModalOpen(false)}
          onSave={handleNodeEdit}
        />

        {/* Modal de variáveis */}
        <VariablesModal
          open={variablesModalOpen}
          onClose={() => setVariablesModalOpen(false)}
        />

        {/* Modal de preview */}
        <PreviewModal
          open={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          nodes={nodes}
          edges={edges}
          projectName={currentProject?.name}
          variables={{}}
          darkMode={darkMode}
        />
      </Box>
    </ReactFlowProvider>
  );
};

// Componente principal com ThemeProvider e VariablesProvider
function App() {
  return (
    <ThemeProvider>
      <VariablesProvider>
        <AppContent />
      </VariablesProvider>
    </ThemeProvider>
  );
}

export default App; 