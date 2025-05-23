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

// Cache em memória dos produtos
let cachedProducts = [];

// 1) Body-parser JSON
app.use(express.json());

// 2) Servir estáticos (HTML/CSS/JS/imagens) em /loja
app.use('/loja', express.static(path.join(__dirname)));

// 3) POST /loja/api/products — ingestão da trigger APIPASS
app.post('/loja/api/products', async (req, res) => {
  try {
    let respBody;
    if (req.body.body?.responseBody) {
      // veio a resposta bruta da APIPASS
      respBody = req.body.body.responseBody;
    } else {
      // teste manual via { page, limit }
      const { page = 1, limit = 100 } = req.body;
      const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
      respBody = apiRes.data.body.responseBody;
    }

    // monta índice de colunas
    const idx = {};
    respBody.fieldsMetadata.forEach((f, i) => { idx[f.name] = i });

    // atualiza cache
    cachedProducts = respBody.rows.map(r => ({
      id:        r[idx.CODPROD],
      name:      (r[idx.DESCRPROD] || '').trim(),
      price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
      available: r[idx.DISPONIVEL],
      image:     `/loja/assets/img/products/${r[idx.CODPROD]}.jpg`
    }));

    return res.json({ products: cachedProducts });
  } catch (err) {
    console.error('Erro ingerindo produtos:', err);
    return res.status(500).json({ error: 'Não foi possível processar produtos.' });
  }
});

// 4) GET /loja/api/products — entrega o cache, sem tocar a APIPASS de novo
app.get('/loja/api/products', (req, res) => {
  if (!cachedProducts.length) {
    return res.status(204).json({ products: [] });
  }
  return res.json({ products: cachedProducts });
});

// 5) Alias (opcional)
app.get('/loja/api/products/cached', (req, res) => {
  return res.json({ products: cachedProducts });
});

// 6) Catch-all para SPA
app.get('/loja/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/loja`);
});
