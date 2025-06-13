// inventory.js

const inventoryList = document.getElementById('inventoryList');

// Fetchuj sve recepte sa Sheets API da sakupiš sastojke
fetch("https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec")
  .then(res => res.json())
  .then(data => {
    let ingredientsSet = new Set();
    data.forEach(recipe => {
      // "ingredients" je string odvojeno zarezima, pa ga razdvajamo
      if (typeof recipe.ingredients === "string") {
        recipe.ingredients.split(',').forEach(ing => {
          ingredientsSet.add(ing.trim());
        });
      }
    });
    const allIngredients = Array.from(ingredientsSet).sort((a, b) => a.localeCompare(b, "sr"));
    renderInventory(allIngredients);
  });

function renderInventory(ingredients) {
  const saved = getInventory();
  inventoryList.innerHTML = '';
  ingredients.forEach((item) => {
    const id = item.toLowerCase().replace(/\s+/g, '-');
    const div = document.createElement('div');
    div.className = 'col-md-4 mb-2';
    div.innerHTML = `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${item}" id="${id}" ${
      saved.includes(normalizeName(item)) ? 'checked' : ''
    }>
        <label class="form-check-label" for="${id}">
          ${item}
        </label>
      </div>
    `;
    inventoryList.appendChild(div);
  });
}

function saveInventory() {
  const checkboxes = document.querySelectorAll('.form-check-input');
  const selected = Array.from(checkboxes)
    .filter((cb) => cb.checked)
    .map((cb) => normalizeName(cb.value));
  localStorage.setItem('inventory', JSON.stringify(selected));
  // Umesto alert-a možeš staviti custom toast!
  alert('✅ Inventar sačuvan!');
}

function clearInventory() {
  localStorage.removeItem('inventory');
  // Moraš opet fetchovati sastojke!
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
