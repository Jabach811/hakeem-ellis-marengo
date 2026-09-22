const openButton = document.querySelector('[data-menu-open]');
const closeButton = document.querySelector('[data-menu-close]');
const drawer = document.querySelector('[data-nav-drawer]');
const backdrop = document.querySelector('[data-nav-backdrop]');
const pageRegion = document.querySelector('[data-page-region]');

if (openButton && closeButton && drawer && backdrop && pageRegion) {
  const setMenuOpen = (open) => {
    openButton.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
    backdrop.hidden = !open;
    drawer.dataset.open = String(open);
    backdrop.dataset.open = String(open);
    pageRegion.inert = open;

    if (open) {
      closeButton.focus();
    } else {
      openButton.focus();
    }
  };

  openButton.addEventListener('click', () => setMenuOpen(true));
  closeButton.addEventListener('click', () => setMenuOpen(false));
  backdrop.addEventListener('click', () => setMenuOpen(false));
  drawer.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
    }
  });
}

for (const disclosure of document.querySelectorAll('[data-disclosure]')) {
  const button = disclosure.querySelector('[data-disclosure-button]');
  const panel = disclosure.querySelector('[data-disclosure-panel]');
  if (!button || !panel) continue;

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  });
}
