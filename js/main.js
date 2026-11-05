/* ==========================================================================
   MAIN: the operating system. Boot, menus, display settings, screensaver,
   crash screen, power button, draggable windows and the other nonsense.
   ========================================================================== */
window.WOS = (function () {
  const P = window.PORTFOLIO;
  const html = document.documentElement;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  const state = {
    phosphor: html.dataset.phosphor || 'green',
    room: html.dataset.room || 'light',
    crt: html.classList.contains('crt-on'),
    turbo: false,
    sound: false,
  };
  const PHOSPHORS = ['green', 'amber', 'ice', 'pink'];
  let nameFx = null;
  const api = { state, busy: false, act, beep, toast };

  function save() {
    try {
      const { phosphor, room, crt, sound } = state;
      localStorage.setItem('waltonos', JSON.stringify({ phosphor, room, crt, sound }));
    } catch (e) { /* private window: settings just won't stick */ }
  }

  /* -------------------------------------------------------------- PC speaker */
  let audio = null;
  function beep(freq, dur, vol) {
    if (!state.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'square';
      o.frequency.value = freq || 880;
      g.gain.value = vol || 0.03;
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + (dur || 0.06));
    } catch (e) { /* no audio, no problem */ }
  }

  /* ------------------------------------------------------------------ toasts */
  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').append(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* --------------------------------------------------------- settings + acts */
  function syncMenus() {
    $$('[data-act="phosphor"]').forEach((b) => b.setAttribute('aria-checked', b.dataset.arg === state.phosphor));
    const check = (name, v) => { const b = $(`[data-act="${name}"]`); if (b) b.setAttribute('aria-checked', v); };
    check('crt', state.crt);
    check('lights', state.room === 'dark');
    check('turbo', state.turbo);
    check('sound', state.sound);
  }

  function setPhosphor(p) {
    state.phosphor = p;
    html.dataset.phosphor = p;
    $('.knob i').style.setProperty('--turn', PHOSPHORS.indexOf(p) * 90 + 'deg');
    if (nameFx) nameFx.refresh();
    save();
  }

  function setTurbo(on) {
    state.turbo = on;
    html.classList.toggle('turbo', on);
    FX.speed = on ? 2.4 : 1;
    $('#turboSeg').textContent = on ? '66' : '33';
    $('#turboBtn').setAttribute('aria-pressed', on);
    $$('.flow').forEach((f) => f.dispatchEvent(new Event('wos:speed')));
    beep(on ? 1200 : 400, 0.08);
    if (on) toast('TURBO ENGAGED. 66 MHz. Please hold on to something.');
  }

  function act(name, arg) {
    switch (name) {
      case 'phosphor': setPhosphor(arg); break;
      case 'crt':
        state.crt = !state.crt;
        html.classList.toggle('crt-on', state.crt);
        save();
        break;
      case 'lights':
        state.room = state.room === 'dark' ? 'light' : 'dark';
        html.dataset.room = state.room;
        beep(180, 0.03);
        save();
        break;
      case 'turbo': setTurbo(!state.turbo); break;
      case 'sound':
        state.sound = !state.sound;
        beep(1000, 0.08);
        save();
        break;
      case 'about': $('#aboutDlg').showModal(); break;
      case 'snake': Terminal.startSnake(); break;
      case 'saver': startSaver(); break;
      case 'crash': crash(); break;
      case 'reboot': boot(true); break;
      case 'power': powerOff(); break;
    }
    syncMenus();
  }

  /* -------------------------------------------------------------------- boot */
  const BOOT_LINES = [
    'WALTON BIOS v26.05   (C) 2022-2026 Walton Prest',
    '',
    'CPU : 1x Walton, full-stack, caffeine cooled',
    '@MEM',
    '',
    'Detecting drives...',
    '  C: C# + ASP.NET MVC ........... OK',
    '  D: SQL Server ................. OK',
    '  E: Entity Framework ........... OK',
    '  F: Firebase ................... OK',
    '',
    'Loading PROJECTS.SYS ............ OK',
    'Starting WaltonOS 26.05 ...',
  ];

  let booting = false;
  function boot(force) {
    if (booting) return Promise.resolve();
    let seen = false;
    try { seen = sessionStorage.getItem('waltonos-booted') === '1'; } catch (e) {}
    const el = $('#boot'), text = $('#bootText');
    if (!force && (seen || FX.reduced)) {
      html.classList.remove('booting');
      el.style.display = 'none';
      afterBoot(false);
      return Promise.resolve();
    }
    booting = true;
    html.classList.add('booting');
    el.style.display = '';
    el.classList.remove('boot--off');
    text.textContent = '';
    window.scrollTo({ top: 0, behavior: 'instant' });

    return new Promise((resolve) => {
      let i = 0, done = false, t = 0;
      const lines = [];
      function finish() {
        if (done) return;
        done = true;
        clearTimeout(t);
        window.removeEventListener('keydown', finish, true);
        window.removeEventListener('pointerdown', finish, true);
        try { sessionStorage.setItem('waltonos-booted', '1'); } catch (e) {}
        beep(990, 0.09);
        el.classList.add('boot--off');
        setTimeout(() => {
          el.style.display = 'none';
          html.classList.remove('booting');
          booting = false;
          afterBoot(true);
          resolve();
        }, 420);
      }
      window.addEventListener('keydown', finish, true);
      window.addEventListener('pointerdown', finish, true);

      function memTest(cb) {
        let k = 0;
        const row = lines.length;
        lines.push('');
        (function count() {
          k += 64;
          lines[row] = `MEM : ${String(Math.min(k, 640)).padStart(3, ' ')}K ${k >= 640 ? 'OK' : ''}`;
          text.textContent = lines.join('\n');
          if (k < 640) t = setTimeout(count, 34);
          else t = setTimeout(cb, 90);
        })();
      }
      (function next() {
        if (done) return;
        if (i >= BOOT_LINES.length) { t = setTimeout(finish, 280); return; }
        const line = BOOT_LINES[i++];
        if (line === '@MEM') return memTest(next);
        lines.push(line);
        text.textContent = lines.join('\n');
        beep(240 + i * 30, 0.012, 0.012);
        t = setTimeout(next, line ? 95 : 40);
      })();
    });
  }

  function afterBoot(animate) {
    if (nameFx && animate) nameFx.assemble();
    Render.drawTraces();
  }

  /* ------------------------------------------------------------------- menus */
  function initMenus() {
    const menus = $$('[data-menu]');
    const closeAll = () => menus.forEach((m) => {
      $('.menu__btn', m).setAttribute('aria-expanded', 'false');
      $('.menu__drop', m).hidden = true;
    });
    menus.forEach((m) => {
      const btn = $('.menu__btn', m), drop = $('.menu__drop', m);
      const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
      const open = () => {
        closeAll();
        btn.setAttribute('aria-expanded', 'true');
        drop.hidden = false;
      };
      let hoverOpenedAt = -1e9;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Sliding onto a menu already opens it, so the click that follows shouldn't close it again.
        if (isOpen() && performance.now() - hoverOpenedAt < 400) return;
        if (isOpen()) closeAll(); else open();
      });
      btn.addEventListener('pointerenter', () => {
        const anyOpen = menus.some((x) => $('.menu__btn', x).getAttribute('aria-expanded') === 'true');
        if (anyOpen && !isOpen()) { open(); hoverOpenedAt = performance.now(); }
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (drop.hidden) btn.click();
          const first = $('button,a', drop);
          if (first) first.focus();
        }
      });
      drop.addEventListener('keydown', (e) => {
        const items = $$('button,a', drop), i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        if (e.key === 'Escape') { closeAll(); btn.focus(); }
      });
      drop.addEventListener('click', (e) => {
        if (e.target.closest('button,a')) closeAll();
      });
    });
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });

    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b) act(b.dataset.act, b.dataset.arg);
    });
  }

  /* -------------------------------------------------------------- status bar */
  function initStatus() {
    const clock = $('#clock');
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 15000);

    const bar = $('#loadBar'), pct = $('#loadPct');
    let pending = false;
    const update = () => {
      pending = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const v = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.style.transform = `scaleX(${v})`;
      pct.textContent = Math.round(v * 100) + '%';
    };
    addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();

    const path = $('#sysPath');
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) path.textContent = e.target.dataset.path; });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('[data-path]').forEach((s) => io.observe(s));
  }

  /* ----------------------------------------------------------------- windows */
  function initWindows() {
    let z = 5;
    $$('[data-shade]').forEach((b) => {
      b.addEventListener('click', () => {
        const w = b.closest('.win');
        const shaded = w.classList.toggle('win--shade');
        b.setAttribute('aria-expanded', !shaded);
        beep(shaded ? 500 : 700, 0.03);
      });
    });
    const canDrag = () => matchMedia('(min-width: 1021px) and (pointer: fine)').matches;
    $$('.win--drag').forEach((w) => {
      const bar = $('.win__bar', w);
      let sx = 0, sy = 0, x = 0, y = 0, on = false;
      w.addEventListener('pointerdown', () => { w.style.zIndex = ++z; });
      bar.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button') || !canDrag()) return;
        on = true;
        sx = e.clientX - x; sy = e.clientY - y;
        bar.setPointerCapture(e.pointerId);
        w.classList.add('dragging');
      });
      bar.addEventListener('pointermove', (e) => {
        if (!on) return;
        const homeTop = w.getBoundingClientRect().top - y;
        x = e.clientX - sx; y = e.clientY - sy;
        // Keep the title bar reachable, just below the menu bar.
        if (y < 36 - homeTop) y = 36 - homeTop;
        w.style.transform = `translate(${x}px, ${y}px)`;
      });
      const stop = () => { on = false; w.classList.remove('dragging'); };
      bar.addEventListener('pointerup', stop);
      bar.addEventListener('pointercancel', stop);
      bar.addEventListener('dblclick', (e) => {
        if (e.target.closest('button')) return;
        x = y = 0;
        w.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------- screensaver */
  let saverRaf = 0, saverOn = false;
  function startSaver() {
    if (saverOn) return;
    saverOn = true;
    const el = $('#saver'), logo = $('#saverLogo'), count = $('#saverCount');
    el.hidden = false;
    const colors = ['#69ffa6', '#ffb72b', '#8fe3ff', '#ff7ac6', '#f2542d', '#fbf7ea'];
    let x = Math.random() * (innerWidth - 200), y = Math.random() * (innerHeight - 120);
    let vx = 2.2, vy = 1.8, c = 0, corners = 0;
    count.textContent = 'Corner hits: 0';
    logo.style.color = colors[0];
    const started = performance.now();
    function frame() {
      const w = logo.offsetWidth, h = logo.offsetHeight;
      x += vx; y += vy;
      let hitX = false, hitY = false;
      if (x <= 0 || x + w >= innerWidth) { vx = -vx; x = Math.max(0, Math.min(x, innerWidth - w)); hitX = true; }
      if (y <= 0 || y + h >= innerHeight) { vy = -vy; y = Math.max(0, Math.min(y, innerHeight - h)); hitY = true; }
      if (hitX || hitY) {
        c = (c + 1) % colors.length;
        logo.style.color = colors[c];
        if (hitX && hitY) {
          corners++;
          count.textContent = `Corner hits: ${corners}`;
          beep(1320, 0.1);
        }
      }
      logo.style.transform = `translate(${x}px, ${y}px)`;
      saverRaf = requestAnimationFrame(frame);
    }
    saverRaf = requestAnimationFrame(frame);

    let ox = null, oy = null;
    function stop(e) {
      if (performance.now() - started < 500) return;
      if (e.type === 'pointermove') {
        if (ox === null) { ox = e.clientX; oy = e.clientY; return; }
        if (Math.hypot(e.clientX - ox, e.clientY - oy) < 12) return;
      }
      e.stopPropagation();
      saverOn = false;
      cancelAnimationFrame(saverRaf);
      el.hidden = true;
      ['pointermove', 'pointerdown', 'keydown'].forEach((t) => removeEventListener(t, stop, true));
      resetIdle();
    }
    ['pointermove', 'pointerdown', 'keydown'].forEach((t) => addEventListener(t, stop, true));
  }

  const IDLE_MS = 90000;
  let idleTimer = 0;
  function resetIdle() {
    clearTimeout(idleTimer);
    if (FX.reduced) return;
    idleTimer = setTimeout(() => {
      if (api.busy || booting || document.hidden || saverOn || $('dialog[open]') || document.activeElement === $('#termInput')) return resetIdle();
      startSaver();
    }, IDLE_MS);
  }

  /* ------------------------------------------------------------------- crash */
  function crash() {
    const el = $('#bsod');
    el.hidden = false;
    api.busy = true;
    beep(120, 0.4);
    setTimeout(() => {
      function wake(e) {
        e.preventDefault();
        e.stopPropagation();
        removeEventListener('keydown', wake, true);
        removeEventListener('pointerdown', wake, true);
        el.hidden = true;
        api.busy = false;
        boot(true);
      }
      addEventListener('keydown', wake, true);
      addEventListener('pointerdown', wake, true);
    }, 400);
  }

  /* ------------------------------------------------------------------- power */
  function powerOff() {
    const main = $('#main');
    api.busy = true;
    html.classList.add('poweroff');
    main.style.transformOrigin = `50% ${scrollY + innerHeight / 2}px`;
    beep(300, 0.2);
    const delay = FX.reduced ? 0 : 560;
    setTimeout(() => {
      $('#powerOff').hidden = false;
      setTimeout(() => {
        function on(e) {
          e.preventDefault();
          e.stopPropagation();
          removeEventListener('keydown', on, true);
          removeEventListener('pointerdown', on, true);
          $('#powerOff').hidden = true;
          html.classList.remove('poweroff');
          main.style.transformOrigin = '';
          api.busy = false;
          boot(true);
        }
        addEventListener('keydown', on, true);
        addEventListener('pointerdown', on, true);
      }, 300);
    }, delay);
  }

  /* ------------------------------------------------------------------ konami */
  function initKonami() {
    const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let i = 0;
    addEventListener('keydown', (e) => {
      if (api.busy) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === code[i] ? i + 1 : (k === code[0] ? 1 : 0);
      if (i === code.length) { i = 0; party(); }
    });
  }
  function party() {
    if (!state.turbo) setTurbo(true);
    syncMenus();
    toast('30 extra disks awarded.');
    const colors = ['var(--red)', 'var(--pink)', 'var(--blue)', 'var(--green)', 'var(--yellow)', 'var(--orange)'];
    for (let n = 0; n < 30; n++) {
      const d = document.createElement('div');
      d.className = 'fall';
      d.style.left = Math.random() * 100 + 'vw';
      d.style.background = colors[n % colors.length];
      d.style.animationDelay = Math.random() * 1.6 + 's';
      d.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      document.body.append(d);
      setTimeout(() => d.remove(), 5200);
    }
    [523, 659, 784, 1047].forEach((f, n) => setTimeout(() => beep(f, 0.09), n * 90));
  }

  /* --------------------------------------------------------- one-off widgets */
  function initTaglines() {
    const el = $('#tagline');
    const lines = P.taglines;
    if (FX.reduced) { el.textContent = lines[0]; return; }
    let i = 0, c = 0, del = false;
    (function type() {
      const s = lines[i];
      el.textContent = s.slice(0, c);
      let wait = del ? 22 : 48 + Math.random() * 50;
      if (!del && c === s.length) { del = true; wait = 2200; }
      else if (del && c === 0) { del = false; i = (i + 1) % lines.length; wait = 280; }
      c += del ? -1 : 1;
      if (c < 0) c = 0;
      setTimeout(type, wait / FX.speed);
    })();
  }

  function initScrollFx() {
    const reveal = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        reveal.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((r) => reveal.observe(r));

    // Feeds the printout out of the printer the first time it's seen.
    const paper = $('#paper');
    new IntersectionObserver((es, o) => {
      if (es[0].isIntersecting) { paper.classList.add('fed'); o.disconnect(); chatter(10); }
    }, { rootMargin: '0px 0px -12% 0px' }).observe(paper);

    // Count-up on the migration widget.
    $$('[data-migration]').forEach((m) => {
      const num = $('[data-count]', m), end = +num.dataset.count;
      new IntersectionObserver((es, o) => {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        m.classList.add('run');
        if (FX.reduced) return;
        const t0 = performance.now(), dur = 1500;
        (function up(t) {
          const k = Math.min(1, (t - t0) / dur);
          num.textContent = Math.round(end * k);
          if (k < 1) requestAnimationFrame(up);
        })(t0);
      }, { threshold: 0.5 }).observe(m);
    });

    // Receipt printer.
    $$('[data-receipt]').forEach((r) => {
      const print = () => {
        r.classList.remove('printing');
        void r.offsetWidth;
        r.classList.add('printing');
        chatter(16);
      };
      new IntersectionObserver((es, o) => {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        print();
      }, { threshold: 0.3 }).observe(r);
      $('[data-reprint]', r).addEventListener('click', print);
    });
  }
  function chatter(n) {
    if (!state.sound) return;
    for (let i = 0; i < n; i++) setTimeout(() => beep(900 + (i % 3) * 180, 0.012, 0.012), i * 70);
  }

  function initMisc() {
    // Keyboard keys in a project window jump to that chip on the circuit board.
    document.addEventListener('click', (e) => {
      const k = e.target.closest('[data-skill]');
      if (!k) return;
      Render.selectSkill(k.dataset.skill);
      $('#skills').scrollIntoView({ block: 'start' });
    });

    $('#copyMail').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(P.email);
        toast('Address copied to the clipboard.');
      } catch (e) {
        toast(P.email);
      }
    });

    const turbo = $('#turboBtn');
    turbo.addEventListener('click', () => act('turbo'));

    $('#knob').addEventListener('click', () => {
      const n = PHOSPHORS[(PHOSPHORS.indexOf(state.phosphor) + 1) % PHOSPHORS.length];
      act('phosphor', n);
      beep(700, 0.02);
    });

    ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach((t) => addEventListener(t, resetIdle, { passive: true }));
    resetIdle();

    console.log(
      '%c WaltonOS 26.05 %c\nYou opened the console. We should probably talk: ' + P.email + '\nTry window.WOS.act("crash") if you are feeling brave.',
      'background:#14110d;color:#69ffa6;font:700 14px monospace;padding:4px 8px',
      'color:inherit;font:12px monospace'
    );
  }

  /* -------------------------------------------------------------------- init */
  function init() {
    Render.all();
    Terminal.init();
    nameFx = FX.PixelName($('#nameCanvas'), $('#crtScreen'));
    initMenus();
    initStatus();
    initWindows();
    initKonami();
    initTaglines();
    initScrollFx();
    initMisc();
    try {
      const saved = JSON.parse(localStorage.getItem('waltonos') || '{}');
      if (saved.sound) state.sound = true;
    } catch (e) {}
    setPhosphor(state.phosphor);
    syncMenus();
    boot(false);
  }

  window.WOS = api;
  init();
  return api;
})();
