// ===================================================
// MAMARONECK ROBOTICS — SITE SCRIPT
// Handles page routing, theme,
// and the image lightbox.
// ===================================================

const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');
const lightbox = document.getElementById('imageLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const siteRoot = new URL('./', document.baseURI).pathname.replace(/\/$/, '');
const pagePaths = {
  home: siteRoot || '/',
  ftc: `${siteRoot}/ftc`,
  rov: `${siteRoot}/rov`,
  gallery: `${siteRoot}/gallery`,
  contact: `${siteRoot}/contact`
};
const pathPages = Object.fromEntries(Object.entries(pagePaths).map(([id, path]) => [path, id]));
const pageTitles = {
  home: 'Mamaroneck Robotics | FTC 8490 & MATE ROV',
  ftc: 'FTC 8490 | Mamaroneck Robotics',
  rov: 'Tigersharks ROV | Mamaroneck Robotics',
  gallery: 'Gallery | Mamaroneck Robotics',
  contact: 'Contact | Mamaroneck Robotics'
};

function getPageIdFromLocation(){
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if(pathPages[path]) return pathPages[path];

  const hash = window.location.hash.replace(/^#/, '');
  return document.getElementById('page-' + hash) ? hash : 'home';
}

function goToPage(id, {updateHistory = true} = {}){
  if(!pagePaths[id]) id = 'home';
  pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + id));
  document.querySelectorAll('nav a, .mobile-menu a').forEach(a => {
    const isActive = a.dataset.page === id;
    a.classList.toggle('active', isActive);
    if(isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('hamburgerBtn').setAttribute('aria-expanded', 'false');
  window.scrollTo({top:0,behavior:'instant'});
  if(updateHistory) history.pushState(null, '', pagePaths[id]);
  document.title = pageTitles[id];
}

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    goToPage(link.dataset.page);
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const initial = getPageIdFromLocation();
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const hasLegacyHash = Boolean(window.location.hash);
  const needsCanonicalPath = hasLegacyHash || !pathPages[currentPath];
  if(needsCanonicalPath) history.replaceState(null, '', pagePaths[initial]);
  goToPage(initial, {updateHistory: false});
});

window.addEventListener('popstate', () => {
  goToPage(getPageIdFromLocation(), {updateHistory: false});
});

// ---------- Mobile menu ----------
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  const isOpen = menu.classList.toggle('open');
  document.getElementById('hamburgerBtn').setAttribute('aria-expanded', String(isOpen));
});

// ---------- Theme toggle (sun/moon icons swap via CSS) ----------
// The initial theme is set by the inline script in <head> to avoid a flash.
const themeBtn = document.getElementById('themeToggle');
function applyTheme(t, {save = true} = {}){
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
  if(save){
    try { localStorage.setItem('mr-theme', t); } catch(e) {}
  }
}
applyTheme(document.documentElement.getAttribute('data-theme') || 'dark', {save: false});
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(cur);
});

// ---------- FTC / MATE image lightbox ----------
let lightboxTrigger = null;

function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.removeAttribute('src');
  document.body.style.overflow = '';
  if(lightboxTrigger) lightboxTrigger.focus();
  lightboxTrigger = null;
}

document.querySelectorAll('.render-box img').forEach(image => {
  image.tabIndex = 0;
  image.setAttribute('role', 'button');
  image.addEventListener('click', () => {
    lightboxTrigger = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  });
  image.addEventListener('keydown', event => {
    if(event.key === 'Enter' || event.key === ' '){
      event.preventDefault();
      image.click();
    }
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => {
  if(event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', event => {
  if(!lightbox.classList.contains('open')) return;
  if(event.key === 'Escape') closeLightbox();
  // The close button is the only focusable control, so keep Tab on it.
  if(event.key === 'Tab'){
    event.preventDefault();
    lightboxClose.focus();
  }
});
