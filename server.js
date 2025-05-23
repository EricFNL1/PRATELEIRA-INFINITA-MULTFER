// server.js
import express from 'express';
import axios from 'axios';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// Habilita __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const API_PASS_URL = 'https://core.apipass.com.br/api/bbf44a81-6be1-41a5-87cc-578c502c55d2/prod/puxa-produtos';

// Middleware CSP: allow same-origin, external APIs, and CDNs for styles and scripts
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "connect-src 'self' https://core.apipass.com.br; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "font-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://multfer.duckdns.org"
  );
  next();
});

// Cache em memória dos produtos
let cachedProducts = [];

// 1) Body-parser JSON
app.use(express.json());

// 2) Servir estáticos em /loja
app.use('/loja', express.static(path.join(__dirname)));

/**
 * 3) POST /loja/api/products
 *    Recebe JSON da APIPASS (ou { page, limit }), popula cache e retorna produtos
 */
app.post('/loja/api/products', async (req, res) => {
  console.log('Recebido POST /loja/api/products', JSON.stringify(req.body).slice(0,200));
  try {
    const incoming = req.body.body?.responseBody ? req.body.body : req.body;
    const respBody = incoming.responseBody;
    if (!respBody?.rows) {
      return res.status(400).json({ error: 'Formato de dados inválido' });
    }

    // Monta índice de colunas
    const idx = {};
    respBody.fieldsMetadata.forEach((f, i) => { idx[f.name] = i });

    // Atualiza cache
    cachedProducts = respBody.rows.map(r => ({
      id:        r[idx.CODPROD],
      name:      (r[idx.DESCRPROD] || '').trim(),
      price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
      available: r[idx.DISPONIVEL],
      image:     `https://multfer.duckdns.org/img/${r[idx.CODPROD]}_1.png`
    }));

    console.log(`Cache atualizado com ${cachedProducts.length} produtos`);
    return res.json({ products: cachedProducts });
  } catch (err) {
    console.error('Erro ao processar POST /loja/api/products:', err);
    return res.status(500).json({ error: 'Não foi possível processar produtos.' });
  }
});

/**
 * 4) GET /loja/api/products
 *    Retorna cache (204 se vazio)
 */
app.get('/loja/api/products', (req, res) => {
  if (!cachedProducts.length) {
    return res.status(204).end();
  }
  return res.json({ products: cachedProducts });
});

// 5) SPA catch-all
app.get('/loja/*', (_, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/loja`);
});
