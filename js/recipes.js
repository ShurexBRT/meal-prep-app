// recipes.js

const recipeList = document.getElementById('recipeList');
const categoryFilter = document.getElementById('categoryFilter');
const filterByInventory = document.getElementById('filterByInventory');

let allRecipes = [];

// Učitaj recepte sa Google Sheets
fetch("https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec")
  .then(res => res.json())
  .then(data => {
    allRecipes = data;
    renderRecipes();
  });

function renderRecipes() {
  recipeList.innerHTML = '';
  const selCat = categoryFilter.value;
  const onlyHave = filterByInventory.checked;
  const inv = getInventory();

  const filtered = allRecipes.filter(r => {
    const match = !selCat || r.meal === selCat;
    if (!match) return false;
    if (onlyHave) {
      const missing = (r.ingredients || '')
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => !inv.includes(i));
      if (missing.length) return false;
    }
    return true;
  });

  if (!filtered.length) {
    recipeList.innerHTML = '<p class="text-muted">Nema recepata za ovaj filter.</p>';
    return;
  }

  filtered.forEach(r => {
    const invOk = !(r.ingredients || '')
      .split(',')
      .map(i => i.trim().toLowerCase())
      .some(i => !inv.includes(i));

    const badges = `
      <span class="badge bg-primary">${capitalize(r.meal)}</span>
      <span class="badge ${r.goal==="gubitak"?"bg-danger":"bg-success"} ms-1">
        ${r.goal==="gubitak"?"Gubitak":"Održavanje"}
      </span>
    `;
    recipeList.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${r.name}</h5>
            <p>${badges}</p>
            <p><strong>Sastojci:</strong> ${r.ingredients}</p>
            <p><strong>Opis:</strong> ${r.description}</p>
            <p>
              ${invOk
                ? '<span class="badge bg-success">✅ Imaš sve</span>'
                : `<button class="btn btn-outline-danger btn-sm" onclick="alert('Nedostaje: ' +
                  (r.ingredients.split(',').filter(i=>!getInventory().includes(i.trim().toLowerCase())).join(', ')) )">
                    🔍 Šta fali?
                  </button>`}
            </p>
          </div>
        </div>
      </div>
    `);
  });
}

function getInventory() {
  try {
    return JSON.parse(localStorage.getItem('inventory')) || [];
  } catch {
    return [];
  }
}

function capitalize(s) {
  return s[0]?.toUpperCase() + s.slice(1);
}

categoryFilter.addEventListener('change', renderRecipes);
filterByInventory.addEventListener('change', renderRecipes);
