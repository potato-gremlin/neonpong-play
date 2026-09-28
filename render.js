/* Neon Pong — drawing library for balls, paddles, glows, boards, trails, goal FX and score digits.
   Plain Canvas2D, no dependencies. Every draw function is self-contained so the real game can reuse it.
   All art is original: no real brands, logos or known characters. */
(function () {
  const NP = (window.NP = {});
  const TAU = Math.PI * 2;
  const C = (NP.colors = {
    bg: '#07060f', cyan: '#00f0ff', pink: '#ff2bd6', lime: '#b6ff3b',
    amber: '#ffb020', violet: '#8a5cff', white: '#f4f2ff', red: '#ff3b5c'
  });

  // ---------- helpers ----------
  const glow = (ctx, color, blur) => { ctx.shadowColor = color; ctx.shadowBlur = blur; };
  const noGlow = (ctx) => { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; };
  function rrect(ctx, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  NP.rrect = rrect;
  function poly(ctx, n, r, rot = 0, sy = 1) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = rot + (i * TAU) / n - Math.PI / 2;
      const x = Math.cos(a) * r, y = Math.sin(a) * r * sy;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath();
  }
  function starPath(ctx, n, r1, r2, rot = 0) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? r2 : r1, a = rot + (i * Math.PI) / n - Math.PI / 2;
      i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
  }
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); }
  function hash(n) { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); }
  NP.hash = hash;
  const hsl = (h, s = 100, l = 60, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

  // ==========================================================
  // BALLS — drawBall(ctx, id, r, t, o) draws centred at (0,0)
  // o: { spin, speed 0..1, dir (radians toward target), face 1..6 }
  // ==========================================================
  const B = {};
  const stroke = (ctx, c, w) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.stroke(); };
  const fill = (ctx, c) => { ctx.fillStyle = c; ctx.fill(); };

  B.circle = (ctx, r) => { glow(ctx, C.cyan, r); circle(ctx, 0, 0, r); fill(ctx, C.white); };
  B.square = (ctx, r, t, o) => { ctx.rotate(o.spin); glow(ctx, C.cyan, r); rrect(ctx, -r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.15); fill(ctx, C.white); };
  B.triangle = (ctx, r, t, o) => { ctx.rotate(o.spin); glow(ctx, C.lime, r); poly(ctx, 3, r * 1.15); fill(ctx, C.lime); };
  B.diamond = (ctx, r, t, o) => { ctx.rotate(Math.sin(o.spin) * 0.3); glow(ctx, C.pink, r); poly(ctx, 4, r, 0, 1.25); fill(ctx, C.pink); };
  B.pentagon = (ctx, r, t, o) => { ctx.rotate(o.spin); glow(ctx, C.violet, r); poly(ctx, 5, r * 1.05); fill(ctx, '#b69cff'); };
  B.hexagon = (ctx, r, t, o) => { ctx.rotate(o.spin); glow(ctx, C.cyan, r); poly(ctx, 6, r * 1.02); fill(ctx, '#7ff8ff'); };
  B.star = (ctx, r, t, o) => { ctx.rotate(o.spin); glow(ctx, C.amber, r); starPath(ctx, 5, r * 1.2, r * 0.5); fill(ctx, '#ffd35a'); };
  B.heart = (ctx, r, t) => {
    const s = 1 + Math.max(0, Math.sin(t * 6)) * 0.08; ctx.scale(s, s);
    glow(ctx, C.red, r); ctx.beginPath();
    ctx.moveTo(0, r * 0.95);
    ctx.bezierCurveTo(-r * 1.4, 0, -r * 0.9, -r * 1.1, 0, -r * 0.45);
    ctx.bezierCurveTo(r * 0.9, -r * 1.1, r * 1.4, 0, 0, r * 0.95);
    fill(ctx, '#ff4d7a');
  };
  B.cube = (ctx, r, t, o) => {
    const a = o.spin, b = o.spin * 0.7 + 0.5;
    const V = [];
    for (let i = 0; i < 8; i++) {
      let x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1;
      let x1 = x * Math.cos(a) - z * Math.sin(a), z1 = x * Math.sin(a) + z * Math.cos(a);
      let y1 = y * Math.cos(b) - z1 * Math.sin(b);
      V.push([x1 * r * 0.62, y1 * r * 0.62]);
    }
    const E = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    glow(ctx, C.cyan, r * 0.8); ctx.beginPath();
    E.forEach(([p, q]) => { ctx.moveTo(...V[p]); ctx.lineTo(...V[q]); });
    stroke(ctx, C.cyan, Math.max(1.5, r * 0.14));
  };
  B.alien = (ctx, r, t) => {
    // original design: lime head, two big black almond eyes, tiny mouth
    glow(ctx, C.lime, r * 0.9);
    ctx.beginPath();
    ctx.moveTo(0, r * 1.05);
    ctx.bezierCurveTo(-r * 0.55, r * 0.95, -r * 1.15, r * 0.1, -r * 1.0, -r * 0.45);
    ctx.bezierCurveTo(-r * 0.85, -r * 1.1, r * 0.85, -r * 1.1, r * 1.0, -r * 0.45);
    ctx.bezierCurveTo(r * 1.15, r * 0.1, r * 0.55, r * 0.95, 0, r * 1.05);
    fill(ctx, '#9dff3b'); noGlow(ctx);
    const blink = (t % 3.5) < 0.12 ? 0.15 : 1;
    [-1, 1].forEach((s) => {
      ctx.save(); ctx.translate(s * r * 0.42, -r * 0.08); ctx.rotate(s * 0.55);
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.36, r * 0.2 * blink, 0, 0, TAU); fill(ctx, '#050505');
      ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 0.05 * blink, r * 0.07, r * 0.05 * blink, 0, 0, TAU); fill(ctx, '#ffffffcc');
      ctx.restore();
    });
    ctx.beginPath(); ctx.moveTo(-r * 0.12, r * 0.55); ctx.quadraticCurveTo(0, r * 0.62, r * 0.12, r * 0.55); stroke(ctx, '#2c5a00', Math.max(1, r * 0.07));
  };
  B.ufo = (ctx, r, t) => {
    ctx.translate(0, Math.sin(t * 3) * r * 0.08);
    ctx.beginPath(); ctx.ellipse(0, -r * 0.2, r * 0.5, r * 0.5, 0, Math.PI, 0); fill(ctx, 'rgba(0,240,255,0.55)');
    glow(ctx, C.cyan, r * 0.6); ctx.beginPath(); ctx.ellipse(0, r * 0.05, r * 1.15, r * 0.38, 0, 0, TAU); fill(ctx, '#b8bfd6'); noGlow(ctx);
    for (let i = 0; i < 5; i++) {
      const on = Math.floor(t * 6 + i) % 5 === 0;
      circle(ctx, (i - 2) * r * 0.42, r * 0.1, r * 0.09); fill(ctx, on ? C.amber : '#5b6078');
    }
  };
  B.planet = (ctx, r, t) => {
    const tilt = -0.35;
    ctx.save(); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.55, r * 0.42, 0, Math.PI, TAU); stroke(ctx, '#ffd58a', r * 0.14); ctx.restore();
    glow(ctx, C.amber, r * 0.6); circle(ctx, 0, 0, r * 0.82); fill(ctx, '#ff9f45'); noGlow(ctx);
    ctx.save(); circle(ctx, 0, 0, r * 0.82); ctx.clip();
    for (let i = -2; i <= 2; i++) { ctx.fillStyle = i % 2 ? '#e07a2b' : '#ffc07a'; ctx.fillRect(-r, i * r * 0.3 - r * 0.07, r * 2, r * 0.14); }
    ctx.restore();
    ctx.save(); ctx.rotate(tilt); ctx.beginPath(); ctx.ellipse(0, 0, r * 1.55, r * 0.42, 0, 0, Math.PI); stroke(ctx, '#ffd58a', r * 0.14); ctx.restore();
  };
  B.moon = (ctx, r, t, o) => {
    ctx.rotate(o.spin * 0.3); glow(ctx, '#fff3b0', r);
    ctx.beginPath(); ctx.arc(0, 0, r, 0.35 * Math.PI, 1.65 * Math.PI, false);
    ctx.arc(r * 0.45, -r * 0.05, r * 0.82, 1.55 * Math.PI, 0.45 * Math.PI, true); fill(ctx, '#fff3b0');
  };
  B.sun = (ctx, r, t) => {
    ctx.save(); ctx.rotate(t * 0.8); glow(ctx, C.amber, r);
    for (let i = 0; i < 10; i++) { ctx.rotate(TAU / 10); ctx.beginPath(); ctx.moveTo(-r * 0.18, -r * 0.75); ctx.lineTo(0, -r * 1.25); ctx.lineTo(r * 0.18, -r * 0.75); fill(ctx, '#ffb020'); }
    ctx.restore(); circle(ctx, 0, 0, r * 0.72); fill(ctx, '#ffd35a');
  };
  B.atom = (ctx, r, t) => {
    glow(ctx, C.cyan, r * 0.6);
    for (let k = 0; k < 3; k++) {
      ctx.save(); ctx.rotate((k * Math.PI) / 3);
      ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r * 0.38, 0, 0, TAU); stroke(ctx, C.cyan, Math.max(1, r * 0.08));
      const a = t * 4 + k * 2.1; circle(ctx, Math.cos(a) * r * 1.1, Math.sin(a) * r * 0.38, r * 0.14); fill(ctx, C.white);
      ctx.restore();
    }
    circle(ctx, 0, 0, r * 0.28); fill(ctx, C.pink);
  };
  B.basketball = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, '#ff7a1a', r * 0.6); circle(ctx, 0, 0, r); fill(ctx, '#ff7a1a'); noGlow(ctx);
    const w = Math.max(1, r * 0.08); ctx.strokeStyle = '#2a1204'; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * 1.25, 0, r * 0.95, -0.75, 0.75); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 1.25, 0, r * 0.95, Math.PI - 0.75, Math.PI + 0.75); ctx.stroke();
  };
  B.soccer = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.white, r * 0.6); circle(ctx, 0, 0, r); fill(ctx, '#f4f4f4'); noGlow(ctx);
    poly(ctx, 5, r * 0.36); fill(ctx, '#111');
    ctx.save(); circle(ctx, 0, 0, r); ctx.clip();
    for (let i = 0; i < 5; i++) {
      const a = (i * TAU) / 5 - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); ctx.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); stroke(ctx, '#111', Math.max(1, r * 0.07));
      const b = a + Math.PI / 5; ctx.save(); ctx.translate(Math.cos(b) * r * 1.05, Math.sin(b) * r * 1.05); poly(ctx, 5, r * 0.34, b); fill(ctx, '#111'); ctx.restore();
    }
    ctx.restore();
  };
  B.tennis = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, '#d4ff3b', r * 0.7); circle(ctx, 0, 0, r); fill(ctx, '#d4ff3b'); noGlow(ctx);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath(); ctx.arc(-r * 1.3, 0, r * 0.95, -0.8, 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 1.3, 0, r * 0.95, Math.PI - 0.8, Math.PI + 0.8); ctx.stroke();
  };
  B.baseball = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.white, r * 0.6); circle(ctx, 0, 0, r); fill(ctx, '#f7f3ea'); noGlow(ctx);
    ctx.strokeStyle = '#e0243b'; ctx.lineWidth = Math.max(1, r * 0.07);
    [-1, 1].forEach((s) => {
      ctx.beginPath(); ctx.arc(s * r * 1.35, 0, r * 0.95, s > 0 ? Math.PI - 0.75 : -0.75, s > 0 ? Math.PI + 0.75 : 0.75); ctx.stroke();
      for (let k = -3; k <= 3; k++) {
        const a = (s > 0 ? Math.PI : 0) + k * 0.2, cx = s * r * 1.35 + Math.cos(a) * r * 0.95, cy = Math.sin(a) * r * 0.95;
        ctx.beginPath(); ctx.moveTo(cx - r * 0.1, cy - r * 0.05); ctx.lineTo(cx + r * 0.1, cy + r * 0.05); ctx.stroke();
      }
    });
  };
  B.eightball = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(o.spin) * 0.6); glow(ctx, C.violet, r * 0.8); circle(ctx, 0, 0, r); fill(ctx, '#0d0d12'); noGlow(ctx);
    circle(ctx, -r * 0.1, -r * 0.1, r * 0.45); fill(ctx, '#fff');
    ctx.fillStyle = '#000'; ctx.font = `bold ${r * 0.6}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('8', -r * 0.1, -r * 0.06);
  };
  B.pizza = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.amber, r * 0.5);
    ctx.beginPath(); ctx.moveTo(0, r * 1.05); ctx.lineTo(-r * 0.9, -r * 0.6); ctx.quadraticCurveTo(0, -r * 1.05, r * 0.9, -r * 0.6); ctx.closePath(); fill(ctx, '#ffd35a'); noGlow(ctx);
    ctx.beginPath(); ctx.moveTo(-r * 0.95, -r * 0.62); ctx.quadraticCurveTo(0, -r * 1.12, r * 0.95, -r * 0.62); stroke(ctx, '#c9772c', r * 0.25);
    [[-0.3, -0.35], [0.28, -0.3], [0, 0.2], [-0.12, 0.62]].forEach(([x, y]) => { circle(ctx, x * r, y * r, r * 0.15); fill(ctx, '#d6293d'); });
  };
  B.donut = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.pink, r * 0.6);
    circle(ctx, 0, 0, r); fill(ctx, '#d99a55'); noGlow(ctx);
    ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = (i * TAU) / 24, rr = r * (0.86 + 0.06 * Math.sin(i * 2.7)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } fill(ctx, '#ff6fcf');
    const cols = ['#fff', '#00f0ff', '#ffd35a', '#b6ff3b'];
    for (let i = 0; i < 12; i++) { const a = hash(i) * TAU, d = r * (0.5 + hash(i + 9) * 0.3); ctx.save(); ctx.translate(Math.cos(a) * d, Math.sin(a) * d); ctx.rotate(hash(i + 3) * 6); ctx.fillStyle = cols[i % 4]; ctx.fillRect(-r * 0.1, -r * 0.03, r * 0.2, r * 0.06); ctx.restore(); }
    circle(ctx, 0, 0, r * 0.3); fill(ctx, C.bg);
  };
  B.taco = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(o.spin) * 0.5); glow(ctx, C.amber, r * 0.5);
    ctx.beginPath(); ctx.arc(0, r * 0.25, r * 1.05, Math.PI, TAU); ctx.closePath(); fill(ctx, '#f2b33d'); noGlow(ctx);
    for (let i = 0; i < 7; i++) { circle(ctx, -r * 0.8 + i * r * 0.27, -r * 0.62 + Math.abs(i - 3) * r * 0.08, r * 0.16); fill(ctx, i % 2 ? '#39c24a' : '#e2372f'); }
    ctx.beginPath(); ctx.arc(0, r * 0.25, r * 1.05, Math.PI, TAU); stroke(ctx, '#c98a1d', r * 0.12);
  };
  B.cookie = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.amber, r * 0.4);
    ctx.beginPath(); for (let i = 0; i <= 20; i++) { const a = (i * TAU) / 20, rr = r * (0.94 + 0.06 * hash(i)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } fill(ctx, '#d9a25f'); noGlow(ctx);
    for (let i = 0; i < 7; i++) { const a = hash(i + 20) * TAU, d = r * 0.65 * hash(i + 40); circle(ctx, Math.cos(a) * d, Math.sin(a) * d, r * 0.13); fill(ctx, '#4a2a14'); }
  };
  B.skull = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(o.spin) * 0.3); glow(ctx, C.white, r * 0.6);
    circle(ctx, 0, -r * 0.15, r * 0.85); fill(ctx, '#eeeae0'); rrect(ctx, -r * 0.5, r * 0.3, r, r * 0.6, r * 0.15); fill(ctx, '#eeeae0'); noGlow(ctx);
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * r * 0.33, -r * 0.12, r * 0.22, r * 0.26, 0, 0, TAU); fill(ctx, '#111'); });
    ctx.beginPath(); ctx.moveTo(0, r * 0.12); ctx.lineTo(-r * 0.1, r * 0.3); ctx.lineTo(r * 0.1, r * 0.3); ctx.closePath(); fill(ctx, '#111');
    ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(1, r * 0.06); for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.18, r * 0.52); ctx.lineTo(i * r * 0.18, r * 0.88); ctx.stroke(); }
  };
  B.eyeball = (ctx, r, t, o) => {
    glow(ctx, C.white, r * 0.6); circle(ctx, 0, 0, r); fill(ctx, '#fbfbff'); noGlow(ctx);
    ctx.strokeStyle = 'rgba(220,40,60,0.6)'; ctx.lineWidth = Math.max(0.8, r * 0.04);
    for (let i = 0; i < 5; i++) { const a = hash(i + 2) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.quadraticCurveTo(Math.cos(a + 0.3) * r * 0.7, Math.sin(a + 0.3) * r * 0.7, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55); ctx.stroke(); }
    const d = o.dir ?? t, px = Math.cos(d) * r * 0.35, py = Math.sin(d) * r * 0.35;
    circle(ctx, px, py, r * 0.42); fill(ctx, '#1fa3ff'); circle(ctx, px, py, r * 0.2); fill(ctx, '#000'); circle(ctx, px - r * 0.1, py - r * 0.1, r * 0.07); fill(ctx, '#fff');
  };
  B.ghost = (ctx, r, t) => {
    // original design: plain white sheet ghost with hollow eyes and an O mouth
    ctx.translate(0, Math.sin(t * 4) * r * 0.08); glow(ctx, '#e6e8ff', r);
    ctx.beginPath(); ctx.moveTo(-r * 0.85, r * 0.9); ctx.lineTo(-r * 0.85, -r * 0.1); ctx.arc(0, -r * 0.1, r * 0.85, Math.PI, 0); ctx.lineTo(r * 0.85, r * 0.9);
    for (let i = 0; i < 4; i++) { const x0 = r * 0.85 - (i + 0.5) * r * 0.425; ctx.quadraticCurveTo(x0, r * (i % 2 ? 0.95 : 0.65), r * 0.85 - (i + 1) * r * 0.425, r * 0.9); }
    ctx.closePath(); fill(ctx, 'rgba(236,238,255,0.93)'); noGlow(ctx);
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * r * 0.3, -r * 0.2, r * 0.13, r * 0.2, 0, 0, TAU); fill(ctx, '#1b1b2b'); });
    ctx.beginPath(); ctx.ellipse(0, r * 0.25, r * 0.13, r * 0.17, 0, 0, TAU); fill(ctx, '#1b1b2b');
  };
  B.bomb = (ctx, r, t, o) => {
    glow(ctx, C.red, r * 0.5); circle(ctx, 0, r * 0.1, r * 0.85); fill(ctx, '#1a1a24'); noGlow(ctx);
    circle(ctx, -r * 0.3, -r * 0.15, r * 0.18); fill(ctx, 'rgba(255,255,255,0.35)');
    ctx.fillStyle = '#555'; ctx.fillRect(-r * 0.2, -r * 0.9, r * 0.4, r * 0.25);
    ctx.beginPath(); ctx.moveTo(0, -r * 0.9); ctx.quadraticCurveTo(r * 0.3, -r * 1.3, r * 0.6, -r * 1.1); stroke(ctx, '#c9a26b', Math.max(1, r * 0.08));
    const f = 1 + (o.speed || 0) * 2, fl = 0.7 + 0.3 * Math.sin(t * 30 * f);
    ctx.save(); ctx.translate(r * 0.62, -r * 1.12); glow(ctx, C.amber, r * 0.8); starPath(ctx, 6, r * 0.32 * fl, r * 0.12, t * 8); fill(ctx, '#ffe066'); ctx.restore();
  };
  B.duck = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(t * 5) * 0.12); glow(ctx, '#ffe14d', r * 0.6);
    ctx.beginPath(); ctx.ellipse(r * 0.05, r * 0.3, r * 0.95, r * 0.6, 0, 0, TAU); fill(ctx, '#ffd83a');
    circle(ctx, -r * 0.35, -r * 0.35, r * 0.48); fill(ctx, '#ffd83a'); noGlow(ctx);
    ctx.beginPath(); ctx.ellipse(-r * 0.9, -r * 0.25, r * 0.3, r * 0.12, 0.1, 0, TAU); fill(ctx, '#ff8a1f');
    circle(ctx, -r * 0.45, -r * 0.45, r * 0.08); fill(ctx, '#111');
    ctx.beginPath(); ctx.ellipse(r * 0.25, r * 0.2, r * 0.4, r * 0.22, -0.3, 0, TAU); fill(ctx, '#f2c21f');
  };
  B.catface = (ctx, r, t) => {
    glow(ctx, C.amber, r * 0.5);
    ctx.beginPath(); ctx.moveTo(-r * 0.85, -r * 0.2); ctx.lineTo(-r * 0.7, -r * 1.05); ctx.lineTo(-r * 0.2, -r * 0.7); ctx.closePath(); fill(ctx, '#ff9a3c');
    ctx.beginPath(); ctx.moveTo(r * 0.85, -r * 0.2); ctx.lineTo(r * 0.7, -r * 1.05); ctx.lineTo(r * 0.2, -r * 0.7); ctx.closePath(); fill(ctx, '#ff9a3c');
    circle(ctx, 0, 0, r * 0.9); fill(ctx, '#ff9a3c'); noGlow(ctx);
    const blink = (t % 4) < 0.15 ? 0.1 : 1;
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * r * 0.35, -r * 0.1, r * 0.13, r * 0.2 * blink, 0, 0, TAU); fill(ctx, '#1a1a1a'); });
    ctx.beginPath(); ctx.moveTo(-r * 0.1, r * 0.2); ctx.lineTo(r * 0.1, r * 0.2); ctx.lineTo(0, r * 0.32); ctx.closePath(); fill(ctx, '#ff5a8a');
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(0.8, r * 0.04);
    [-1, 1].forEach((s) => { for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(s * r * 0.25, r * 0.3); ctx.lineTo(s * r * 1.05, r * (0.25 + k * 0.15)); ctx.stroke(); } });
  };
  B.smiley = (ctx, r, t, o) => {
    const shocked = (o.speed || 0) > 0.7;
    glow(ctx, '#ffe14d', r * 0.7); circle(ctx, 0, 0, r); fill(ctx, '#ffd83a'); noGlow(ctx);
    [-1, 1].forEach((s) => { ctx.beginPath(); ctx.ellipse(s * r * 0.33, -r * 0.25, r * (shocked ? 0.14 : 0.1), r * (shocked ? 0.2 : 0.17), 0, 0, TAU); fill(ctx, '#222'); });
    if (shocked) { ctx.beginPath(); ctx.ellipse(0, r * 0.38, r * 0.2, r * 0.26, 0, 0, TAU); fill(ctx, '#222'); }
    else { ctx.beginPath(); ctx.arc(0, r * 0.05, r * 0.55, 0.2 * Math.PI, 0.8 * Math.PI); stroke(ctx, '#222', Math.max(1.2, r * 0.1)); }
  };
  B.dice = (ctx, r, t, o) => {
    ctx.rotate(o.spin); glow(ctx, C.white, r * 0.6); rrect(ctx, -r * 0.9, -r * 0.9, r * 1.8, r * 1.8, r * 0.3); fill(ctx, '#f7f7fb'); noGlow(ctx);
    const face = o.face || 1 + (Math.floor(t * 1.2) % 6), p = r * 0.48, pr = r * 0.17;
    const P = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[face];
    P.forEach(([x, y]) => { circle(ctx, x * p, y * p, pr); fill(ctx, face === 1 ? '#e0243b' : '#111'); });
  };
  B.coin = (ctx, r, t, o) => {
    const sx = Math.max(0.12, Math.abs(Math.cos(t * 3)));
    ctx.scale(sx, 1); glow(ctx, C.amber, r * 0.8); circle(ctx, 0, 0, r); fill(ctx, '#ffc93a'); noGlow(ctx);
    circle(ctx, 0, 0, r * 0.72); stroke(ctx, '#d99a12', Math.max(1, r * 0.1));
    starPath(ctx, 5, r * 0.42, r * 0.18); fill(ctx, '#d99a12');
  };
  B.gem = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(o.spin) * 0.3); glow(ctx, C.cyan, r);
    ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.7); ctx.lineTo(r * 0.6, -r * 0.7); ctx.lineTo(r, -r * 0.2); ctx.lineTo(0, r); ctx.lineTo(-r, -r * 0.2); ctx.closePath(); fill(ctx, '#5ef2ff'); noGlow(ctx);
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(0.8, r * 0.05);
    ctx.beginPath(); ctx.moveTo(-r, -r * 0.2); ctx.lineTo(r, -r * 0.2); ctx.moveTo(-r * 0.3, -r * 0.7); ctx.lineTo(-r * 0.45, -r * 0.2); ctx.lineTo(0, r); ctx.lineTo(r * 0.45, -r * 0.2); ctx.lineTo(r * 0.3, -r * 0.7); ctx.stroke();
  };
  B.snowflake = (ctx, r, t, o) => {
    ctx.rotate(o.spin * 0.5); glow(ctx, C.cyan, r * 0.8); ctx.strokeStyle = '#dffcff'; ctx.lineWidth = Math.max(1.2, r * 0.12); ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate((i * TAU) / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r); ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.25, -r * 0.8); ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.25, -r * 0.8); ctx.stroke(); ctx.restore(); }
  };
  B.crown = (ctx, r, t, o) => {
    ctx.rotate(Math.sin(o.spin) * 0.25); glow(ctx, C.amber, r * 0.8);
    ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(-r, -r * 0.5); ctx.lineTo(-r * 0.5, 0); ctx.lineTo(0, -r * 0.8); ctx.lineTo(r * 0.5, 0); ctx.lineTo(r, -r * 0.5); ctx.lineTo(r, r * 0.6); ctx.closePath(); fill(ctx, '#ffc93a'); noGlow(ctx);
    [[-0.5, 0.3, '#ff2bd6'], [0, 0.25, '#00f0ff'], [0.5, 0.3, '#b6ff3b']].forEach(([x, y, c]) => { circle(ctx, x * r, y * r, r * 0.13); fill(ctx, c); });
  };

  NP.ballIds = Object.keys(B);
  NP.drawBall = function (ctx, id, r, t, o = {}) {
    o = Object.assign({ spin: t * 2.2, speed: 0.3 }, o);
    ctx.save();
    (B[id] || B.circle)(ctx, r, t, o);
    ctx.restore();
    noGlow(ctx);
  };

  // ==========================================================
  // PADDLES + GLOW — drawn centred, vertical (w = thickness, h = length)
  // ==========================================================
  const P = {};
  P.p_classic = (ctx, w, h) => { glow(ctx, C.cyan, 14); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, C.white); };
  P.p_chrome = (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    g.addColorStop(0, '#5d6472'); g.addColorStop(0.35, '#f5f6fa'); g.addColorStop(0.6, '#8b93a3'); g.addColorStop(1, '#d9dde6');
    glow(ctx, '#cfd6ff', 10); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, g); noGlow(ctx);
    const y = (((t * 0.5) % 1.4) - 0.2) * h - h / 2;
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.clip();
    const s = ctx.createLinearGradient(0, y - h * 0.15, 0, y + h * 0.15);
    s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.5, 'rgba(255,255,255,0.9)'); s.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = s; ctx.fillRect(-w / 2, y - h * 0.15, w, h * 0.3); ctx.restore();
  };
  P.p_candy = (ctx, w, h, t) => {
    glow(ctx, '#ff5a7a', 10); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, '#fff'); noGlow(ctx);
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.clip(); ctx.fillStyle = '#e8203f';
    const step = w * 1.6, off = (t * 30) % step;
    for (let y = -h / 2 - step * 2 + off; y < h / 2 + step; y += step) { ctx.beginPath(); ctx.moveTo(-w, y); ctx.lineTo(w, y - w * 1.2); ctx.lineTo(w, y - w * 1.2 + step * 0.45); ctx.lineTo(-w, y + step * 0.45); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  };
  P.p_circuit = (ctx, w, h, t) => {
    glow(ctx, '#1bff7a', 10); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.3); fill(ctx, '#05301a'); noGlow(ctx);
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.3); ctx.clip();
    ctx.strokeStyle = 'rgba(27,255,122,0.55)'; ctx.lineWidth = Math.max(1, w * 0.1);
    for (let i = 0; i < 6; i++) { const x = (hash(i) - 0.5) * w * 0.6, y0 = (hash(i + 7) - 0.5) * h; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h * 0.25); ctx.lineTo(-x, y0 + h * 0.32); ctx.stroke(); }
    for (let i = 0; i < 3; i++) { const y = (((t * 0.6 + i / 3) % 1) - 0.5) * h; glow(ctx, '#7dffb5', 8); circle(ctx, (hash(i + 3) - 0.5) * w * 0.4, y, w * 0.14); fill(ctx, '#d9ffe9'); noGlow(ctx); }
    ctx.restore();
  };
  P.p_molten = (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#ff3b00'); g.addColorStop(0.5, '#ffb020'); g.addColorStop(1, '#ff3b00');
    glow(ctx, '#ff6a00', 16); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, g); noGlow(ctx);
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); ctx.clip();
    for (let i = 0; i < 7; i++) { const y = (((hash(i) + t * 0.05 * (i % 2 ? 1 : -1)) % 1 + 1) % 1 - 0.5) * h; ctx.beginPath(); ctx.ellipse((hash(i + 4) - 0.5) * w * 0.5, y, w * 0.35, h * 0.06, 0, 0, TAU); fill(ctx, 'rgba(60,10,0,0.55)'); }
    ctx.restore();
  };
  P.p_hotdog = (ctx, w, h) => {
    glow(ctx, '#ffb86b', 8); rrect(ctx, -w * 0.62, -h / 2, w * 1.24, h, w * 0.6); fill(ctx, '#e2a55a'); noGlow(ctx);
    rrect(ctx, -w * 0.32, -h * 0.56, w * 0.64, h * 1.12, w * 0.32); fill(ctx, '#b3401f');
    ctx.beginPath(); for (let i = 0; i <= 14; i++) { const y = -h * 0.45 + (i * h * 0.9) / 14, x = (i % 2 ? 1 : -1) * w * 0.16; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } stroke(ctx, '#ffd21f', Math.max(1.5, w * 0.12));
  };
  P.p_baguette = (ctx, w, h) => {
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#b8741f'); g.addColorStop(0.5, '#f2c46d'); g.addColorStop(1, '#c98a33');
    glow(ctx, '#ffcf7a', 8); rrect(ctx, -w * 0.6, -h / 2, w * 1.2, h, w * 0.6); fill(ctx, g); noGlow(ctx);
    ctx.strokeStyle = '#fbe3a8'; ctx.lineWidth = Math.max(1.2, w * 0.12); ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const y = -h * 0.36 + i * h * 0.18; ctx.beginPath(); ctx.moveTo(-w * 0.3, y + h * 0.05); ctx.lineTo(w * 0.3, y - h * 0.03); ctx.stroke(); }
  };
  P.p_glitch = (ctx, w, h, t, o) => {
    const spike = (o.hitAge ?? 9) < 0.25 || Math.floor(t * 5) % 7 === 0;
    const j = spike ? w * 0.5 * Math.sin(t * 90) : w * 0.12;
    ctx.globalCompositeOperation = 'lighter';
    rrect(ctx, -w / 2 - j, -h / 2, w, h, w * 0.2); fill(ctx, 'rgba(255,0,60,0.85)');
    rrect(ctx, -w / 2 + j, -h / 2 + (spike ? 3 : 0), w, h, w * 0.2); fill(ctx, 'rgba(0,240,255,0.85)');
    ctx.globalCompositeOperation = 'source-over';
    rrect(ctx, -w * 0.3, -h / 2, w * 0.6, h, w * 0.2); fill(ctx, '#fff');
    if (spike) { ctx.fillStyle = C.bg; ctx.fillRect(-w, (hash(Math.floor(t * 20)) - 0.5) * h, w * 2, 2); }
  };
  P.p_plasma = (ctx, w, h, t) => {
    const f = 0.85 + 0.15 * Math.sin(t * 40) * Math.sin(t * 7);
    glow(ctx, C.cyan, 26 * f); rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, `rgba(0,240,255,${0.55 * f})`);
    glow(ctx, '#fff', 10); rrect(ctx, -w * 0.18, -h / 2 + w * 0.2, w * 0.36, h - w * 0.4, w * 0.18); fill(ctx, '#ffffff');
  };
  NP.paddleIds = Object.keys(P);

  NP.drawGlow = function (ctx, glowId, w, h, t, o = {}) {
    if (!glowId || glowId === 'o_none') return;
    const pad = 4, x = -w / 2 - pad, y = -h / 2 - pad, W = w + pad * 2, H = h + pad * 2, R = w / 2 + pad;
    ctx.save(); ctx.lineWidth = 3;
    if (glowId === 'o_cyan' || glowId === 'o_pink') {
      const c = glowId === 'o_cyan' ? C.cyan : C.pink; glow(ctx, c, 18); rrect(ctx, x, y, W, H, R); stroke(ctx, c, 3);
    } else if (glowId === 'o_pulse') {
      const bpm = o.bpm || 168, ph = (t * bpm / 60) % 1, k = Math.exp(-ph * 5);
      glow(ctx, C.violet, 8 + 26 * k); rrect(ctx, x, y, W, H, R); stroke(ctx, `rgba(190,150,255,${0.45 + 0.55 * k})`, 2 + 3 * k);
    } else if (glowId === 'o_rainbow') {
      let g;
      if (ctx.createConicGradient) { g = ctx.createConicGradient(t * 2.5, 0, 0); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hsl(i * 60)); }
      else { g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hsl(i * 60 + t * 200)); }
      glow(ctx, hsl((t * 160) % 360), 22); rrect(ctx, x, y, W, H, R); stroke(ctx, g, 3.5);
      noGlow(ctx); rrect(ctx, x, y, W, H, R); stroke(ctx, g, 2);
    }
    ctx.restore();
  };
  NP.drawPaddle = function (ctx, skinId, glowId, w, h, t, o = {}) {
    ctx.save();
    (P[skinId] || P.p_classic)(ctx, w, h, t, o);
    ctx.restore(); noGlow(ctx);
    NP.drawGlow(ctx, glowId, w, h, t, o);
    noGlow(ctx);
  };

  // ==========================================================
  // BOARDS — drawBoard(ctx, id, w, h, t, st, o) ; st = per-canvas state
  // ==========================================================
  const BD = {};
  function fillBg(ctx, w, h, a, b) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  function grid(ctx, w, h, t, horizon, color, speed = 0.5) {
    ctx.strokeStyle = color; ctx.lineWidth = 1;
    const vx = w / 2;
    for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(vx + i * (w / 24), horizon); ctx.lineTo(vx + i * (w / 4.5), h); ctx.stroke(); }
    const n = 10, off = (t * speed) % 1;
    for (let i = 0; i < n; i++) { const z = (i + off) / n, y = horizon + (h - horizon) * z * z; ctx.globalAlpha = 0.25 + z * 0.75; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  BD.b_grid = (ctx, w, h, t) => {
    fillBg(ctx, w, h, '#0a0620', '#12052a');
    const hz = h * 0.42; const g = ctx.createLinearGradient(0, hz - 30, 0, hz + 10); g.addColorStop(0, 'rgba(255,43,214,0)'); g.addColorStop(1, 'rgba(255,43,214,0.35)'); ctx.fillStyle = g; ctx.fillRect(0, hz - 30, w, 40);
    grid(ctx, w, h, t, hz, 'rgba(255,43,214,0.55)');
  };
  const CAR_COLORS = ['#ff2b4a', '#00c2ff', '#ffd21f', '#39ff6a', '#ff7a1a', '#b36bff', '#ffffff', '#ff4fd8'];
  function drawCar(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#0b0b0b';
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => rrect(ctx, a * s * 0.55 - s * 0.12, b * s * 0.62 - s * 0.2, s * 0.24, s * 0.4, s * 0.06) || ctx.fill());
    glow(ctx, color, s * 0.5); rrect(ctx, -s * 0.45, -s, s * 0.9, s * 2, s * 0.35); fill(ctx, color); noGlow(ctx);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-s * 0.08, -s * 0.95, s * 0.16, s * 1.9);
    rrect(ctx, -s * 0.32, s * 0.05, s * 0.64, s * 0.45, s * 0.12); fill(ctx, '#11131c');
    ctx.fillStyle = '#11131c'; ctx.fillRect(-s * 0.55, -s * 1.05, s * 1.1, s * 0.18);
    glow(ctx, '#fff6c0', s * 0.8); ctx.fillStyle = '#fff6c0'; ctx.fillRect(-s * 0.38, s * 0.88, s * 0.18, s * 0.1); ctx.fillRect(s * 0.2, s * 0.88, s * 0.18, s * 0.1); noGlow(ctx);
    ctx.restore();
  }
  NP.drawCar = drawCar;
  BD.b_raceday = (ctx, w, h, t, st, o) => {
    ctx.fillStyle = '#15161d'; ctx.fillRect(0, 0, w, h);
    const lanes = 6, lw = w / lanes, s = Math.min(lw * 0.22, h * 0.07);
    ctx.fillStyle = 'rgba(255,255,255,0.03)'; for (let i = 0; i < lanes; i += 2) ctx.fillRect(i * lw, 0, lw, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.setLineDash([h * 0.05, h * 0.05]); ctx.lineWidth = 2;
    for (let i = 1; i < lanes; i++) { ctx.beginPath(); ctx.moveTo(i * lw, 0); ctx.lineTo(i * lw, h); ctx.stroke(); }
    ctx.setLineDash([]);
    const kerb = Math.max(4, w * 0.012);
    for (let y = 0; y < h; y += kerb * 2) { ctx.fillStyle = (y / (kerb * 2)) % 2 ? '#e8203f' : '#fff'; ctx.fillRect(0, y, kerb, kerb * 2); ctx.fillRect(w - kerb, y, kerb, kerb * 2); }
    if (!st.cars) {
      st.cars = [];
      for (let i = 0; i < lanes * 2; i++) st.cars.push({ lane: i % lanes, y: hash(i) * h * 1.3 - h * 0.3, v: 0.25 + hash(i + 11) * 0.35, c: CAR_COLORS[i % CAR_COLORS.length] });
      st.last = t;
    }
    const dt = Math.min(0.05, t - st.last); st.last = t;
    const boost = 1 + (o.intensity || 0) * 1.5;
    st.cars.forEach((car, i) => {
      car.y += car.v * h * dt * boost;
      if (car.y > h + s * 2) { car.y = -s * 2 - hash(i + t) * h * 0.5; car.v = 0.25 + hash(i + t * 3) * 0.35; car.c = CAR_COLORS[Math.floor(hash(t + i) * CAR_COLORS.length)]; }
      drawCar(ctx, (car.lane + 0.5) * lw, car.y, s, car.c);
    });
  };
  BD.b_starwarp = (ctx, w, h, t, st, o) => {
    ctx.fillStyle = '#03030a'; ctx.fillRect(0, 0, w, h);
    if (!st.stars) { st.stars = Array.from({ length: 140 }, (_, i) => ({ x: hash(i) * 2 - 1, y: hash(i + 99) * 2 - 1, z: hash(i + 7) })); st.last = t; }
    const dt = Math.min(0.05, t - st.last); st.last = t; const sp = 0.35 + (o.intensity || 0) * 1.2;
    ctx.lineCap = 'round';
    st.stars.forEach((s) => {
      const z0 = s.z; s.z -= dt * sp; if (s.z <= 0.02) { s.z = 1; s.x = hash(t + s.y) * 2 - 1; s.y = hash(t * 2 + s.x) * 2 - 1; return; }
      const px = w / 2 + (s.x / s.z) * w * 0.25, py = h / 2 + (s.y / s.z) * h * 0.25, qx = w / 2 + (s.x / z0) * w * 0.25, qy = h / 2 + (s.y / z0) * h * 0.25;
      ctx.strokeStyle = `rgba(200,230,255,${1 - s.z})`; ctx.lineWidth = (1 - s.z) * 2.5; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(px, py); ctx.stroke();
    });
  };
  BD.b_sunset = (ctx, w, h, t) => {
    const hz = h * 0.58; fillBg(ctx, w, hz, '#12002a', '#ff2b8a'); ctx.fillStyle = '#0a0418'; ctx.fillRect(0, hz, w, h - hz);
    const R = Math.min(w, h) * 0.26, cy = hz - R * 0.35 + Math.sin(t * 0.3) * 3;
    ctx.save(); circle(ctx, w / 2, cy, R); ctx.clip();
    const g = ctx.createLinearGradient(0, cy - R, 0, cy + R); g.addColorStop(0, '#ffe14d'); g.addColorStop(1, '#ff2bd6'); ctx.fillStyle = g; ctx.fillRect(0, cy - R, w, R * 2);
    ctx.fillStyle = '#ff2b8a'; for (let i = 0; i < 6; i++) { const y = cy + R * 0.1 + i * R * 0.16 + ((t * 8) % (R * 0.16)); ctx.fillRect(0, y, w, 1.5 + i * 1.3); }
    ctx.restore();
    ctx.fillStyle = '#1a0636'; ctx.strokeStyle = C.cyan; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, hz); [0.1, 0.22, 0.3, 0.42, 0.55, 0.68, 0.8, 0.9, 1].forEach((x, i) => ctx.lineTo(x * w, hz - (i % 2 ? h * 0.14 : h * 0.05) * (1 + hash(i) * 0.6))); ctx.lineTo(w, hz); ctx.closePath(); ctx.fill(); ctx.stroke();
    grid(ctx, w, h, t, hz, 'rgba(0,240,255,0.45)', 0.4);
  };
  BD.b_datastream = (ctx, w, h, t, st) => {
    ctx.fillStyle = '#020a05'; ctx.fillRect(0, 0, w, h);
    const fs = Math.max(8, Math.round(h / 26)), cols = Math.ceil(w / fs);
    if (!st.cols || st.cols.length !== cols) { st.cols = Array.from({ length: cols }, (_, i) => ({ y: hash(i) * h, v: 40 + hash(i + 5) * 90 })); st.last = t; }
    const dt = Math.min(0.05, t - st.last); st.last = t; const chars = '0123456789ABCDEF01';
    ctx.font = `${fs}px monospace`; ctx.textAlign = 'center';
    st.cols.forEach((c, i) => {
      c.y += c.v * dt * (h / 300); if (c.y - fs * 14 > h) c.y = -hash(t + i) * h * 0.4;
      for (let k = 0; k < 14; k++) { const y = c.y - k * fs; if (y < -fs || y > h + fs) continue; const ch = chars[Math.floor(hash(i * 31 + k + Math.floor(t * 6)) * chars.length)]; ctx.fillStyle = k === 0 ? '#eaffea' : `rgba(57,255,106,${(1 - k / 14) * 0.8})`; ctx.fillText(ch, i * fs + fs / 2, y); }
    });
  };
  BD.b_deepsea = (ctx, w, h, t, st) => {
    fillBg(ctx, w, h, '#002238', '#000611');
    if (!st.bub) { st.bub = Array.from({ length: 30 }, (_, i) => ({ x: hash(i) * w, y: hash(i + 3) * h, r: 1 + hash(i + 8) * 3, v: 15 + hash(i + 1) * 25 })); st.last = t; }
    const dt = Math.min(0.05, t - st.last); st.last = t;
    ctx.strokeStyle = 'rgba(160,230,255,0.5)'; ctx.lineWidth = 1;
    st.bub.forEach((b, i) => { b.y -= b.v * dt; b.x += Math.sin(t * 2 + i) * 0.2; if (b.y < -5) { b.y = h + 5; b.x = hash(t + i) * w; } circle(ctx, b.x, b.y, b.r); ctx.stroke(); });
    for (let j = 0; j < 3; j++) {
      const x = w * (0.2 + j * 0.3) + Math.sin(t * 0.4 + j) * w * 0.05, y = h * (0.35 + 0.2 * Math.sin(t * 0.5 + j * 2)), s = Math.min(w, h) * 0.08, pulse = 1 + 0.12 * Math.sin(t * 3 + j);
      const c = j % 2 ? C.pink : C.cyan;
      ctx.save(); ctx.translate(x, y); glow(ctx, c, 20);
      ctx.beginPath(); ctx.ellipse(0, 0, s * pulse, s * 0.7, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = c + '99'; ctx.fill(); noGlow(ctx);
      ctx.strokeStyle = c + 'aa'; ctx.lineWidth = 1.2;
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * s * 0.3, 0); for (let q = 1; q <= 8; q++) ctx.lineTo(k * s * 0.3 + Math.sin(t * 3 + q * 0.7 + k) * s * 0.12, q * s * 0.2); ctx.stroke(); }
      ctx.restore();
    }
  };
  BD.b_storm = (ctx, w, h, t, st, o) => {
    fillBg(ctx, w, h, '#0c1020', '#060812');
    const period = 5.5, p = t % period, flash = p < 0.12 || (p > 0.2 && p < 0.26);
    if (flash) { ctx.fillStyle = `rgba(200,210,255,${o.reduceFlashing ? 0.06 : 0.22})`; ctx.fillRect(0, 0, w, h); }
    ctx.strokeStyle = 'rgba(150,170,255,0.35)'; ctx.lineWidth = 1;
    for (let i = 0; i < 70; i++) { const x = ((hash(i) * w + t * 60) % (w + 40)) - 20, y = ((hash(i + 50) * h + t * h * 1.6) % (h + 30)) - 15; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 12); ctx.stroke(); }
  };
  BD.b_aurora = (ctx, w, h, t) => {
    fillBg(ctx, w, h, '#020414', '#05102a');
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * hash(i + Math.floor(t))})`; ctx.fillRect(hash(i) * w, hash(i + 4) * h * 0.6, 1.3, 1.3); }
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const g = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, k === 1 ? 'rgba(138,92,255,0.35)' : 'rgba(57,255,160,0.32)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += w / 40) ctx.lineTo(x, h * (0.3 + 0.1 * k) + Math.sin(x / w * 5 + t * 0.6 + k) * h * 0.08 + Math.sin(x / w * 13 - t * 0.9) * h * 0.03);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  BD.b_crt = (ctx, w, h, t) => {
    BD.b_grid(ctx, w, h, t);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(120,255,200,${0.02 + 0.02 * Math.sin(t * 50)})`; ctx.fillRect(0, 0, w, h);
  };
  BD.b_snowglobe = (ctx, w, h, t, st) => {
    fillBg(ctx, w, h, '#0b1633', '#1a2750');
    const cycle = 8, p = (t % cycle) / cycle;
    if (!st.fl) { st.fl = Array.from({ length: 80 }, (_, i) => ({ x: hash(i) * w, y: hash(i + 2) * h, v: 12 + hash(i + 5) * 25 })); st.last = t; }
    const dt = Math.min(0.05, t - st.last); st.last = t;
    const pile = h * 0.12 * Math.min(1, p * 1.3);
    ctx.fillStyle = '#eaf2ff';
    st.fl.forEach((f, i) => { f.y += f.v * dt; f.x += Math.sin(t + i) * 0.3; if (f.y > h - pile) { f.y = -5; f.x = hash(i + t) * w; } circle(ctx, f.x, f.y, 1.2 + hash(i) * 1.5); ctx.fill(); });
    ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += w / 20) ctx.lineTo(x, h - pile * (0.8 + 0.2 * Math.sin(x / w * 9))); ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  };
  BD.b_lavalamp = (ctx, w, h, t) => {
    fillBg(ctx, w, h, '#2a0636', '#12021c');
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const x = w * (0.15 + 0.7 * hash(i)) + Math.sin(t * 0.3 + i) * w * 0.08, y = h * (0.5 + 0.45 * Math.sin(t * 0.25 * (0.6 + hash(i + 3)) + i * 1.7)), r = Math.min(w, h) * (0.1 + 0.08 * hash(i + 9));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, i % 2 ? 'rgba(255,120,40,0.9)' : 'rgba(255,43,214,0.8)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
  };
  NP.boardIds = Object.keys(BD);
  NP.drawBoard = function (ctx, id, w, h, t, st = {}, o = {}) { ctx.save(); (BD[id] || BD.b_grid)(ctx, w, h, t, st, o); ctx.restore(); noGlow(ctx); };

  // ==========================================================
  // TRAILS — drawTrail(ctx, id, hist, t, st, color)  hist = [{x,y}] newest last
  // ==========================================================
  NP.drawTrail = function (ctx, id, hist, t, st, color = C.cyan, r = 6) {
    const n = hist.length; if (!n) return;
    const head = hist[n - 1];
    st.parts = st.parts || []; const dt = Math.min(0.05, t - (st.last ?? t)); st.last = t;
    const spawn = (p) => st.parts.push(p);
    ctx.save();
    if (id === 't_comet') {
      for (let i = 0; i < n; i++) { const a = i / n; ctx.globalAlpha = a * 0.6; glow(ctx, color, 10); circle(ctx, hist[i].x, hist[i].y, r * (0.3 + 0.7 * a)); fill(ctx, color); }
    } else if (id === 't_rainbow') {
      ctx.lineCap = 'round';
      for (let i = 1; i < n; i++) { ctx.strokeStyle = hsl((i * 14 + t * 240) % 360, 100, 60, i / n); ctx.lineWidth = r * 1.4 * (i / n); ctx.beginPath(); ctx.moveTo(hist[i - 1].x, hist[i - 1].y); ctx.lineTo(hist[i].x, hist[i].y); ctx.stroke(); }
    } else if (id === 't_afterimage') {
      for (let k = 1; k <= 5; k++) { const p = hist[Math.max(0, n - 1 - k * 3)]; ctx.globalAlpha = 0.5 - k * 0.08; glow(ctx, color, 8); circle(ctx, p.x, p.y, r); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); }
    } else if (id === 't_pixels') {
      if (Math.random() < 0.8) spawn({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 20, life: 0.6, max: 0.6, s: 2 + Math.random() * 3, c: Math.random() < 0.5 ? color : C.white });
    } else if (id === 't_bubbles') {
      if (Math.random() < 0.35) spawn({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 10, vy: -15 - Math.random() * 15, life: 1.0, max: 1.0, s: 2 + Math.random() * 3, bubble: true });
    } else if (id === 't_fire') {
      for (let k = 0; k < 2; k++) spawn({ x: head.x + (Math.random() - 0.5) * r, y: head.y + (Math.random() - 0.5) * r, vx: (Math.random() - 0.5) * 15, vy: -20 - Math.random() * 30, life: 0.5, max: 0.5, s: r * (0.6 + Math.random() * 0.6), fire: true });
    }
    // particles
    st.parts = st.parts.filter((p) => (p.life -= dt) > 0);
    st.parts.forEach((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt; const a = p.life / p.max;
      if (p.bubble) { ctx.globalAlpha = a; circle(ctx, p.x, p.y, p.s * (1.5 - a * 0.5)); ctx.strokeStyle = '#bff6ff'; ctx.lineWidth = 1; ctx.stroke(); }
      else if (p.fire) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; circle(ctx, p.x, p.y, p.s * a); fill(ctx, a > 0.6 ? '#ffe066' : a > 0.3 ? '#ff7a1a' : '#ff2b2b'); ctx.globalCompositeOperation = 'source-over'; }
      else { p.vy += 60 * dt; ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); }
    });
    ctx.restore(); noGlow(ctx);
  };

  // ==========================================================
  // GOAL FX — preview loop (goal on the right edge)
  // ==========================================================
  NP.drawGoalFx = function (ctx, id, w, h, t, st, color = C.cyan) {
    const T = 2.4, cyc = Math.floor(t / T), p = (t % T) / T, gx = w - 6, gy = h / 2;
    if (st.cyc !== cyc) { st.cyc = cyc; st.parts = []; st.fired = {}; }
    const dt = Math.min(0.05, t - (st.last ?? t)); st.last = t;
    const scene = () => { NP.drawBoard(ctx, 'b_grid', w, h, t, st.bst || (st.bst = {})); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.setLineDash([]); };
    ctx.save();
    if (id === 'g_implosion' && p > 0.3) {
      const q = (p - 0.3) / 0.7, s = q < 0.45 ? 1 - Math.sin((q / 0.45) * Math.PI / 2) * 0.92 : 0.08 + (1 - 0.08) * (1 + Math.sin((q - 0.45) / 0.55 * Math.PI * 1.5) * 0.12 * (1 - q)) * Math.min(1, (q - 0.45) / 0.25);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.translate(gx, gy); ctx.rotate((1 - s) * 1.2); ctx.scale(s, s); ctx.translate(-gx, -gy); scene();
    } else if (id === 'g_shockwave' && p > 0.3 && p < 0.55) {
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8); scene();
    } else scene();
    ctx.restore();
    // ball travelling into goal
    if (p < 0.3) { const x = w * 0.3 + (gx - w * 0.3) * (p / 0.3); ctx.save(); ctx.translate(x, gy - 10 + p * 30); NP.drawBall(ctx, 'circle', 5, t); ctx.restore(); }
    const q = (p - 0.3) / 0.7; if (p < 0.3) return;
    ctx.save();
    if (id === 'g_flash') { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - q * 3)})`; ctx.fillRect(gx - 30, 0, 36, h); }
    if (id === 'g_confetti') {
      if (!st.fired.c) { st.fired.c = 1; for (let i = 0; i < 70; i++) { const top = i % 2; st.parts.push({ x: gx, y: top ? 4 : h - 4, vx: -60 - Math.random() * 160, vy: (top ? 1 : -1) * (40 + Math.random() * 140), r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: hsl(Math.random() * 360) }); } }
      st.parts.forEach((c) => { c.vy += 180 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.r += c.vr * dt; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = c.c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore(); });
    }
    if (id === 'g_fireworks') {
      [0, 0.2, 0.4].forEach((d, k) => { if (q > d && !st.fired[k]) { st.fired[k] = 1; const cx = w * (0.6 + 0.12 * k), cy = h * (0.3 + 0.2 * (k % 2)), col = [C.pink, C.cyan, C.amber][k]; for (let i = 0; i < 36; i++) { const a = (i / 36) * TAU, v = 60 + Math.random() * 40; st.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: col }); } } });
      st.parts.forEach((f) => { f.vy += 50 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt * 1.1; ctx.globalAlpha = Math.max(0, f.life); glow(ctx, f.c, 6); circle(ctx, f.x, f.y, 1.8); fill(ctx, f.c); });
    }
    if (id === 'g_pixelboom') {
      if (!st.fired.p) { st.fired.p = 1; for (let i = 0; i < 50; i++) { const a = Math.PI / 2 + Math.random() * Math.PI, v = 40 + Math.random() * 180; st.parts.push({ x: gx, y: gy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 3 + Math.random() * 5, c: [color, C.white, C.amber][i % 3], life: 1 }); } }
      st.parts.forEach((b) => { b.vy += 120 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; ctx.globalAlpha = Math.max(0, b.life); ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.s, b.s); });
    }
    if (id === 'g_shockwave') { for (let k = 0; k < 2; k++) { const rr = Math.max(0, q - k * 0.12) * w * 1.1; ctx.globalAlpha = Math.max(0, 1 - q * 1.3); glow(ctx, color, 20); circle(ctx, gx, gy, rr); ctx.strokeStyle = color; ctx.lineWidth = 4 - k * 2; ctx.stroke(); } }
    ctx.restore(); noGlow(ctx);
  };

  // ==========================================================
  // SCORE DIGITS
  // ==========================================================
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  function segDigit(ctx, d, x, y, s, color) {
    const L = s * 0.5, T = s * 0.1, H = s;
    const segs = { a: [x + T, y, L, T], b: [x + L + T, y + T, T, H / 2 - T], c: [x + L + T, y + H / 2 + T, T, H / 2 - T], d: [x + T, y + H, L, T], e: [x, y + H / 2 + T, T, H / 2 - T], f: [x, y + T, T, H / 2 - T], g: [x + T, y + H / 2, L, T] };
    Object.entries(segs).forEach(([k, r]) => { const on = SEG[d].includes(k); ctx.fillStyle = on ? color : 'rgba(255,255,255,0.06)'; if (on) glow(ctx, color, s * 0.25); else noGlow(ctx); ctx.fillRect(...r); });
    noGlow(ctx);
  }
  NP.drawScore = function (ctx, hudId, text, x, y, size, t, color = C.white, align = 'center') {
    text = String(text);
    ctx.save();
    if (hudId === 'h_led') {
      const dw = size * 0.8, total = dw * text.length, x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      [...text].forEach((ch, i) => segDigit(ctx, ch, x0 + i * dw, y - size / 2, size, color));
    } else if (hudId === 'h_flip') {
      const dw = size * 0.78, total = dw * text.length, x0 = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      [...text].forEach((ch, i) => {
        const cx = x0 + i * dw; rrect(ctx, cx, y - size * 0.62, dw - 6, size * 1.24, 6); fill(ctx, '#1b1830');
        ctx.fillStyle = color; ctx.font = `bold ${size}px "Chakra Petch", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, cx + (dw - 6) / 2, y + size * 0.04);
        ctx.fillStyle = C.bg; ctx.fillRect(cx, y - 1, dw - 6, 2);
      });
    } else {
      ctx.font = `${size}px "Press Start 2P", monospace`; ctx.textAlign = align; ctx.textBaseline = 'middle';
      glow(ctx, color, size * 0.4); ctx.fillStyle = color; ctx.fillText(text, x, y);
    }
    ctx.restore(); noGlow(ctx);
  };

  // ==========================================================
  // UPGRADE ICONS (inline SVG, 24x24, stroke = currentColor)
  // ==========================================================
  const I = {
    'arrows-v': '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
    'arrows-v-big': '<path d="M12 2v20M7 7l5-5 5 5M7 17l5 5 5-5"/><path d="M5 12h14" opacity=".5"/>',
    'bolt': '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
    'bolt-big': '<path d="M13 2L5 14h6l-1 8 8-12h-6z"/><path d="M3 6h3M2 10h3M19 18h3" opacity=".6"/>',
    'fist': '<rect x="5" y="8" width="12" height="10" rx="3"/><path d="M9 8V6M13 8V6M17 12h2"/>',
    'angle': '<path d="M4 20L20 4M4 20h16"/><path d="M12 20a8 8 0 0 0-2.3-5.7"/>',
    'dash': '<path d="M3 12h10M6 7h8M6 17h8"/><path d="M15 6l6 6-6 6"/>',
    'dots': '<circle cx="5" cy="18" r="1.5"/><circle cx="9" cy="14" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="17" cy="6" r="1.5"/>',
    'target': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    'curve': '<path d="M4 18C8 4 16 4 20 12"/><circle cx="20" cy="12" r="2"/>',
    'shield': '<path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/>',
    'twin-dots': '<circle cx="8" cy="12" r="3"/><circle cx="16" cy="12" r="3" stroke-dasharray="2 2"/>',
    'hourglass': '<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/>',
    'magnet': '<path d="M6 4v8a6 6 0 0 0 12 0V4"/><path d="M6 8h4M14 8h4"/>',
    'two-bars': '<rect x="5" y="4" width="3" height="16" rx="1.5"/><rect x="14" y="8" width="3" height="8" rx="1.5"/>',
    'three-balls': '<circle cx="6" cy="16" r="2.5"/><circle cx="12" cy="8" r="2.5"/><circle cx="18" cy="16" r="2.5"/>',
    'snowflake': '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/>',
    'vortex': '<path d="M12 12m-1 0a1 1 0 1 0 2 0a3 3 0 1 0-6 0a5 5 0 1 0 10 0a7 7 0 1 0-14 0"/>',
    'flame': '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-3 8-2-1-3-3-3-3-2 2-3 4-3 7 0 4 3 7 7 7z"/>',
    'drone': '<rect x="8" y="10" width="8" height="5" rx="2"/><path d="M4 7h5M15 7h5M6 7v3M18 7v3"/>',
    'shrink': '<path d="M4 4l6 6M20 4l-6 6M4 20l6-6M20 20l-6-6"/><rect x="10" y="10" width="4" height="4"/>'
  };
  NP.icon = (name, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[name] || I.target}</svg>`;
})();
