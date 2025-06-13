// Hamburger meni i dark mode
const btn = document.getElementById('hamburgerBtn');
const menu = document.getElementById('hamburgerMenu');
const toggle = document.getElementById('darkToggle');

btn.onclick = () => menu.classList.toggle('open');
document.addEventListener('click', (e) => {
  if (!btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') menu.classList.remove('open');
});

// DARK MODE logika
toggle.onclick = () => {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? '1' : '0');
};
if (localStorage.getItem('darkMode') === '1') {
  document.body.classList.add('dark-mode');
}
