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

// Cache em memória dos produtos recebidos via POST
let cachedProducts = [];

// Middleware para JSON
app.use(express.json());

// Servir estáticos (HTML, CSS, JS, imagens) em /loja
app.use('/loja', express.static(path.join(__dirname)));

/**
 * POST /loja/api/products
 * Ingestão de produtos: o flow APIPASS envia o JSON raw no body
 * Armazena em cache e retorna array formatado
 */
app.post('/loja/api/products', async (req, res) => {
  try {
    let respBody;
    // Se veio JSON bruto da APIPASS (com body.responseBody)
    if (req.body.body && req.body.body.responseBody) {
      respBody = req.body.body.responseBody;
    } else {
      // Caso teste manual com { page, limit }
      const { page = 1, limit = 100 } = req.body;
      const apiRes = await axios.get(API_PASS_URL, { params: { page, limit } });
      respBody = apiRes.data.body.responseBody;
    }
    // Mapear campos
    const idx = {};
    respBody.fieldsMetadata.forEach((f, i) => { idx[f.name] = i });
    // Montar array em cache
    cachedProducts = respBody.rows.map(r => ({
      id:        r[idx.CODPROD],
      name:      (r[idx.DESCRPROD] || '').trim(),
      price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
      available: r[idx.DISPONIVEL],
      image:     `/loja/assets/img/products/${r[idx.CODPROD]}.jpg`
    }));
    // Responder ao chamador da trigger
    return res.json({ products: cachedProducts });
  } catch (err) {
    console.error('Erro ingerindo produtos:', err);
    return res.status(500).json({ error: 'Não foi possível processar produtos.' });
  }
});

/**
 * GET /loja/api/products
 * Retorna apenas os produtos em cache, evitando chamadas repetidas à APIPASS
 */
app.get('/loja/api/products', (req, res) => {
  if (cachedProducts.length === 0) {
    return res.status(204).json({ products: [] });
  }
  return res.json({ products: cachedProducts });
});

/**
 * GET /loja/api/products/cached
 * Alias para rota acima, caso prefira endpoint dedicado
 */
app.get('/loja/api/products/cached', (req, res) => {
  return res.json({ products: cachedProducts });
});

// Catch-all para SPA: devolve index.html
app.get('/loja/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/loja`);
});