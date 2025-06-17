// js/add-recipe.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addRecipeForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Skupi podatke iz forme
    const data = {
      name: form.name.value.trim(),
      meal: form.meal.value,
      goal: form.goal.value,
      description: form.description.value.trim(),
      ingredients: form.ingredients.value
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
        .join(", "),
      calories: form.calories.value,
      protein: form.protein.value,
      carbs: form.carbs.value,
      fat: form.fat.value,
    };

    // Simple validacija
    if (
      !data.name ||
      !data.meal ||
      !data.goal ||
      !data.description ||
      !data.ingredients
    ) {
      showToast("Popuni sva obavezna polja.", "danger");
      return;
    }

    // Pošalji podatke POST-om na tvoj Google Apps Script
    try {
      showToast("Šaljem recept...", "primary", 1500);

      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzG479FCE0jYnIZRZkXXUYTbkXtGfyWhvTtmwaT_qDI2tiQ2A-jJDmqfjBn-i9bmEw/exec", // zameni sa tvojim ako se menja!
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        showToast("Recept uspešno dodat! 🚀", "success");
        setTimeout(() => (window.location.href = "recipes.html"), 1500);
      } else {
        throw new Error("Nešto nije u redu, pokušaj ponovo.");
      }
    } catch (err) {
      showToast("Greška: " + err.message, "danger");
    }
  });
});
