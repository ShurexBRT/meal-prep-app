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

  // Svi recepti
  const filtered = allRecipes.filter((recipe) => {
    // Kategorija sada može biti meal (doručak/ručak/večera/užina) ili prava kategorija
    const matchKategorija = !selectedCategory || recipe.meal === selectedCategory;

    if (filterOnlyWhatIHave) {
      const missing = recipe.ingredients.filter(
        (s) => !inventory.includes(normalizeName(typeof s === 'string' ? s : s.name || s))
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

    // Sastojci – podrška za array stringova ili objekata sa .name
    const sastojci = recipe.ingredients.map(s =>
      typeof s === 'string' ? s : (s.name || s)
    );
    const missingIngredients = sastojci.filter(
      (s) => !inventory.includes(normalizeName(s))
    );
    const hasAll = missingIngredients.length === 0;

    card.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body">
          <h5 class="card-title mb-2">${recipe.name}</h5>
          <p>
            <span class="badge rounded-pill bg-primary">${capitalize(recipe.meal)}</span>
            <span class="badge rounded-pill bg-info">${capitalize(recipe.category)}</span>
            <span class="badge rounded-pill ${recipe.goal === "gubitak" ? "goal-gubitak bg-danger" : "goal-odrzavanje bg-success"}">
              ${recipe.goal === "gubitak" ? "Gubitak kila" : "Održavanje"}
            </span>
          </p>
          <table class="nutr-table mb-2">
            <tr>
              <td>🔥</td><td><strong>${recipe.nutrition.calories}</strong> kcal</td>
              <td>🥚</td><td><strong>${recipe.nutrition.protein}</strong>g protein</td>
            </tr>
            <tr>
              <td>🥔</td><td><strong>${recipe.nutrition.carbs}</strong>g ugljeni hidrati</td>
              <td>🥑</td><td><strong>${recipe.nutrition.fats}</strong>g masti</td>
            </tr>
          </table>
          <p class="mb-1"><strong>Sastojci:</strong></p>
          <ul>
            ${sastojci.map((s) => `<li>${s}</li>`).join('')}
          </ul>
          <p><strong>Priprema:</strong> ${recipe.instructions || ''}</p>
          ${
            hasAll
              ? `<span class="badge text-bg-success">✅ Imaš sve sastojke</span>`
              : `<button class="btn btn-outline-danger btn-sm mt-2" onclick='alert("Nedostaje: ${missingIngredients.join(", ")}")'>🔍 Šta mi fali?</button>`
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
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Event listeneri
categoryFilter.addEventListener('change', renderRecipes);
filterByInventory.addEventListener('change', renderRecipes);
