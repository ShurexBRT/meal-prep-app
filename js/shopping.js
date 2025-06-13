const container = document.getElementById('shoppingListContainer');

// ucitavanje recepata sa google tabele
fetch("https://script.google.com/macros/s/AKfycbwhR0JDjMv9lo3qxqssbOPvTDETZxTdclSPcQLM7IhCJHhXzKaobyOK_2I-dXWwZc_e/exec")
  .then(res => res.json())
  .then(data => {
    // data je niz objekata, svaki je jedan recept!
    console.log(data);

  
//fetch('/meal-prep-app/data/recipes.json')
//  .then((res) => res.json())
//  .then((recipes) => {
//    const inventory = getInventory();
//    const neededItems = new Set();

    // NOVI FORMAT: svi sastojci su sada u 'ingredients' kao niz stringova
    recipes.forEach((recipe) => {
      (Array.isArray(recipe.ingredients) ? recipe.ingredients : Object.values(recipe.ingredients)).forEach((s) => {
        const normName = normalizeName(s);
        if (!inventory.includes(normName)) {
          neededItems.add(s);
        }
      });
    });

    renderList(Array.from(neededItems).sort((a, b) => a.localeCompare(b, "sr")));
  });

function renderList(items) {
  container.innerHTML = "";
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
