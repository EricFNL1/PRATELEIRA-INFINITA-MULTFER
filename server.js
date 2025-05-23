// server.js
import express from 'express';
import axios from 'axios';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Habilita __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const app = express();
const API_PASS_URL = 'https://core.apipass.com.br/api/bbf44a81-6be1-41a5-87cc-578c502c55d2/prod/puxa-produtos';

// 1) Body parser para JSON (POST)
app.use(express.json());

// 2) Serve conteúdo estático sob /loja
app.use('/loja', express.static(path.join(__dirname)));

// 3) GET /loja/api/products → proxy APIPASS (para front-end)
app.get('/loja/api/products', async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  try {
    const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
    return res.json(apiRes.data);
  } catch (err) {
    console.error('Erro APIPASS GET:', err.message);
    return res.status(500).json({ error: 'Não foi possível buscar produtos.' });
  }
});

// 4) POST /loja/api/products → flow APIPASS chama trigger e envia JSON raw da APIPASS
app.post('/loja/api/products', async (req, res) => {
  try {
    let respBody;
    // Se vier o JSON completo da APIPASS (body.body.responseBody)
    if (req.body.body && req.body.body.responseBody) {
      respBody = req.body.body.responseBody;
    } else {
      // Caso seja chamado com { page, limit }
      const { page = 1, limit = 12 } = req.body;
      const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
      respBody = apiRes.data.body.responseBody;
    }

    // Mapeia colunas para índices
    const idx = {};
    respBody.fieldsMetadata.forEach((f, i) => { idx[f.name] = i });
    // Transforma rows em array de objetos
    const products = respBody.rows.map(r => ({
      id:        r[idx.CODPROD],
      name:      (r[idx.DESCRPROD] || '').trim(),
      price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
      available: r[idx.DISPONIVEL],
      image:     `/loja/assets/img/products/${r[idx.CODPROD]}.jpg`
    }));

    // Devolve JSON para quem chamou a trigger
    return res.json({ products });
  } catch (err) {
    console.error('Erro APIPASS POST:', {
      message: err.message,
      status:  err.response?.status,
      data:    err.response?.data
    });
    return res.status(500).json({ error: 'Não foi possível processar produtos.' });
  }
});

// 5) SPA catch-all
app.get('/loja/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});
app.get('/loja/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/loja`);
});
