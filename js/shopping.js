const container = document.getElementById('shoppingListContainer');

fetch('data/recipes.json')
  .then((res) => res.json())
  .then((recipes) => {
    const inventory = getInventory();
    const neededItems = new Set();

    recipes.forEach((recipe) => {
      recipe.sastojci.forEach((s) => {
        const normName = normalizeName(s.naziv);
        if (!inventory.includes(normName)) {
          neededItems.add(s.naziv);
        }
      });
    });

    renderList(Array.from(neededItems).sort((a, b) => a.localeCompare(b)));
  });

function renderList(items) {
  if (items.length === 0) {
    container.innerHTML = '<p class="text-muted">Imaš sve što ti treba. ✅</p>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'list-group';

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = item;
    list.appendChild(li);
  });

  container.appendChild(list);
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
