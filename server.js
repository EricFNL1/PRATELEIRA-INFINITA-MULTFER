import express from 'express';
import axios from 'axios';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();
const API_PASS_URL = 'https://core.apipass.com.br/api/bbf44a81-6be1-41a5-87cc-578c502c55d2/prod/puxa-produtos';

// ATENÇÃO: todas as rotas devem começar com /loja para casar com o proxy reverso
app.use('/loja/assets', express.static(path.join(__dirname, 'assets')));
app.use('/loja/js', express.static(path.join(__dirname, 'js')));
app.use('/loja/css', express.static(path.join(__dirname, 'css'))); // Se tiver pasta css
// Adicione outras se necessário, como /images, /fonts

// Rota principal da loja
app.get('/loja', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Proxy para API (se consumir via frontend, também prefixe com /loja/api/products)
app.get('/loja/api/products', async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  try {
    const response = await axios.get(API_PASS_URL, { params: { page, limit } });
    return res.json(response.data);
  } catch (err) {
    console.error('Erro ao chamar APIPASS:', err.message);
    return res.status(500).json({ error: 'Não foi possível buscar produtos.' });
  }
});

// Redirecionar qualquer /loja/* para 404 se não existir
app.use('/loja/*', (req, res) => {
  res.status(404).send('Página não encontrada');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${PORT}/loja`);
});
