// js/meal-plan.js

const days = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const meals = ['dorucak', 'rucak', 'vecera'];
const mealLabels = { dorucak: 'Doručak', rucak: 'Ručak', vecera: 'Večera' };

const table = document.getElementById('mealPlanTable');
const saveMsg = document.getElementById('saveMessage');
let allRecipes = [];


// ucitavanje recepata sa google tabele
fetch("https://script.google.com/macros/s/AKfycbwhR0JDjMv9lo3qxqssbOPvTDETZxTdclSPcQLM7IhCJHhXzKaobyOK_2I-dXWwZc_e/exec")
  .then(res => res.json())
  .then(data => {
    // data je niz objekata, svaki je jedan recept!
    console.log(data);
  });
// Učitavanje recepata
fetch('/meal-prep-app/data/recipes.json')
  .then(res => res.json())
  .then(data => {
    allRecipes = data;
    console.log("Loaded recipes in meal-plan.js:", allRecipes);
    renderTable();
  });



function renderTable() {
  const savedPlan = getSavedPlan();
  table.innerHTML = '';

  days.forEach((day) => {
    const tr = document.createElement('tr');
    const tdDay = document.createElement('td');
    tdDay.textContent = day;
    tr.appendChild(tdDay);

    meals.forEach((meal) => {
      const td = document.createElement('td');
      const select = document.createElement('select');
      select.className = 'form-select';
      select.dataset.day = day;
      select.dataset.meal = meal;

      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '---';
      select.appendChild(emptyOption);

      // Samo recepti za taj obrok
      const filteredRecipes = allRecipes.filter((r) => (r.meal || "").toLowerCase() === meal);

      filteredRecipes.forEach((r) => {
        const option = document.createElement('option');
        option.value = r.id || r.name || r.naziv_jela;
        option.textContent = r.name || r.naziv_jela;
        if (savedPlan[day] && savedPlan[day][meal] === (r.id || r.name || r.naziv_jela)) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      td.appendChild(select);
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });
}

function saveMealPlan() {
  const selects = document.querySelectorAll('select');
  const plan = {};

  selects.forEach((sel) => {
    const day = sel.dataset.day;
    const meal = sel.dataset.meal;
    const val = sel.value;
    if (!plan[day]) plan[day] = {};
    plan[day][meal] = val;
  });

  localStorage.setItem('weeklyPlan', JSON.stringify(plan));
  saveMsg.classList.remove('d-none');
  setTimeout(() => saveMsg.classList.add('d-none'), 2000);
}

function getSavedPlan() {
  const raw = localStorage.getItem('weeklyPlan');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function generateShoppingList() {
  const plan = getSavedPlan();
  if (!plan || Object.keys(plan).length === 0) {
    alert('Nema sačuvanog plana.');
    return;
  }

  // Povuci sve selektovane recepte iz plana
  let selectedRecipeIds = [];
  Object.values(plan).forEach(dayObj => {
    meals.forEach(meal => {
      if (dayObj[meal]) selectedRecipeIds.push(dayObj[meal]);
    });
  });

  // Eliminacija duplikata
  selectedRecipeIds = [...new Set(selectedRecipeIds)];

  // Pronađi recepte po ID-u/nazivu
  const selectedRecipes = allRecipes.filter(r =>
    selectedRecipeIds.includes(r.id || r.name || r.naziv_jela)
  );

  // Sakupi sve sastojke
  let allIngredients = [];
  selectedRecipes.forEach(recipe => {
    if (Array.isArray(recipe.ingredients)) {
      allIngredients = allIngredients.concat(recipe.ingredients.map(i => typeof i === "string" ? i : (i.name || i.naziv || i)));
    }
  });

  // Eliminacija duplikata
  allIngredients = [...new Set(allIngredients.map(i => i.trim()))];

  // Ukloni iz inventory-ja (sve što korisnik ima u frižideru)
  const inventory = getInventory();
  const finalList = allIngredients.filter(
    ing => !inventory.includes(normalizeName(ing))
  );

  if (finalList.length === 0) {
    alert('Imaš sve potrebne sastojke za izabrane recepte. ✅');
    return;
  }

  // Prikaz finalne liste (možeš kasnije napraviti modal/print)
  alert(
    'Lista za kupovinu za tvoj plan:\n\n' +
    finalList.join('\n')
  );

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

}


// Ako koristiš dugmad u HTML, moraš ih povezati sa globalnim funkcijama
window.saveMealPlan = saveMealPlan;
window.generateShoppingList = generateShoppingList;
