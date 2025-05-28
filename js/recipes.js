const recipeList = document.getElementById('recipeList');
const categoryFilter = document.getElementById('categoryFilter');
const filterByInventory = document.getElementById('filterByInventory');

let allRecipes = [];

// Učitavanje recepata iz JSON fajla
fetch('/meal-prep-app/data/recipes.json')
  .then((res) => res.json())
  .then((data) => {
    allRecipes = data;
    renderRecipes();
  });

// Crtanje recepata
function renderRecipes() {
  recipeList.innerHTML = '';

  const selectedCategory = categoryFilter.value;
  const filterOnlyWhatIHave = filterByInventory.checked;
  const inventory = getInventory();

  const filtered = allRecipes.filter((recipe) => {
    const matchKategorija = !selectedCategory || recipe.kategorija === selectedCategory;

    if (filterOnlyWhatIHave) {
      const missing = recipe.sastojci.filter(
        (s) => !inventory.includes(normalizeName(s.naziv))
      );
      return matchKategorija && missing.length === 0;
    }

    return matchKategorija;
  });

  if (filtered.length === 0) {
    recipeList.innerHTML = '<p class="text-muted">Nema recepata za ovaj filter. 🧹</p>';
    return;
  }

  filtered.forEach((recipe) => {
    const card = document.createElement('div');
    card.className = 'col-md-6';

    const missingIngredients = recipe.sastojci.filter(
      (s) => !inventory.includes(normalizeName(s.naziv))
    );

    const hasAll = missingIngredients.length === 0;

    card.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${recipe.naziv}</h5>
          <p class="card-text mb-2">
            <strong>Kategorija:</strong> ${capitalize(recipe.kategorija)}
          </p>
          <p class="card-text"><strong>Sastojci:</strong></p>
          <ul>
            ${recipe.sastojci
              .map((s) => `<li>${s.naziv} – ${s.kolicina} ${s.jedinica}</li>`)
              .join('')}
          </ul>
          ${
            hasAll
              ? `<span class="badge text-bg-success">✅ Imaš sve sastojke</span>`
              : `<button class="btn btn-outline-danger btn-sm mt-2" onclick='alert("Nedostaje: ${missingIngredients
                  .map((m) => m.naziv)
                  .join(', ')}")'>🔍 Šta mi fali?</button>`
          }
        </div>
      </div>
    `;

    recipeList.appendChild(card);
  });
}

function getInventory() {
  const raw = localStorage.getItem('inventory');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event listeneri
categoryFilter.addEventListener('change', renderRecipes);
filterByInventory.addEventListener('change', renderRecipes);
