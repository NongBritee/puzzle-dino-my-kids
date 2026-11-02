/* ภาพไดโนเสาร์ 10 แบบ (SVG วาดด้วยโค้ด) — viewBox 0 0 400 400
   แต่ละภาพ: { id, th, en, art(prefix) -> string }  prefix ใช้กัน id ซ้ำเวลาแตกภาพเป็นชิ้นจิ๊กซอว์ */
(function () {
  // ---------- ตัวช่วยวาด ----------
  const rnd = (seed) => { let a = seed; return () => (a = (a * 16807) % 2147483647) / 2147483647; };
  const stars = (seed, n, y0, y1, fill = '#fff') => {
    const r = rnd(seed); let s = '';
    for (let i = 0; i < n; i++) {
      s += `<circle cx="${(r() * 400) | 0}" cy="${(y0 + r() * (y1 - y0)) | 0}" r="${(1 + r() * 2.2).toFixed(1)}" fill="${fill}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
    }
    return s;
  };
  const star4 = (x, y, s, fill) =>
    `<path d="M${x} ${y - s}L${x + s * .28} ${y - s * .28}L${x + s} ${y}L${x + s * .28} ${y + s * .28}L${x} ${y + s}L${x - s * .28} ${y + s * .28}L${x - s} ${y}L${x - s * .28} ${y - s * .28}Z" fill="${fill}"/>`;
  const cloud = (x, y, s = 1, f = '#fff', o = .9) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${f}" opacity="${o}"><ellipse rx="34" ry="14"/><circle cx="-14" cy="-10" r="14"/><circle cx="8" cy="-16" r="18"/><circle cx="24" cy="-6" r="11"/></g>`;
  const eye = (x, y, r = 9) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#222" stroke-width="2.5"/><circle cx="${x + r * .2}" cy="${y}" r="${r * .56}" fill="#222"/><circle cx="${x + r * .38}" cy="${y - r * .28}" r="${r * .22}" fill="#fff"/>`;
  const sky = (p, stops) =>
    `<defs><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient></defs><rect width="400" height="400" fill="url(#${p}s)"/>`;
  const glowDef = (id, c, o = 1) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
  const flower = (x, y, s, petal, mid = '#ffe14d') => {
    let o = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      o += `<circle cx="${(x + Math.cos(a) * s).toFixed(1)}" cy="${(y + Math.sin(a) * s).toFixed(1)}" r="${s * .75}" fill="${petal}"/>`;
    }
    return o + `<circle cx="${x}" cy="${y}" r="${s * .65}" fill="${mid}"/>`;
  };
  const shroom = (x, y, s, cap, stem = '#fff4e0', glow) =>
    `${glow ? `<circle cx="${x}" cy="${y - 14 * s}" r="${34 * s}" fill="${glow}" opacity=".35"/>` : ''}<rect x="${x - 5 * s}" y="${y - 18 * s}" width="${10 * s}" height="${20 * s}" rx="${4 * s}" fill="${stem}"/><path d="M${x - 22 * s} ${y - 16 * s}Q${x} ${y - 52 * s} ${x + 22 * s} ${y - 16 * s}Z" fill="${cap}"/><circle cx="${x - 7 * s}" cy="${y - 28 * s}" r="${3.5 * s}" fill="#fff" opacity=".8"/><circle cx="${x + 8 * s}" cy="${y - 24 * s}" r="${3 * s}" fill="#fff" opacity=".8"/>`;
  const fly = (seed, n, y0, y1, c = '#fff7a8') => {
    const r = rnd(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 400, y = y0 + r() * (y1 - y0);
      s += `<circle cx="${x | 0}" cy="${y | 0}" r="9" fill="${c}" opacity=".25"/><circle cx="${x | 0}" cy="${y | 0}" r="3" fill="${c}"/>`;
    }
    return s;
  };
  const pine = (x, y, s, c, snow) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-4" width="8" height="14" fill="#6b4a3a"/><path d="M0 -70L22 -30H8L28 0H-28L-8 -30H-22Z" fill="${c}"/>${snow ? `<path d="M0 -70L9 -52Q0 -46 -9 -52Z M-6 -30Q0 -25 6 -30L10 -38H-10Z" fill="${snow}"/>` : ''}</g>`;

  // วาดตัวไดโน: เส้นขอบรอบรูปรวม (ไม่มีรอยตะเข็บ) — item เป็น string(รูปทรงปิด) หรือ {l:path, w:ความหนา} (ขา/แขน)
  const blob = (items, fill, ol, w = 8) => {
    const a = items.map(i => typeof i === 'string'
      ? `<g fill="${ol}" stroke="${ol}" stroke-width="${w}" stroke-linejoin="round">${i}</g>`
      : `<path d="${i.l}" fill="none" stroke="${ol}" stroke-width="${i.w + w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    const b = items.map(i => typeof i === 'string'
      ? `<g fill="${fill}">${i}</g>`
      : `<path d="${i.l}" fill="none" stroke="${fill}" stroke-width="${i.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
    return a + b;
  };
  const mirror = (inner, k = 0.9) => `<g transform="translate(200 340) scale(${-k} ${k}) translate(-200 -340)">${inner}</g>`;
  const toes = (x, y, c = '#fff6dc') => `<circle cx="${x - 9}" cy="${y}" r="3.5" fill="${c}"/><circle cx="${x}" cy="${y + 1}" r="3.5" fill="${c}"/><circle cx="${x + 9}" cy="${y}" r="3.5" fill="${c}"/>`;
  const smile = (x, y, w, c = '#7a2a2a') => `<path d="M${x} ${y}q${w / 2} ${w * .45} ${w} 0" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
  const blush = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ff7aa8" opacity=".45"/>`;

  // ---------- 1. ทีเร็กซ์ : ภูเขาไฟยามเย็น ----------
  function trex(p) {
    const G = '#5cc24e', D = '#256a2e';
    let teeth = ''; for (let i = 0; i < 5; i++) teeth += `<path d="M${284 + i * 19} 150l7 0l-3.5 13z" fill="#fff"/>`;
    return sky(p, [[0, '#2a0f5c'], [.45, '#c2368b'], [.8, '#ff8f4a'], [1, '#ffd36b']]) + stars(3, 26, 0, 150) +
      `<circle cx="322" cy="64" r="30" fill="#fff4c9"/><circle cx="312" cy="56" r="6" fill="#f0dc98"/><circle cx="334" cy="74" r="4" fill="#f0dc98"/>` +
      `<circle cx="120" cy="140" r="24" fill="#7a3a77" opacity=".85"/><circle cx="142" cy="108" r="30" fill="#8a4585" opacity=".8"/><circle cx="112" cy="86" r="26" fill="#9b5594" opacity=".75"/><circle cx="138" cy="58" r="20" fill="#b06bab" opacity=".7"/>` +
      `<path d="M-20 340L92 178Q112 150 134 178L262 340Z" fill="#4a1f55"/><path d="M92 178Q112 150 134 178L126 186Q112 172 100 186Z" fill="#ff7a21"/><path d="M110 180L104 218L116 255L98 305L128 305L124 255L134 218L122 182Z" fill="#ff9b3d"/>` +
      star4(80, 120, 7, '#ffd36b') + star4(165, 95, 5, '#ff9b3d') + star4(60, 70, 4, '#ffd36b') +
      `<path d="M250 330L330 250L400 300V400H250Z" fill="#6b2a6a"/><path d="M0 312Q100 292 200 310T400 304V400H0Z" fill="#2f8e68"/><path d="M0 345Q120 330 220 346T400 340V400H0Z" fill="#1f6b55"/>` +
      `<circle cx="40" cy="365" r="14" fill="#6ff0ff" opacity=".3"/>` + flower(40, 365, 6, '#6ff0ff', '#fff') + flower(360, 372, 7, '#ff9de0', '#fff') + flower(300, 360, 5, '#6ff0ff', '#fff') +
      blob([
        '<path d="M12 300C70 308 125 275 150 215L215 225L200 305Z"/>',
        '<ellipse cx="205" cy="238" rx="84" ry="62"/>',
        { l: 'M170 275L160 322', w: 34 }, { l: 'M148 334L188 334', w: 20 },
        { l: 'M240 280L246 322', w: 32 }, { l: 'M236 334L276 334', w: 20 },
        '<path d="M250 205C262 170 272 150 292 128L338 170L300 235Z"/>',
        '<path d="M268 150L374 146C374 178 346 194 306 192C282 190 268 174 268 150Z"/>'
      ], G, D) +
      `<ellipse cx="222" cy="266" rx="56" ry="32" fill="#d9f7a8"/>` +
      `<path d="M274 152L368 148C366 170 342 182 308 180C288 178 276 168 274 152Z" fill="#b8283f"/><ellipse cx="318" cy="174" rx="22" ry="7" fill="#ff7f9a"/>` +
      blob(['<path d="M252 118C258 78 335 68 380 98C394 112 392 140 374 148L268 152C254 144 250 130 252 118Z"/>'], G, D) + teeth +
      eye(322, 104, 11) + `<path d="M306 88q16-8 30 0" fill="none" stroke="${D}" stroke-width="4" stroke-linecap="round"/><ellipse cx="376" cy="112" rx="3" ry="4.5" fill="${D}"/>` + blush(340, 130, 9) +
      `<g fill="#3f9a3a"><circle cx="150" cy="212" r="9"/><circle cx="178" cy="190" r="10"/><circle cx="212" cy="182" r="10"/><circle cx="244" cy="188" r="9"/><circle cx="130" cy="240" r="8"/></g>` +
      blob([{ l: 'M262 236L286 252', w: 10 }], G, D, 5) + `<path d="M286 252l9 3m-9-3l6 8" stroke="#fff6dc" stroke-width="4" stroke-linecap="round"/>` + toes(268, 338) + toes(168, 338);
  }

  // ---------- 2. ไทรเซอราทอปส์ : ทุ่งคริสตัล ----------
  function tric(p) {
    const B = '#4aa8e0', D = '#1d5a94', C = '#fff0c8';
    let scal = '';
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * (0.95 + i * 0.11) ; // ครึ่งวงบน-หลัง
      scal += `<circle cx="${(292 + Math.cos(a + Math.PI * .1) * 56).toFixed(1)}" cy="${(185 + Math.sin(a + Math.PI * .1) * 62).toFixed(1)}" r="12" fill="#ff7eb6" stroke="#c23d85" stroke-width="3"/>`;
    }
    return sky(p, [[0, '#7fe3ff'], [.55, '#d9c3ff'], [1, '#ffd1f0']]) +
      `<defs>${glowDef(p + 'g1', '#ffffff', .9)}<linearGradient id="${p}c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9bf3ff"/><stop offset="1" stop-color="#6c8cff"/></linearGradient><linearGradient id="${p}c2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb0ec"/><stop offset="1" stop-color="#b266ff"/></linearGradient></defs>` +
      `<circle cx="90" cy="70" r="34" fill="#fff6c8"/><circle cx="78" cy="62" r="7" fill="#f0e2a0"/><circle cx="310" cy="48" r="20" fill="#ffd6f6"/>` + cloud(210, 80, 1, '#fff', .8) + cloud(350, 120, .7, '#fff', .7) +
      `<path d="M10 330L40 190L70 330Z" fill="url(#${p}c1)"/><path d="M50 330L90 150L128 330Z" fill="url(#${p}c2)"/><path d="M90 150L128 330L100 330Z" fill="#fff" opacity=".25"/><path d="M110 330L140 230L170 330Z" fill="url(#${p}c1)"/>` +
      `<path d="M300 330L330 210L362 330Z" fill="url(#${p}c2)"/><path d="M340 330L376 140L400 160V330Z" fill="url(#${p}c1)"/><path d="M376 140L400 160V330H380Z" fill="#fff" opacity=".22"/>` +
      star4(60, 120, 8, '#fff') + star4(350, 90, 6, '#fff') + star4(180, 150, 5, '#fff') + star4(240, 40, 6, '#fff') +
      `<path d="M0 305Q100 285 200 302T400 296V400H0Z" fill="#8fe39b"/><path d="M0 340Q120 322 220 340T400 334V400H0Z" fill="#62c97d"/>` +
      flower(30, 360, 7, '#ff8fd0') + flower(110, 375, 6, '#fff') + flower(330, 365, 7, '#ff8fd0') + flower(375, 380, 5, '#fff') + flower(250, 380, 6, '#ffd24d', '#ff8fd0') +
      blob([
        '<path d="M80 265C55 275 35 300 20 318L55 318C85 305 105 295 118 285Z"/>',
        '<ellipse cx="175" cy="250" rx="100" ry="58"/>',
        { l: 'M120 290L118 335', w: 38 }, { l: 'M160 294L160 337', w: 38 }, { l: 'M215 294L218 337', w: 38 }, { l: 'M255 288L262 335', w: 38 },
      ], B, D) +
      `<ellipse cx="190" cy="278" rx="70" ry="28" fill="#cfeeff"/>` +
      `<ellipse cx="292" cy="185" rx="57" ry="64" fill="#c23d85"/>` + scal + `<ellipse cx="292" cy="185" rx="48" ry="55" fill="#ff9ed0"/><ellipse cx="292" cy="185" rx="34" ry="40" fill="#ffc9e4"/>` +
      `<g fill="#ff7eb6"><circle cx="270" cy="155" r="6"/><circle cx="300" cy="145" r="6"/><circle cx="318" cy="170" r="5"/><circle cx="262" cy="185" r="6"/></g>` +
      blob([
        '<path d="M312 200C312 168 340 162 372 188C385 200 382 224 366 232C340 248 300 246 296 226Z"/>'
      ], B, D) +
      `<path d="M312 184L336 170L384 116Z" fill="#fff6dc" stroke="#c9a85c" stroke-width="3" stroke-linejoin="round"/>` +
      blob(['<path d="M358 206C382 200 396 212 390 226C380 238 362 234 356 222Z"/>'], '#ffd76b', '#b3801f', 5) +
      `<path d="M330 186L354 174L396 134L344 170Z" fill="${C}" stroke="#c9a85c" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M358 197L388 192L378 172Z" fill="${C}" stroke="#c9a85c" stroke-width="3" stroke-linejoin="round"/>` +
      eye(336, 204, 10) + smile(340, 226, 22, D) + blush(322, 220, 8) + toes(118, 338) + toes(262, 338);
  }

  // ---------- 3. บราคิโอซอรัส : เกาะลอยฟ้า ----------
  function brach(p) {
    const B = '#f5a742', D = '#a85a14';
    const isl = (x, y, s, top) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0Q0 -22 60 0L40 40Q20 78 0 96Q-20 78 -40 40Z" fill="#8a5a3c"/><path d="M-60 0Q0 -26 60 0Q0 14 -60 0Z" fill="${top}"/><path d="M-12 8h14v74q-7 6-14 0Z" fill="#9be8ff" opacity=".8"/></g>`;
    return sky(p, [[0, '#4db8ff'], [.7, '#bfeaff'], [1, '#fff4e0']]) +
      `<defs>${glowDef(p + 'sun', '#fff2a0', 1)}</defs><circle cx="330" cy="70" r="70" fill="url(#${p}sun)"/><circle cx="330" cy="70" r="30" fill="#fff6b0"/>` +
      cloud(90, 60, 1.1) + cloud(230, 130, .8) + cloud(60, 160, .7, '#fff', .8) +
      isl(70, 195, .7, '#6fd66f') + isl(345, 175, .55, '#7be07b') + isl(335, 270, .5, '#5bc96f') +
      `<g transform="translate(335 160)"><path d="M0 0v-26" stroke="#7a4a2a" stroke-width="4"/><circle cx="0" cy="-34" r="14" fill="#ff8fc2"/></g>` +
      `<path d="M0 305Q100 290 200 304T400 298V400H0Z" fill="#6fd66f"/><path d="M0 345Q120 330 220 346T400 340V400H0Z" fill="#4cbf5e"/>` +
      flower(45, 370, 6, '#ffd24d', '#ff7aa8') + flower(350, 372, 7, '#ff8fd0') + flower(300, 385, 5, '#fff') +
      blob([
        '<path d="M22 322C60 305 92 275 106 235L150 285L128 322Z"/>',
        '<ellipse cx="170" cy="255" rx="102" ry="58"/>',
        '<path d="M120 250C108 170 150 110 196 62L246 84C214 124 198 170 214 250Z"/>',
        '<ellipse cx="248" cy="72" rx="32" ry="23"/>',
        { l: 'M105 290L105 335', w: 38 }, { l: 'M145 292L145 337', w: 38 }, { l: 'M200 292L200 337', w: 38 }, { l: 'M242 288L242 335', w: 38 },
      ], B, D) +
      `<ellipse cx="170" cy="282" rx="76" ry="26" fill="#ffe3a8"/><path d="M150 100C170 150 175 190 168 240" stroke="#ffe3a8" stroke-width="22" fill="none" stroke-linecap="round" opacity=".0"/>` +
      `<g fill="#d97a1f"><circle cx="120" cy="238" r="9"/><circle cx="155" cy="222" r="10"/><circle cx="195" cy="228" r="9"/><circle cx="232" cy="240" r="8"/><circle cx="150" cy="190" r="7"/><circle cx="178" cy="148" r="7"/><circle cx="196" cy="108" r="6"/></g>` +
      eye(258, 66, 9) + `<circle cx="274" cy="68" r="2.5" fill="${D}"/><circle cx="268" cy="62" r="2.5" fill="${D}"/>` + smile(256, 84, 20, D) + blush(246, 82, 7) + toes(105, 339) + toes(145, 341) + toes(200, 341) + toes(242, 339);
  }

  // ---------- 4. สเตโกซอรัส : ออโรร่า ----------
  function steg(p) {
    const B = '#8e6fd8', D = '#43288a';
    const yTop = (x) => 255 - 62 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 200) / 125, 2)));
    let plates = '';
    [[118, 26], [152, 38], [190, 46], [230, 42], [266, 32]].forEach(([x, s], i) => {
      const y = yTop(x) + 6;
      plates += `<g transform="translate(${x} ${y}) rotate(${-8 + i * 4})"><path d="M-${s * .5} 0Q-${s * .55} -${s * 1.1} 0 -${s * 1.35}Q${s * .55} -${s * 1.1} ${s * .5} 0Z" fill="url(#${p}pl)" stroke="#9c3f8f" stroke-width="3.5" stroke-linejoin="round"/><path d="M0 0V-${s * .9}" stroke="#fff" stroke-width="3" opacity=".5"/></g>`;
    });
    return sky(p, [[0, '#0b1240'], [.5, '#1b2a73'], [1, '#2d6d86']]) + stars(11, 40, 0, 200) +
      `<defs><linearGradient id="${p}au" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4dffb0" stop-opacity="0"/><stop offset=".3" stop-color="#4dffb0"/><stop offset=".7" stop-color="#b47bff"/><stop offset="1" stop-color="#ff7bd8" stop-opacity="0"/></linearGradient><linearGradient id="${p}pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe86b"/><stop offset="1" stop-color="#ff7ab8"/></linearGradient><filter id="${p}bl"><feGaussianBlur stdDeviation="7"/></filter></defs>` +
      `<g filter="url(#${p}bl)" opacity=".75"><path d="M-20 90C60 20 120 120 200 60S340 20 430 80L430 130C340 70 280 130 200 110S60 50 -20 140Z" fill="url(#${p}au)"/><path d="M-20 150C80 100 140 170 230 120S350 90 430 140L430 170C340 130 290 180 230 160S80 120 -20 190Z" fill="url(#${p}au)" opacity=".6"/></g>` +
      `<path d="M0 290L70 190L110 250L170 170L240 270L300 200L360 260L400 220V400H0Z" fill="#26407a"/><path d="M70 190L90 218L70 212L52 222Z M170 170L192 205L170 198L150 210Z M300 200L318 226L300 220L284 230Z" fill="#dff3ff"/>` +
      `<path d="M0 312Q100 296 200 312T400 306V400H0Z" fill="#1f5f6f"/><path d="M0 346Q120 332 220 348T400 342V400H0Z" fill="#164a5a"/>` +
      shroom(45, 352, 1.3, '#4dffe0', '#d9fff8', '#4dffe0') + shroom(350, 365, 1.5, '#ff7bd8', '#ffe0f6', '#ff7bd8') + shroom(110, 380, .9, '#b47bff', '#eee0ff', '#b47bff') + shroom(300, 385, .8, '#4dffe0', '#d9fff8', '#4dffe0') +
      blob([
        '<path d="M110 265C70 265 40 250 14 218L26 300C60 312 100 306 128 296Z"/>',
        '<ellipse cx="200" cy="255" rx="125" ry="62"/>',
        '<path d="M300 238C330 244 348 262 342 290L296 302Z"/><ellipse cx="346" cy="286" rx="36" ry="22"/>',
        { l: 'M130 295L124 335', w: 44 }, { l: 'M290 296L294 336', w: 36 }, { l: 'M168 298L166 336', w: 36 }, { l: 'M250 300L252 336', w: 34 },
      ], B, D) + plates +
      `<path d="M26 300L14 252L40 292Z M50 306L36 264L62 300Z" fill="#fff6dc" stroke="${D}" stroke-width="3" stroke-linejoin="round"/>` +
      `<ellipse cx="205" cy="288" rx="90" ry="26" fill="#cdb9ff"/>` +
      eye(352, 276, 8.5) + smile(344, 298, 20, D) + blush(330, 292, 7) + `<ellipse cx="376" cy="282" rx="2.6" ry="3.5" fill="${D}"/>` + toes(124, 340) + toes(294, 341);
  }

  // ---------- 5. แอนคีโลซอรัส : ทะเลทรายลูกกวาด (หันซ้าย) ----------
  function anky(p) {
    const B = '#35b5a2', D = '#136a60';
    let bumps = '';
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.08 + i * 0.105);
      const x = 200 + Math.cos(a) * 118, y = 262 + Math.sin(a) * 52;
      bumps += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 ? 13 : 16}" fill="#ff9a3c" stroke="#b5561a" stroke-width="3.5"/><circle cx="${(x - 3).toFixed(1)}" cy="${(y - 3).toFixed(1)}" r="4" fill="#ffd37a"/>`;
    }
    const dino = blob([
      '<path d="M96 268C60 270 36 282 22 292L28 314C64 314 96 306 116 298Z"/>',
      '<ellipse cx="22" cy="302" rx="28" ry="24"/>',
      '<ellipse cx="205" cy="268" rx="132" ry="56"/>',
      '<path d="M312 256C314 226 372 222 388 248C394 272 362 292 330 288Z"/>',
      { l: 'M120 300L118 336', w: 36 }, { l: 'M170 304L172 338', w: 32 }, { l: 'M250 304L250 338', w: 32 }, { l: 'M298 298L304 336', w: 36 },
    ], B, D) +
      `<ellipse cx="210" cy="300" rx="100" ry="22" fill="#a8f0e2"/>` + bumps +
      `<path d="M0 0" /><path d="M330 236l10-26l10 28z M352 242l14-24l6 30z" fill="#fff6dc" stroke="#c9a85c" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M12 286l-12-12M4 306l-14 4M20 322l-8 14M38 296l4-18" stroke="#fff6dc" stroke-width="7" stroke-linecap="round"/>` +
      eye(362, 256, 9.5) + smile(346, 276, 22, D) + blush(340, 270, 7) + toes(118, 339) + toes(302, 339);
    return sky(p, [[0, '#ff8fb8'], [.5, '#ffc8a0'], [1, '#fff0b0']]) +
      `<defs>${glowDef(p + 'sun', '#fff0a0', 1)}</defs><circle cx="95" cy="110" r="95" fill="url(#${p}sun)"/><circle cx="95" cy="110" r="50" fill="#fff7c4"/>` +
      cloud(260, 70, 1, '#ffe6f1', .9) + cloud(350, 140, .8, '#ffe6f1', .85) + stars(5, 8, 0, 60, '#fff') +
      `<path d="M150 330V220Q150 200 170 200H230Q250 200 250 220V330Z" fill="#e8679a"/><path d="M150 250H250V270H150Z M150 295H250V315H150Z" fill="#f59ab8"/>` +
      `<path d="M250 330V180Q250 160 270 160H330Q350 160 350 180V330Z" fill="#c9609e"/><path d="M250 205H350V225H250Z M250 255H350V275H250Z" fill="#e48ac0"/>` +
      `<path d="M0 320Q100 296 200 316T400 308V400H0Z" fill="#f7c97e"/><path d="M0 352Q120 336 220 354T400 346V400H0Z" fill="#f0b05c"/>` +
      `<path d="M40 368q30-10 60 0M260 376q30-10 60 0M180 390q20-6 40 0" fill="none" stroke="#fff3c8" stroke-width="3" stroke-linecap="round"/>` +
      `<g><rect x="18" y="226" width="22" height="100" rx="11" fill="#4cc46a" stroke="#1f7a3a" stroke-width="4"/><rect x="-6" y="262" width="34" height="14" rx="7" fill="#4cc46a" stroke="#1f7a3a" stroke-width="4"/><rect x="30" y="248" width="30" height="14" rx="7" fill="#4cc46a" stroke="#1f7a3a" stroke-width="4"/>${flower(29, 224, 7, '#ff6fa8')}</g>` +
      `<g><rect x="362" y="262" width="20" height="70" rx="10" fill="#4cc46a" stroke="#1f7a3a" stroke-width="4"/>${flower(372, 260, 6, '#ff6fa8')}</g>` +
      mirror(dino);
  }

  // ---------- 6. สปิโนซอรัส : ทะเลสาบเขตร้อน (หันซ้าย) ----------
  function spin(p) {
    const B = '#7c6ae0', D = '#3a2a9a';
    let rays = '';
    for (let i = 0; i < 9; i++) {
      const x = 126 + i * 19, h = 70 + Math.sin(i * 1.3) * 18;
      rays += `<path d="M${x} 205V${205 - h}" stroke="#ffe4a0" stroke-width="3.5" stroke-linecap="round"/><circle cx="${x}" cy="${205 - h}" r="4.5" fill="#ffe4a0"/>`;
    }
    const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q14 -50 4 -100" stroke="#8a5a30" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="#2fb560" stroke="#1c7a3d" stroke-width="3" stroke-linejoin="round"><path d="M4 -100Q-30 -120 -62 -92Q-30 -104 4 -100Z"/><path d="M4 -100Q-10 -140 -44 -146Q-20 -128 4 -100Z"/><path d="M4 -100Q30 -140 66 -134Q40 -120 4 -100Z"/><path d="M4 -100Q40 -116 66 -88Q36 -100 4 -100Z"/></g><circle cx="0" cy="-98" r="6" fill="#8a5a30"/></g>`;
    const dino = blob([
      '<path d="M120 245C80 250 50 235 15 205L30 262C70 278 110 276 130 272Z"/>',
      '<ellipse cx="200" cy="238" rx="86" ry="56"/>',
      '<path d="M262 220C280 192 296 176 310 172L322 218L272 272Z"/>',
      '<path d="M295 168C300 148 330 145 392 160C398 166 396 178 388 182L330 192C305 196 292 184 295 168Z"/>',
      { l: 'M170 272L165 336', w: 36 }, { l: 'M232 274L242 336', w: 32 }, { l: 'M258 246L284 266', w: 14 },
    ], B, D) +
      `<ellipse cx="205" cy="268" rx="62" ry="26" fill="#cfc6ff"/>` +
      `<path d="M318 183C340 190 372 190 388 180" fill="none" stroke="${D}" stroke-width="3"/>` +
      `<g fill="#fff">${[0, 1, 2, 3, 4].map(i => `<path d="M${334 + i * 11} 184l5 0l-2.5 9z"/>`).join('')}</g>` +
      rays +
      `<path d="M118 206C124 122 186 92 228 112C262 128 270 172 276 208Z" fill="#ff5f9e" stroke="#b81f64" stroke-width="5" stroke-linejoin="round"/>` +
      `<path d="M140 206C146 140 190 116 226 130M180 206C184 160 204 138 228 136M226 208C230 176 240 156 252 148" fill="none" stroke="#ffb0d0" stroke-width="5" stroke-linecap="round"/>` +
      eye(322, 158, 9) + `<ellipse cx="386" cy="162" rx="2.6" ry="3.4" fill="${D}"/>` + blush(318, 176, 7) +
      `<path d="M285 266l8 4M285 266l4 9" stroke="#fff6dc" stroke-width="4" stroke-linecap="round"/>`;
    const water = `<path d="M0 300Q50 290 100 300T200 300T300 300T400 300V400H0Z" fill="#1aa6d0" opacity=".88"/><path d="M0 335Q60 325 120 335T240 335T360 335T400 332V400H0Z" fill="#0b7fb5" opacity=".95"/><path d="M20 318q20-6 40 0M170 322q22-6 44 0M300 316q20-6 40 0M80 365q24-6 48 0M250 372q24-6 48 0" fill="none" stroke="#e9fbff" stroke-width="3.5" stroke-linecap="round"/>` +
      `<g><ellipse cx="45" cy="352" rx="26" ry="8" fill="#3fcf7a"/>${flower(45, 345, 6, '#ff9de0')}</g><g><ellipse cx="340" cy="368" rx="22" ry="7" fill="#3fcf7a"/>${flower(340, 362, 5, '#fff')}</g>` +
      `<g transform="translate(330 270) rotate(-30)"><ellipse rx="14" ry="6" fill="#ffb347"/><path d="M-12 0l-10-6v12z" fill="#ffb347"/><circle cx="7" cy="-1" r="1.8" fill="#222"/></g>`;
    return sky(p, [[0, '#35c8e8'], [.65, '#b9f2ff'], [1, '#fff8e0']]) +
      `<defs>${glowDef(p + 'sun', '#fff2a0', 1)}</defs><circle cx="70" cy="70" r="60" fill="url(#${p}sun)"/><circle cx="70" cy="70" r="26" fill="#fff6b0"/>` +
      cloud(220, 60, 1) + cloud(330, 110, .7) +
      `<path d="M0 280L60 210L120 270L200 190L290 280L340 230L400 285V300H0Z" fill="#6bd1b3"/><path d="M200 190L216 212L200 208L184 214Z" fill="#fff"/>` +
      palm(355, 300, 1) + palm(30, 300, .8) +
      mirror(dino) + water;
  }

  // ---------- 7. พาราซอโรโลฟัส : สายรุ้ง ----------
  function para(p) {
    const B = '#ffcf44', D = '#b36a00';
    const bows = ['#ff6b6b', '#ffa94d', '#ffe066', '#69db7c', '#4dabf7', '#9775fa'];
    const rb = bows.map((c, i) => `<path d="M${200 - (200 - i * 14)} 335A${200 - i * 14} ${200 - i * 14} 0 0 1 ${200 + (200 - i * 14)} 335" fill="none" stroke="${c}" stroke-width="14"/>`).join('');
    return sky(p, [[0, '#a8e6ff'], [.7, '#e6f6ff'], [1, '#fff0fa']]) +
      `<g opacity=".9" transform="translate(0 -70)">${rb}</g>` +
      cloud(50, 270, 1.1) + cloud(350, 262, 1.2) + cloud(205, 70, .8, '#fff', .8) +
      `<path d="M300 130H400V340H300Z" fill="#a37bd8"/><path d="M300 130Q320 118 340 130T400 125V150H300Z" fill="#7be07b"/><path d="M322 150h22v190h-22Z" fill="#a8ecff"/><path d="M322 150h22v190h-22Z" fill="url(#${p}wf)" opacity=".0"/><path d="M326 160v170M334 156v176M340 166v160" stroke="#fff" stroke-width="2.5" opacity=".7"/>` +
      `<ellipse cx="333" cy="338" rx="38" ry="12" fill="#7dd9ff"/>` +
      `<g transform="translate(30 250)"><rect x="-5" y="0" width="10" height="60" fill="#8a5a3c"/><circle cx="0" cy="-14" r="36" fill="#ff9ccf"/><circle cx="-16" cy="-30" r="10" fill="#ffc2e2"/><circle cx="14" cy="-8" r="8" fill="#ffc2e2"/></g>` +
      `<g transform="translate(80 270) scale(.7)"><rect x="-5" y="0" width="10" height="60" fill="#8a5a3c"/><circle cx="0" cy="-14" r="36" fill="#b9f08a"/><circle cx="-12" cy="-26" r="9" fill="#dcffb8"/></g>` +
      `<path d="M0 305Q100 288 200 304T400 298V400H0Z" fill="#9be07c"/><path d="M0 345Q120 330 220 346T400 340V400H0Z" fill="#74cf6c"/>` +
      flower(60, 368, 7, '#ff8fd0') + flower(150, 382, 6, '#fff') + flower(260, 372, 7, '#ff6b6b') + flower(380, 380, 6, '#fff') +
      blob([
        '<path d="M110 240C70 250 40 250 15 275L25 300C70 292 110 285 130 278Z"/>',
        '<ellipse cx="190" cy="245" rx="92" ry="52"/>',
        '<path d="M235 215C262 180 270 150 285 130L322 150C305 170 305 200 290 240Z"/>',
        '<path d="M282 120C285 100 310 96 335 108L378 116C388 120 386 134 376 138L322 148C298 150 280 138 282 120Z"/>',
        { l: 'M150 280L146 336', w: 40 }, { l: 'M250 282L254 336', w: 34 }, { l: 'M226 262L240 300', w: 12 },
      ], B, D) +
      `<ellipse cx="195" cy="274" rx="70" ry="24" fill="#fff1b8"/>` +
      blob(['<path d="M298 106C288 78 255 56 205 58C194 70 204 82 222 84C256 86 280 102 290 128Z"/>'], '#b06be8', '#5e2a96') +
      `<path d="M214 62Q250 70 280 108M210 74Q248 82 284 118" fill="none" stroke="#ffd9f5" stroke-width="5" stroke-linecap="round"/>` +
      `<g fill="#f2a200"><circle cx="130" cy="228" r="8"/><circle cx="165" cy="214" r="9"/><circle cx="205" cy="212" r="8"/><circle cx="240" cy="226" r="7"/></g>` +
      eye(318, 120, 8.5) + smile(334, 134, 22, D) + blush(304, 136, 7) + `<circle cx="372" cy="122" r="2.6" fill="${D}"/>` + toes(146, 339) + toes(254, 339);
  }

  // ---------- 8. คาร์โนทอรัส : ถ้ำคริสตัล (หันซ้าย) ----------
  function carno(p) {
    const B = '#e0554f', D = '#7a1f26';
    const crys = (x, y, s, c1, c2) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-34" r="50" fill="${c1}" opacity=".25"/><path d="M-20 0L-12 -52L0 -70L10 -50L22 0Z" fill="${c1}"/><path d="M0 -70L10 -50L22 0H4Z" fill="${c2}" opacity=".55"/><path d="M-34 0L-34 -30L-24 -44L-14 -28L-10 0Z" fill="${c2}"/><path d="M18 0L26 -36L38 -26L40 0Z" fill="${c1}"/></g>`;
    let stal = '';
    [[20, 50], [70, 80], [130, 40], [200, 62], [260, 36], [320, 78], [375, 52]].forEach(([x, h]) => { stal += `<path d="M${x - 22} 0L${x} ${h}L${x + 22} 0Z" fill="#3b2275" stroke="#53309b" stroke-width="3" stroke-linejoin="round"/>`; });
    const dino = blob([
      '<path d="M115 250C80 260 40 280 12 310L35 322C80 310 120 300 140 290Z"/>',
      '<ellipse cx="205" cy="238" rx="92" ry="64"/>',
      '<path d="M260 215C270 180 282 160 300 148L338 190L296 255Z"/>',
      '<path d="M290 140C295 105 350 100 385 125C392 140 388 162 370 168L305 172C292 166 288 154 290 140Z"/>',
      { l: 'M175 280L168 330', w: 40 }, { l: 'M240 284L248 330', w: 36 }, { l: 'M252 240L268 258', w: 9 },
    ], B, D) +
      `<ellipse cx="212" cy="270" rx="64" ry="28" fill="#ffc9a0"/>` +
      `<g fill="#9c2d34"><path d="M150 190l14 40l-20-8z M185 178l12 46l-20-14z M222 178l8 46l-18-16z M255 190l2 38l-16-14z"/></g>` +
      `<path d="M318 108L326 74L338 108Z M348 112L358 84L366 118Z" fill="#fff0cc" stroke="#c9a85c" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M300 160Q340 176 380 160" fill="none" stroke="${D}" stroke-width="3.5" stroke-linecap="round"/>` +
      `<g fill="#fff">${[0, 1, 2, 3].map(i => `<path d="M${314 + i * 15} 162l7 3l-5 8z"/>`).join('')}</g>` +
      eye(344, 130, 10) + `<path d="M330 112q14 -2 28 6" fill="none" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/>` + blush(322, 148, 8) + `<ellipse cx="384" cy="136" rx="2.5" ry="3.4" fill="${D}"/>` +
      `<path d="M268 258l9 5m-9-5l3 9" stroke="#fff6dc" stroke-width="4" stroke-linecap="round"/>` + toes(166, 334) + toes(248, 334);
    return sky(p, [[0, '#150a33'], [.6, '#2b1668'], [1, '#4a2a8e']]) + stars(21, 25, 0, 200, '#cdb8ff') +
      `<path d="M0 0H400V60Q300 40 200 60T0 60Z" fill="#241250"/>` + stal +
      `<defs>${glowDef(p + 'lt', '#7ae8ff', .9)}</defs><ellipse cx="200" cy="170" rx="150" ry="110" fill="url(#${p}lt)" opacity=".25"/>` +
      crys(40, 330, 1.5, '#5fe3ff', '#8aa4ff') + crys(360, 330, 1.7, '#ff7bd8', '#b47bff') + crys(150, 318, .9, '#b47bff', '#ff7bd8') + crys(300, 322, .8, '#5fe3ff', '#8aa4ff') +
      `<path d="M0 312Q100 298 200 312T400 306V400H0Z" fill="#3a2377"/><path d="M0 348Q120 334 220 350T400 344V400H0Z" fill="#2a1860"/>` +
      shroom(60, 376, 1.1, '#5fe3ff', '#e0fbff', '#5fe3ff') + shroom(335, 380, 1.2, '#ffd36b', '#fff3d0', '#ffd36b') + shroom(200, 392, .8, '#ff7bd8', '#ffe0f6', '#ff7bd8') +
      fly(8, 10, 80, 300, '#a8fff0') +
      mirror(dino);
  }

  // ---------- 9. ดิพลอโดคัส : ป่าเวทมนตร์ ----------
  function dipl(p) {
    const B = '#f08fc0', D = '#9c2f6e';
    const trunk = (x, w) => `<path d="M${x - w / 2} 330C${x - w / 2 + 6} 200 ${x - w / 2 - 4} 100 ${x - w / 2 + 4} 0H${x + w / 2 - 4}C${x + w / 2 + 4} 100 ${x + w / 2 - 6} 200 ${x + w / 2} 330Z" fill="#1c5a48"/>`;
    return sky(p, [[0, '#0e4a4c'], [.55, '#2f9a86'], [1, '#bff0b8']]) +
      `<path d="M120 0L60 330H150L210 0Z M230 0L190 330H260L290 0Z" fill="#fff" opacity=".1"/>` +
      trunk(25, 56) + trunk(380, 70) + trunk(335, 34) +
      `<g fill="#2dbf80" opacity=".9"><ellipse cx="30" cy="40" rx="70" ry="38"/><ellipse cx="380" cy="40" rx="80" ry="40"/><ellipse cx="200" cy="10" rx="120" ry="28"/></g>` +
      `<g stroke="#ffe566" stroke-width="2" opacity=".6"><path d="M70 60V110M110 40V90M320 62V120M280 40V80"/></g>` +
      `<g fill="#ffe566">${[[70, 110], [110, 90], [320, 120], [280, 80]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/><circle cx="${x}" cy="${y}" r="14" opacity=".25"/>`).join('')}</g>` +
      fly(4, 14, 90, 300) +
      `<path d="M0 305Q100 290 200 306T400 300V400H0Z" fill="#3fae6a"/><path d="M0 345Q120 332 220 348T400 342V400H0Z" fill="#2c8c58"/>` +
      shroom(60, 362, 1.5, '#ff8a4d', '#fff1d8', '#ffb06b') + shroom(345, 372, 1.7, '#ff6fb0', '#fff1d8', '#ff9fd0') + shroom(150, 386, .9, '#ffd24d', '#fff1d8', '#ffe27a') + shroom(272, 388, .8, '#7ad7ff', '#fff1d8', '#a8e8ff') +
      `<path d="M100 345q-6-30 6-44M112 345q4-26 18-36M240 340q-4-28 8-40" stroke="#1f7a46" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      blob([
        '<path d="M105 240C60 255 30 290 8 280L10 296C45 312 95 295 120 285Z"/>',
        '<ellipse cx="165" cy="258" rx="92" ry="52"/>',
        '<path d="M205 236C255 230 282 196 290 148L322 158C314 210 270 262 225 286Z"/>',
        '<ellipse cx="312" cy="130" rx="28" ry="19"/>', '<path d="M300 122L350 136C356 146 346 154 332 152L304 146Z"/>',
        { l: 'M110 292L108 336', w: 34 }, { l: 'M150 296L150 338', w: 34 }, { l: 'M205 296L205 338', w: 34 }, { l: 'M240 290L242 336', w: 34 },
      ], B, D) +
      `<ellipse cx="170" cy="284" rx="70" ry="22" fill="#ffd0e8"/>` +
      `<g fill="#ffb5d8"><circle cx="120" cy="238" r="9"/><circle cx="158" cy="224" r="10"/><circle cx="196" cy="230" r="8"/><circle cx="60" cy="278" r="5"/><circle cx="270" cy="200" r="6"/><circle cx="288" cy="170" r="5"/></g>` +
      eye(322, 124, 8.5) + smile(326, 142, 18, D) + blush(308, 142, 7) + `<circle cx="344" cy="134" r="2.4" fill="${D}"/>` + toes(108, 340) + toes(150, 342) + toes(205, 342) + toes(242, 340);
  }

  // ---------- 10. เทริซิโนซอรัส : ภูเขาหิมะ ----------
  function ther(p) {
    const B = '#b9703a', D = '#6a3a14';
    let tufts = '';
    for (let i = 0; i < 12; i++) {
      const a = Math.PI * (0.55 + i * 0.12) + Math.PI * .5;
      const x = 190 + Math.cos(a) * 80, y = 238 + Math.sin(a) * 62;
      tufts += `<path d="M${(x - 7).toFixed(1)} ${y.toFixed(1)}l7 -${14}l7 14z" fill="#ff9a3c" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    const claws = [0, 1, 2].map(i => `<path d="M${286 + i * 8} ${262 + i * 6}Q${330 + i * 12} ${262 + i * 18} ${372 + i * 6} ${300 + i * 10}" fill="none" stroke="#6a3a14" stroke-width="12" stroke-linecap="round"/><path d="M${286 + i * 8} ${262 + i * 6}Q${330 + i * 12} ${262 + i * 18} ${372 + i * 6} ${300 + i * 10}" fill="none" stroke="#fff6dc" stroke-width="6" stroke-linecap="round"/>`).join('');
    const flakes = (() => { const r = rnd(33); let s = ''; for (let i = 0; i < 26; i++) s += `<circle cx="${(r() * 400) | 0}" cy="${(r() * 330) | 0}" r="${(1.5 + r() * 2.5).toFixed(1)}" fill="#fff" opacity=".9"/>`; return s; })();
    return sky(p, [[0, '#9fd2ff'], [.6, '#dff1ff'], [1, '#f4fbff']]) +
      `<defs>${glowDef(p + 'mn', '#ffffff', .9)}</defs><circle cx="305" cy="85" r="64" fill="url(#${p}mn)"/><circle cx="305" cy="85" r="34" fill="#fffdf0"/><circle cx="295" cy="76" r="6" fill="#efe7c8"/><circle cx="316" cy="95" r="4" fill="#efe7c8"/>` +
      cloud(80, 70, 1, '#fff', .9) + cloud(200, 130, .7, '#fff', .8) +
      `<path d="M-20 300L70 150L130 240L200 130L290 270L340 190L420 300Z" fill="#a9b8ff"/><path d="M70 150L98 200L70 192L44 204Z M200 130L232 190L200 182L170 194Z M340 190L362 228L340 222L320 232Z" fill="#fff"/>` +
      `<path d="M-20 310L50 230L120 300L190 250L260 310L340 240L420 310V330H-20Z" fill="#c8d6ff"/>` +
      pine(40, 318, 1.2, '#2f9aa0', '#fff') + pine(85, 326, .9, '#3bb0b0', '#fff') + pine(355, 320, 1.3, '#2f9aa0', '#fff') + pine(390, 330, .8, '#3bb0b0', '#fff') +
      `<path d="M0 318Q100 300 200 316T400 310V400H0Z" fill="#ffffff"/><path d="M0 352Q120 338 220 354T400 348V400H0Z" fill="#dcecff"/><path d="M0 318Q100 300 200 316T400 310" fill="none" stroke="#c4dcff" stroke-width="3"/>` +
      `<g fill="#8fe8ff" stroke="#4dbfe8" stroke-width="2.5" stroke-linejoin="round"><path d="M30 380l8-28l10 28z"/><path d="M355 384l7-22l9 22z"/><path d="M290 392l6-18l8 18z"/></g>` +
      blob([
        '<path d="M120 235C85 235 55 250 30 272L50 290C85 280 115 275 135 270Z"/>',
        '<ellipse cx="190" cy="240" rx="82" ry="62"/>',
        { l: 'M235 215C255 175 262 135 276 98', w: 36 },
        '<ellipse cx="287" cy="86" rx="27" ry="21"/>',
        { l: 'M170 290L160 334', w: 32 }, { l: 'M230 290L238 334', w: 32 }, { l: 'M240 240L284 262', w: 20 },
      ], B, D) + tufts +
      `<ellipse cx="192" cy="268" rx="56" ry="28" fill="#ffd9a8"/>` +
      `<path d="M296 82L338 90L300 103Z" fill="#ffd24d" stroke="#b3801f" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="M262 70q8-18 22-18" fill="none" stroke="#ff9a3c" stroke-width="7" stroke-linecap="round"/><path d="M270 62q6-20 22-22" fill="none" stroke="#ff7a1f" stroke-width="6" stroke-linecap="round"/>` +
      claws + eye(288, 80, 9) + blush(282, 96, 6) +
      `<path d="M150 336h26M222 336h26" stroke="#fff6dc" stroke-width="0"/>` + toes(160, 338) + toes(238, 338) + flakes;
  }

  // ======== ชุดที่ 2: สไตล์การ์ตูนตัวละคร (เส้นขอบหนา ตาโต ลายจุด กอหญ้า) ========
  const ceye = (x, y, r, iris) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#1d1d1d" stroke-width="3.5"/><circle cx="${x + r * .12}" cy="${y + r * .05}" r="${r * .7}" fill="${iris}"/><circle cx="${x + r * .12}" cy="${y + r * .05}" r="${r * .4}" fill="#111"/><circle cx="${x + r * .38}" cy="${y - r * .28}" r="${r * .24}" fill="#fff"/><circle cx="${x - r * .15}" cy="${y + r * .3}" r="${r * .1}" fill="#fff"/>`;
  const grass = (x, y, s, c = '#3fa84a', o = '#1d5a2a') => {
    const b = (dx, h, w) => `<path d="M${x + dx - w} ${y}L${x + dx} ${y - h * s}L${x + dx + w} ${y}Z"/>`;
    const sh = b(-12, 26, 6) + b(0, 34, 7) + b(12, 24, 6);
    return `<g fill="${o}" stroke="${o}" stroke-width="6" stroke-linejoin="round">${sh}</g><g fill="${c}">${sh}</g>`;
  };
  const spots = (arr, c) => arr.map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * .78).toFixed(1)}" fill="${c}"/>`).join('');
  const shadow = (x, y, rx) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="9" fill="#000" opacity=".22"/>`;
  const teethLine = (x0, y0, x1, y1, n, sz, down = true) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : i / (n - 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      s += `<path d="M${(x - sz / 2).toFixed(1)} ${y.toFixed(1)}l${sz} 0l${-sz / 2} ${down ? sz * 1.6 : -sz * 1.6}z" fill="#fff" stroke="#6a3030" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    return s;
  };

  // ---------- 11. จิกาโนโตซอรัส : พายุสายฟ้ากับดอกไม้ยักษ์ ----------
  function giga(p) {
    const B = '#4a6cf0', D = '#18287a';
    const flowerBig = (x, y, s, c1, c2) => {
      let o = `<path d="M${x} ${y}C${x - 8 * s} ${y - 40 * s} ${x + 6 * s} ${y - 60 * s} ${x} ${y - 70 * s}" stroke="#1f8a5a" stroke-width="${5 * s}" fill="none"/><circle cx="${x}" cy="${y - 80 * s}" r="${46 * s}" fill="${c1}" opacity=".3"/>`;
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; o += `<ellipse cx="${(x + Math.cos(a) * 17 * s).toFixed(1)}" cy="${(y - 80 * s + Math.sin(a) * 17 * s).toFixed(1)}" rx="${13 * s}" ry="${9 * s}" transform="rotate(${(a * 57.3).toFixed(0)} ${(x + Math.cos(a) * 17 * s).toFixed(1)} ${(y - 80 * s + Math.sin(a) * 17 * s).toFixed(1)})" fill="${c1}"/>`; }
      return o + `<circle cx="${x}" cy="${y - 80 * s}" r="${9 * s}" fill="${c2}"/>`;
    };
    return sky(p, [[0, '#150c3a'], [.45, '#4b2585'], [.8, '#c0509a'], [1, '#ff9ac0']]) +
      `<defs>${glowDef(p + 'lg', '#fff6a0', 1)}</defs>` +
      `<g fill="#2a1760"><ellipse cx="60" cy="50" rx="90" ry="36"/><ellipse cx="330" cy="40" rx="100" ry="40"/><ellipse cx="190" cy="85" rx="80" ry="28"/><ellipse cx="380" cy="120" rx="50" ry="22"/></g>` +
      `<g fill="#6a3aa8" opacity=".8"><ellipse cx="70" cy="95" rx="60" ry="20"/><ellipse cx="310" cy="85" rx="70" ry="20"/></g>` +
      `<circle cx="215" cy="150" r="90" fill="url(#${p}lg)" opacity=".7"/><path d="M232 60L196 140L222 140L190 230L262 120L232 120L262 60Z" fill="#fff36b" stroke="#ffb400" stroke-width="4" stroke-linejoin="round"/>` +
      `<path d="M-10 300L40 210L90 280L150 200L210 290L280 215L340 285L410 230V320H-10Z" fill="#3a1d6e"/><path d="M0 318Q100 300 200 316T400 308V400H0Z" fill="#40206f"/><path d="M0 352Q120 338 220 354T400 348V400H0Z" fill="#2c1556"/>` +
      flowerBig(40, 345, .95, '#ff7bd8', '#ffe14d') + flowerBig(360, 352, 1.05, '#5fe3ff', '#fff') + flowerBig(330, 390, .6, '#ffb347', '#fff') + fly(14, 12, 150, 320, '#ffe6ff') +
      shadow(200, 344, 130) +
      blob([
        '<path d="M135 215C92 232 45 226 10 196C28 262 80 298 152 292Z"/>',
        '<ellipse cx="190" cy="232" rx="66" ry="78"/>',
        { l: 'M165 285L148 328', w: 42 }, { l: 'M130 337L176 337', w: 24 }, { l: 'M215 290L226 328', w: 38 }, { l: 'M214 337L260 337', w: 22 },
        '<path d="M195 180C195 150 208 128 228 116L284 144L250 205Z"/>',
        '<path d="M226 146L334 130C338 168 306 192 268 190C240 186 226 168 226 146Z"/>'
      ], B, D, 11) +
      `<ellipse cx="206" cy="258" rx="40" ry="56" fill="#ffe9a8"/>` +
      `<g fill="none" stroke="#2f4ad0" stroke-width="7" stroke-linecap="round"><path d="M135 208q16-14 36-10M150 228q18-14 38-10M170 190q16-8 32-2"/></g>` +
      spots([[60, 232, 9], [95, 250, 8], [30, 215, 6]], '#2f4ad0') +
      `<path d="M232 148L330 134C330 164 304 180 270 178C250 176 236 166 232 148Z" fill="#c7283f"/><ellipse cx="278" cy="170" rx="24" ry="8" fill="#ff7f9a"/>` +
      blob(['<path d="M208 112C208 64 275 50 322 76C346 90 352 118 336 134L226 152C212 142 208 126 208 112Z"/>'], B, D, 11) +
      teethLine(244, 150, 326, 136, 6, 9) + teethLine(262, 184, 318, 174, 3, 7, false) +
      ceye(278, 94, 15, '#ffd23f') + `<path d="M256 70q22-14 44 2" fill="none" stroke="${D}" stroke-width="7" stroke-linecap="round"/><ellipse cx="340" cy="104" rx="3.4" ry="5" fill="${D}"/>` + blush(250, 126, 9) +
      `<path d="M222 82l6-18l8 14M240 62l8-16l6 16" fill="#7f9bff" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"/>` +
      blob([{ l: 'M234 212L264 234', w: 12 }], B, D, 6) + `<path d="M264 234l10 2m-10-2l8 8" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` + toes(150, 340) + toes(232, 340) +
      grass(52, 348, 1, '#3fa84a', '#1d5a2a') + grass(350, 352, 1.1);
  }

  // ---------- 12. อาร์เจนติโนซอรัส : รุ่งอรุณกับบอลลูน ----------
  function argent(p) {
    const B = '#6fe0b0', D = '#1b6b55';
    const balloon = (x, y, s, c1, c2) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0C-30 -34 -10 -56 0 -56C10 -56 30 -34 22 0Z" fill="${c1}" stroke="#fff" stroke-width="2"/><path d="M-6 0C-14 -30 -4 -52 0 -56C4 -52 14 -30 6 0Z" fill="${c2}"/><path d="M-12 4L-8 18H8L12 4Z" fill="#a8683a"/><path d="M-12 4L-8 18M12 4L8 18" stroke="#6a3f1f" stroke-width="2"/></g>`;
    const bird = (x, y, s = 1) => `<path d="M${x - 8 * s} ${y}q${4 * s} ${-6 * s} ${8 * s} 0q${4 * s} ${-6 * s} ${8 * s} 0" fill="none" stroke="#7a4a6a" stroke-width="2.5" stroke-linecap="round"/>`;
    const tinyBird = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="7" fill="#ffd24d" stroke="#8a5a10" stroke-width="2.5"/><path d="M${x + 7} ${y - 2}l7 2l-7 3z" fill="#ff8a3d"/><circle cx="${x + 3}" cy="${y - 2}" r="1.8" fill="#222"/>`;
    return sky(p, [[0, '#ffa8c8'], [.45, '#ffd0a0'], [.8, '#fff0b0'], [1, '#fffbe0']]) +
      `<defs>${glowDef(p + 'sn', '#fffbd0', 1)}</defs><circle cx="205" cy="270" r="170" fill="url(#${p}sn)"/><circle cx="205" cy="270" r="62" fill="#fff6b8"/>` +
      `<g stroke="#fff6b8" stroke-width="6" stroke-linecap="round" opacity=".6">${[0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI * (1.05 + i * .15); return `<path d="M${(205 + Math.cos(a) * 80).toFixed(0)} ${(270 + Math.sin(a) * 80).toFixed(0)}L${(205 + Math.cos(a) * 130).toFixed(0)} ${(270 + Math.sin(a) * 130).toFixed(0)}"/>`; }).join('')}</g>` +
      balloon(70, 130, 1.1, '#ff6b8a', '#ffd24d') + balloon(330, 90, 1, '#4dabf7', '#fff') + balloon(250, 170, .7, '#9775fa', '#ff9de0') + bird(140, 80) + bird(300, 150, .8) + bird(40, 60, .7) +
      cloud(40, 250, 1.1, '#fff', .95) + cloud(360, 240, 1.2, '#fff', .95) + cloud(130, 215, .8, '#ffe8f0', .9) +
      `<path d="M0 300Q100 280 200 298T400 290V400H0Z" fill="#a8e6a0"/><path d="M0 340Q120 322 220 342T400 334V400H0Z" fill="#7bd68a"/>` +
      flower(30, 372, 7, '#ff8fd0') + flower(380, 378, 7, '#fff') + flower(90, 388, 5, '#ffd24d', '#ff8fd0') +
      shadow(200, 346, 160) +
      blob([
        '<path d="M110 222C75 234 45 222 26 186C12 180 8 196 14 208C34 262 85 292 138 288Z"/>',
        '<ellipse cx="200" cy="250" rx="118" ry="68"/>',
        '<path d="M268 235C300 195 296 150 290 112L338 114C346 156 350 215 322 268Z"/>',
        '<ellipse cx="322" cy="92" rx="40" ry="29"/>',
        { l: 'M118 300L118 336', w: 48 }, { l: 'M170 306L172 338', w: 46 }, { l: 'M238 306L238 338', w: 46 }, { l: 'M288 298L292 336', w: 48 },
      ], B, D, 11) +
      `<ellipse cx="208" cy="288" rx="92" ry="28" fill="#d9fff0"/>` +
      spots([[120, 232, 12], [165, 215, 13], [215, 220, 12], [260, 235, 11], [300, 165, 8], [310, 205, 8], [90, 258, 8]], '#3fc08f') +
      `<g fill="#3fc08f" stroke="${D}" stroke-width="3.5" stroke-linejoin="round"><path d="M294 190l-14 -4l14 -10z M298 160l-14 -4l14 -10z M300 130l-12 -4l12 -10z M138 204l-4 -16l14 8z M176 192l-2 -16l14 8z M214 190l0 -16l14 8z"/></g>` +
      tinyBird(180, 186) + tinyBird(240, 192) +
      ceye(334, 86, 12.5, '#7a4a2a') + smile(332, 104, 22, D) + blush(312, 102, 8) + `<ellipse cx="358" cy="92" rx="2.4" ry="3.4" fill="${D}"/>` +
      toes(118, 340) + toes(172, 342) + toes(238, 342) + toes(292, 340) + grass(40, 354, 1.1) + grass(360, 352, 1);
  }

  // ---------- 13. อิกัวโนดอน : ปราสาทเทพนิยาย ----------
  function igua(p) {
    const B = '#ff8a65', D = '#8f2f14';
    const tower = (x, y, w, h, wall, roof) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x - 6} ${y}L${x + w / 2} ${y - w * 1.1}L${x + w + 6} ${y}Z" fill="${roof}"/><path d="M${x + w / 2} ${y - w * 1.1}v-16" stroke="#7a5a3a" stroke-width="2.5"/><path d="M${x + w / 2} ${y - w * 1.1 - 16}l14 5l-14 5z" fill="#ff6b8a"/><rect x="${x + w / 2 - 4}" y="${y + 14}" width="8" height="14" rx="4" fill="#6a5a9a"/>`;
    const butter = (x, y, c) => `<g transform="translate(${x} ${y})"><ellipse cx="-7" cy="-3" rx="8" ry="6" fill="${c}"/><ellipse cx="7" cy="-3" rx="8" ry="6" fill="${c}"/><ellipse cx="-5" cy="5" rx="5" ry="4" fill="${c}"/><ellipse cx="5" cy="5" rx="5" ry="4" fill="${c}"/><rect x="-1.2" y="-6" width="2.4" height="14" rx="1.2" fill="#4a2a5a"/></g>`;
    return sky(p, [[0, '#8fd5ff'], [.7, '#d8f1ff'], [1, '#fff6ea']]) +
      cloud(70, 70, 1.2) + cloud(230, 40, .8) + cloud(350, 110, 1) +
      `<path d="M150 330C190 230 240 220 280 220C330 220 380 250 420 330Z" fill="#8edc88"/>` +
      `<rect x="250" y="178" width="110" height="60" fill="#ffe2f0"/>` + tower(238, 150, 34, 90, '#ffd0e6', '#7a8cff') + tower(340, 140, 38, 100, '#ffd0e6', '#7a8cff') + tower(284, 120, 44, 118, '#fff0f6', '#ff7aa8') +
      `<path d="M300 238v-34a12 12 0 0 1 24 0v34Z" fill="#8a5aa8"/>` +
      `<path d="M-10 322Q80 270 170 310T420 300V400H-10Z" fill="#6fd678"/><path d="M0 300Q60 280 110 296" fill="none" stroke="#a8f0a0" stroke-width="6" opacity=".7"/>` +
      `<path d="M0 346Q120 328 220 348T400 340V400H0Z" fill="#4cc26a"/>` +
      `<path d="M215 338Q250 300 276 250" fill="none" stroke="#fff2c0" stroke-width="12" stroke-linecap="round" opacity=".9"/>` +
      butter(60, 200, '#ff9de0') + butter(150, 140, '#ffd24d') + butter(360, 270, '#9de0ff') + butter(30, 130, '#b9a0ff') +
      flower(25, 372, 7, '#ff8fd0') + flower(375, 370, 7, '#ffd24d', '#ff8fd0') + flower(110, 390, 6, '#fff') + flower(290, 386, 6, '#ff8fd0') +
      shadow(200, 344, 130) +
      blob([
        '<path d="M130 245C85 260 45 248 14 214C18 272 80 305 150 290Z"/>',
        '<ellipse cx="195" cy="238" rx="78" ry="60"/>',
        { l: 'M170 280L152 326', w: 42 }, { l: 'M132 337L180 337', w: 24 }, { l: 'M225 284L240 326', w: 38 }, { l: 'M226 337L272 337', w: 22 },
        '<path d="M232 195C246 168 262 150 282 138L322 170L282 240Z"/>',
        { l: 'M240 216L292 200', w: 15 }, { l: 'M250 232L282 255', w: 13 },
      ], B, D, 11) +
      `<ellipse cx="208" cy="262" rx="46" ry="38" fill="#ffd9c0"/>` +
      `<g fill="none" stroke="#e06030" stroke-width="7" stroke-linecap="round"><path d="M135 218q16-14 36-10M152 200q18-12 38-6M180 184q16-8 32-2"/></g>` + spots([[70, 252, 9], [100, 268, 8], [40, 240, 6]], '#e06030') +
      blob(['<path d="M268 132C272 100 312 94 346 112C364 122 362 148 344 154L288 160C274 154 266 144 268 132Z"/>'], B, D, 11) +
      `<path d="M334 116C358 112 372 126 366 142C358 156 340 152 334 142Z" fill="#ffd76b" stroke="#a8761b" stroke-width="5" stroke-linejoin="round"/>` +
      ceye(312, 122, 13, '#2f9a4a') + `<path d="M298 104q14-8 28 0" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>` + smile(318, 150, 22, D) + blush(298, 142, 8) + `<ellipse cx="354" cy="122" rx="2.5" ry="3.4" fill="${D}"/>` +
      `<path d="M296 196l22-16l4 14z" fill="#fff6dc" stroke="#c9a85c" stroke-width="3.5" stroke-linejoin="round"/><path d="M290 198l12 4m-12-4l12-6m-12 6l8 8" stroke="#fff6dc" stroke-width="5" stroke-linecap="round"/>` +
      toes(156, 341) + toes(246, 341) + grass(48, 354, 1) + grass(352, 356, 1.1);
  }

  // ---------- 14. แพคิเซฟาโลซอรัส : คืนฟักทองฮาโลวีน ----------
  function pachy(p) {
    const B = '#b5e04a', D = '#4a6a10';
    const pumpkin = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="52" ry="42" fill="#ff8a1f" stroke="#a84a00" stroke-width="5"/><path d="M-30 -36Q-44 0 -30 36M0 -41V41M30 -36Q44 0 30 36" fill="none" stroke="#d96a00" stroke-width="5"/><rect x="-5" y="-54" width="10" height="16" rx="3" fill="#4a7a2a"/><path d="M-20 -8l10 -14l10 14zM10 -8l10 -14l10 14z" fill="#fff0a0"/><path d="M-22 12Q0 34 22 12Q0 22 -22 12Z" fill="#fff0a0"/></g>`;
    const bat = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#2a1450"><path d="M0 0C-6 -10 -18 -12 -28 -4C-22 -4 -20 2 -14 4C-12 0 -6 2 0 8C6 2 12 0 14 4C20 2 22 -4 28 -4C18 -12 6 -10 0 0Z"/></g>`;
    const leaf = (x, y, c, r) => `<path d="M${x} ${y}l8 -10l8 10l-4 2l4 8l-12 -4l-12 4l4 -8l-4 -2z" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`;
    return sky(p, [[0, '#2a1060'], [.5, '#8a3a8a'], [.8, '#ff7a3d'], [1, '#ffc15a']]) + stars(9, 22, 0, 120, '#ffe9c0') +
      `<defs>${glowDef(p + 'mn', '#ffd27a', 1)}</defs><circle cx="95" cy="110" r="95" fill="url(#${p}mn)"/><circle cx="95" cy="110" r="52" fill="#ffd9a0"/><circle cx="82" cy="100" r="8" fill="#f2b872"/><circle cx="108" cy="124" r="6" fill="#f2b872"/><circle cx="110" cy="90" r="4" fill="#f2b872"/>` +
      bat(250, 60, 1) + bat(320, 110, .8) + bat(180, 130, .6) + bat(370, 50, .7) +
      `<path d="M330 330C332 260 322 220 340 150M334 220C350 200 372 196 392 180M338 180C320 170 304 160 296 138" stroke="#2a1450" stroke-width="12" fill="none" stroke-linecap="round"/>` +
      `<g><path d="M392 180v22" stroke="#6a4a8a" stroke-width="2"/><circle cx="392" cy="214" r="12" fill="#ffd24d"/><circle cx="392" cy="214" r="22" fill="#ffd24d" opacity=".25"/></g>` +
      `<path d="M0 312Q100 296 200 312T400 306V400H0Z" fill="#4a2a5e"/><path d="M0 348Q120 334 220 350T400 344V400H0Z" fill="#35194a"/>` +
      pumpkin(36, 360, .85) + pumpkin(372, 378, 1) + pumpkin(100, 392, .5) +
      leaf(130, 120, '#ff9a3c', 20) + leaf(300, 190, '#ffd24d', -30) + leaf(60, 250, '#ff6a3c', 40) + leaf(255, 110, '#ffb347', 10) + leaf(350, 300, '#ff9a3c', -20) +
      shadow(200, 346, 120) +
      blob([
        '<path d="M120 252C80 262 40 262 6 248L10 274C55 296 110 292 140 280Z"/>',
        '<ellipse cx="188" cy="236" rx="72" ry="70"/>',
        { l: 'M168 288L152 328', w: 42 }, { l: 'M134 337L182 337', w: 24 }, { l: 'M216 292L228 328', w: 38 }, { l: 'M218 337L264 337', w: 22 },
        '<path d="M222 192C238 172 252 158 268 150L310 190L270 245Z"/>',
        { l: 'M232 222L266 242', w: 12 },
      ], B, D, 11) +
      `<ellipse cx="204" cy="262" rx="44" ry="42" fill="#f4ffc0"/>` + spots([[60, 262, 9], [100, 274, 8], [140, 205, 10], [170, 190, 9], [210, 185, 8]], '#8ab82a') +
      blob(['<path d="M262 160C262 132 296 124 330 134C358 142 364 166 346 178C320 190 282 188 268 176Z"/>'], B, D, 11) +
      blob(['<ellipse cx="294" cy="108" rx="44" ry="38"/>'], '#ff9a3c', '#8a3a00', 11) +
      `<path d="M262 94q14-24 38-22" fill="none" stroke="#ffd09a" stroke-width="6" stroke-linecap="round"/>` +
      [[256, 120], [262, 96], [276, 78], [298, 70], [322, 76], [336, 96], [338, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#ffd24d" stroke="#8a3a00" stroke-width="3.5"/>`).join('') +
      ceye(312, 150, 13, '#6a3aa8') + `<path d="M296 134q14-8 30 0" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>` + smile(308, 172, 24, D) + blush(290, 166, 8) + `<ellipse cx="350" cy="148" rx="2.6" ry="3.4" fill="${D}"/>` +
      `<path d="M266 244l8 4m-8-4l4 9" stroke="#fff6dc" stroke-width="4" stroke-linecap="round"/>` + toes(158, 341) + toes(240, 341) + grass(60, 350, .9, '#4a8a3a', '#1d3a1a') + grass(340, 352, 1, '#4a8a3a', '#1d3a1a');
  }

  // ---------- 15. สไตราโคซอรัส : ทุ่งลาเวนเดอร์ดาวตก (หันซ้าย) ----------
  function styra(p) {
    const B = '#e8b04a', D = '#7a4a0a';
    let sp = '';
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (1.1 + i * 0.1), x = 300 + Math.cos(a) * 46, y = 178 + Math.sin(a) * 50, x2 = 300 + Math.cos(a) * 88, y2 = 178 + Math.sin(a) * 94;
      sp += `<path d="M${(x - 9 * Math.sin(a)).toFixed(1)} ${(y + 9 * Math.cos(a)).toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}L${(x + 9 * Math.sin(a)).toFixed(1)} ${(y - 9 * Math.cos(a)).toFixed(1)}Z" fill="#fff0c8" stroke="#b58a3a" stroke-width="3.5" stroke-linejoin="round"/>`;
    }
    const lav = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V-20" stroke="#3a9a5a" stroke-width="2.5"/><g fill="#b07aff">${[0, 1, 2, 3, 4].map(i => `<ellipse cx="${i % 2 ? 3 : -3}" cy="${-22 - i * 6}" rx="3.6" ry="4.4"/>`).join('')}</g></g>`;
    let field = '';
    const r = rnd(41);
    for (let row = 0; row < 7; row++) { const y = 316 + row * 14, s = .6 + row * .18; for (let x = (row % 2) * 8; x < 410; x += 16 * s + 6) field += lav(x + r() * 4, y, s); }
    const windmill = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0L-9 -60H9L14 0Z" fill="#5a3a8a"/><path d="M-12 -60L0 -76L12 -60Z" fill="#3a2060"/><g stroke="#8a6ac8" stroke-width="5" stroke-linecap="round"><path d="M0 -64L-40 -100M0 -64L40 -28M0 -64L40 -100M0 -64L-40 -28"/></g></g>`;
    const dino = blob([
      '<path d="M82 268C56 280 36 302 22 320L58 320C88 308 108 296 120 286Z"/>',
      '<ellipse cx="175" cy="255" rx="100" ry="58"/>',
      { l: 'M118 292L116 336', w: 38 }, { l: 'M160 296L160 338', w: 38 }, { l: 'M216 296L218 338', w: 38 }, { l: 'M256 290L262 336', w: 38 },
    ], B, D, 11) +
      `<ellipse cx="190" cy="282" rx="70" ry="26" fill="#fff0c0"/>` + spots([[110, 235, 10], [150, 220, 11], [195, 218, 10], [235, 230, 9], [90, 258, 7]], '#c98a2a') +
      `<ellipse cx="300" cy="178" rx="52" ry="58" fill="#7a4a0a"/>` + sp + `<ellipse cx="300" cy="178" rx="45" ry="52" fill="#e0486a"/><ellipse cx="300" cy="178" rx="32" ry="38" fill="#ff7aa0"/>` +
      `<g fill="#fff0c8">${spots([[280, 150, 6], [310, 140, 6], [325, 168, 5], [275, 180, 6], [300, 200, 5]], '#ffb0c8')}</g>` +
      blob(['<path d="M285 206C285 176 336 170 372 192C386 204 384 228 368 236C340 250 300 248 288 230Z"/>'], B, D, 11) +
      blob(['<path d="M362 200C386 196 398 210 392 224C382 236 364 232 358 220Z"/>'], '#ffd76b', '#a8761b', 5) +
      `<path d="M340 192L372 188L376 128L350 168Z" fill="#fff0c8" stroke="#b58a3a" stroke-width="4" stroke-linejoin="round"/>` +
      ceye(334, 206, 12, '#2f9a8a') + `<path d="M318 188q14-8 28 0" fill="none" stroke="${D}" stroke-width="5" stroke-linecap="round"/>` + smile(334, 228, 22, D) + blush(318, 224, 8) +
      toes(116, 340) + toes(262, 340);
    return sky(p, [[0, '#2b1a7a'], [.5, '#9a4ac0'], [.85, '#ff9ab0'], [1, '#ffd0a0']]) + stars(17, 40, 0, 170) +
      `<path d="M90 40L40 100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>${star4(92, 38, 10, '#fff')}<path d="M260 20L215 70" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>${star4(262, 18, 7, '#fff')}` +
      `<path d="M330 70a34 34 0 1 0 28 54a28 28 0 1 1 -28 -54Z" fill="#fff3c0"/>` +
      `<path d="M0 300Q100 280 200 296T400 290V320H0Z" fill="#6a3a9a"/>` + windmill(70, 300, .9) +
      `<rect x="0" y="312" width="400" height="88" fill="#5a2a8a"/>` + field +
      shadow(200, 344, 130) + mirror(dino, .92);
  }

  window.DINOS = [
    { id: 'trex',  th: 'ทีเร็กซ์',          en: 'T-Rex',            art: trex },
    { id: 'tric',  th: 'ไทรเซอราทอปส์',     en: 'Triceratops',      art: tric },
    { id: 'brach', th: 'บราคิโอซอรัส',      en: 'Brachiosaurus',    art: brach },
    { id: 'steg',  th: 'สเตโกซอรัส',        en: 'Stegosaurus',      art: steg },
    { id: 'anky',  th: 'แอนคีโลซอรัส',      en: 'Ankylosaurus',     art: anky },
    { id: 'spin',  th: 'สปิโนซอรัส',        en: 'Spinosaurus',      art: spin },
    { id: 'para',  th: 'พาราซอโรโลฟัส',     en: 'Parasaurolophus',  art: para },
    { id: 'carno', th: 'คาร์โนทอรัส',       en: 'Carnotaurus',      art: carno },
    { id: 'dipl',  th: 'ดิพลอโดคัส',        en: 'Diplodocus',       art: dipl },
    { id: 'ther',  th: 'เทริซิโนซอรัส',     en: 'Therizinosaurus',  art: ther },
    { id: 'giga',  th: 'จิกาโนโตซอรัส',     en: 'Giganotosaurus',   art: giga },
    { id: 'argent',th: 'อาร์เจนติโนซอรัส',  en: 'Argentinosaurus',  art: argent },
    { id: 'igua',  th: 'อิกัวโนดอน',        en: 'Iguanodon',        art: igua },
    { id: 'pachy', th: 'แพคิเซฟาโลซอรัส',   en: 'Pachycephalosaurus', art: pachy },
    { id: 'styra', th: 'สไตราโคซอรัส',      en: 'Styracosaurus',    art: styra }
  ];
})();
