// ===================================================
// MAMARONECK ROBOTICS — SITE SCRIPT
// Handles page routing, reveal animations, theme,
// and the contact form.
// ===================================================

const navLinks = document.querySelectorAll('[data-page]');
const pages = document.querySelectorAll('.page');

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

function goToPage(id){
  pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + id));
  document.querySelectorAll('nav a, .mobile-menu a').forEach(a => a.classList.toggle('active', a.dataset.page === id));
  document.getElementById('mobileMenu').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  history.replaceState(null, '', '#' + id);
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
  const initial = (location.hash || '#home').replace('#','');
  if(document.getElementById('page-' + initial)) {
    goToPage(initial);
  } else {
    initReveal(document.getElementById('page-home'));
  }
});

// ---------- Mobile menu ----------
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.toggle('open');
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
