// public/js/main.js
// Monta cards de produtos via proxy `/loja/api/products`, com overlay de iniciação e chamada POST

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('product-list');
  const INGEST_URL = '/loja/api/products'; // POST para acionar trigger e popular cache

  // Cria overlay de inicialização
  const overlay = document.createElement('div');
  overlay.id = 'start-overlay';
  Object.assign(overlay.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100%', height: '100%',
    backgroundColor: '#fff',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: '9999'
  });
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Iniciar';
  startBtn.className = 'btn btn-warning btn-lg';
  overlay.appendChild(startBtn);
  document.body.appendChild(overlay);

  // Ao clicar, faz POST para trigger da APIPASS e obtém lista de produtos
  startBtn.addEventListener('click', async () => {
    try {
      const postRes = await fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 1, limit: 100 })
      });
      if (!postRes.ok) throw new Error(`Ingestão falhou: HTTP ${postRes.status}`);

      const { products } = await postRes.json();
      if (!Array.isArray(products)) throw new Error('Resposta inválida: expected products array');

      // Remove overlay e renderiza cards
      overlay.remove();
      products.forEach(prod => renderCard(prod, list));
    } catch (e) {
      console.error('Erro ao iniciar e buscar produtos:', e);
      alert('Falha ao iniciar. Veja console para detalhes.');
    }
  });

  // Função para renderizar cada card
  function renderCard(prod, container) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="ratio ratio-1x1">
          <img src="${prod.image}" class="card-img-top p-3" alt="${prod.name}" style="object-fit: contain;" />
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="${prod.name}">${prod.name}</h5>
          <p class="card-text mt-auto mb-2"><strong>R$ ${Number(prod.price).toFixed(2)}</strong></p>
          <p class="card-text mb-2"><strong>Qtd ${Number(prod.available ?? 0)}</strong></p>
          <div class="d-grid gap-2">
            <button class="btn btn-warning btn-sm">Adicionar</button>
            <button class="btn btn-outline-warning btn-sm">Detalhes</button>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  }
});
