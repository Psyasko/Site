/* Оболонка сайту: світло, навігація, меню, анімації появи, пил у промені, лайтбокс. */
(() => {
  const root = document.documentElement;
  const SECTIONS = ['home', 'about', 'consultations', 'tests', 'soothing'];
  const THEME_COLORS = { sunset: '#15110D', night: '#070B17', dawn: '#F3EADC' };

  /* ---------- Світло: захід → ніч → світанок ---------- */
  const switchBtns = document.querySelectorAll('.light-switch button');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function setLight(mode, save = true) {
    if (!THEME_COLORS[mode]) mode = 'sunset';
    root.setAttribute('data-light', mode);
    switchBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLORS[mode]);
    if (save) { try { localStorage.setItem('light-mode', mode); } catch (e) {} }
  }
  setLight(root.getAttribute('data-light'), false);
  switchBtns.forEach(b => b.addEventListener('click', () => setLight(b.dataset.mode)));

  /* ---------- Маршрутизація за адресою ---------- */
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && !SECTIONS.includes(id)) return; // якорі всередині сторінки не чіпаємо
    showSection(id || 'home');
    observeReveals();
  }
  addEventListener('hashchange', route);

  /* ---------- Навігація ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  document.querySelectorAll('.js-to-contacts').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('contacts').scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- Поява блоків ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { threshold: .12 })
    : null;
  function observeReveals() {
    document.querySelectorAll('.site-section.active .reveal:not(.in)').forEach(el => {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- Документи: лайтбокс ---------- */
  document.querySelectorAll('[data-doc]').forEach(b => b.addEventListener('click', () => openLightbox(b.dataset.doc, b.dataset.cap || '')));
  const lb = document.getElementById('lightbox');
  lb.addEventListener('click', e => { if (e.target.id !== 'lightboxImg') closeLightbox(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLightbox(); });

  /* ---------- Пил у промені ---------- */
  function startDust() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.querySelector('.dust');
    if (!c || !c.getContext) return;
    const ctx = c.getContext('2d');
    let W = 0, H = 0, dpr = 1, parts = [], color = '#FFD29A', last = 0;
    const readColor = () => { color = getComputedStyle(root).getPropertyValue('--dust').trim() || color; };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = c.width = Math.round(innerWidth * dpr);
      H = c.height = Math.round(innerHeight * dpr);
      const n = innerWidth < 860 ? 22 : 45;
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: (Math.random() * 1.3 + .4) * dpr,
        vx: (-.06 - Math.random() * .12) * dpr, vy: (-.03 + Math.random() * .08) * dpr,
        p: Math.random() * Math.PI * 2
      }));
    };
    resize(); readColor();
    addEventListener('resize', resize);
    new MutationObserver(() => setTimeout(readColor, 50)).observe(root, { attributes: true, attributeFilter: ['data-light'] });
    const tick = t => {
      requestAnimationFrame(tick);
      if (t - last < 33) return; // ~30 кадрів/с — для повільного пилу досить
      last = t;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = color;
      for (const q of parts) {
        q.x += q.vx * 2 + Math.sin(t / 4000 + q.p) * .1 * dpr; q.y += q.vy * 2;
        if (q.x < -10) q.x = W + 10;
        if (q.y < -10) q.y = H + 10; else if (q.y > H + 10) q.y = -10;
        ctx.globalAlpha = .35 + .35 * Math.sin(t / 1800 + q.p);
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
      }
    };
    requestAnimationFrame(tick);
  }

  route();
  startDust();
})();
