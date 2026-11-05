/* ==========================================================================
   FX: the canvas toys
   - PixelName: the name on the big monitor, made of pixels you can shove around
   - DoomFire: the wildfire banner (the classic PSX DOOM fire algorithm)
   - Static: TV noise behind the NO SIGNAL screens
   ========================================================================== */
window.FX = (function () {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const api = { reduced, speed: 1 };

  /* Runs a frame callback only while the element is on screen and the tab is visible. */
  function loop(el, frame, fps) {
    let raf = 0, last = 0, seen = false, enabled = true;
    const target = fps || 60;
    function tick(t) {
      raf = requestAnimationFrame(tick);
      if (t - last < 1000 / (target * api.speed)) return;
      last = t;
      frame(t);
    }
    function sync() {
      const want = seen && enabled && !document.hidden;
      if (want && !raf) raf = requestAnimationFrame(tick);
      else if (!want && raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    new IntersectionObserver((entries) => {
      seen = entries[entries.length - 1].isIntersecting;
      sync();
    }, { rootMargin: '120px' }).observe(el);
    document.addEventListener('visibilitychange', sync);
    return { pause() { enabled = false; sync(); }, resume() { enabled = true; sync(); } };
  }
  api.loop = loop;

  function phosphor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--phos').trim() || '#69ffa6';
  }

  /* ---------------------------------------------------------------- PixelName */
  const GLYPHS = {
    W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
    A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    N: ['10001', '11001', '10101', '10101', '10011', '10001', '10001'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    '#': ['11111', '11111', '11111', '11111', '11111', '11111', '11111'], // the block cursor
  };

  api.PixelName = function (canvas, surface) {
    const ctx = canvas.getContext('2d');
    const rows = ['WALTON', 'PREST#']; // "PREST" + block cursor is exactly as wide as "WALTON"
    let W = 0, H = 0, ps = [], size = 3, cell = 10, color = phosphor(), R = 60;
    const ptr = { x: -1e4, y: -1e4 };
    let glitch = null, nextGlitch = 2500, energy = 1, lastBlink = true;

    function build() {
      const r = surface.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = 35, lines = 16; // 6 letters of 5 + 5 gaps; 2 rows of 7 + a 2 cell gap
      cell = Math.min((W * 0.86) / cols, (H * 0.62) / lines);
      const sub = cell >= 12 ? 3 : 2;
      size = cell / sub;
      R = cell * 3.4;
      const ox = (W - cols * cell) / 2;
      const oy = (H - lines * cell) / 2 - H * 0.015;

      const next = [];
      rows.forEach((row, ri) => {
        [...row].forEach((ch, ci) => {
          GLYPHS[ch].forEach((bits, gy) => {
            [...bits].forEach((bit, gx) => {
              if (bit !== '1') return;
              for (let sx = 0; sx < sub; sx++) for (let sy = 0; sy < sub; sy++) {
                const hx = ox + (ci * 6 + gx) * cell + sx * size;
                const hy = oy + (ri * 9 + gy) * cell + sy * size;
                next.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, blink: ch === '#' });
              }
            });
          });
        });
      });
      ps = next;
      energy = 1;
    }

    function draw(blinkOn) {
      ctx.clearRect(0, 0, W, H);
      const pad = size * 0.9;
      const glow = new Path2D(), core = new Path2D();
      for (const p of ps) {
        if (p.blink && !blinkOn) continue;
        const off = glitch && p.hy > glitch.a && p.hy < glitch.b ? glitch.dx : 0;
        glow.rect(p.x + off - pad / 2, p.y - pad / 2, size + pad, size + pad);
        core.rect(p.x + off, p.y, size - 0.5, size - 0.5);
      }
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.14;
      ctx.fill(glow);
      ctx.globalAlpha = 1;
      ctx.fill(core);
    }

    function step(t) {
      const speed = api.speed > 1 ? 1.35 : 1;
      let e = 0;
      for (const p of ps) {
        const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < R * R && d2 > 0.01) {
          const d = Math.sqrt(d2), f = (1 - d / R) * 3.2 * speed;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx = (p.vx + (p.hx - p.x) * 0.075 * speed) * 0.8;
        p.vy = (p.vy + (p.hy - p.y) * 0.075 * speed) * 0.8;
        p.x += p.vx;
        p.y += p.vy;
        e += Math.abs(p.vx) + Math.abs(p.vy);
      }
      energy = e;

      nextGlitch -= 16;
      if (nextGlitch <= 0 && !glitch) {
        const a = Math.random() * H;
        glitch = { a, b: a + cell * (1 + Math.random() * 3), dx: (Math.random() - 0.5) * cell * 3, until: t + 110 };
        nextGlitch = 2400 + Math.random() * 4200;
      }
      if (glitch && t > glitch.until) { glitch = null; energy = 1; }

      const blinkOn = Math.floor(t / 560) % 2 === 0;
      if (energy > 0.4 || glitch || blinkOn !== lastBlink) draw(blinkOn);
      lastBlink = blinkOn;
    }

    if (!api.reduced) loop(surface, step, 60);
    const self = {
      refresh() { color = phosphor(); energy = 1; if (api.reduced) draw(true); else draw(lastBlink); },
      /* Fly in from random positions. */
      assemble() {
        if (api.reduced) return;
        for (const p of ps) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = p.vy = 0;
        }
        energy = 1;
      },
      blast(x, y) {
        if (api.reduced) return;
        for (const p of ps) {
          const dx = p.x - x, dy = p.y - y, d = Math.hypot(dx, dy) + 1;
          const f = Math.min(40, 2600 / d);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        energy = 1;
      },
    };

    surface.addEventListener('pointermove', (e) => {
      const r = surface.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
    });
    surface.addEventListener('pointerleave', () => { ptr.x = ptr.y = -1e4; });
    surface.addEventListener('pointerdown', (e) => {
      const r = surface.getBoundingClientRect();
      self.blast(e.clientX - r.left, e.clientY - r.top);
    });
    new ResizeObserver(() => { build(); draw(true); }).observe(surface);
    build();
    draw(true);
    return self;
  };

  /* ----------------------------------------------------------------- DoomFire */
  const MAX = 36;
  /* Black, through deep red and orange, up to white hot. [heat, r, g, b] */
  const FIRE_STOPS = [[0, 7, 7, 7], [5, 44, 8, 6], [11, 128, 20, 8], [17, 208, 50, 10], [23, 242, 104, 16], [29, 252, 168, 30], [33, 255, 226, 110], [36, 255, 255, 235]];
  function fireColor(i) {
    let k = 0;
    while (k < FIRE_STOPS.length - 2 && i > FIRE_STOPS[k + 1][0]) k++;
    const a = FIRE_STOPS[k], b = FIRE_STOPS[k + 1], t = (i - a[0]) / (b[0] - a[0]);
    const mix = (n) => Math.round(a[n] + (b[n] - a[n]) * t);
    return 0xff000000 | (mix(3) << 16) | (mix(2) << 8) | mix(1);
  }

  api.DoomFire = function (canvas, surface, onSaved) {
    const PX = 6; // CSS pixels per fire pixel
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, px = null, cool = null, img = null, buf = null, saved = 0, extraDecay = 0;
    const lut = new Uint32Array(MAX + 1);
    for (let i = 0; i <= MAX; i++) lut[i] = fireColor(i);

    function build() {
      const r = surface.getBoundingClientRect();
      const nw = Math.max(20, Math.ceil(r.width / PX)), nh = Math.max(12, Math.ceil(r.height / PX));
      if (nw === W && nh === H) return;
      W = nw; H = nh;
      canvas.width = W; canvas.height = H;
      px = new Uint8Array(W * H);
      cool = new Float32Array(W);
      img = ctx.createImageData(W, H);
      buf = new Uint32Array(img.data.buffer);
      // Flames should reach about 70% of the way up, whatever size the banner is.
      extraDecay = Math.max(0, MAX / (H * 0.7) - 1 / 3);
      // Start already burning rather than growing from nothing.
      for (let i = 0; i < H + 12; i++) simulate();
      paint();
    }

    function simulate() {
      const base = H * W - W;
      for (let x = 0; x < W; x++) {
        // A little variation in the source row keeps the flames from being one flat wall.
        const v = MAX * (1 - cool[x]);
        px[base + x] = Math.max(0, Math.min(MAX, v - (Math.random() < 0.06 ? 6 : 0)));
        cool[x] *= 0.985;
      }
      for (let x = 0; x < W; x++) {
        for (let y = 1; y < H; y++) {
          const src = y * W + x, p = px[src];
          if (p === 0) { px[src - W] = 0; continue; }
          const rnd = (Math.random() * 3) & 3;
          let dst = src - rnd + 1 - W;
          if (dst < 0) dst = 0;
          px[dst] = Math.max(0, p - (rnd & 1) - (Math.random() < extraDecay ? 1 : 0));
        }
      }
    }
    function paint() {
      for (let i = 0; i < px.length; i++) buf[i] = lut[px[i]];
      ctx.putImageData(img, 0, 0);
    }
    function step() { simulate(); paint(); }

    function mitigate(e) {
      const r = surface.getBoundingClientRect();
      const cx = (e.clientX - r.left) / PX, cy = (e.clientY - r.top) / PX;
      const rad = 7;
      let hit = 0;
      for (let y = Math.max(0, Math.floor(cy - rad)); y < Math.min(H, cy + rad); y++) {
        for (let x = Math.max(0, Math.floor(cx - rad)); x < Math.min(W, cx + rad); x++) {
          if ((x - cx) ** 2 + (y - cy) ** 2 < rad * rad) {
            const i = y * W + x;
            if (px[i]) { px[i] = 0; hit++; }
          }
        }
      }
      for (let x = Math.max(0, Math.floor(cx - rad)); x < Math.min(W, cx + rad); x++) cool[x] = 1;
      if (hit) { saved += hit; if (onSaved) onSaved(saved); }
    }

    build();
    new ResizeObserver(build).observe(surface);
    surface.addEventListener('pointermove', mitigate);
    surface.addEventListener('pointerdown', mitigate);

    if (!api.reduced) loop(surface, step, 24);
  };

  /* ------------------------------------------------------------------- Static */
  api.Static = function (canvas) {
    const W = 160, H = 100;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, H), buf = new Uint32Array(img.data.buffer);
    let band = 0;
    function frame() {
      band = (band + 1.4) % (H + 24);
      for (let y = 0, i = 0; y < H; y++) {
        const boost = Math.abs(y - band + 12) < 8 ? 70 : 0;
        for (let x = 0; x < W; x++, i++) {
          const v = Math.min(255, ((Math.random() * 150) | 0) + boost);
          buf[i] = 0xff000000 | (v << 16) | (v << 8) | v;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    frame();
    return api.reduced ? { pause() {}, resume() {} } : loop(canvas, frame, 14);
  };

  return api;
})();
