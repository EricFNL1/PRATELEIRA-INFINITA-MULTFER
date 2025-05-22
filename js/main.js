// js/main.js
let page = 1;
const list = document.getElementById('product-list');
const trigger = document.getElementById('scroll-trigger');

async function loadProducts() {
  try {
    const res = await fetch(`/api/products?page=${page}&limit=12`);
    const { products } = await res.json();
    products.forEach(prod => {
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
    });
  } catch(e) {
    console.error('Erro ao carregar produtos:', e);
  }
}

const obs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    obs.unobserve(trigger);
    page++;
    loadProducts().then(() => obs.observe(trigger));
  }
}, { threshold: 1 });

loadProducts();
obs.observe(trigger);
