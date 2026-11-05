/* ==========================================================================
   TERMINAL: a real, working little shell, plus Snake.
   ========================================================================== */
window.Terminal = (function () {
  const P = window.PORTFOLIO;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let out, input, form, body;
  const history = [];
  let hi = 0, game = null;

  function print(text, cls) {
    const d = document.createElement('div');
    d.className = 'term__line' + (cls ? ' ' + cls : '');
    d.textContent = text;
    out.append(d);
    out.scrollTop = out.scrollHeight;
    return d;
  }
  function printHTML(html, cls) {
    const d = document.createElement('div');
    d.className = 'term__line' + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    out.append(d);
    out.scrollTop = out.scrollHeight;
    return d;
  }
  const cmdLink = (c, label) => `<button type="button" class="term__cmd" data-cmd="${esc(c)}">${esc(label || c)}</button>`;

  function goTo(sel) {
    const t = document.querySelector(sel);
    if (t) t.scrollIntoView({ block: 'start' });
  }
  function projectFor(arg) {
    const a = (arg || '').toLowerCase().replace('.exe', '');
    return P.projects.find((p) => p.id === a || p.file.toLowerCase().startsWith(a) && a) || null;
  }

  const FILES = {
    'readme.txt': () => {
      print(`${P.name}. ${P.title} in ${P.location}.`);
      print('Full-stack web applications in C#, ASP.NET MVC and SQL.');
      print(`${P.education.degree}, UTK, ${P.education.graduated}.`);
    },
    'experience.log': () => commands.experience(),
    'skills.sys': () => commands.skills(),
    'contact.vcf': () => commands.contact(),
    '.secrets': () => {
      print('Things to try: the Konami code, the turbo button, and');
      print('leaving this page alone for a minute and a half.');
    },
  };

  const commands = {
    help() {
      print('Try one of these (or just click it):', 'dim');
      [
        ['whoami', 'who you are talking to'],
        ['projects', 'list the programs'],
        ['open wildfire', 'jump to a project'],
        ['experience', 'where I have worked'],
        ['skills', 'what I work with'],
        ['contact', 'say hello'],
        ['neofetch', 'system info'],
        ['snake', 'play Snake (arrows or swipe)'],
        ['theme amber', 'green, amber, ice or pink'],
        ['turbo', 'do not press this'],
        ['crash', 'ruin everything'],
      ].forEach(([c, d]) => printHTML(`${cmdLink(c)}<span class="term__desc">${esc(d)}</span>`, 'term__help'));
    },
    whoami() {
      print(`${P.name}, ${P.title.toLowerCase()} in ${P.location}.`);
      print('Builds full-stack web apps in C#, ASP.NET MVC and SQL.');
    },
    ls(args) {
      if (args.includes('-a') || args.includes('-la') || args.includes('-al')) {
        print('.  ..  .secrets  projects/  readme.txt  experience.log  skills.sys  contact.vcf');
      } else {
        print('projects/  readme.txt  experience.log  skills.sys  contact.vcf');
      }
    },
    dir(args) { commands.ls(args); },
    cat(args) {
      const f = (args[0] || '').toLowerCase();
      if (!f) return print('cat: which file? try: ls');
      if (FILES[f]) return FILES[f]();
      if (f.startsWith('projects')) return commands.projects();
      print(`cat: ${f}: No such file or directory`);
    },
    cd(args) {
      const a = (args[0] || '').replace(/\/$/, '').toLowerCase();
      if (!a || a === '~' || a === '..') return goTo('#intro');
      if (['projects', 'experience', 'skills', 'contact', 'intro'].includes(a)) return goTo('#' + a);
      print(`cd: ${a}: No such file or directory`);
    },
    pwd() { print('/home/walton'); },
    projects() {
      P.projects.forEach((p) => {
        printHTML(`${cmdLink('open ' + p.id, p.file)}<span class="term__desc">${esc(p.name)}</span>`, 'term__help');
      });
      print('Type open <name> or click one.', 'dim');
    },
    open(args) {
      const p = projectFor(args[0]);
      if (!p) return print('open: try: ' + P.projects.map((x) => 'open ' + x.id).join(', '));
      print(`Loading ${p.file}...`);
      goTo('#project-' + p.id);
    },
    run(args) { commands.open(args); },
    experience() {
      P.experience.forEach((e) => print(`${e.role} @ ${e.company} (${e.dates})`));
      printHTML(cmdLink('cd experience', 'scroll to the full log'));
    },
    education() {
      const ed = P.education;
      print(`${ed.degree}, ${ed.school}`);
      print(`${ed.minors}. Graduated ${ed.graduated}.`);
    },
    skills() {
      P.skills.forEach((g) => print(`${g.group}: ${g.items.map((s) => s.name).join(', ')}`));
    },
    contact() {
      printHTML(`<a href="mailto:${esc(P.email)}">${esc(P.email)}</a>`);
      P.links.forEach((l) => printHTML(`<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`));
    },
    email() { commands.contact(); },
    neofetch() {
      const art = [
        '  .----------.  ',
        '  | >_  WP   |  ',
        '  |          |  ',
        "  '----------'  ",
        '    ________    ',
        '   /_:::::::_\\  ',
      ];
      const info = [
        'walton@knoxville',
        'OS: WaltonOS 26.05',
        `Host: ${P.education.school}`,
        'Shell: C#, ASP.NET MVC, SQL',
        `Programs: ${P.projects.length}`,
        'Memory: 640K free',
      ];
      art.forEach((a, i) => print(a + (info[i] || '')));
    },
    date() { print(new Date().toString()); },
    echo(args) { print(args.join(' ')); },
    clear() { out.innerHTML = ''; },
    cls() { out.innerHTML = ''; },
    theme(args) {
      const t = (args[0] || '').toLowerCase();
      if (!['green', 'amber', 'ice', 'pink'].includes(t)) return print('theme: try: green, amber, ice or pink');
      WOS.act('phosphor', t);
      print(`Phosphor set to ${t}.`);
    },
    lights() { WOS.act('lights'); print('Click.'); },
    crt() { WOS.act('crt'); print('Scanlines toggled.'); },
    turbo() { WOS.act('turbo'); print(WOS.state.turbo ? 'TURBO ON. You were told.' : 'Turbo off. Back to 33 MHz.'); },
    sound() { WOS.act('sound'); print(WOS.state.sound ? 'PC speaker on. Beep.' : 'PC speaker off.'); },
    snake() { startSnake(); },
    screensaver() { WOS.act('saver'); },
    crash() { print('Goodbye.'); setTimeout(() => WOS.act('crash'), 300); },
    reboot() { WOS.act('reboot'); },
    shutdown() { WOS.act('power'); },
    exit() { print('There is no exit. Only shutdown.'); },
    sudo(args) {
      const s = args.join(' ').toLowerCase();
      if (s.startsWith('hire')) {
        print('[sudo] password for recruiter: ********');
        print('Access granted. Opening your mail client...');
        setTimeout(() => { location.href = `mailto:${P.email}?subject=${encodeURIComponent("Let's talk")}`; }, 900);
        return;
      }
      print('walton is not in the sudoers file. This incident will be reported.');
      print('(Try: sudo hire walton)', 'dim');
    },
    rm(args) {
      if (args.join(' ').includes('-rf')) {
        print('Deleting everything...');
        setTimeout(() => WOS.act('crash'), 700);
        return;
      }
      print('rm: nice try');
    },
    vim() { print('You are now in vim. There is no way out. Just kidding: this is a website.'); },
    nano() { print('Real programmers use butterflies.'); },
    ping() { print(`64 bytes from ${P.email}: time=fast. Say hello!`); },
    coffee() { print('  ( (\n   ) )\n .______.\n |      |]\n \\      /\n  `----\'', 'pre'); },
    hi() { print('Hi! Type help to see what this thing can do.'); },
    hello() { commands.hi(); },
    man() { commands.help(); },
  };

  function run(raw) {
    const line = raw.trim();
    printHTML(`<span class="term__ps2">walton:~$</span> ${esc(line)}`, 'term__echo');
    if (!line) return;
    history.push(line);
    hi = history.length;
    const [c, ...args] = line.split(/\s+/);
    const fn = Object.prototype.hasOwnProperty.call(commands, c.toLowerCase()) ? commands[c.toLowerCase()] : null;
    if (window.WOS) WOS.beep(520, 0.015);
    if (fn) fn(args);
    else {
      print(`${c}: command not found`);
      printHTML(`Try ${cmdLink('help')}`, 'dim');
    }
  }

  function complete() {
    const v = input.value;
    if (!v) return;
    const parts = v.split(/\s+/);
    if (parts.length === 1) {
      const m = Object.keys(commands).filter((k) => k.startsWith(parts[0].toLowerCase()));
      if (m.length === 1) input.value = m[0] + ' ';
      else if (m.length > 1) print(m.join('  '), 'dim');
    } else if (parts[0] === 'open' || parts[0] === 'run') {
      const m = P.projects.map((p) => p.id).filter((k) => k.startsWith(parts[1].toLowerCase()));
      if (m.length === 1) input.value = `${parts[0]} ${m[0]}`;
    } else if (parts[0] === 'cat') {
      const m = Object.keys(FILES).filter((k) => k.startsWith(parts[1].toLowerCase()));
      if (m.length === 1) input.value = `cat ${m[0]}`;
    }
  }

  /* ------------------------------------------------------------------ Snake */
  function startSnake() {
    if (game) return;
    const win = document.getElementById('termWin');
    win.classList.remove('win--shade');
    win.scrollIntoView({ block: 'center' });
    const wrap = document.createElement('div');
    wrap.className = 'snake';
    wrap.innerHTML = `<canvas></canvas><p class="snake__hud"><span data-score>SCORE 0</span><span data-food></span><span>ESC QUITS</span></p><p class="snake__msg" data-msg hidden></p>`;
    body.append(wrap);
    input.blur();
    WOS.busy = true;

    const canvas = wrap.querySelector('canvas'), ctx = canvas.getContext('2d');
    const hud = wrap.querySelector('[data-score]'), foodHud = wrap.querySelector('[data-food]'), msg = wrap.querySelector('[data-msg]');
    const foods = P.skills.flatMap((g) => g.items.map((s) => s.name));
    const r = body.getBoundingClientRect();
    const CELL = 14;
    const cols = Math.max(10, Math.floor(r.width / CELL));
    const rows = Math.max(8, Math.floor((r.height - 26) / CELL));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = cols * CELL * dpr;
    canvas.height = rows * CELL * dpr;
    canvas.style.width = cols * CELL + 'px';
    canvas.style.height = rows * CELL + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let best = 0;
    try { best = +localStorage.getItem('waltonos-snake') || 0; } catch (e) {}
    let snake, dir, next, food, foodName, score, over, timer;

    const color = () => getComputedStyle(document.documentElement).getPropertyValue('--phos').trim();
    function place() {
      do {
        food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
      } while (snake.some((s) => s.x === food.x && s.y === food.y));
      foodName = foods[Math.floor(Math.random() * foods.length)];
    }
    function reset() {
      const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
      snake = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
      dir = { x: 1, y: 0 }; next = dir; score = 0; over = false;
      hud.textContent = 'SCORE 0';
      foodHud.textContent = '';
      msg.hidden = true;
      place();
      clearInterval(timer);
      timer = setInterval(tick, 105 / Math.max(1, FX.speed * 0.8));
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, cols * CELL, rows * CELL);
      ctx.fillStyle = color();
      ctx.globalAlpha = 0.14;
      ctx.fillRect(0, 0, cols * CELL, rows * CELL);
      ctx.globalAlpha = 1;
      snake.forEach((s) => ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2));
      ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.strokeStyle = color();
      ctx.strokeRect(food.x * CELL + 0.5, food.y * CELL + 0.5, CELL - 1, CELL - 1);
    }
    function tick() {
      dir = next;
      const h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (h.x < 0 || h.y < 0 || h.x >= cols || h.y >= rows || snake.some((s) => s.x === h.x && s.y === h.y)) return die();
      snake.unshift(h);
      if (h.x === food.x && h.y === food.y) {
        score++;
        hud.textContent = `SCORE ${score}`;
        foodHud.textContent = `ATE ${foodName.toUpperCase()}`;
        WOS.beep(880, 0.04);
        place();
      } else snake.pop();
      draw();
    }
    function die() {
      over = true;
      clearInterval(timer);
      WOS.beep(140, 0.25);
      if (score > best) {
        best = score;
        try { localStorage.setItem('waltonos-snake', String(best)); } catch (e) {}
      }
      msg.innerHTML = `GAME OVER<br>SCORE ${score} / BEST ${best}<br>ENTER OR TAP TO RETRY`;
      msg.hidden = false;
    }
    function quit() {
      clearInterval(timer);
      window.removeEventListener('keydown', onKey, true);
      wrap.remove();
      game = null;
      WOS.busy = false;
      print(`Snake closed. Final score ${score}, best ${best}.`);
    }
    function turn(x, y) {
      if (dir.x === -x && dir.y === -y) return;
      next = { x, y };
    }
    const KEYS = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
    };
    function onKey(e) {
      e.stopPropagation();
      if (e.key === 'Escape' || e.key === 'q') { e.preventDefault(); return quit(); }
      if (over && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); return reset(); }
      const k = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
      if (k) { e.preventDefault(); turn(k[0], k[1]); }
      else if (e.key === ' ') e.preventDefault();
    }
    window.addEventListener('keydown', onKey, true);

    let tx = 0, ty = 0;
    wrap.addEventListener('pointerdown', (e) => { tx = e.clientX; ty = e.clientY; if (over) reset(); });
    wrap.addEventListener('pointerup', (e) => {
      const dx = e.clientX - tx, dy = e.clientY - ty;
      if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
    });

    game = { quit };
    reset();
    print('Snake started. Arrow keys, WASD or swipe.', 'dim');
  }

  function init() {
    out = document.getElementById('termOut');
    input = document.getElementById('termInput');
    form = document.getElementById('termForm');
    body = document.getElementById('term');

    print('WaltonOS 26.05 (tty1)');
    printHTML(`Type ${cmdLink('help')} or try ${cmdLink('snake')}`);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      run(input.value);
      input.value = '';
    });
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hi > 0) input.value = history[--hi] || '';
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        hi = Math.min(history.length, hi + 1);
        input.value = history[hi] || '';
      } else if (e.key === 'Tab' && input.value) {
        e.preventDefault();
        complete();
      } else if (e.key.length === 1 && window.WOS) {
        WOS.beep(1400 + Math.random() * 400, 0.006, 0.012);
      }
    });
    out.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]');
      if (b) run(b.dataset.cmd);
    });
    body.addEventListener('click', (e) => {
      if (!e.target.closest('a,button') && !String(getSelection())) input.focus({ preventScroll: true });
    });
  }

  return { init, run, startSnake };
})();
