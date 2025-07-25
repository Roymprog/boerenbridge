import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('Connecting...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await axios.get(`${API_URL}/health`);
        setApiStatus(`Connected! ${response.data.message || 'API is healthy'}`);
        setError(null);
      } catch (err) {
        setError('Failed to connect to backend API');
        setApiStatus('Connection failed');
      } finally {
        setLoading(false);
      }
    };

    testApiConnection();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Boerenbridge Scorekeeping
      </Typography>
      
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Backend Connection Status
          </Typography>
          
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CircularProgress size={20} />
              <Typography>Testing connection...</Typography>
            </div>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Alert severity="success">{apiStatus}</Alert>
          )}
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            API URL: {API_URL}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Next Steps
          </Typography>
          <Typography variant="body1">
            • Frontend: React TypeScript with Material-UI ✅<br/>
            • Backend: FastAPI with CORS configuration ✅<br/>
            • Docker: Development environment ready ✅<br/>
            • Database: PostgreSQL configured ✅<br/>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default App;
