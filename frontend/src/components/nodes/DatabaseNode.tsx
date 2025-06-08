import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, Typography, Box, Chip, useTheme } from '@mui/material';
import { Storage } from '@mui/icons-material';

interface DatabaseNodeData {
  label: string;
  dbType?: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite' | 'redis';
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'FIND' | 'COUNT';
  query?: string;
  collection?: string;
  resultVariable?: string;
}

const DatabaseNode = ({ data, selected }: NodeProps<DatabaseNodeData>) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Cores adaptáveis ao tema
  const primaryColor = '#795548';
  const backgroundColor = isDark ? '#2d2520' : '#efebe9';
  const borderColor = isDark ? '#424242' : '#e0e0e0';
  const queryBackgroundColor = isDark ? '#1a1a1a' : '#263238';
  
  const getDbColor = (dbType: string) => {
    switch (dbType) {
      case 'mysql': return '#00758f';
      case 'postgresql': return '#336791';
      case 'mongodb': return '#47a248';
      case 'sqlite': return '#003b57';
      case 'redis': return '#d82c20';
      default: return '#424242';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'SELECT':
      case 'FIND': return '#4caf50';
      case 'INSERT': return '#2196f3';
      case 'UPDATE': return '#ff9800';
      case 'DELETE': return '#f44336';
      case 'COUNT': return '#9c27b0';
      default: return '#757575';
    }
  };

  return (
    <Card 
      sx={{ 
        minWidth: 240,
        border: selected ? `2px solid ${primaryColor}` : `1px solid ${borderColor}`,
        boxShadow: selected ? 3 : 1,
        backgroundColor: backgroundColor,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Storage sx={{ mr: 1, color: primaryColor, fontSize: 20 }} />
          <Typography variant="subtitle2" color={primaryColor} fontWeight="bold">
            {data.label}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={data.dbType || 'mysql'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getDbColor(data.dbType || 'mysql'),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Chip 
            label={data.operation || 'SELECT'} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              backgroundColor: getOperationColor(data.operation || 'SELECT'),
              color: 'white'
            }}
          />
        </Box>
        
        {data.collection && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Coleção: <strong>{data.collection}</strong>
          </Typography>
        )}
        
        {data.query && (
          <Box sx={{ 
            backgroundColor: queryBackgroundColor, 
            color: '#4fc3f7', 
            p: 1, 
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            maxHeight: 60,
            overflow: 'hidden',
            mb: 1,
            border: `1px solid ${primaryColor}`
          }}>
            {data.query.length > 40 ? `${data.query.substring(0, 40)}...` : data.query}
          </Box>
        )}
        
        {data.resultVariable && (
          <Typography variant="caption" color="text.secondary">
            Resultado em: <strong>{data.resultVariable}</strong>
          </Typography>
        )}
      </CardContent>
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: primaryColor,
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="success"
        style={{
          background: '#4caf50',
          width: 8,
          height: 8,
          left: '25%',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="error"
        style={{
          background: '#f44336',
          width: 8,
          height: 8,
          left: '75%',
        }}
      />
      
      {/* Labels para as saídas */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: -20, 
        left: 0, 
        right: 0, 
        display: 'flex', 
        justifyContent: 'space-around',
        fontSize: '0.6rem',
        color: 'text.secondary'
      }}>
        <Typography variant="caption" sx={{ color: '#4caf50' }}>Sucesso</Typography>
        <Typography variant="caption" sx={{ color: '#f44336' }}>Erro</Typography>
      </Box>
    </Card>
  );
};

export default memo(DatabaseNode); 