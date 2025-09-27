document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const sideNav = document.getElementById('side-nav');
  const overlay = document.getElementById('side-overlay');

  if (!hamburger || !sideNav || !overlay) {
    console.warn('Faltan elementos para el menú lateral');
    return;
  }

  // Abrir menú
  hamburger.addEventListener('click', () => {
    sideNav.classList.add('open');
    overlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    sideNav.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');
  });

  // Cerrar menú al hacer clic en la superposición
  overlay.addEventListener('click', () => {
    sideNav.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    sideNav.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');
  });
});