import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore
} from '@mui/icons-material';
import VariableSelector from './VariableSelector';

interface NodeEditModalProps {
  open: boolean;
  node: any;
  onClose: () => void;
  onSave: (nodeId: string, newData: any) => void;
}

const NodeEditModal = ({ open, node, onClose, onSave }: NodeEditModalProps) => {
  const [editData, setEditData] = useState<any>({});
  const [choices, setChoices] = useState<any[]>([]);

  useEffect(() => {
    if (node) {
      setEditData({ ...node.data });
      if (node.data.choices) {
        setChoices([...node.data.choices]);
      }
    }
  }, [node]);

  const handleSave = () => {
    const updatedData = {
      ...editData,
      ...(choices.length > 0 && { choices })
    };
    onSave(node.id, updatedData);
    onClose();
  };

  const addChoice = () => {
    setChoices([...choices, { label: 'Nova opção', value: `option_${choices.length + 1}` }]);
  };

  const updateChoice = (index: number, field: string, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = { ...newChoices[index], [field]: value };
    setChoices(newChoices);
  };

  const removeChoice = (index: number) => {
    setChoices(choices.filter((_, i) => i !== index));
  };

  const renderBasicFields = () => (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Título"
        value={editData.label || ''}
        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
        sx={{ mb: 2 }}
      />
    </Box>
  );

  const renderMessageFields = () => (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Mensagem"
          multiline
          rows={5}
          value={editData.text || editData.message || ''}
          onChange={(e) => setEditData({ 
            ...editData, 
            text: e.target.value,
            message: e.target.value 
          })}
          placeholder="Digite sua mensagem aqui...

💡 Você pode usar:
• **texto em negrito** ou *itálico*
• [links](https://exemplo.com)
• Variáveis: {{nome_usuario}}
• Quebras de linha

Dica: Use o botão de variáveis ao lado para inserir facilmente!"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <VariableSelector
                  onSelectVariable={(variable) => {
                    const currentText = editData.text || editData.message || '';
                    const textarea = document.querySelector('textarea[label="Mensagem"]') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const newText = currentText.substring(0, start) + variable + currentText.substring(end);
                      setEditData({ 
                        ...editData, 
                        text: newText,
                        message: newText 
                      });
                      // Restaurar posição do cursor
                      setTimeout(() => {
                        textarea.focus();
                        textarea.setSelectionRange(start + variable.length, start + variable.length);
                      }, 0);
                    } else {
                      setEditData({ 
                        ...editData, 
                        text: currentText + variable,
                        message: currentText + variable 
                      });
                    }
                  }}
                />
              </InputAdornment>
            )
          }}
          sx={{ 
            '& .MuiInputBase-root': {
              alignItems: 'flex-start'
            },
            '& .MuiInputBase-input': {
              fontSize: '0.95rem',
              lineHeight: 1.5
            }
          }}
        />
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 1, 
          px: 1,
          color: 'text.secondary',
          fontSize: '0.75rem'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <span>📝</span>
            <span>Suporte completo a Markdown e variáveis habilitado</span>
          </Box>
        </Box>
      </Box>
      
      <TextField
        label="Delay de digitação (segundos)"
        type="number"
        value={editData.typingDelay || 0}
        onChange={(e) => setEditData({ ...editData, typingDelay: Number(e.target.value) })}
        inputProps={{ min: 0, max: 10, step: 0.5 }}
        helperText="Tempo de espera antes de mostrar a mensagem (simula digitação)"
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderInputFields = () => (
    <>
      <TextField
        fullWidth
        label="Placeholder"
        value={editData.placeholder || ''}
        onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  const currentText = editData.placeholder || '';
                  setEditData({ 
                    ...editData, 
                    placeholder: currentText + variable
                  });
                }}
              />
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Tipo de Input</InputLabel>
          <Select
            value={editData.inputType || 'text'}
            onChange={(e) => setEditData({ ...editData, inputType: e.target.value })}
            label="Tipo de Input"
          >
            <MenuItem value="text">Texto</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="number">Número</MenuItem>
            <MenuItem value="tel">Telefone</MenuItem>
            <MenuItem value="url">URL</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Variável"
          value={editData.variableName || ''}
          onChange={(e) => setEditData({ ...editData, variableName: e.target.value })}
          sx={{ flex: 1 }}
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={editData.required || false}
            onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
          />
        }
        label="Campo obrigatório"
      />
    </>
  );

  const renderChoiceFields = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Opções de Escolha</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={addChoice}
          variant="outlined"
          size="small"
        >
          Adicionar
        </Button>
      </Box>
      {choices.map((choice, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
          <TextField
            label="Texto"
            value={choice.label}
            onChange={(e) => updateChoice(index, 'label', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <TextField
            label="Valor"
            value={choice.value}
            onChange={(e) => updateChoice(index, 'value', e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <IconButton
            onClick={() => removeChoice(index)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <FormControlLabel
        control={
          <Switch
            checked={editData.allowMultiple || false}
            onChange={(e) => setEditData({ ...editData, allowMultiple: e.target.checked })}
          />
        }
        label="Permitir múltiplas seleções"
        sx={{ mt: 1 }}
      />
    </>
  );

  const renderAiFields = () => (
    <>
      <TextField
        fullWidth
        label="Template do Prompt"
        multiline
        rows={3}
        value={editData.promptTemplate || ''}
        onChange={(e) => setEditData({ ...editData, promptTemplate: e.target.value })}
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ flex: 1 }}>
          <InputLabel>Modelo</InputLabel>
          <Select
            value={editData.model || 'gpt-3.5-turbo'}
            onChange={(e) => setEditData({ ...editData, model: e.target.value })}
            label="Modelo"
          >
            <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
            <MenuItem value="gpt-4">GPT-4</MenuItem>
            <MenuItem value="gpt-4-turbo">GPT-4 Turbo</MenuItem>
            <MenuItem value="claude">Claude</MenuItem>
            <MenuItem value="groq">Groq</MenuItem>
            <MenuItem value="gemini">Gemini</MenuItem>
            <MenuItem value="deepseek">DeepSeek</MenuItem>
            <MenuItem value="ollama">Ollama</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Max Tokens"
          type="number"
          value={editData.maxTokens || 150}
          onChange={(e) => setEditData({ ...editData, maxTokens: Number(e.target.value) })}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Temperatura: {editData.temperature || 0.7}</Typography>
        <Slider
          value={editData.temperature || 0.7}
          onChange={(_, value) => setEditData({ ...editData, temperature: value })}
          min={0}
          max={2}
          step={0.1}
          marks
          valueLabelDisplay="auto"
        />
      </Box>
      <TextField
        fullWidth
        label="Salvar resposta em"
        value={editData.storeIn || ''}
        onChange={(e) => setEditData({ ...editData, storeIn: e.target.value })}
        sx={{ mb: 2 }}
      />
    </>
  );

  const renderImageFields = () => (
    <>
      <TextField
        fullWidth
        label="URL da Imagem"
        value={editData.imageUrl || ''}
        onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  const currentText = editData.imageUrl || '';
                  setEditData({ 
                    ...editData, 
                    imageUrl: currentText + variable
                  });
                }}
              />
            </InputAdornment>
          )
        }}
      />
      <TextField
        fullWidth
        label="Texto Alternativo"
        value={editData.altText || ''}
        onChange={(e) => setEditData({ ...editData, altText: e.target.value })}
        sx={{ mb: 2 }}
        placeholder="Descrição da imagem para acessibilidade"
      />
      <TextField
        fullWidth
        label="Legenda"
        value={editData.caption || ''}
        onChange={(e) => setEditData({ ...editData, caption: e.target.value })}
        sx={{ mb: 2 }}
        placeholder="Texto que aparece embaixo da imagem"
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Largura (px)"
          type="number"
          value={editData.width || ''}
          onChange={(e) => setEditData({ ...editData, width: Number(e.target.value) || undefined })}
          sx={{ flex: 1 }}
          placeholder="Auto"
        />
        <TextField
          label="Altura (px)"
          type="number"
          value={editData.height || ''}
          onChange={(e) => setEditData({ ...editData, height: Number(e.target.value) || undefined })}
          sx={{ flex: 1 }}
          placeholder="Auto"
        />
      </Box>
      <FormControlLabel
        control={
          <Switch
            checked={editData.clickable || false}
            onChange={(e) => setEditData({ ...editData, clickable: e.target.checked })}
          />
        }
        label="Imagem clicável"
      />
    </>
  );

  const renderVideoFields = () => (
    <>
      <TextField
        fullWidth
        label="URL do Vídeo"
        value={editData.videoUrl || ''}
        onChange={(e) => setEditData({ ...editData, videoUrl: e.target.value })}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Plataforma</InputLabel>
        <Select
          value={editData.platform || 'youtube'}
          onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
          label="Plataforma"
        >
          <MenuItem value="youtube">YouTube</MenuItem>
          <MenuItem value="vimeo">Vimeo</MenuItem>
          <MenuItem value="direct">Direto</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={editData.autoplay || false}
              onChange={(e) => setEditData({ ...editData, autoplay: e.target.checked })}
            />
          }
          label="Autoplay"
        />
        <FormControlLabel
          control={
            <Switch
              checked={editData.controls !== false}
              onChange={(e) => setEditData({ ...editData, controls: e.target.checked })}
            />
          }
          label="Controles"
        />
        <FormControlLabel
          control={
            <Switch
              checked={editData.muted || false}
              onChange={(e) => setEditData({ ...editData, muted: e.target.checked })}
            />
          }
          label="Mudo"
        />
      </Box>
    </>
  );

  const renderEndFields = () => (
    <>
      <TextField
        fullWidth
        label="Mensagem de Encerramento"
        multiline
        rows={2}
        value={editData.message || ''}
        onChange={(e) => setEditData({ ...editData, message: e.target.value })}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  const currentText = editData.message || '';
                  setEditData({ 
                    ...editData, 
                    message: currentText + variable
                  });
                }}
              />
            </InputAdornment>
          )
        }}
      />
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Texto do Botão CTA"
          value={editData.ctaLabel || ''}
          onChange={(e) => setEditData({ ...editData, ctaLabel: e.target.value })}
          sx={{ flex: 1 }}
          placeholder="Ex: Visite nosso site"
        />
        <TextField
          label="URL do CTA"
          value={editData.ctaUrl || ''}
          onChange={(e) => setEditData({ ...editData, ctaUrl: e.target.value })}
          sx={{ flex: 1 }}
          placeholder="https://exemplo.com"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={editData.showRating || false}
              onChange={(e) => setEditData({ ...editData, showRating: e.target.checked })}
            />
          }
          label="Mostrar avaliação"
        />
        <TextField
          label="Redirecionar após (segundos)"
          type="number"
          value={editData.redirectAfter || ''}
          onChange={(e) => setEditData({ ...editData, redirectAfter: Number(e.target.value) || undefined })}
          sx={{ width: 200 }}
          placeholder="0 = não redirecionar"
        />
      </Box>
    </>
  );

  const renderDelayFields = () => (
    <>
      <TextField
        fullWidth
        label="Duração (segundos)"
        type="number"
        value={editData.duration || ''}
        onChange={(e) => setEditData({ ...editData, duration: Number(e.target.value) || undefined })}
        sx={{ mb: 2 }}
        placeholder="Ex: 5"
      />
      <TextField
        fullWidth
        label="Mensagem durante o delay"
        value={editData.message || ''}
        onChange={(e) => setEditData({ ...editData, message: e.target.value })}
        sx={{ mb: 2 }}
        placeholder="Mensagem opcional exibida durante a espera"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  const currentText = editData.message || '';
                  setEditData({ 
                    ...editData, 
                    message: currentText + variable
                  });
                }}
              />
            </InputAdornment>
          )
        }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={editData.showTypingIndicator || false}
            onChange={(e) => setEditData({ ...editData, showTypingIndicator: e.target.checked })}
          />
        }
        label="Mostrar indicador de digitação"
      />
    </>
  );

  const renderFileFields = () => (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Operação</InputLabel>
        <Select
          value={editData.operation || 'upload'}
          label="Operação"
          onChange={(e) => setEditData({ ...editData, operation: e.target.value })}
        >
          <MenuItem value="upload">Upload</MenuItem>
          <MenuItem value="read">Ler</MenuItem>
          <MenuItem value="download">Download</MenuItem>
          <MenuItem value="delete">Deletar</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Tipo de Arquivo</InputLabel>
        <Select
          value={editData.fileType || 'any'}
          label="Tipo de Arquivo"
          onChange={(e) => setEditData({ ...editData, fileType: e.target.value })}
        >
          <MenuItem value="any">Qualquer</MenuItem>
          <MenuItem value="image">Imagem</MenuItem>
          <MenuItem value="document">Documento</MenuItem>
          <MenuItem value="csv">CSV</MenuItem>
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="xml">XML</MenuItem>
          <MenuItem value="video">Vídeo</MenuItem>
          <MenuItem value="audio">Áudio</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Tamanho máximo (MB)"
        type="number"
        value={editData.maxSize || ''}
        onChange={(e) => setEditData({ ...editData, maxSize: Number(e.target.value) || undefined })}
        sx={{ mb: 2 }}
        placeholder="Ex: 10"
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Armazenamento</InputLabel>
        <Select
          value={editData.storage || 'local'}
          label="Armazenamento"
          onChange={(e) => setEditData({ ...editData, storage: e.target.value })}
        >
          <MenuItem value="local">Local</MenuItem>
          <MenuItem value="minio">MinIO</MenuItem>
          <MenuItem value="google-drive">Google Drive</MenuItem>
          <MenuItem value="onedrive">OneDrive</MenuItem>
          <MenuItem value="s3">Amazon S3</MenuItem>
          <MenuItem value="custom">Customizado</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Variável de resultado"
        value={editData.resultVariable || ''}
        onChange={(e) => setEditData({ ...editData, resultVariable: e.target.value })}
        sx={{ mb: 2 }}
        placeholder="Nome da variável para armazenar resultado"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  setEditData({ 
                    ...editData, 
                    resultVariable: variable.replace('{{', '').replace('}}', '')
                  });
                }}
              />
            </InputAdornment>
          )
        }}
      />

      {editData.storage !== 'local' && (
        <>
          <TextField
            fullWidth
            label="Nome do Bucket/Container"
            value={editData.bucketName || ''}
            onChange={(e) => setEditData({ ...editData, bucketName: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="nome-do-bucket"
          />
          
          <TextField
            fullWidth
            label="Chave de Acesso"
            type="password"
            value={editData.accessKey || ''}
            onChange={(e) => setEditData({ ...editData, accessKey: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Chave de acesso ao serviço"
          />
        </>
      )}
    </>
  );

  const renderScriptFields = () => (
    <>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Linguagem</InputLabel>
        <Select
          value={editData.language || 'javascript'}
          label="Linguagem"
          onChange={(e) => setEditData({ ...editData, language: e.target.value })}
        >
          <MenuItem value="javascript">JavaScript</MenuItem>
          <MenuItem value="python">Python</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Código"
        multiline
        rows={8}
        value={editData.script || ''}
        onChange={(e) => setEditData({ ...editData, script: e.target.value })}
        sx={{ 
          mb: 2,
          '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }
        }}
        placeholder={editData.language === 'python' ? 
          `# Exemplo Python
def main():
    result = 2 + 2
    return result

# O resultado será salvo na variável especificada` :
          `// Exemplo JavaScript
function main() {
    const result = 2 + 2;
    return result;
}

// O resultado será salvo na variável especificada`
        }
      />

      <TextField
        fullWidth
        label="Timeout (segundos)"
        type="number"
        value={editData.timeout || ''}
        onChange={(e) => setEditData({ ...editData, timeout: Number(e.target.value) || undefined })}
        sx={{ mb: 2 }}
        placeholder="30"
        helperText="Tempo limite para execução do script"
      />

      <TextField
        fullWidth
        label="Variável de resultado"
        value={editData.resultVariable || ''}
        onChange={(e) => setEditData({ ...editData, resultVariable: e.target.value })}
        sx={{ mb: 2 }}
        placeholder="resultado_script"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <VariableSelector
                onSelectVariable={(variable) => {
                  setEditData({ 
                    ...editData, 
                    resultVariable: variable.replace('{{', '').replace('}}', '')
                  });
                }}
              />
            </InputAdornment>
          )
        }}
      />

      <Box sx={{ 
        backgroundColor: 'info.light', 
        p: 2, 
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'info.main'
      }}>
        <Typography variant="body2" color="info.dark" sx={{ mb: 1, fontWeight: 'bold' }}>
          💡 Dicas de Uso:
        </Typography>
        <Typography variant="caption" color="info.dark" component="div">
          • Use <code>return valor;</code> para retornar resultado<br/>
          • Variáveis do bot estão disponíveis globalmente<br/>
          • Funções assíncronas são suportadas<br/>
          • Logs aparecem no console do navegador
        </Typography>
      </Box>
    </>
  );

  const renderFieldsByType = () => {
    if (!node) return null;

    switch (node.type) {
      case 'message':
      case 'text':
        return renderMessageFields();
      case 'user-input':
        return renderInputFields();
      case 'choice':
        return renderChoiceFields();
      case 'ai-response':
        return renderAiFields();
      case 'image':
        return renderImageFields();
      case 'video':
        return renderVideoFields();
      case 'end':
        return renderEndFields();
      case 'delay':
        return renderDelayFields();
      case 'file-upload':
        return renderFileFields();
      case 'script':
        return renderScriptFields();
      default:
        return null;
    }
  };

  if (!node) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Editar {node.data.label}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderBasicFields()}
        {renderFieldsByType()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NodeEditModal; 