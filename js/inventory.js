const inventoryList = document.getElementById('inventoryList');

const allIngredients = [
  
"avokado",
  "bademi",
  "bademovo mleko",
  "banana",
  "batat",
  "belance",
  "borovnice",
  "brokoli",
  "chia",
  "cimet",
  "crvena paprika",
  "falafel",
  "falafel salata",
  "grčki jogurt",
  "heljdino brašno",
  "hleb od celog zrna",
  "humus",
  "integralna testenina",
  "integralna tortilja",
  "integralni tost",
  "integralno brašno",
  "jabuka",
  "jaja",
  "jaje",
  "jogurt",
  "kikiriki puter",
  "kinoa",
  "kiseli krastavci",
  "kivi",
  "krastavac",
  "krompir",
  "kruška",
  "kupus",
  "kuskus",
  "kuvano jaje",
  "lanene semenke",
  "lešnici",
  "losos",
  "maslinovo",
  "maslinovo ulje",
  "mladi sir",
  "mleko",
  "mlevena junetina",
  "orah",
  "orasi",
  "ovsena kaša",
  "ovsene pahuljice",
  "ovseni musli",
  "palenta (100g kuvana",
  "paprika",
  "paprike",
  "paradajz",
  "paradajz sok",
  "pastrmka",
  "pasulj",
  "pasulj prebranac",
  "pileće grudi",
  "pileći file",
  "povrće za supu",
  "povrćna čorba",
  "proso",
  "rukola",
  "sočivo",
  "spanać",
  "supa",
  "supa od povrća",
  "teletina",
  "tikvica",
  "tofu",
  "tunjevina",
  "zelena salata",
  "ćureća prsa",
  "ćureće mleveno meso",
  "šargarepa"

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
