// ===================================================
// MAMARONECK ROBOTICS — SITE SCRIPT
// Handles page routing, reveal animations, theme,
// and the contact form.
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

function initReveal(root){
  const items = root.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in'), i * 60);
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});
  items.forEach(item => obs.observe(item));
}

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
  window.scrollTo({top:0,behavior:'smooth'});
  if(updateHistory) history.pushState(null, '', pagePaths[id]);
  const activePage = document.getElementById('page-' + id);
  if(activePage) initReveal(activePage);
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

// ---------- Theme toggle (text-based, no icon dependency) ----------
const themeBtn = document.getElementById('themeToggle');
function applyTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  themeBtn.textContent = t === 'light' ? 'Light' : 'Dark';
  localStorage.setItem('mr-theme', t);
}
applyTheme(localStorage.getItem('mr-theme') || 'dark');
themeBtn.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  applyTheme(cur);
});

// ---------- FTC / MATE image lightbox ----------
function closeLightbox(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('.render-box img').forEach(image => {
  image.tabIndex = 0;
  image.addEventListener('click', () => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
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
  if(event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

// ---------- Contact form ----------
document.getElementById('contactForm').addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('cname').value.trim();
  const email = document.getElementById('cemail').value.trim();
  const msg = document.getElementById('cmsg').value.trim();
  const out = document.getElementById('formMsg');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if(!name || !email || !msg){
    out.textContent = 'Please fill in every field before sending.';
    out.className = 'err';
    return;
  }
  if(!emailPattern.test(email)){
    out.textContent = 'Please enter a valid email address.';
    out.className = 'err';
    return;
  }

  const subject = encodeURIComponent('Website inquiry from ' + name);
  const body = encodeURIComponent(msg + '\n\n— ' + name + ' (' + email + ')');
  window.location.href = 'mailto:team8490@mamaroneckrobotics.org?subject=' + subject + '&body=' + body;
  out.textContent = 'Opening your email client to send this message...';
  out.className = 'ok';
});
