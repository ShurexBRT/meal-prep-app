// meal-plan.js

const days = ['Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota', 'Nedelja'];
const meals = ['dorucak', 'rucak', 'vecera'];

const table = document.getElementById('mealPlanTable');
const saveMsg = document.getElementById('saveMessage');
let allRecipes = [];

// Učitaj recepte sa Google Sheets
fetch("https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec")
  .then(res => res.json())
  .then(data => {
    allRecipes = data;
    renderTable();
  });

function renderTable() {
  const savedPlan = getSavedPlan();
  table.innerHTML = '';

  days.forEach(day => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${day}</td>`;
    meals.forEach(meal => {
      const td = document.createElement('td');
      const select = document.createElement('select');
      select.className = 'form-select';
      select.dataset.day = day;
      select.dataset.meal = meal;
      // prazna opcija
      select.innerHTML = `<option value="">---</option>`;

      // filtriraj po meal (string CSV polje .meal)
      allRecipes
        .filter(r => (r.meal || '').toLowerCase() === meal)
        .forEach(r => {
          const val = r.id || r.name;
          const option = document.createElement('option');
          option.value = val;
          option.textContent = r.name;
          if (savedPlan[day] && savedPlan[day][meal] === val) {
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
  const plan = {};
  document.querySelectorAll('#mealPlanTable select').forEach(sel => {
    const { day, meal } = sel.dataset;
    plan[day] = plan[day] || {};
    plan[day][meal] = sel.value;
  });
  localStorage.setItem('weeklyPlan', JSON.stringify(plan));
  saveMsg.classList.remove('d-none');
  setTimeout(() => saveMsg.classList.add('d-none'), 2000);
}

function getSavedPlan() {
  try {
    return JSON.parse(localStorage.getItem('weeklyPlan')) || {};
  } catch {
    return {};
  }
}

function generateShoppingList() {
  const plan = getSavedPlan();
  let ids = [];
  Object.values(plan).forEach(dayObj => {
    meals.forEach(m => dayObj[m] && ids.push(dayObj[m]));
  });
  ids = [...new Set(ids)];
  const selected = allRecipes.filter(r => ids.includes(r.id || r.name));
  // sakupi sve sastojke i ukloni ono iz inventory
  const inv = getInventory();
  let needed = new Set();
  selected.forEach(r => {
    (r.ingredients || '').split(',').forEach(i => {
      const ingr = i.trim();
      if (!inv.includes(ingr.toLowerCase())) needed.add(ingr);
    });
  });
  const list = Array.from(needed);
  if (!list.length) {
    alert('Imaš sve sastojke! ✅');
  } else {
    alert('🛒 Lista za kupovinu:\n\n' + list.join('\n'));
  }

  function getInventory() {
    try {
      return JSON.parse(localStorage.getItem('inventory')) || [];
    } catch {
      return [];
    }
  }
}

window.saveMealPlan = saveMealPlan;
window.generateShoppingList = generateShoppingList;
