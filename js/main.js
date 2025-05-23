// public/js/main.js
// Monta cards de produtos carregados do servidor via cache

document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('product-list');

  async function loadProducts() {
    try {
      const res = await fetch('/loja/api/products');
      if (res.status === 204) {
        console.warn('Nenhum produto em cache ainda.');
        return;
      }
      const { products } = await res.json();
      products.forEach(prod => renderCard(prod, list));
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    }
  }

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
          <div class="d-grid gap-2">
            <button class="btn btn-warning btn-sm">Adicionar</button>
            <button class="btn btn-outline-warning btn-sm">Detalhes</button>
          </div>
        </div>
      </div>`;
    container.appendChild(col);
  }

  loadProducts();
});
