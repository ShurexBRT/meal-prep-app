const inventoryList = document.getElementById('inventoryList');

// Umesto fiksnog niza, vucemo iz recipes.json
fetch('/meal-prep-app/data/recipes.json')
  .then(res => res.json())
  .then(recipes => {
    // Skupljamo sve unikatne sastojke iz svih recepata
    let ingredientsSet = new Set();
    recipes.forEach(recipe => {
      // podržava ili string niz ili objekat u ingredients
      (Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients)).forEach(ing => {
        ingredientsSet.add(ing.trim());
      });
    });
    const allIngredients = Array.from(ingredientsSet).sort((a, b) => a.localeCompare(b, "sr"));

    renderInventory(allIngredients);
  });

function renderInventory(allIngredients) {
  const saved = getInventory();

  inventoryList.innerHTML = '';

  allIngredients.forEach((item) => {
    const id = item.toLowerCase().replace(/\s+/g, '-');
    const div = document.createElement('div');
    div.className = 'col-md-4 mb-2';
    div.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${item}" id="${id}" ${saved.includes(normalizeName(item)) ? 'checked' : ''}>
        <label class="form-check-label" for="${id}">
          ${item}
        </label>
      </div>
    `;
    inventoryList.appendChild(div);
  });

  // Dodaj event listenere na checkbokse (za auto-save on change)
  const checkboxes = inventoryList.querySelectorAll('.form-check-input');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', saveInventory);
  });
}

function saveInventory() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  const selected = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => normalizeName(cb.value));
  localStorage.setItem('inventory', JSON.stringify(selected));
}

function clearInventory() {
  localStorage.removeItem('inventory');
  // Ponovo renderuj (ponovo će učitati sastojke iz json-a)
  location.reload();
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
