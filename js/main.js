// public/js/main.js
// Monta cards de produtos diretamente da APIPASS via GET trigger

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('product-list');

  // Overlay de inicialização
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

  startBtn.addEventListener('click', async () => {
    try {
      // Chama trigger APIPASS via GET
      const response = await fetch('https://core.apipass.com.br/api/bbf44a81-6be1-41a5-87cc-578c502c55d2/prod/puxa-produtos');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const respBody = data.body?.responseBody;
      if (!respBody) throw new Error('JSON inesperado da APIPASS');

      // Mapeia colunas
      const idx = {};
      respBody.fieldsMetadata.forEach((f, i) => { idx[f.name] = i });
      // Transforma rows em array legível
      const products = respBody.rows.map(r => ({
        id:        r[idx.CODPROD],
        name:      (r[idx.DESCRPROD] || '').trim(),
        price:     r[idx.VLRVENDA] != null ? r[idx.VLRVENDA] : r[idx.PREPRO],
        available: r[idx.DISPONIVEL],
        image:     `/loja/assets/img/products/${r[idx.CODPROD]}.jpg`
      }));

      // Remove overlay e renderiza cards
      overlay.remove();
      products.forEach(prod => renderCard(prod, list));
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
      alert('Erro ao iniciar. Confira o console.');
    }
  });

  // renderiza um card
  function renderCard(prod, container) {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="ratio ratio-1x1">
          <img src="${prod.image}"
               class="card-img-top p-3"
               alt="${prod.name}"
               style="object-fit: contain;" />
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

  // Não carrega produtos antes do clique
});
