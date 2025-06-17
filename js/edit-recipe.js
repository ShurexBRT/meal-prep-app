// edit-recipe.js

const apiUrl = 'https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec';
const form = document.getElementById('editRecipeForm');
const id = getRecipeIdFromUrl();

if (!id) {
  showToast("Nedostaje ID recepta!", 'danger', 5000);
  setTimeout(() => window.location.href = 'recipes.html', 2200);
} else {
  fetch(`${apiUrl}?id=${encodeURIComponent(id)}`)
    .then(res => res.json())
    .then(data => {
      if (!data || !data.id) {
        showToast("Recept nije pronađen!", 'danger', 6000);
        setTimeout(() => window.location.href = 'recipes.html', 2300);
        return;
      }
      populateForm(data);
    })
    .catch(() => {
      showToast("Greška pri učitavanju recepta!", 'danger', 6000);
      setTimeout(() => window.location.href = 'recipes.html', 2500);
    });
}

function getRecipeIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function populateForm(recipe) {
  form.id.value = recipe.id || "";
  form.name.value = recipe.name || "";
  form.meal.value = (recipe.meal || "").toLowerCase();
  form.goal.value = (recipe.goal || "").toLowerCase();
  form.description.value = recipe.description || "";
  // Ingredients kao zarezovani string
  if (recipe.ingredients) {
    form.ingredients.value = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.join(', ')
      : recipe.ingredients;
  }
  form.calories.value = recipe.calories || "";
  form.protein.value = recipe.protein || "";
  form.carbs.value = recipe.carbs || "";
  form.fat.value = recipe.fat || "";
}

// Submit handler
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const recipe = {
    id: form.id.value,
    name: form.name.value.trim(),
    meal: form.meal.value,
    goal: form.goal.value,
    description: form.description.value.trim(),
    ingredients: form.ingredients.value.split(',').map(s => s.trim()).filter(Boolean).join(', '), // sheets čuva kao string
    calories: form.calories.value,
    protein: form.protein.value,
    carbs: form.carbs.value,
    fat: form.fat.value
  };
  if (!recipe.name || !recipe.meal || !recipe.goal || !recipe.ingredients) {
    showToast("Sva polja su obavezna!", 'danger', 4000);
    return;
  }

  // Disable submit za vreme zahteva
  form.querySelector('button[type="submit"]').disabled = true;

  fetch(apiUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe)
  })
    .then(res => res.json())
    .then(result => {
      if (result.status === "success") {
        showToast("Recept uspešno izmenjen!", 'success');
        setTimeout(() => window.location.href = 'recipes.html', 1000);
      } else {
        showToast("Greška: " + (result.msg || 'Nije moguće izmeniti recept!'), 'danger', 5000);
      }
    })
    .catch(() => {
      showToast("Greška pri komunikaciji sa serverom!", 'danger', 6000);
    })
    .finally(() => {
      form.querySelector('button[type="submit"]').disabled = false;
    });
});
