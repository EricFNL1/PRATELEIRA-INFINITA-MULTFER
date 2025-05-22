// server.js
import express from 'express';
import axios from 'axios';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Para usar __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();
const API_PASS_URL = 'https://core.apipass.com.br/api/bbf44a81-6be1-41a5-87cc-578c502c55d2/prod/puxa-produtos';

// Serve todo conteúdo estático (root, assets, js, etc.)
app.use(express.static(path.join(__dirname)));

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Proxy /api/products → APIPASS
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  try {
    const response = await axios.get(API_PASS_URL, { params: { page, limit } });
    return res.json(response.data);
  } catch (err) {
    console.error('Erro ao chamar APIPASS:', err.message);
    return res.status(500).json({ error: 'Não foi possível buscar produtos.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
