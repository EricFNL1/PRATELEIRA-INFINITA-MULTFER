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

// Armazena em memória últimos produtos recebidos via POST
let cachedProducts = [];

// 1) Body parser para JSON (POST)
app.use(express.json());

// 2) Serve conteúdo estático sob /loja
app.use('/loja', express.static(path.join(__dirname)));

// 3) GET /loja/api/products → proxy APIPASS (para front-end, faz fetch direto da APIPASS)
app.get('/loja/api/products', async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  try {
    const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
    return res.json(apiRes.data);
  } catch (err) {
    console.error('Erro APIPASS GET:', err.message);
    return res.status(500).json({ error: 'Não foi possível buscar produtos da APIPASS.' });
  }
});

// 4) POST /loja/api/products → flow APIPASS envia JSON raw; servidor processa e armazena
app.post('/loja/api/products', async (req, res) => {
  try {
    // 4.1) Obtém responseBody: se veio embutido, ou faz GET interno
    let respBody;
    if (req.body.body && req.body.body.responseBody) {
      respBody = req.body.body.responseBody;
    } else {
      const { page = 1, limit = 100 } = req.body;
      const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
      respBody = apiRes.data.body.responseBody;
    }

    // 4.2) Mapeia colunas para índices
    const idx = {};
    respBody.fieldsMetadata.forEach((f, i) => idx[f.name] = i);

    // 4.3) Transforma rows em objetos e atualiza cache
    cachedProducts = respBody.rows.map(r => ({
      id:        r[idx.CODPROD],
      name:      (r[idx.DESCRPROD] || '').trim(),
      price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
      available: r[idx.DISPONIVEL],
      image:     `/loja/assets/img/products/${r[idx.CODPROD]}.jpg`
    }));

    // 4.4) Retorna array formatado ao cliente
    return res.json({ products: cachedProducts });
  } catch (err) {
    console.error('Erro APIPASS POST:', err);
    return res.status(500).json({ error: 'Não foi possível processar produtos.' });
  }
});

// 5) GET /loja/api/products/cached → retorna os produtos armazenados
app.get('/loja/api/products/cached', (_, res) => {
  return res.json({ products: cachedProducts });
});

// 6) SPA catch-all: devolve index.html para qualquer outra rota em /loja
app.get('/loja/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/loja`);
});
