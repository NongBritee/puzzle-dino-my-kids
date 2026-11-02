/* ไดโนจิ๊กซอว์ — เกมสำหรับเด็ก 2-3 ขวบ  (ลากชิ้นส่วนไปวางบนภาพจาง) */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const DINOS = window.DINOS;
  const SAVE_KEY = 'dinopuzzle.v1';

  // ---------- บันทึก ----------
  let save = { n: 3, done: {} };
  try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (e) { /* ใช้ค่าเริ่มต้น */ }
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } };

  // ---------- เสียง (สังเคราะห์เอง ไม่ต้องมีไฟล์) ----------
  let ac = null;
  const audio = () => {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  function tone(f, t0, dur, type = 'sine', vol = 0.18, f2) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  const sfx = {
    pick() { tone(520, 0, .08, 'triangle', .1); },
    ding() { tone(660, 0, .18, 'sine', .2); tone(880, .08, .2, 'sine', .2); tone(1320, .16, .3, 'sine', .18); },
    boing() { tone(320, 0, .28, 'triangle', .2, 130); },
    tap() { tone(900, 0, .1, 'sine', .15); tone(1200, .08, .1, 'sine', .12); },
    fanfare() { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * .13, .25, 'square', .09)); },
    roar() {
      const a = audio(); if (!a) return;
      const t = a.currentTime, dur = 1.3;
      const o = a.createOscillator(), lp = a.createBiquadFilter(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(150, t + .25); o.frequency.linearRampToValueAtTime(55, t + dur);
      lfo.frequency.value = 28; lg.gain.value = 18; lfo.connect(lg).connect(o.frequency);
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(1500, t + .3); lp.frequency.linearRampToValueAtTime(300, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.45, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(lp).connect(g).connect(a.destination); o.start(t); lfo.start(t); o.stop(t + dur + .05); lfo.stop(t + dur + .05);
      // เสียงลมหายใจ
      const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const n = a.createBufferSource(), nf = a.createBiquadFilter(), ng = a.createGain();
      n.buffer = buf; nf.type = 'bandpass'; nf.frequency.value = 700; ng.gain.value = .25;
      n.connect(nf).connect(ng).connect(a.destination); n.start(t);
    }
  };
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'th-TH'; u.rate = .8; u.pitch = 1.3;
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  // ---------- เมนู ----------
  let uid = 0;
  const hasDone = (d) => !!(save.done[d.id] && (save.done[d.id][2] || save.done[d.id][3]));
  function buildMenu() {
    const grid = $('#grid'); grid.innerHTML = '';
    DINOS.forEach((d, i) => {
      const b = document.createElement('button');
      b.className = 'card'; b.setAttribute('aria-label', d.th);
      b.innerHTML = `<svg viewBox="0 0 400 400">${d.art('m' + (uid++) + '-')}</svg>${hasDone(d) ? '<span class="star">⭐</span>' : ''}`;
      b.onclick = () => { audio(); sfx.tap(); startPuzzle(i); };
      grid.appendChild(b);
    });
    document.querySelectorAll('.lvl').forEach(b => b.classList.toggle('on', +b.dataset.n === save.n));
  }
  document.querySelectorAll('.lvl').forEach(b => b.onclick = () => {
    audio(); sfx.tap(); save.n = +b.dataset.n; persist();
    document.querySelectorAll('.lvl').forEach(x => x.classList.toggle('on', x === b));
  });
  function showMenu() {
    stopFx(); $('#play').hidden = true; $('#menu').hidden = false; buildMenu();
    try { speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }

  // ---------- จิ๊กซอว์ ----------
  const stage = $('#stage');
  let cur = 0, n = 3, S = 300, cell = 100, bx = 0, by = 0;
  let board, slots = [], pieces = [], placedCount = 0, zTop = 10, finished = false, tray = null;

  function startPuzzle(i) {
    cur = i; n = save.n; finished = false; placedCount = 0; stopFx();
    $('#menu').hidden = true; $('#play').hidden = false; $('#win').hidden = true;
    stage.innerHTML = ''; stage.classList.remove('done');
    const d = DINOS[i];
    board = document.createElement('div'); board.id = 'board';
    board.innerHTML = `<div class="ghost"><svg viewBox="0 0 400 400">${d.art('g' + (uid++) + '-')}</svg></div><div class="full"><svg viewBox="0 0 400 400">${d.art('f' + (uid++) + '-')}</svg></div>`;
    stage.appendChild(board);
    slots = []; pieces = [];
    for (let k = 0; k < n * n; k++) {
      const s = document.createElement('div'); s.className = 'slot'; board.appendChild(s); slots.push(s);
    }
    // สับตำแหน่งในถาด
    const order = [...Array(n * n).keys()];
    for (let k = order.length - 1; k > 0; k--) { const j = (Math.random() * (k + 1)) | 0;[order[k], order[j]] = [order[j], order[k]]; }
    // ไม่ให้เรียงถูกพอดีตั้งแต่ต้น
    if (order.every((v, k) => v === k)) order.push(order.shift());
    for (let k = 0; k < n * n; k++) {
      const r = (k / n) | 0, c = k % n, w = 400 / n;
      const el = document.createElement('div'); el.className = 'piece';
      el.innerHTML = `<svg viewBox="${c * w} ${r * w} ${w} ${w}">${d.art('p' + (uid++) + '-')}</svg>`;
      stage.appendChild(el);
      const p = { el, idx: k, tray: order.indexOf(k), placed: false, x: 0, y: 0, s: 1 };
      pieces.push(p); bindDrag(p);
    }
    layout();
  }

  // จัดตำแหน่งตามขนาดหน้าจอ
  function layout() {
    if ($('#play').hidden) return;
    const W = stage.clientWidth, H = stage.clientHeight, m = 22;
    const landscape = W > H * 1.15;
    let tx, ty, tw, th;
    if (landscape) {
      S = Math.max(120, Math.min(H - 2 * m, W * .5)); bx = m + 6; by = (H - S) / 2;
      tx = bx + S + m * 1.5; ty = m; tw = W - tx - m; th = H - 2 * m;
    } else {
      S = Math.max(120, Math.min(W - 2 * m - 8, H * .5)); bx = (W - S) / 2; by = m;
      tx = m; ty = by + S + m * 1.4; tw = W - 2 * m; th = H - ty - m;
    }
    cell = S / n;
    Object.assign(board.style, { left: bx + 'px', top: by + 'px', width: S + 'px', height: S + 'px' });
    slots.forEach((s, k) => Object.assign(s.style, { left: (k % n) * cell + 'px', top: ((k / n) | 0) * cell + 'px', width: cell + 'px', height: cell + 'px' }));
    // ถาดวางชิ้นส่วน
    let t = Math.min(cell, th), gap, cols = 1, rows = pieces.length;
    for (; t >= 44; t -= 4) {
      gap = Math.max(8, t * .1); cols = Math.max(1, Math.floor((tw + gap) / (t + gap))); rows = Math.ceil(pieces.length / cols);
      if (rows * (t + gap) - gap <= th) break;
    }
    tray = { t, gap, cols, rows, tx, ty, tw, th };
    pieces.forEach(p => {
      p.el.style.width = p.el.style.height = cell + 'px';
      if (p.dragging) return;
      if (p.placed) setPos(p, bx + (p.idx % n) * cell, by + ((p.idx / n) | 0) * cell, 1);
      else { const q = trayPos(p.tray); setPos(p, q.x, q.y, tray.t / cell); }
    });
  }
  function trayPos(i) {
    const { t, gap, cols, tx, ty, tw, th } = tray, total = pieces.length;
    const row = (i / cols) | 0, col = i % cols, inRow = Math.min(cols, total - row * cols);
    const rowsH = Math.ceil(total / cols) * (t + gap) - gap;
    return { x: tx + (tw - (inRow * (t + gap) - gap)) / 2 + col * (t + gap), y: ty + (th - rowsH) / 2 + row * (t + gap) };
  }
  function setPos(p, x, y, s) { p.x = x; p.y = y; p.s = s; p.el.style.transform = `translate(${x}px,${y}px) scale(${s})`; }

  // ---------- ลากวาง ----------
  function bindDrag(p) {
    const el = p.el; let sx, sy, fx, fy, t0, moved;
    el.addEventListener('pointerdown', (e) => {
      if (p.placed || finished || p.dragging) return;
      audio(); e.preventDefault(); el.setPointerCapture(e.pointerId);
      const r = stage.getBoundingClientRect(), X = e.clientX - r.left, Y = e.clientY - r.top;
      fx = (X - p.x) / (cell * p.s); fy = (Y - p.y) / (cell * p.s);   // จุดที่จับ (สัดส่วนในชิ้น)
      sx = X; sy = Y; t0 = performance.now(); moved = false; p.dragging = true;
      el.classList.add('drag'); el.style.zIndex = ++zTop;
      setPos(p, X - fx * cell, Y - fy * cell, 1); sfx.pick();
    });
    el.addEventListener('pointermove', (e) => {
      if (!p.dragging) return;
      const r = stage.getBoundingClientRect(), X = e.clientX - r.left, Y = e.clientY - r.top;
      if (Math.hypot(X - sx, Y - sy) > 8) moved = true;
      setPos(p, X - fx * cell, Y - fy * cell, 1);
    });
    const end = (e) => {
      if (!p.dragging) return;
      p.dragging = false; el.classList.remove('drag');
      const sl = { x: bx + (p.idx % n) * cell, y: by + ((p.idx / n) | 0) * cell };
      const d = Math.hypot(p.x - sl.x, p.y - sl.y);
      if (e.type !== 'pointercancel' && d < cell * .6) place(p, sl);
      else {
        const q = trayPos(p.tray); el.style.zIndex = ++zTop; setPos(p, q.x, q.y, tray.t / cell);
        if (!moved && performance.now() - t0 < 500) hint(p); else if (e.type !== 'pointercancel') sfx.boing();
      }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  function place(p, sl) {
    p.placed = true; p.el.classList.add('placed'); p.el.style.zIndex = 5;
    setPos(p, sl.x, sl.y, 1); sfx.ding();
    burst(sl.x + cell / 2, sl.y + cell / 2, 14);
    if (++placedCount === pieces.length) setTimeout(win, 450);
  }
  function hint(p) {
    sfx.tap(); const s = slots[p.idx];
    s.classList.remove('flash'); void s.offsetWidth; s.classList.add('flash');
    p.el.classList.remove('hint'); void p.el.offsetWidth; p.el.classList.add('hint');
  }
  $('#hint').onclick = () => { audio(); const left = pieces.filter(p => !p.placed); if (left.length) hint(left[(Math.random() * left.length) | 0]); };

  // ---------- ชนะ ----------
  function win() {
    finished = true; const d = DINOS[cur];
    board.classList.add('done'); stage.classList.add('done');
    save.done[d.id] = save.done[d.id] || {}; save.done[d.id][n] = true; persist();
    sfx.fanfare(); setTimeout(sfx.roar, 500); setTimeout(() => speak(d.th), 1900);
    $('#winName').textContent = d.th; $('#win').hidden = false;
    confetti();
  }
  $('#home').onclick = () => { sfx.tap(); showMenu(); };
  $('#winHome').onclick = () => { sfx.tap(); showMenu(); };
  $('#again').onclick = () => { sfx.tap(); startPuzzle(cur); };
  $('#next').onclick = () => { sfx.tap(); startPuzzle((cur + 1) % DINOS.length); };

  // ---------- เอฟเฟกต์ (ประกายและพลุกระดาษ) ----------
  const cv = $('#fx'), cx = cv.getContext('2d');
  let parts = [], raf = 0, fxStart = 0;
  const COLORS = ['#ff5f7e', '#ffb347', '#ffe14d', '#5fe38a', '#4dc3ff', '#b47bff'];
  function sizeCanvas() { const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function loop(ts) {
    const r = cv.getBoundingClientRect(); cx.clearRect(0, 0, r.width, r.height);
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 1; p.rot += p.vr;
      cx.save(); cx.globalAlpha = Math.min(1, p.life / 20); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c;
      if (p.star) { cx.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? p.s * .4 : p.s; cx.lineTo(Math.cos(k * Math.PI / 4) * rr, Math.sin(k * Math.PI / 4) * rr); } cx.fill(); }
      else cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .66);
      cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(loop) : 0;
  }
  function addParts(list) { sizeCanvas(); parts.push(...list); if (!raf) raf = requestAnimationFrame(loop); }
  function burst(x, y, k) {
    const o = stage.getBoundingClientRect(), c = cv.getBoundingClientRect(), ox = o.left - c.left, oy = o.top - c.top;
    addParts(Array.from({ length: k }, () => { const a = Math.random() * 6.283, v = 2 + Math.random() * 4; return { x: x + ox, y: y + oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .12, life: 30 + Math.random() * 20, s: 8 + Math.random() * 8, c: COLORS[(Math.random() * 6) | 0], rot: 0, vr: .2, star: true }; }));
  }
  function confetti() {
    const W = cv.getBoundingClientRect().width;
    for (let wave = 0; wave < 5; wave++) setTimeout(() => {
      addParts(Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: -10, vx: (Math.random() - .5) * 3, vy: 2 + Math.random() * 3, g: .05, life: 150 + Math.random() * 60, s: 10 + Math.random() * 8, c: COLORS[(Math.random() * 6) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, star: Math.random() < .3 })));
    }, wave * 350);
  }
  function stopFx() { parts = []; if (raf) cancelAnimationFrame(raf); raf = 0; cx.clearRect(0, 0, cv.width, cv.height); }

  window.addEventListener('resize', layout);
  window.addEventListener('orientationchange', () => setTimeout(layout, 200));
  // ป้องกันเมนูคลิกขวา/ซูมโดยไม่ตั้งใจ
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  buildMenu();
})();
