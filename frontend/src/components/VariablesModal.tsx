import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useVariables, Variable } from '../contexts/VariablesContext';

interface VariablesModalProps {
  open: boolean;
  onClose: () => void;
}

const VariablesModal = ({ open, onClose }: VariablesModalProps) => {
  const { variables, addVariable, updateVariable, deleteVariable } = useVariables();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'string' as Variable['type'],
    value: '',
    description: '',
    isGlobal: true
  });
  const [editData, setEditData] = useState<Partial<Variable>>({});
  const [isAdding, setIsAdding] = useState(false);

  const handleStartEdit = (variable: Variable) => {
    setEditingId(variable.id);
    setEditData({ ...variable });
  };

  const handleSaveEdit = () => {
    if (editingId && editData) {
      updateVariable(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleAddVariable = () => {
    if (newVariable.name.trim()) {
      let processedValue = newVariable.value;
      
      try {
        switch (newVariable.type) {
          case 'number':
            processedValue = Number(newVariable.value) || 0;
            break;
          case 'boolean':
            processedValue = newVariable.value === 'true' || newVariable.value === true;
            break;
          case 'array':
            processedValue = newVariable.value ? JSON.parse(newVariable.value) : [];
            break;
          case 'object':
            processedValue = newVariable.value ? JSON.parse(newVariable.value) : {};
            break;
          default:
            processedValue = String(newVariable.value || '');
        }
      } catch (e) {
        processedValue = newVariable.value;
      }

      addVariable({
        ...newVariable,
        value: processedValue
      });
      
      setNewVariable({
        name: '',
        type: 'string',
        value: '',
        description: '',
        isGlobal: true
      });
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta variável?')) {
      deleteVariable(id);
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '';
    
    switch (type) {
      case 'boolean':
        return value.toString();
      case 'array':
      case 'object':
        return JSON.stringify(value);
      default:
        return String(value);
    }
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Gerenciar Variáveis do Projeto
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            As variáveis podem ser usadas nos blocos usando a sintaxe: <code>{"{{nomeVariavel}}"}</code>
          </Alert>
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            sx={{ mb: 2 }}
          >
            Adicionar Nova Variável
          </Button>

          {isAdding && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Nova Variável</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  label="Nome"
                  value={newVariable.name}
                  onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as Variable['type'] })}
                    label="Tipo"
                  >
                    <MenuItem value="string">String</MenuItem>
                    <MenuItem value="number">Number</MenuItem>
                    <MenuItem value="boolean">Boolean</MenuItem>
                    <MenuItem value="array">Array</MenuItem>
                    <MenuItem value="object">Object</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Valor Inicial"
                  value={newVariable.value}
                  onChange={(e) => setNewVariable({ ...newVariable, value: e.target.value })}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="Descrição"
                  value={newVariable.description}
                  onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={newVariable.isGlobal}
                      onChange={(e) => setNewVariable({ ...newVariable, isGlobal: e.target.checked })}
                    />
                  }
                  label="Global"
                />
                <IconButton onClick={handleAddVariable} color="primary">
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={() => setIsAdding(false)} color="error">
                  <CancelIcon />
                </IconButton>
              </Box>
            </Paper>
          )}
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Escopo</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variables.map((variable) => (
                <TableRow key={variable.id}>
                  <TableCell>
                    {editingId === variable.id ? (
                      <TextField
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" fontWeight="medium">
                        {variable.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variable.id ? (
                      <FormControl size="small" fullWidth>
                        <Select
                          value={editData.type || variable.type}
                          onChange={(e) => setEditData({ ...editData, type: e.target.value as Variable['type'] })}
                        >
                          <MenuItem value="string">String</MenuItem>
                          <MenuItem value="number">Number</MenuItem>
                          <MenuItem value="boolean">Boolean</MenuItem>
                          <MenuItem value="array">Array</MenuItem>
                          <MenuItem value="object">Object</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={variable.type}
                        size="small"
                        sx={{
                          bgcolor: getTypeColor(variable.type),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variable.id ? (
                      <TextField
                        value={formatValue(editData.value !== undefined ? editData.value : variable.value, editData.type || variable.type)}
                        onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                        size="small"
                        fullWidth
                        multiline={variable.type === 'array' || variable.type === 'object'}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: variable.type === 'array' || variable.type === 'object' ? 'pre' : 'nowrap'
                      }}>
                        {formatValue(variable.value, variable.type)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variable.id ? (
                      <TextField
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {variable.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === variable.id ? (
                      <Switch
                        checked={editData.isGlobal !== undefined ? editData.isGlobal : variable.isGlobal}
                        onChange={(e) => setEditData({ ...editData, isGlobal: e.target.checked })}
                      />
                    ) : (
                      <Chip
                        label={variable.isGlobal ? 'Global' : 'Local'}
                        size="small"
                        color={variable.isGlobal ? 'primary' : 'default'}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {editingId === variable.id ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Salvar">
                          <IconButton onClick={handleSaveEdit} color="primary" size="small">
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton onClick={handleCancelEdit} color="error" size="small">
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleStartEdit(variable)} color="primary" size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton onClick={() => handleDelete(variable.id)} color="error" size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {variables.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Nenhuma variável criada ainda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em "Adicionar Nova Variável" para começar
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariablesModal;
