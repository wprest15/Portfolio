/* ==========================================================================
   RENDER: turns js/content.js into the projects, experience and skills sections.
   ========================================================================== */
window.Render = (function () {
  const P = window.PORTFOLIO;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const projectById = (id) => P.projects.find((p) => p.id === id);

  /* A stable, decorative 7 character "commit hash" for each entry. */
  function hash7(s) {
    let h = 0x811c9dc5;
    for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
  }

  /* -------------------------------------------------------------- floppies */
  const DISK_COLORS = ['var(--red)', 'var(--pink)', 'var(--blue)', 'var(--green)', 'var(--yellow)', 'var(--orange)'];
  function renderDisks() {
    const disks = [
      ...P.projects.map((p) => ({ href: '#project-' + p.id, file: p.file, sub: p.disk || p.short })),
      { href: '#experience', file: 'WORK.LOG', sub: 'Experience' },
      { href: '#skills', file: 'SKILLS.SYS', sub: 'Skills' },
    ];
    const html = disks.map((d, i) => `
      <a class="floppy" href="${d.href}" style="--c:${DISK_COLORS[i % DISK_COLORS.length]};--tilt:${[-2.5, 1.5, -1, 2][i % 4]}deg">
        <span class="floppy__shutter" aria-hidden="true"><i></i></span>
        <span class="floppy__label"><b>${esc(d.file)}</b><span>${esc(d.sub)}</span></span>
      </a>`).join('');
    $('#disks').insertAdjacentHTML('beforeend', html);
  }

  /* ----------------------------------------------------------- dir listing */
  function renderDir() {
    const rows = P.projects.map((p) => {
      const [name, ext] = p.file.split('.');
      const year = p.dates.match(/\d{4}/)[0];
      return `<a class="dir__row" href="#project-${p.id}">
        <span>${esc(name.padEnd(9, ' '))}${esc(ext)}</span><span>&lt;${year}&gt;</span><span>${esc(p.short)}</span>
      </a>`;
    }).join('');
    $('#dirList').innerHTML = `${rows}<p class="dir__sum">${P.projects.length} file(s) &nbsp; 0 bugs (that I know of)</p>`;
  }

  /* -------------------------------------------------------------- projects */
  function bannerHTML(p) {
    const titles = `
      <div class="prog__titles">
        <p class="prog__kicker">${esc(p.kicker)}</p>
        <h3 class="prog__name">${esc(p.name)}</h3>
      </div>`;
    if (p.banner === 'fire') {
      return `<div class="prog__banner prog__banner--fire" data-fire>
        <canvas aria-hidden="true"></canvas>
        ${titles}
        <p class="firehud" aria-hidden="true"><span>Move your cursor to mitigate</span><span data-saved>0 PX SAVED</span></p>
      </div>`;
    }
    const ticker = p.flow.map((s) => s.title.toUpperCase()).join(' &#9733; ');
    return `<div class="prog__banner prog__banner--awning">
        <div class="awning" aria-hidden="true"></div>
        ${titles}
        <div class="ledsign" aria-hidden="true"><div class="ledsign__track">
          <span>&#9733; NOW OPEN &#9733; ${ticker} &nbsp;</span><span>&#9733; NOW OPEN &#9733; ${ticker} &nbsp;</span>
        </div></div>
      </div>`;
  }

  function flowHTML(p) {
    const tabs = p.flow.map((s, i) => `
      <li><button class="flow__tab" type="button" role="tab" id="${p.id}-tab-${i}" aria-controls="${p.id}-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
        <span class="flow__num">${pad(i + 1)}</span><span class="flow__name">${esc(s.title)}</span>
      </button></li>`).join('');
    return `<div class="flow" data-flow="${p.id}">
      <ol class="flow__steps" role="tablist" aria-label="${esc(p.name)} flow">${tabs}</ol>
      <div class="flow__monitor">
        <div class="flow__addr"><span class="flow__dot"></span><span data-addr></span></div>
        <div class="flow__view" id="${p.id}-panel" role="tabpanel" tabindex="-1">
          <canvas class="flow__static" aria-hidden="true"></canvas>
          <div class="nosignal" data-nosignal>
            <div class="nosignal__bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <p class="nosignal__big">NO SIGNAL</p>
            <p class="nosignal__small">screenshot on the way</p>
          </div>
          <button class="flow__zoom" type="button" data-zoom hidden aria-label="View screenshot full size"><img alt=""></button>
        </div>
      </div>
      <div class="flow__foot">
        <div class="flow__caption"><h4 data-cap-title></h4><p data-cap-text></p></div>
        <div class="flow__ctrl">
          <button class="btn btn--sq" type="button" data-prev aria-label="Previous step">&#9664;</button>
          <button class="btn btn--sq" type="button" data-play aria-label="Pause the flow">&#10074;&#10074;</button>
          <button class="btn btn--sq" type="button" data-next aria-label="Next step">&#9654;</button>
        </div>
      </div>
    </div>`;
  }

  function infoHTML(p) {
    const keys = p.stack.map((s) => `<li><button class="key" type="button" data-skill="${esc(s === 'Firebase' ? 'Firebase Studio' : s)}">${esc(s)}</button></li>`).join('');
    return `<div class="prog__info">
      <p class="prog__summary">${esc(p.summary)}</p>
      <dl class="specs">
        <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
        <div><dt>When</dt><dd>${esc(p.dates)}</dd></div>
        <div><dt>Where</dt><dd>${esc(p.where)}</dd></div>
      </dl>
      <p class="label">Built with</p>
      <ul class="keys">${keys}</ul>
    </div>`;
  }

  function migrationHTML() {
    return `<div class="mig" data-migration>
      <p class="mig__title">MIGRATE.EXE</p>
      <div class="mig__path"><span class="mig__box">WordPress</span><span class="mig__arrow" aria-hidden="true">&gt;&gt;&gt;</span><span class="mig__box mig__box--on">In-house app</span></div>
      <div class="mig__bar" aria-hidden="true"><i></i></div>
      <p class="mig__count"><b data-count="800">800</b><span>+ user accounts</span></p>
    </div>`;
  }

  function receiptHTML(p) {
    const lines = p.receipt.map(([n, q]) => `<li><span>${esc(n)}</span><span>x${q}</span></li>`).join('');
    const bars = Array.from({ length: 34 }, (_, i) => `<i style="width:${1 + ((i * 7) % 4)}px"></i>`).join('');
    return `<div class="till" data-receipt>
      <div class="till__head"><span class="led"></span><span>RECEIPT-O-TRON</span><button class="till__btn" type="button" data-reprint>Reprint</button></div>
      <div class="till__slot"></div>
      <div class="till__feed"><div class="receipt">
        <p class="receipt__head">SENIOR DESIGN<br>UNIVERSITY OF TENNESSEE</p>
        <p class="receipt__sub">Customer: a Knoxville business</p>
        <ul class="receipt__lines">${lines}</ul>
        <p class="receipt__row"><span>Sites deployed</span><span>2</span></p>
        <p class="receipt__row receipt__row--total"><span>Stack</span><span>${esc(p.stack.join(' / '))}</span></p>
        <div class="receipt__bars" aria-hidden="true">${bars}</div>
        <p class="receipt__thanks">THANK YOU, COME AGAIN</p>
      </div></div>
    </div>`;
  }

  function renderProjects() {
    const html = P.projects.map((p, idx) => {
      const flipped = idx % 2 === 1;
      const widget = p.widget === 'migration' ? migrationHTML(p) : p.widget === 'receipt' ? receiptHTML(p) : '';
      const bullets = p.highlights.map((h) => `<li>${esc(h)}</li>`).join('');
      return `<article class="prog reveal ${flipped ? 'prog--flip' : ''}" id="project-${p.id}" style="--accent:${p.accent};--on-accent:${p.onAccent}">
        <header class="prog__bar">
          <span class="prog__file">${esc(p.file)}</span>
          <span class="prog__state">running</span>
          <span class="prog__btns" aria-hidden="true"><i></i><i></i><i></i></span>
        </header>
        ${bannerHTML(p)}
        <div class="prog__body">${flowHTML(p)}${infoHTML(p)}</div>
        <div class="prog__lower">
          <div><p class="label">What I did</p><ul class="bullets">${bullets}</ul></div>
          ${widget}
        </div>
      </article>`;
    }).join('');
    $('#projectList').innerHTML = html;

    $$('[data-fire]').forEach((el) => {
      const saved = $('[data-saved]', el);
      FX.DoomFire($('canvas', el), el, (n) => { saved.textContent = n.toLocaleString() + ' PX SAVED'; });
    });
    P.projects.forEach((p) => initFlow($(`[data-flow="${p.id}"]`), p));
  }

  /* A step-through viewer. Advances on its own while on screen until told to stop. */
  function initFlow(root, p) {
    const tabs = $$('.flow__tab', root), steps = p.flow;
    const view = $('.flow__view', root), noSig = $('[data-nosignal]', root), canvas = $('.flow__static', root);
    const zoom = $('[data-zoom]', root), img = $('img', zoom);
    const addr = $('[data-addr]', root), capT = $('[data-cap-title]', root), capP = $('[data-cap-text]', root);
    const playBtn = $('[data-play]', root);
    const noise = FX.Static(canvas);
    let i = 0, playing = !FX.reduced, seen = false, hover = false, timer = 0;

    function show(n, focus) {
      i = (n + steps.length) % steps.length;
      const s = steps[i];
      tabs.forEach((t, k) => {
        t.setAttribute('aria-selected', k === i);
        t.tabIndex = k === i ? 0 : -1;
        t.closest('li').classList.toggle('done', k < i);
      });
      if (focus) tabs[i].focus();
      view.setAttribute('aria-labelledby', tabs[i].id);
      addr.textContent = `C:\\${p.file.split('.')[0]}\\${pad(i + 1)}_${s.title.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`;
      capT.textContent = s.title;
      capP.textContent = s.caption;
      const hasImg = !!s.image;
      zoom.hidden = !hasImg;
      noSig.hidden = hasImg;
      canvas.hidden = hasImg;
      view.classList.toggle('has-img', hasImg);
      if (hasImg) { img.src = s.image; img.alt = s.alt || s.title; noise.pause(); } else { noise.resume(); }
      view.classList.remove('flip');
      void view.offsetWidth;
      view.classList.add('flip');
      if (tabs[i].scrollIntoView && root.dataset.ready && seen && tabs[0].parentElement.parentElement.scrollWidth > root.clientWidth) {
        const ol = tabs[0].closest('ol');
        ol.scrollTo({ left: tabs[i].closest('li').offsetLeft - 16, behavior: 'smooth' });
      }
    }
    function arm() {
      clearInterval(timer);
      if (playing && seen && !hover) timer = setInterval(() => show(i + 1), 4800 / Math.max(1, FX.speed));
    }
    function setPlaying(v) {
      playing = v;
      playBtn.innerHTML = v ? '&#10074;&#10074;' : '&#9658;';
      playBtn.setAttribute('aria-label', v ? 'Pause the flow' : 'Play the flow');
      arm();
    }

    tabs.forEach((t, k) => t.addEventListener('click', () => { setPlaying(false); show(k); if (window.WOS) WOS.beep(660, 0.03); }));
    $('[data-prev]', root).addEventListener('click', () => { setPlaying(false); show(i - 1); });
    $('[data-next]', root).addEventListener('click', () => { setPlaying(false); show(i + 1); });
    playBtn.addEventListener('click', () => setPlaying(!playing));
    root.querySelector('[role=tablist]').addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      setPlaying(false);
      show(i + d, true);
    });
    root.addEventListener('pointerenter', () => { hover = true; arm(); });
    root.addEventListener('pointerleave', () => { hover = false; arm(); });
    root.addEventListener('focusin', () => { hover = true; arm(); });
    root.addEventListener('focusout', () => { hover = false; arm(); });
    zoom.addEventListener('click', () => {
      $('#lightboxImg').src = steps[i].image;
      $('#lightboxImg').alt = steps[i].alt || steps[i].title;
      $('#lightbox').showModal();
    });
    new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; arm(); }, { threshold: 0.4 }).observe(view);
    if (FX.reduced) setPlaying(false);
    show(0);
    root.dataset.ready = '1';
    root.addEventListener('wos:speed', arm);
  }

  /* ------------------------------------------------------------ git graph */
  function renderGraph() {
    const VW = 1000, VH = 360, PADX = 34, MAIN = 112, AXIS = 326;
    const now = new Date();
    const first = 2022 * 12, last = Math.max(2026 * 12 + 11, now.getFullYear() * 12 + now.getMonth() + 1);
    const X = ([y, m]) => PADX + ((y * 12 + m - 1 - first) / (last - first)) * (VW - PADX * 2);
    const INK = '#1a1712';

    let out = '';
    for (let y = 2022; y <= Math.floor(last / 12); y++) {
      const x = X([y, 1]);
      out += `<line x1="${x}" x2="${x}" y1="14" y2="${AXIS}" stroke="${INK}" stroke-opacity=".16" stroke-dasharray="2 6"/>
        <text x="${x + 4}" y="${AXIS + 22}" class="g-year">${y}</text>`;
    }
    const nowX = X([now.getFullYear(), now.getMonth() + 1]);
    out += `<line x1="${PADX}" x2="${nowX}" y1="${MAIN}" y2="${MAIN}" stroke="${INK}" stroke-width="5"/>
      <text x="${PADX}" y="${MAIN - 12}" class="g-main">main</text>`;

    const lanes = [...P.experience, ...P.graphExtras];
    lanes.forEach((b) => {
      const x0 = X(b.from), x1 = X(b.to), t = Math.min(30, (x1 - x0) * 0.36), y = b.lane;
      const d = `M${x0},${MAIN} C${x0 + t * 0.6},${MAIN} ${x0 + t * 0.4},${y} ${x0 + t},${y} L${x1 - t},${y} C${x1 - t * 0.4},${y} ${x1 - t * 0.6},${MAIN} ${x1},${MAIN}`;
      const target = b.project && !b.company ? `project-${b.project}` : `log-${b.id}`;
      const above = y < MAIN;
      const lx = above ? x0 + t + 6 : x0 - 14;
      const ly = above ? y - 22 : y - 3;
      const anchor = above ? 'start' : 'end';
      out += `<g class="g-branch" data-branch="${b.id}" data-target="${target}" tabindex="0" role="link" aria-label="${esc(b.branch)}, ${esc(b.dates)}" style="--b:${b.color}">
        <path class="g-hit" d="${d}"/>
        <path class="g-line" d="${d}" stroke="${b.color}" ${b.dashed ? 'stroke-dasharray="9 7"' : ''}/>
        <circle cx="${x0}" cy="${MAIN}" r="7" fill="${b.color}" stroke="${INK}" stroke-width="2"/>
        <circle cx="${x1}" cy="${MAIN}" r="7" fill="${b.color}" stroke="${INK}" stroke-width="2"/>
        <text x="${lx}" y="${ly}" text-anchor="${anchor}" class="g-name" fill="${b.color}">${esc(b.branch)}</text>
        <text x="${lx}" y="${ly + 17}" text-anchor="${anchor}" class="g-date">${esc(b.dates.replace(/January|February|March|April|August|September|October|November|December|June|July/g, (m) => m.slice(0, 3)))}</text>
      </g>`;
    });

    const tagX = X(P.education.graduatedAt);
    out += `<g class="g-tag">
      <line x1="${tagX}" x2="${tagX}" y1="${MAIN}" y2="${MAIN - 30}" stroke="${INK}" stroke-width="2"/>
      <circle cx="${tagX}" cy="${MAIN}" r="5" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <text x="${tagX - 6}" y="${MAIN - 18}" text-anchor="end" class="g-tagtext">tag: ${esc(P.education.tag)} ${esc(P.education.tagLabel)}</text>
    </g>
    <g class="g-head"><circle cx="${nowX}" cy="${MAIN}" r="8" fill="${INK}"/><circle class="g-pulse" cx="${nowX}" cy="${MAIN}" r="8" fill="none" stroke="${INK}" stroke-width="2"/>
      <text x="${Math.min(nowX, VW - PADX)}" y="${MAIN + 30}" text-anchor="end" class="g-headtext">HEAD</text></g>`;

    $('#graph').innerHTML = `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="A git graph of Walton's career: Crye-Leike from June 2022 to July 2026, Vantage Point Solutions from April 2025 to August 2026, Stowers Caterpillar from May to August 2025, Senior Design from August 2025 to May 2026, and a BS in Computer Science in May 2026.">${out}</svg>`;
    // On narrow screens the graph scrolls sideways. Start at the recent end, where the action is.
    const graphEl = $('#graph');
    graphEl.scrollLeft = graphEl.scrollWidth;

    $$('.g-branch').forEach((g) => {
      const go = () => {
        const t = document.getElementById(g.dataset.target);
        if (t) t.scrollIntoView({ block: 'start' });
      };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      g.addEventListener('pointerenter', () => linkHighlight(g.dataset.branch, true));
      g.addEventListener('pointerleave', () => linkHighlight(g.dataset.branch, false));
    });
  }

  function linkHighlight(id, on) {
    const log = document.getElementById('log-' + id);
    if (log) log.classList.toggle('hot', on);
    const g = $(`.g-branch[data-branch="${id}"]`);
    if (g) g.classList.toggle('hot', on);
  }

  /* ------------------------------------------------------------ git log */
  function renderLog() {
    const items = P.experience.map((e) => {
      const bullets = e.bullets.map((b) => `<li>${esc(b)}</li>`).join('');
      const link = e.project ? `<a class="log__link" href="#project-${e.project}">See the project &uarr;</a>` : '';
      return `<article class="log" id="log-${e.id}" data-id="${e.id}" style="--b:${e.color}">
        <p class="log__meta"><span class="log__hash">commit ${hash7(e.company)}</span> <span class="log__ref">(${esc(e.branch)})</span></p>
        <h3 class="log__title">${esc(e.role)}</h3>
        <p class="log__org">${esc(e.company)}</p>
        <p class="log__when">${esc(e.dates)} &nbsp;/&nbsp; ${esc(e.where)}</p>
        <ul class="log__list">${bullets}</ul>
        ${link}
      </article>`;
    }).join('');
    const ed = P.education;
    const edu = `<article class="log log--edu" id="log-edu" style="--b:#1a1712">
      <p class="log__meta"><span class="log__hash">tag ${esc(ed.tag)}</span> <span class="log__ref">(main)</span></p>
      <h3 class="log__title">${esc(ed.degree)}</h3>
      <p class="log__org">${esc(ed.school)}</p>
      <p class="log__when">Graduated ${esc(ed.graduated)} &nbsp;/&nbsp; ${esc(ed.minors)}</p>
      <ul class="log__list"><li>${esc(ed.activity)}</li></ul>
    </article>`;
    $('#logList').innerHTML = items + edu;
    $$('.log[data-id]').forEach((a) => {
      a.addEventListener('pointerenter', () => linkHighlight(a.dataset.id, true));
      a.addEventListener('pointerleave', () => linkHighlight(a.dataset.id, false));
    });
  }

  /* -------------------------------------------------------------- skills */
  const allSkills = P.skills.flatMap((g) => g.items);
  function chipHTML(s, n) {
    return `<button class="chip" type="button" data-chip="${esc(s.name)}" aria-pressed="false">
      <span class="chip__id" aria-hidden="true">U${n}</span><span class="chip__name">${esc(s.name)}</span><span class="chip__led" aria-hidden="true"></span>
    </button>`;
  }
  function renderSkills() {
    let n = 1;
    const col = (side) => P.skills.filter((g) => g.side === side).map((g) => `
      <div class="group"><p class="group__silk">${esc(g.group)}</p><div class="group__chips">${g.items.map((s) => chipHTML(s, n++)).join('')}</div></div>`).join('');
    $('#boardLeft').innerHTML = col('left');
    $('#boardRight').innerHTML = col('right');
    selectSkill(null);
    $$('.chip').forEach((c) => {
      c.addEventListener('click', () => selectSkill(c.dataset.chip));
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') selectSkill(c.dataset.chip); });
      c.addEventListener('focus', () => selectSkill(c.dataset.chip));
    });
    drawTraces();
    new ResizeObserver(drawTraces).observe($('#board'));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawTraces);
    if (!FX.reduced) ambientTraces();
  }

  function selectSkill(name) {
    const readout = $('#readout');
    $$('.chip').forEach((c) => {
      const on = c.dataset.chip === name;
      c.classList.toggle('on', on);
      c.setAttribute('aria-pressed', on);
    });
    $$('#traces path').forEach((t) => t.classList.toggle('live', t.dataset.chip === name));
    if (!name) {
      readout.innerHTML = `<p class="ro__cmd">$ ./skills --help</p><p>Pick any chip on the board to trace where it shows up in my work.</p>`;
      return;
    }
    const s = allSkills.find((x) => x.name === name);
    if (!s) return;
    const used = (s.used || []).map(projectById).filter(Boolean);
    const lines = used.map((p) => `<a class="ro__hit" href="#project-${p.id}">${esc(p.file)}<span>${esc(p.short)}</span></a>`).join('');
    const note = s.note ? `<p class="ro__note">${esc(s.note)}</p>` : '';
    const none = !used.length && !s.note ? `<p class="ro__note">On the resume, no project writeup yet. Ask me about it.</p>` : '';
    readout.innerHTML = `<p class="ro__cmd">$ grep -r "${esc(s.name)}" ~/walton</p>${lines}${note}${none}<p class="ro__count">${used.length} project match${used.length === 1 ? '' : 'es'}</p>`;
    if (window.WOS) WOS.beep(990, 0.02);
  }

  /* Routes a copper trace from every chip to a pin on the CPU without crossings. */
  function drawTraces() {
    const board = $('#board'), svg = $('#traces'), cpu = $('.cpu');
    if (!board || !cpu) return;
    if (matchMedia('(max-width: 960px)').matches) { svg.innerHTML = ''; return; }
    const br = board.getBoundingClientRect(), cr = cpu.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
    svg.setAttribute('width', br.width);
    svg.setAttribute('height', br.height);
    const active = $('.chip.on');
    let paths = '';

    [['#boardLeft', -1], ['#boardRight', 1]].forEach(([sel, dir]) => {
      const chips = $$('.chip', $(sel));
      const pinTop = cr.top - br.top + 22, pinH = cr.height - 44;
      const rows = chips.map((c, i) => {
        const r = c.getBoundingClientRect();
        return {
          name: c.dataset.chip,
          y: r.top - br.top + r.height / 2,
          x: dir < 0 ? r.right - br.left : r.left - br.left,
          py: pinTop + (pinH * (i + 0.5)) / chips.length,
        };
      });
      const cpuX = dir < 0 ? cr.left - br.left : cr.right - br.left;
      const edge = rows[0] ? rows[0].x : 0;
      const channel = Math.abs(cpuX - edge) - 12;
      const step = channel / (rows.length + 1);

      /* Heading down: the higher the chip, the closer its vertical run sits to the CPU.
         Heading up it's the reverse. That ordering is what keeps traces from crossing. */
      const down = rows.filter((r) => r.py >= r.y);
      const up = rows.filter((r) => r.py < r.y).reverse();
      [...down, ...up].forEach((r, k) => {
        const lanes = rows.length;
        const offset = (lanes - k) * step;
        const bus = edge + (dir < 0 ? offset : -offset);
        const d = `M${r.x},${r.y} H${bus} V${r.py} H${cpuX}`;
        paths += `<path d="${d}" data-chip="${esc(r.name)}" class="${active && active.dataset.chip === r.name ? 'live' : ''}"/>`;
      });
    });
    svg.innerHTML = paths;
  }

  function ambientTraces() {
    setInterval(() => {
      const list = $$('#traces path:not(.live)');
      if (!list.length || document.hidden) return;
      const t = list[Math.floor(Math.random() * list.length)];
      t.classList.add('blip');
      setTimeout(() => t.classList.remove('blip'), 1100);
    }, 650);
  }

  /* ------------------------------------------------------------ contact */
  function renderContact() {
    const row = $('#contactRow');
    P.links.forEach((l) => {
      const a = document.createElement('a');
      a.className = 'btn btn--dark';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = l.label;
      row.append(a);
    });
  }

  function renderTicker() {
    const t = 'LOADING PROGRAMS &#9617;&#9618;&#9619; PLEASE DO NOT TURN OFF YOUR COMPUTER &#9619;&#9618;&#9617; ';
    const chunk = `<span>${t.repeat(4)}</span>`;
    $('#ticker').innerHTML = chunk + chunk;
  }

  function renderAbout() {
    const ed = P.education;
    const rows = [
      ['Operator', P.name],
      ['Location', P.location],
      ['Education', `BS Computer Science, UTK (${ed.graduated})`],
      ['Core stack', 'C#, ASP.NET MVC, SQL'],
      ['Programs', `${P.projects.length} installed`],
      ['Memory', '640K free'],
    ];
    $('#aboutList').innerHTML = rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  }

  function all() {
    renderDisks();
    renderDir();
    renderTicker();
    renderProjects();
    renderGraph();
    renderLog();
    renderSkills();
    renderContact();
    renderAbout();
  }

  return { all, selectSkill, drawTraces, esc };
})();
