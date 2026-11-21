document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const btn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileClose');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const navLinks = document.querySelectorAll('.mobile-nav-links a');
  const toggleMenu = () => {
    const open = menu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  if (btn) btn.addEventListener('click', toggleMenu);
  if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);
  navLinks.forEach((a) => a.addEventListener('click', toggleMenu));

  /* ---------- Header scroll state + back to top ---------- */
  const header = document.querySelector('header');
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  });
  if (btt) btt.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Reveal-on-scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-item .val');
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const final = target.getAttribute('data-final') || target.textContent;
        const num = parseFloat(final.replace(/[^0-9.]/g, ''));
        const suffix = final.replace(/[0-9.]/g, '');
        const duration = 1600;
        const startTime = performance.now();
        const animate = (now) => {
          const p = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const val = (num * ease).toFixed(Number.isInteger(num) ? 0 : 2);
          target.textContent = val.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
          if (p < 1) requestAnimationFrame(animate);
          else target.textContent = final;
        };
        requestAnimationFrame(animate);
        countObserver.unobserve(target);
      });
    },
    { threshold: 0.3 }
  );
  counters.forEach((c) => countObserver.observe(c));

  /* ---------- Horoscope tabs ---------- */
  document.querySelectorAll('.tab-btn').forEach((tb) => {
    tb.addEventListener('click', () => {
      const panel = document.getElementById(tb.dataset.target);
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      tb.classList.add('active');
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Toast ---------- */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  window.showToast = (msg) => {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        form.reset();
        showToast('Thank you! Our team will connect with you shortly.');
      }, 1200);
    });
  }

  /* ---------- Free calculators ---------- */
  function setupCalc(formId, fn) {
    const el = document.getElementById(formId);
    if (!el) return;
    el.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = el.querySelector('.calc-result');
      const out = el.querySelector('.calc-output');
      try {
        out.textContent = fn(new FormData(el));
      } catch (err) {
        out.textContent = 'Invalid input';
      }
      res.style.display = 'block';
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  // Destiny / Life Path number from DOB
  setupCalc('destinyForm', (fd) => {
    const dob = (fd.get('dob') || '').replace(/\D/g, '');
    let sum = [...dob].reduce((a, b) => a + parseInt(b, 10), 0);
    const reduce = (n) => [...String(n)].reduce((a, b) => a + parseInt(b, 10), 0);
    while (sum > 9 && ![11, 22, 33].includes(sum)) sum = reduce(sum);
    return 'Destiny Number: ' + sum;
  });
  // Love (FLAMES-ish) compatibility
  setupCalc('loveForm', (fd) => {
    const a = (fd.get('name1') || '').toLowerCase();
    const b = (fd.get('name2') || '').toLowerCase();
    let score = 0;
    for (const ch of 'loves') {
      score += ((a.match(new RegExp(ch, 'g')) || []).length + (b.match(new RegExp(ch, 'g')) || []).length);
    }
    score = Math.min(99, Math.max(1, score));
    return 'Love Compatibility: ' + score + '%';
  });
  /* ---------- Newsletter (home page) ---------- */
  const nf = document.getElementById('newsletterForm');
  if (nf) {
    nf.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thanks for subscribing!');
      nf.reset();
    });
  }
});