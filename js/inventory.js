const inventoryList = document.getElementById('inventoryList');

const allIngredients = [
  "Pileći file", "Bulgur", "Brokoli", "Pasulj", "Crni luk", "Beli luk",
  "Tikvica", "Teletina", "Jaje", "Integralni hleb", "Posni sir", "Paradajz",
  "Spanać", "Palenta", "Pavlaka", "Tuna", "Proso", "Pečurke", "Jogurt",
  "Kiseli krastavci", "Losos", "Kinoa", "Rukola", "Ovsene pahuljice", "Avokado",
  "Banana", "Lan", "Heljdina galeta", "Hleb", "Bademov puter","Tuna u sopstvenom soku",
"Maslinovo ulje","Mleko 1.5%","Pavlaka 12%","Borovnice","Chia semenke","Krastavac"

];

function renderInventory() {
  const saved = getInventory();
  const sorted = [...allIngredients].sort((a, b) => a.localeCompare(b));

  inventoryList.innerHTML = '';

  sorted.forEach((item) => {
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
  alert('✅ Inventar sačuvan!');
}

function clearInventory() {
  localStorage.removeItem('inventory');
  renderInventory();
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

renderInventory();
