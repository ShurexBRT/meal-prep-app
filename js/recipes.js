// js/recipes.js
import { db } from './firebase.js';
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const recipeList = document.getElementById('recipeList');
// Ove ID-jeve koristiš ako imaš filtere
const mealFilter = document.getElementById('mealFilter');
const goalFilter = document.getElementById('goalFilter');
const searchInput = document.getElementById('searchInput');
const filterByInventory = document.getElementById('filterByInventory');

let allRecipes = [];

async function fetchRecipes() {
  allRecipes = [];
  const querySnapshot = await getDocs(collection(db, "recipes"));
  querySnapshot.forEach((docSnap) => {
    let recipe = docSnap.data();
    recipe.id = docSnap.id; // Firestore ID kao id
    allRecipes.push(recipe);
  });
  renderRecipes();
}

// Helper funkcije (localStorage, normalizacija, itd.)
function getInventory() {
  const raw = localStorage.getItem('inventory');
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}
function normalizeName(name) { return name ? name.trim().toLowerCase() : ''; }

function renderRecipes() {
  recipeList.innerHTML = '';

  const selectedMeal = mealFilter ? mealFilter.value : '';
  const selectedGoal = goalFilter ? goalFilter.value : '';
  const query = searchInput ? normalizeName(searchInput.value) : '';
  const inventory = getInventory();
  const mustHaveAll = filterByInventory ? filterByInventory.checked : false;

  let filtered = allRecipes.filter(r => {
    if (selectedMeal && normalizeName(r.meal) !== selectedMeal) return false;
    if (selectedGoal && normalizeName(r.goal) !== selectedGoal) return false;
    if (query) {
      const inName = (r.name || '').toLowerCase().includes(query);
      const inIngredients = (r.ingredients || '').toLowerCase().includes(query);
      if (!inName && !inIngredients) return false;
    }
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
    // Badge-ovi, makroi, sastojci, itd.
    const badgeMeal = r.meal;
    const badgeGoal = r.goal;
    const cal = r.calories || '';
    const protein = r.protein || '';
    const carbs = r.carbs || '';
    const fat = r.fat || '';
    const ingredientsArr = (r.ingredients || '').split(',').map(i => i.trim());
    const missing = ingredientsArr.filter(i => !inventory.includes(normalizeName(i)));
    const invOk = missing.length === 0;

    recipeList.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <h5 class="card-title mb-2">${r.name || 'Recept'}</h5>
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

window.showMissingIngredients = function(missingStr) {
  const list = missingStr.split(',').map(i => i.trim()).filter(i => i).join(', ');
  showToast('Nedostaje: ' + list, 'danger');
};

window.editRecipe = function(id) {
  window.location.href = `edit-recipe.html?id=${id}`;
};

window.deleteRecipe = async function(id, name) {
  if (!confirm(`Da li sigurno želiš da obrišeš recept: "${name}"?`)) return;
  try {
    await deleteDoc(doc(db, "recipes", id));
    showToast("Recept uspešno obrisan!", "success");
    allRecipes = allRecipes.filter(r => r.id !== id);
    renderRecipes();
  } catch (e) {
    showToast("Greška pri brisanju!", "danger");
  }
};

// Event listeners
if (mealFilter) mealFilter.addEventListener('change', renderRecipes);
if (goalFilter) goalFilter.addEventListener('change', renderRecipes);
if (searchInput) searchInput.addEventListener('input', renderRecipes);
if (filterByInventory) filterByInventory.addEventListener('change', renderRecipes);

fetchRecipes();
