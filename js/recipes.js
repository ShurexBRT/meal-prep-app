// js/recipes.js

const apiUrl = 'https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec';

const recipeList = document.getElementById('recipeList');
// HTML koristi id="categoryFilter" za odabir obroka i id="searchRecipe" za pretragu
const mealFilter = document.getElementById('categoryFilter');
const goalFilter = document.getElementById('goalFilter'); // opcioni filter, mozda ne postoji
const searchInput = document.getElementById('searchRecipe');
const filterByInventory = document.getElementById('filterByInventory');

let allRecipes = [];

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    allRecipes = data;
    renderRecipes();
  });

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
  return name ? name.trim().toLowerCase() : '';
}

function renderRecipes() {
  recipeList.innerHTML = '';

  // FILTERS
  const selectedMeal = mealFilter ? mealFilter.value : '';
  const selectedGoal = goalFilter ? goalFilter.value : '';
  const query = searchInput ? normalizeName(searchInput.value) : '';
  const inventory = getInventory();
  const mustHaveAll = filterByInventory ? filterByInventory.checked : false;

  let filtered = allRecipes.filter(r => {
    // Meal/category
    if (selectedMeal && normalizeName(r.meal || r.category) !== selectedMeal) return false;
    // Goal
    if (selectedGoal && normalizeName(r.goal) !== selectedGoal) return false;
    // Search (name or ingredient)
    if (query) {
      const inName = (r.name || '').toLowerCase().includes(query);
      const inIngredients = (r.ingredients || '').toLowerCase().includes(query);
      if (!inName && !inIngredients) return false;
    }
    // "Imam sve" filter
    if (mustHaveAll) {
      const ingredients = (r.ingredients || '').split(',').map(i => normalizeName(i));
      const missing = ingredients.filter(i => !inventory.includes(i));
      if (missing.length > 0) return false;
    }
    return true;
  });

  if (!filtered.length) {
    recipeList.innerHTML = `<div class="col-12"><div class="alert alert-warning">Nema recepata za ovaj filter! 🧹</div></div>`;
    return;
  }

  filtered.forEach(r => {
    // Prikaz badge-a za obrok i cilj
    const badgeMeal = r.meal || r.category;
    const badgeGoal = r.goal;
    // Makroi
    const cal = r.calories || r.nutrition?.calories || '';
    const protein = r.protein || r.nutrition?.protein || '';
    const carbs = r.carbs || r.nutrition?.carbs || '';
    const fat = r.fat || r.nutrition?.fat || '';
    // Sastojci kao lista
    const ingredientsArr = (r.ingredients || '').split(',').map(i => i.trim());
    // Nedostajući sastojci
    const missing = ingredientsArr.filter(i => !inventory.includes(normalizeName(i)));
    const invOk = missing.length === 0;
    // HTML kartice
    recipeList.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h5 class="card-title mb-2">${r.name || r.naziv_jela || 'Recept'}</h5>
              <div>
                <span class="badge badge-goal ${badgeGoal === 'gubitak' ? 'gubitak' : 'odrzavanje'}">${badgeGoal ? badgeGoal.charAt(0).toUpperCase() + badgeGoal.slice(1) : ''}</span>
                <span class="badge bg-light text-dark ms-1">${badgeMeal ? badgeMeal.charAt(0).toUpperCase() + badgeMeal.slice(1) : ''}</span>
              </div>
            </div>
            <p class="mb-1"><strong>Opis:</strong> ${r.description || ''}</p>
            <p class="mb-1"><strong>Sastojci:</strong></p>
            <ul class="mb-2">
              ${ingredientsArr.map(i => `<li>${i}</li>`).join('')}
            </ul>
            <div class="recipe-macros mb-2">
              ${cal ? `<span>🔥 ${cal} kcal</span> &nbsp;` : ''}
              ${protein ? `<span>🥚 ${protein}g proteina</span> &nbsp;` : ''}
              ${carbs ? `<span>🍞 ${carbs}g UH</span> &nbsp;` : ''}
              ${fat ? `<span>🥑 ${fat}g masti</span>` : ''}
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <div>
                ${invOk
                  ? '<span class="badge text-bg-success">✅ Imaš sve</span>'
                  : `<button class="btn btn-outline-danger btn-sm" onclick="showMissingIngredients('${missing.join(',')}')">🔍 Šta fali?</button>`
                }
              </div>
              <div>
                <button class="btn btn-outline-secondary btn-sm me-1" onclick="editRecipe('${r.id}')">
                  <span class="material-icons" style="font-size:18px;vertical-align:middle;">edit</span>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteRecipe('${r.id}','${(r.name || '').replace(/'/g, "\\'")}')">
                  <span class="material-icons" style="font-size:18px;vertical-align:middle;">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });
}

// Extra: Missing ingredients modal/alert
window.showMissingIngredients = function(missingStr) {
  const list = missingStr.split(',').map(i => i.trim()).filter(i => i).join(', ');
  showToast('Nedostaje: ' + list, 'danger');
};

window.editRecipe = function(id) {
  window.location.href = `edit-recipe.html?id=${id}`;
};

window.deleteRecipe = function(id, name) {
  if (!confirm(`Da li sigurno želiš da obrišeš recept: "${name}"?`)) return;
  fetch(apiUrl, {
    method: "DELETE",
    body: JSON.stringify({ id })
  })
    .then(res => res.json())
    .then(res => {
      if(res.status === "success") {
        showToast("Recept uspešno obrisan!", "success");
        // Lokalno update
        allRecipes = allRecipes.filter(r => r.id !== id);
        renderRecipes();
      } else {
        showToast("Greška prilikom brisanja!", "danger");
      }
    }).catch(()=>{
      showToast("Greška u vezi sa serverom!", "danger");
    });
};

// Event listeners
if (mealFilter) mealFilter.addEventListener('change', renderRecipes);
if (goalFilter) goalFilter.addEventListener('change', renderRecipes);
if (searchInput) searchInput.addEventListener('input', renderRecipes);
if (filterByInventory) filterByInventory.addEventListener('change', renderRecipes);
