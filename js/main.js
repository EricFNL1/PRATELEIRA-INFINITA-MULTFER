// public/js/main.js

const list = document.getElementById('product-list');

// Carrega produtos do cache
async function loadProducts() {
  try {
    const res = await fetch('/loja/api/products/cached');
    const { products } = await res.json();
    products.forEach(renderCard);
  } catch (e) {
    console.error('Erro ao carregar produtos:', e);
  }
}

// Renderiza um card de produto
function renderCard(prod) {
  const col = document.createElement('div');
  col.className = 'col-sm-6 col-md-4 col-lg-3';
  col.innerHTML = `
    <div class="card h-100">
      <img src="${prod.image}" class="card-img-top" alt="${prod.name}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${prod.name}</h5>
        <p class="card-text mt-auto">R$ ${Number(prod.price).toFixed(2)}</p>
        <button class="btn btn-primary btn-sm">Adicionar</button>
      </div>
    </div>`;
  list.append(col);
}

// Inicia carregamento dos produtos
loadProducts();
