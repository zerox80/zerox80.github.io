(() => {
  // Theme toggle with localStorage
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const stored = localStorage.getItem('theme');
  if (stored === 'light') {
    root.setAttribute('data-theme', 'light');
  } else if (stored === 'dark') {
    root.removeAttribute('data-theme'); // dark = default
  } else {
    // Default to light theme for a fresh, clean design
    root.setAttribute('data-theme', 'light');
  }
  if (btn) {
    btn.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      const next = isLight ? 'dark' : 'light';
      if (next === 'dark') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', 'light');
      }
      localStorage.setItem('theme', next);
    });
  }

  // Inject mobile menu toggle and behavior
  function setupMobileMenu() {
    const nav = document.querySelector('.top-nav');
    if (!nav || nav.dataset.menuReady) return;
    nav.dataset.menuReady = '1';
    const btnMenu = document.createElement('button');
    btnMenu.className = 'btn menu-toggle';
    btnMenu.type = 'button';
    btnMenu.setAttribute('aria-label', 'Menü');
    btnMenu.innerHTML = '☰';
    nav.insertBefore(btnMenu, nav.firstChild);

    const closeMenu = () => document.body.classList.remove('menu-open');
    const toggleMenu = () => document.body.classList.toggle('menu-open');
    btnMenu.addEventListener('click', toggleMenu);
    window.addEventListener('resize', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }
  setupMobileMenu();

  // Mark active link in top nav and sidebar TOCs
  function markActiveLinks() {
    const here = location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.top-nav a[href], .sidebar .toc a[href]').forEach(a => {
      try {
        const url = new URL(a.getAttribute('href'), location.href);
        const path = url.pathname.replace(/index\.html$/, '');
        if (path === here) a.classList.add('active');
      } catch (_) { /* ignore invalid hrefs */ }
    });
  }
  markActiveLinks();

  // Ensure skip link and main target exist on all pages
  function ensureSkipLink() {
    let main = document.querySelector('main');
    if (!main) return;
    if (!main.id) main.id = 'main';
    if (!document.querySelector('.skip-link')) {
      const a = document.createElement('a');
      a.className = 'skip-link';
      a.href = `#${main.id}`;
      a.textContent = 'Zum Inhalt springen';
      document.body.prepend(a);
    }
  }
  ensureSkipLink();

  // Ensure back-to-top button exists
  function ensureBackToTop() {
    if (!document.querySelector('.back-to-top')) {
      const btnTop = document.createElement('button');
      btnTop.className = 'btn back-to-top';
      btnTop.setAttribute('aria-label', 'Nach oben');
      btnTop.textContent = '↑';
      document.body.appendChild(btnTop);
    }
  }
  ensureBackToTop();

  // --- LPIC-1 enhancements ---
  const topics = [
    { slug: 'grundlagen-linux', title: 'Grundlagen & Philosophien', path: 'lpic-1/grundlagen-linux.html' },
    { slug: 'dateisysteme-fhs', title: 'Dateisysteme & FHS', path: 'lpic-1/dateisysteme-fhs.html' },
    { slug: 'berechtigungen-acls', title: 'Berechtigungen & ACLs', path: 'lpic-1/berechtigungen-acls.html' },
    { slug: 'paketverwaltung', title: 'Paketverwaltung', path: 'lpic-1/paketverwaltung.html' },
    { slug: 'prozesse', title: 'Prozesse & Systemd', path: 'lpic-1/prozesse.html' },
    { slug: 'benutzer-gruppen', title: 'Benutzer & Gruppen', path: 'lpic-1/benutzer-gruppen.html' },
    { slug: 'netzwerkgrundlagen', title: 'Netzwerkgrundlagen', path: 'lpic-1/netzwerkgrundlagen.html' },
    { slug: 'shells-scripting', title: 'Shells & Scripting', path: 'lpic-1/shells-scripting.html' },
    { slug: 'archivierung-komprimierung', title: 'Archivierung & Komprimierung', path: 'lpic-1/archivierung-komprimierung.html' },
    { slug: 'systemstart-boot', title: 'Systemstart & Boot', path: 'lpic-1/systemstart-boot.html' },
    { slug: 'hardware-geraete', title: 'Hardware & Geräte', path: 'lpic-1/hardware-geraete.html' },
  ];

  const topicIcons = {
    'grundlagen-linux': '📘',
    'dateisysteme-fhs': '🗄️',
    'berechtigungen-acls': '🔐',
    'paketverwaltung': '📦',
    'prozesse': '⚙️',
    'benutzer-gruppen': '👥',
    'netzwerkgrundlagen': '🌐',
    'shells-scripting': '🖥️',
    'archivierung-komprimierung': '🗜️',
    'systemstart-boot': '🚀',
    'hardware-geraete': '💻',
  };

  const isLPICIndex = /\/lpic-1\/index\.html?$/.test(location.pathname);
  const isTopicPage = /\/lpic-1\/.+\.html$/.test(location.pathname) && !isLPICIndex;

  function getSlugFromPath(pathname) {
    const m = pathname.match(/([^/]+)\.html?$/);
    return m ? m[1] : '';
  }

  function getTopicSlugForCurrentPath() {
    const p = location.pathname;
    const t = topics.find(t => p.includes(`/lpic-1/${t.slug}/`) || p.endsWith(`/lpic-1/${t.slug}.html`));
    return t ? t.slug : '';
  }

  function progressKey(slug) { return `progress:${slug}`; }
  function getProgress(slug) { return localStorage.getItem(progressKey(slug)) === '1'; }
  function setProgress(slug, val) { localStorage.setItem(progressKey(slug), val ? '1' : '0'); }

  // Render topics list with search and progress (LPIC-1 overview)
  function renderTopics() {
    const grid = document.getElementById('topicsGrid');
    if (!grid) return;
    const qInput = document.getElementById('topicSearch');
    const q = (qInput?.value || '').toLowerCase();
    grid.innerHTML = '';
    topics
      .filter(t => t.title.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q))
      .forEach((t, idx) => {
        // Compute subtopic-based progress percentage if we know subtopic count
        let subCount = 0;
        try { subCount = parseInt(localStorage.getItem(`subcount:${t.slug}`) || '0', 10) || 0; } catch (_) {}
        let subDone = 0;
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(`progress:sub:/lpic-1/${t.slug}/`) && localStorage.getItem(k) === '1') subDone++;
          }
        } catch (_) {}
        const percent = subCount > 0 ? Math.round((subDone / subCount) * 100) : (getProgress(t.slug) ? 100 : 0);
        const done = percent === 100;
        const icon = topicIcons[t.slug] || '📘';
        const card = document.createElement('a');
        card.href = relToCurrent(t.path);
        card.className = 'topic-card card';
        card.innerHTML = `
          <div class="card-body">
            <div class="topic-card-top">
              <span class="topic-icon">${icon}</span>
              <span class="topic-index">${String(idx + 1).padStart(2,'0')}</span>
              <span class="topic-title">${t.title}</span>
            </div>
            <div class="topic-progress">
              <div class="bar"><span style="width:${percent}%"></span></div>
              <span class="state">${percent}%</span>
            </div>
          </div>`;
        // Enable CSS accents for completed topics
        card.dataset.done = done ? '1' : '0';
        grid.appendChild(card);
      });
  }

  function relToCurrent(targetPath) {
    // Make links work from both root and nested pages
    const depth = location.pathname.split('/').length - 2; // rough
    if (location.pathname.endsWith('/index.html')) {
      // from root index -> targetPath as-is
      return location.pathname.includes('/lpic-1/') ? `../${targetPath}`.replace(/\/+/g,'/') : targetPath;
    }
    // if already inside lpic-1/*, remove duplicate
    if (location.pathname.includes('/lpic-1/')) return `./${targetPath.split('lpic-1/')[1]}`;
    return targetPath;
  }

  if (isLPICIndex) {
    const input = document.getElementById('topicSearch');
    if (input) input.addEventListener('input', renderTopics);
    renderTopics();
  }

  // Add copy buttons to code blocks
  function enhanceCodeCopy() {
    document.querySelectorAll('pre > code').forEach(code => {
      const pre = code.parentElement;
      if (pre.classList.contains('copy-ready')) return;
      pre.classList.add('copy-ready');
      const btn = document.createElement('button');
      btn.className = 'btn copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(code.innerText);
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 1200);
        } catch (_) {
          btn.textContent = 'Fehler';
          setTimeout(() => (btn.textContent = 'Copy'), 1200);
        }
      });
      pre.appendChild(btn);
    });
  }
  enhanceCodeCopy();

  // Simple quiz logic (single- and multi-select)
  function setupQuizzes() {
    const quizzes = document.querySelectorAll('.quiz');
    quizzes.forEach((quiz) => {
      if (quiz.dataset.ready) return;
      quiz.dataset.ready = '1';
      const options = Array.from(quiz.querySelectorAll('.quiz-option'));
      // Reflect initial selected state and keep .selected styling in sync
      options.forEach((opt) => {
        const input = opt.querySelector('input');
        if (!input) return;
        opt.classList.toggle('selected', input.checked);
        input.addEventListener('change', () => {
          if (input.type === 'radio') {
            options.forEach(o => {
              const i = o.querySelector('input');
              o.classList.toggle('selected', !!i?.checked);
            });
          } else {
            opt.classList.toggle('selected', input.checked);
          }
        });
      });

      const btnCheck = quiz.querySelector('.check-quiz');
      const btnReset = quiz.querySelector('.reset-quiz');
      const feedback = quiz.querySelector('.quiz-feedback');

      const clearState = () => {
        quiz.classList.remove('correct', 'wrong');
        if (feedback) feedback.textContent = '';
      };

      const compute = () => {
        let anySelected = false;
        let ok = true;
        options.forEach((opt) => {
          const input = opt.querySelector('input');
          const selected = !!input?.checked;
          const correct = opt.dataset.correct === '1';
          anySelected = anySelected || selected;
          if (selected !== correct) ok = false;
        });
        return { ok, anySelected };
      };

      btnCheck?.addEventListener('click', (e) => {
        e.preventDefault();
        clearState();
        const { ok, anySelected } = compute();
        if (!anySelected) {
          if (feedback) feedback.textContent = 'Bitte wähle eine Option.';
          return;
        }
        quiz.classList.add(ok ? 'correct' : 'wrong');
        if (feedback) feedback.textContent = ok ? 'Richtig!' : 'Nicht ganz. Prüfe deine Auswahl und versuch es erneut.';
      });

      btnReset?.addEventListener('click', (e) => {
        e.preventDefault();
        options.forEach((opt) => {
          const input = opt.querySelector('input');
          if (input) input.checked = false;
          opt.classList.remove('selected');
        });
        clearState();
      });
    });
  }
  setupQuizzes();

  // Topic pages: prev/next and progress toggle
  function injectPrevNextAndProgress() {
    if (!isTopicPage) return;
    const slug = getSlugFromPath(location.pathname);
    const idx = topics.findIndex(t => t.slug === slug);
    if (idx === -1) return;
    const container = document.querySelector('.content');
    if (!container) return;

    // Progress toggle
    const progWrap = document.createElement('div');
    progWrap.className = 'progress-toggle card block';
    progWrap.innerHTML = `
      <div class="card-body">
        <label class="progress-check">
          <input type="checkbox" id="topicDone"> Kapitel abgeschlossen
        </label>
      </div>`;
    container.insertBefore(progWrap, container.firstElementChild);
    const chk = progWrap.querySelector('#topicDone');
    chk.checked = getProgress(slug);
    chk.addEventListener('change', () => setProgress(slug, chk.checked));

    // Continue CTA: resume last subtopic visit for this topic
    const last = localStorage.getItem(`last:sub:${slug}`);
    if (last) {
      const cont = document.createElement('div');
      cont.className = 'card block';
      cont.innerHTML = `<div class="card-body"><a class="btn primary" href="${relToCurrent(last)}">Fortsetzen</a></div>`;
      container.insertBefore(cont, progWrap.nextElementSibling);
    }

    // Prev/Next nav
    const nav = document.createElement('nav');
    nav.className = 'prev-next card block';
    const prev = topics[idx - 1];
    const next = topics[idx + 1];
    nav.innerHTML = `
      <div class="card-body prev-next-body">
        <a class="btn" ${prev ? `href="${relToCurrent(prev.path)}"` : 'aria-disabled="true"'}>← Vorheriges</a>
        <a class="btn primary" ${next ? `href="${relToCurrent(next.path)}"` : 'aria-disabled="true"'}>Nächstes →</a>
      </div>`;
    container.appendChild(nav);
  }
  injectPrevNextAndProgress();

  // Subtopic pages: prev/next and progress toggle per lesson
  function injectSubtopicPrevNextAndProgress() {
    const subNav = document.querySelector('.toc.subtopics');
    if (!subNav) return;
    const tslug = getTopicSlugForCurrentPath();
    if (!tslug) return;
    // Skip the topic overview page itself
    if (location.pathname.endsWith(`/lpic-1/${tslug}.html`)) return;

    const links = Array.from(subNav.querySelectorAll('a[href]'));
    if (!links.length) return;
    const here = pathKey(location.pathname);
    let idx = links.findIndex((a) => {
      try { const u = new URL(a.getAttribute('href'), location.href); return pathKey(u.pathname) === here; } catch (_) { return false; }
    });
    if (idx === -1) {
      const active = subNav.querySelector('a.active');
      if (active) idx = links.indexOf(active);
    }
    const container = document.querySelector('.content');
    if (!container) return;

    // Progress toggle (per subtopic)
    const progKey = `progress:sub:${here}`;
    const wrap = document.createElement('div');
    wrap.className = 'progress-toggle card block';
    wrap.innerHTML = `
      <div class="card-body">
        <label class="progress-check">
          <input type="checkbox" id="subDone"> Lektion abgeschlossen
        </label>
      </div>`;
    container.insertBefore(wrap, container.firstElementChild);
    const chk2 = wrap.querySelector('#subDone');
    chk2.checked = (localStorage.getItem(progKey) === '1');
    chk2.addEventListener('change', () => {
      try { localStorage.setItem(progKey, chk2.checked ? '1' : '0'); } catch (_) {}
      refreshSubBarProgress();
    });

    // Prev/Next navigation within the subtopic list
    const nav = document.createElement('nav');
    nav.className = 'prev-next card block';
    const prev = links[idx - 1];
    const next = links[idx + 1];
    const hrefOf = (a) => a ? a.getAttribute('href') : null;
    nav.innerHTML = `
      <div class="card-body prev-next-body">
        <a class="btn" ${prev ? `href="${hrefOf(prev)}"` : 'aria-disabled="true"'}>← Vorheriges</a>
        <a class="btn primary" ${next ? `href="${hrefOf(next)}"` : 'aria-disabled="true"'}>Nächstes →</a>
      </div>`;
    container.appendChild(nav);

    // Keyboard shortcuts for prev/next
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'ArrowLeft' && prev) { location.href = hrefOf(prev); }
      if (e.key === 'ArrowRight' && next) { location.href = hrefOf(next); }
    });
  }
  injectSubtopicPrevNextAndProgress();

  // --- Subtopic visit tracking for nicer Unterthemen UI ---
  function pathKey(pathname) {
    // Normalize by removing trailing 'index.html'
    return pathname.replace(/index\.html$/, '');
  }

  function markVisitedSubtopics() {
    const nav = document.querySelector('.toc.subtopics');
    if (!nav) return;
    const here = pathKey(location.pathname);
    // Mark current page as visited
    try { localStorage.setItem(`visited:${here}`, '1'); } catch (_) {}
    // Track last visited subtopic per topic slug (only on subtopic pages)
    const tslug = getTopicSlugForCurrentPath();
    if (tslug && !location.pathname.endsWith(`/lpic-1/${tslug}.html`)) {
      try { localStorage.setItem(`last:sub:${tslug}`, here); } catch (_) {}
    }
    nav.querySelectorAll('a[href]').forEach(a => {
      try {
        const href = a.getAttribute('href');
        const url = new URL(href, location.href);
        const key = `visited:${pathKey(url.pathname)}`;
        // Keeping visited info in storage for future features. CSS no longer
        // visualizes it to keep UI minimal.
        if (localStorage.getItem(key) === '1') {
          // no-op styling-wise
        }
      } catch (_) { /* ignore */ }
    });
  }
  markVisitedSubtopics();

  // Subtopic bar progress meta (X/Y abgeschlossen)
  function refreshSubBarProgress() {
    const src = document.querySelector('.toc.subtopics');
    const bar = document.querySelector('.subtopic-bar');
    if (!src || !bar) return;
    const links = Array.from(src.querySelectorAll('a[href]'));
    let done = 0;
    links.forEach((a) => {
      try {
        const url = new URL(a.getAttribute('href'), location.href);
        if (localStorage.getItem(`progress:sub:${pathKey(url.pathname)}`) === '1') done++;
      } catch (_) {}
    });
    let meta = bar.querySelector('.subprogress');
    if (!meta) {
      meta = document.createElement('div');
      meta.className = 'subprogress';
      const wrap = bar.querySelector('.bar-wrap');
      if (wrap) wrap.appendChild(meta);
    }
    if (meta) meta.textContent = `${done}/${links.length} abgeschlossen`;
  }

  // Normalize Unterthemen cards: ensure nav has .subtopics everywhere
  // and hide only the duplicate sidebar card on desktop
  function normalizeSubtopicsCards() {
    const cards = Array.from(document.querySelectorAll('.card')).filter((c) => {
      const h = c.querySelector('h3');
      return h && /unterthemen/i.test(h.textContent || '');
    });
    cards.forEach((card) => {
      const nav = card.querySelector('nav.toc');
      if (nav && !nav.classList.contains('subtopics')) nav.classList.add('subtopics');
      // Save space on desktop only for the sidebar copy; keep content cards visible
      if (card.closest('.sidebar')) {
        card.classList.add('subtopics-card-hidden');
      }
    });
  }
  normalizeSubtopicsCards();

  // Enhance subtopics with search and autoscroll
  function enhanceSubtopicsUI() {
    const nav = document.querySelector('.toc.subtopics');
    if (!nav || nav.dataset.enhanced) return;
    nav.dataset.enhanced = '1';

    const items = Array.from(nav.querySelectorAll('a'));
    // Ensure a clean text span for consistent truncation if needed
    items.forEach((a) => {
      let titleEl = a.querySelector('.title');
      if (!titleEl) {
        const text = a.textContent.trim();
        a.textContent = '';
        titleEl = document.createElement('span');
        titleEl.className = 'title';
        titleEl.textContent = text;
        a.appendChild(titleEl);
      }
    });

    // Insert filter input above
    const wrap = document.createElement('div');
    wrap.className = 'toc-search';
    wrap.innerHTML = `<input type="search" placeholder="Unterthemen filtern…" aria-label="Unterthemen filtern" />`;
    const input = wrap.querySelector('input');
    const cardBody = nav.closest('.card-body');
    if (cardBody) cardBody.insertBefore(wrap, nav);

    const filter = () => {
      const q = (input.value || '').trim().toLowerCase();
      items.forEach(a => {
        const text = a.textContent.toLowerCase();
        a.style.display = !q || text.includes(q) ? '' : 'none';
      });
    };
    input.addEventListener('input', filter);

    // Autoscroll active into view inside scrollable sidebar
    const active = nav.querySelector('a.active');
    const scrollBox = nav.closest('.sidebar') || nav;
    if (active && scrollBox) {
      active.scrollIntoView({ block: 'center' });
    }
  }
  enhanceSubtopicsUI();

  // Build a top subtopic bar so users don't need to scroll the sidebar
  function buildSubtopicBar() {
    const src = document.querySelector('.toc.subtopics');
    const content = document.querySelector('.content');
    if (!src || !content || content.dataset.subbarReady) return;
    content.dataset.subbarReady = '1';

    const links = Array.from(src.querySelectorAll('a[href]'));
    if (!links.length) return;

    // Persist subtopic count for overview progress
    const tslug = getTopicSlugForCurrentPath();
    if (tslug) { try { localStorage.setItem(`subcount:${tslug}`, String(links.length)); } catch (_) {}
    }

    const bar = document.createElement('div');
    bar.className = 'subtopic-bar';
    bar.innerHTML = `<div class="bar-wrap"><div class="chips"></div></div>`;
    const chips = bar.querySelector('.chips');
    links.forEach((a) => {
      const chip = document.createElement('a');
      chip.href = a.getAttribute('href');
      chip.className = 'chip';
      if (a.classList.contains('active')) chip.classList.add('active');
      const titleText = a.querySelector('.title')?.textContent?.trim() || a.textContent.trim();
      chip.appendChild(document.createTextNode(titleText));
      chips.appendChild(chip);
    });

    // Insert bar before first content block
    content.prepend(bar);

    // Update bar progress meta
    refreshSubBarProgress();

    // Hide all Unterthemen cards on desktop to avoid duplication;
    // CSS will reveal them on mobile (<= 860px)
    document.querySelectorAll('.card h3').forEach((h) => {
      if (/unterthemen/i.test(h.textContent || '')) {
        const card = h.closest('.card');
        if (card) card.classList.add('subtopics-card-hidden');
      }
    });
  }
  buildSubtopicBar();

  // Sidebar visibility rules: keep sidebar always, but on topic pages
  // hide the general LPIC overview card and show only matching subtopics.
  function manageSidebarCards() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    const cards = Array.from(sidebar.querySelectorAll('.card'));
    const normalize = (s) => (s || '')
      .toLowerCase()
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-') // various hyphens to '-'
      .replace(/\s+/g, ' ')
      .trim();
    const findCardByTitle = (needle) => {
      const n = normalize(needle);
      return cards.find(c => {
        const h = c.querySelector('h3');
        const txt = normalize(h?.textContent);
        return txt === n || txt.includes('lpic-1') || txt.includes('lpic - 1') || /lpic.*themen/.test(txt);
      });
    };
    const topicsCard = findCardByTitle('LPIC-1 Themen');
    const toggleKey = 'ui:showTopicsCard';
    let wrap = sidebar.querySelector('.toggle-wrap');
    const ensureToggle = () => {
      if (wrap || !topicsCard) return;
      wrap = document.createElement('div');
      wrap.className = 'toggle-wrap';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn';
      btn.id = 'toggleTopicsCard';
      wrap.appendChild(btn);
      sidebar.insertBefore(wrap, topicsCard);
      btn.addEventListener('click', () => {
        const willShow = topicsCard.classList.contains('hidden');
        topicsCard.classList.toggle('hidden', !willShow);
        localStorage.setItem(toggleKey, willShow ? '1' : '0');
        btn.textContent = willShow ? 'LPIC‑1 Themen ausblenden' : 'LPIC‑1 Themen anzeigen';
      });
    };

    if (isTopicPage) {
      ensureToggle();
      const btn = sidebar.querySelector('#toggleTopicsCard');
      const wantShow = localStorage.getItem(toggleKey) === '1';
      if (topicsCard) topicsCard.classList.toggle('hidden', !wantShow);
      if (btn) btn.textContent = wantShow ? 'LPIC‑1 Themen ausblenden' : 'LPIC‑1 Themen anzeigen';

      // If on desktop and the sidebar has no visible cards (e.g., only a hidden
      // Unterthemen card), default to focus mode to maximize space. Respect any
      // prior user choice if set.
      const desktop = window.matchMedia('(min-width: 861px)').matches;
      const visibleCards = cards.filter(c => !c.classList.contains('hidden') && !c.classList.contains('subtopics-card-hidden'));
      if (desktop && visibleCards.length === 0) {
        const slug = getSlugFromPath(location.pathname);
        const fmKey = `ui:focusMode:${slug}`;
        const hasPref = localStorage.getItem(fmKey);
        if (!hasPref) {
          localStorage.setItem(fmKey, '1');
          document.body.classList.add('focus-mode');
        }
      }
    } else {
      // On non-topic pages remove toggle and always show the topics card
      topicsCard?.classList.remove('hidden');
      if (wrap) wrap.remove();
    }
  }
  manageSidebarCards();

  // Focus mode: hide sidebar and expand content, with per-topic persistence
  function injectFocusModeToggle() {
    if (!isTopicPage) return;
    const layout = document.querySelector('.layout');
    if (!layout || layout.dataset.focusReady) return;
    layout.dataset.focusReady = '1';

    const slug = getSlugFromPath(location.pathname);
    const fmKey = `ui:focusMode:${slug}`;
    const want = localStorage.getItem(fmKey) === '1';
    document.body.classList.toggle('focus-mode', want);

    const fab = document.createElement('div');
    fab.className = 'nav-fab';
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.id = 'focusToggle';
    btn.setAttribute('aria-pressed', want ? 'true' : 'false');
    btn.title = 'Fokusmodus umschalten';
    btn.textContent = want ? 'Fokus aus' : 'Fokus an';
    fab.appendChild(btn);
    document.body.appendChild(fab);

    btn.addEventListener('click', () => {
      const next = !document.body.classList.contains('focus-mode');
      document.body.classList.toggle('focus-mode', next);
      localStorage.setItem(fmKey, next ? '1' : '0');
      btn.textContent = next ? 'Fokus aus' : 'Fokus an';
      btn.setAttribute('aria-pressed', next ? 'true' : 'false');
    });
  }
  injectFocusModeToggle();

  // Smooth anchor scrolling (respect reduced motion)
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  });

  // Back to top button behavior
  const backTop = document.querySelector('.back-to-top');
  if (backTop) {
    const toggle = () => {
      const show = window.scrollY > 400;
      backTop.classList.toggle('show', show);
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    backTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }
})();

// COPY BUTTONS for code blocks
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1200);
      } catch (e) {
        console.error(e);
      }
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
});
// PROGRESS: store a per-page completion flag
(function() {
  const key = 'pageDone:' + location.pathname.replace(/index\.html$/, '');
  const box = document.getElementById('pageComplete');
  if (box) {
    // init
    box.checked = localStorage.getItem(key) === 'true';
    box.addEventListener('change', () => {
      localStorage.setItem(key, box.checked ? 'true' : 'false');
      // fire event for the Fortschritt page
      window.dispatchEvent(new Event('progress-changed'));
    });
  }
})();

// ====== ENHANCEMENTS START ======

// Anchor links for headings (h2,h3)
(function() {
  function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9äöüß\s-]/g,'').replace(/\s+/g,'-');
  }
  document.querySelectorAll('main h2, main h3').forEach(h => {
    if (!h.id) h.id = slugify(h.textContent);
    if (!h.querySelector('.anchor')) {
      const a = document.createElement('a');
      a.className = 'anchor';
      a.href = '#' + h.id;
      a.setAttribute('aria-label', 'Permalink');
      a.textContent = '§';
      h.appendChild(a);
    }
  });
})();

// Auto Table of Contents
(function() {
  const container = document.querySelector('.sidebar .toc') || document.querySelector('.toc-auto .toc');
  if (!container) return;
  const list = document.createElement('ul');
  document.querySelectorAll('main h2, main h3').forEach(h => {
    const li = document.createElement('li');
    li.className = h.tagName.toLowerCase();
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.replace('§','').trim();
    li.appendChild(a);
    list.appendChild(li);
  });
  container.innerHTML = '';
  container.appendChild(list);
})();

// Keyboard shortcuts
(function() {
  const prev = document.querySelector('a[rel="prev"]');
  const next = document.querySelector('a[rel="next"]');
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && prev) { location.href = prev.href; }
    if (e.key === 'ArrowRight' && next) { location.href = next.href; }
    if (e.key === '/' && document.getElementById('q')) {
      e.preventDefault(); document.getElementById('q').focus();
    }
    if (e.key === '?' && !document.getElementById('helpOverlay')) {
      window.showHelpOverlay && window.showHelpOverlay();
    }
  });
})();

// Quiz engine (works with details/summary blocks)
(function() {
  function initQuizCard(card) {
    if (card.dataset.quizInited) return;
    card.dataset.quizInited = '1';
    const body = card.querySelector('.card-body') || card;
    let ol = card.querySelector('ol');
    if (ol && !ol.querySelector('input[type="radio"]')) {
      const name = 'q' + Math.random().toString(36).slice(2);
      const items = Array.from(ol.querySelectorAll('li'));
      ol.innerHTML = '';
      items.forEach((li, idx) => {
        const id = name + '_' + idx;
        const label = document.createElement('label');
        label.style.display = 'block';
        const input = document.createElement('input');
        input.type = 'radio'; input.name = name; input.value = idx; input.id = id;
        label.appendChild(input);
        const span = document.createElement('span');
        span.textContent = li.textContent.replace(/^\s*[A-E]\.\s*/,'').trim();
        label.appendChild(span);
        const liNew = document.createElement('li');
        liNew.appendChild(label);
        ol.appendChild(liNew);
      });
    }
    if (!card.querySelector('.quiz-submit')) {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn quiz-submit';
      btn.textContent = 'Auswerten';
      const fb = document.createElement('div'); fb.className = 'quiz-feedback muted'; fb.style.marginTop = '8px';
      body.appendChild(btn); body.appendChild(fb);
      btn.addEventListener('click', () => {
        const sol = card.querySelector('details');
        let correctIdx = null;
        if (sol) {
          const m = sol.textContent.match(/Richtig:\s*([A-E])/i);
          if (m) correctIdx = 'ABCDE'.indexOf(m[1].toUpperCase());
        }
        const chosen = card.querySelector('input[type="radio"]:checked');
        if (correctIdx == null) { fb.textContent = 'Lösungstext nicht gefunden.'; return; }
        if (!chosen) { fb.textContent = 'Bitte eine Antwort wählen.'; return; }
        const idx = parseInt(chosen.value,10);
        fb.textContent = (idx === correctIdx) ? '✅ Korrekt!' : '❌ Nicht ganz. Schau dir die Erklärung an.';
        if (sol) sol.open = true;
      });
    }
  }
  document.querySelectorAll('.card').forEach(card => {
    if (card.querySelector('summary') && /Lösung anzeigen/i.test(card.textContent)) {
      initQuizCard(card);
    }
  });
})();

// Help overlay
window.showHelpOverlay = function() {
  const id = 'helpOverlay';
  if (document.getElementById(id)) return;
  const o = document.createElement('div');
  o.id = id;
  o.style.position='fixed'; o.style.inset='0'; o.style.background='rgba(0,0,0,.6)'; o.style.zIndex='1000';
  const panel = document.createElement('div');
  panel.style.maxWidth='720px'; panel.style.margin='10vh auto'; panel.style.background='var(--panel)'; panel.style.color='var(--text)'; panel.style.padding='20px'; panel.style.borderRadius='16px';
  panel.innerHTML = '<h3>Tastenkürzel & Tipps</h3><ul>' +
    '<li><strong>←/→</strong> Vor/Zurück zwischen Seiten</li>' +
    '<li><strong>/</strong> Suche fokussieren</li>' +
    '<li><strong>?</strong> Hilfe anzeigen</li>' +
    '<li><strong>Copy</strong>-Button in Codeblöcken für die Zwischenablage</li>' +
    '</ul><p><button class="btn" id="helpClose">Schließen</button></p>';
  o.appendChild(panel);
  document.body.appendChild(o);
  document.getElementById('helpClose').addEventListener('click', () => o.remove());
};

// PWA register
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/assets/js/sw.js').catch(console.error);
  });
}

// ====== ENHANCEMENTS END ======
