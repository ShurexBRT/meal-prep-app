// shopping.js

const container = document.getElementById('shoppingListContainer');

// Učitaj recepte sa Google Sheets
fetch("https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec")
  .then(res => res.json())
  .then(data => {
    const inv = getInventory();
    const needed = new Set();
    data.forEach(r => {
      (r.ingredients || '').split(',').forEach(i => {
        const ing = i.trim();
        if (ing && !inv.includes(ing.toLowerCase())) needed.add(ing);
      });
    });
    renderList(Array.from(needed).sort((a, b) => a.localeCompare(b, "sr")));
  });

function renderList(items) {
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="text-muted">Imaš sve što ti treba. ✅</p>';
    return;
  }
  const ul = document.createElement('ul');
  ul.className = 'list-group';
  items.forEach(it => {
    ul.insertAdjacentHTML('beforeend', `<li class="list-group-item">${it}</li>`);
  });
  container.appendChild(ul);
}

function getInventory() {
  try {
    return JSON.parse(localStorage.getItem('inventory')) || [];
  } catch {
    return [];
  }
}

function normalizeName(n) {
  return n.trim().toLowerCase();
}
