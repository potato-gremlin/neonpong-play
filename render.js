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

  // ---- colour helpers (arrays [r,g,b,a], r/g/b 0..255) used by the glow system, auras and newer boards
  const rgbA = (hex, a = 1) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255, a];
  const cs = (k) => `rgba(${Math.round(k[0])},${Math.round(k[1])},${Math.round(k[2])},${Math.round(Math.max(0, Math.min(1, k[3])) * 1000) / 1000})`;
  const mixC = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
  const alphaC = (k, a) => [k[0], k[1], k[2], k[3] * a];
  function hslA(h, s, l, a = 1) {
    h = (((h % 360) + 360) % 360) / 360; s /= 100; l /= 100;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return 255 * (t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p); };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3), a];
  }
  const fract01 = (x) => x - Math.floor(x);
  const add = (ctx, on) => { ctx.globalCompositeOperation = on ? 'lighter' : 'source-over'; };
  const WHITE = rgbA(0xffffff);

  // ---- glows: each Glow cosmetic is {colour (or rainbow), animation, strength}. The equipped glow is the paddle's colour.
  // anim: 0 steady, 1 beat pulse, 2 breathing, 3 flicker
  const GLOWS = {
    o_none: [0xffffff, 0, 0, 0.6], o_white: [0xffffff, 0, 0, 1.0],
    o_red: [0xff2b3a, 0, 0, 1], o_orange: [0xff7a1a, 0, 0, 1], o_yellow: [0xffe833, 0, 0, 1], o_green: [0x2bff5a, 0, 0, 1],
    o_blue: [0x2b7bff, 0, 0, 1], o_teal: [0x19e6c8, 0, 0, 1], o_magenta: [0xf01de0, 0, 0, 1],
    o_cyan: [0x00f0ff, 0, 0, 1], o_pink: [0xff6fb5, 0, 0, 1], o_lime: [0xb6ff3b, 0, 0, 1], o_violet: [0x8a5cff, 0, 0, 1], o_amber: [0xffb020, 0, 0, 1],
    o_rainbow: [0xffffff, 1, 0, 1],
    o_pulse: [0xbe96ff, 0, 1, 1], o_pulse_red: [0xff2b3a, 0, 1, 1], o_pulse_blue: [0x2b7bff, 0, 1, 1], o_pulse_green: [0x2bff5a, 0, 1, 1],
    o_pulse_pink: [0xff6fb5, 0, 1, 1], o_pulse_rainbow: [0xffffff, 1, 1, 1],
    o_ice: [0x8fe3ff, 0, 2, 1], o_breathe_cyan: [0x00f0ff, 0, 2, 1], o_breathe_red: [0xff2b3a, 0, 2, 1], o_breathe_green: [0x2bff5a, 0, 2, 1],
    o_breathe_pink: [0xff6fb5, 0, 2, 1], o_breathe_rainbow: [0xffffff, 1, 2, 1],
    o_flame: [0xff7a1a, 0, 3, 1],
  };
  function glowLook(id, t, bpm = 168, calm = false) {
    const s = GLOWS[id] || GLOWS.o_none, L = { power: s[3], k: 1 };
    L.color = s[1] ? hslA((t * 80) % 360, 100, 62) : rgbA(s[0]);
    switch (s[2]) {
      case 1: { const ph = fract01(t * bpm / 60), b = 0.5 + 0.5 * Math.cos(ph * TAU); L.k = 0.32 + 0.68 * b * b; break; }
      case 2: L.k = 0.3 + 0.7 * (0.5 - 0.5 * Math.cos(t * TAU / 3.6)); break;
      case 3: L.k = 0.66 + 0.34 * Math.abs(Math.sin(t * 9) * Math.sin(t * 3.3)); break;
    }
    if (calm) L.k = 0.75 + 0.25 * L.k;  // Reduce Flashing: same animation, much smaller swing
    return L;
  }
  NP.glowColorAt = (id, t) => cs(glowLook(id, t).color);

  // Light emitted from a capsule (the paddle): alpha falls smoothly with distance from the paddle edge, built from
  // one linear gradient along the body and two radial gradients on the end caps - no outline, no hard edge.
  const BLOOM_V = [0, 0.08, 0.17, 0.28, 0.42, 0.58, 0.75, 0.9, 1];
  const bloomFall = (v) => Math.pow(1 - v, 1.9) * Math.exp(-0.45 * v);
  function bloomCapsule(ctx, w, h, R, k, a, additive) {
    if (a <= 0.003) return;
    const ro = w / 2 + R, p0 = (w / 2) / ro;
    let yA = -h / 2 + w / 2, yB = h / 2 - w / 2; if (yA > yB) yA = yB = 0;
    const radStops = [[0, alphaC(k, 1)]];
    for (const v of BLOOM_V) radStops.push([p0 + v * (1 - p0), alphaC(k, bloomFall(v))]);
    const lin = ctx.createLinearGradient(-ro, 0, ro, 0);
    lin.addColorStop(0, cs(alphaC(k, 0)));
    for (let i = 8; i >= 0; i--) lin.addColorStop(Math.min(1, (1 - (p0 + BLOOM_V[i] * (1 - p0))) / 2), cs(alphaC(k, bloomFall(BLOOM_V[i]))));
    for (let i = 0; i <= 8; i++) lin.addColorStop(Math.min(1, (1 + (p0 + BLOOM_V[i] * (1 - p0))) / 2), cs(alphaC(k, bloomFall(BLOOM_V[i]))));
    lin.addColorStop(1, cs(alphaC(k, 0)));
    ctx.save(); add(ctx, additive); ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = lin; ctx.fillRect(-ro, yA, ro * 2, yB - yA);
    for (let cap = 0; cap < 2; cap++) {
      const yc = cap ? yB : yA, g = ctx.createRadialGradient(0, yc, 0, 0, yc, ro);
      for (const [p, c] of radStops) g.addColorStop(Math.min(1, p), cs(c));
      ctx.fillStyle = g; ctx.fillRect(-ro, cap ? yc : yc - ro, ro * 2, ro);
    }
    ctx.restore();
  }
  function drawGlowBloom(ctx, w, h, L, gain = 1) {
    const kk = L.k * L.power * gain;
    bloomCapsule(ctx, w, h, 64, L.color, 0.32 * kk, false);                              // wide diffuse haze (stays visible on light boards)
    bloomCapsule(ctx, w, h, 32, L.color, 0.5 * kk, true);                                // main bloom
    bloomCapsule(ctx, w, h, 10, mixC(L.color, WHITE, 0.3), 0.7 * kk, true);              // tight hot edge
  }
  // keeps paddles and the ball readable on pale boards (a soft dark contact shadow; invisible on dark boards)
  const drawContactShadow = (ctx, w, h, k = 0.4) => bloomCapsule(ctx, w, h, 12, rgbA(0x000000), k, false);
  NP.drawBallShadow = function (ctx, r) {
    const g = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.6); g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(-r * 2.6, -r * 2.6, r * 5.2, r * 5.2);
  };
  NP.boardIsLight = (id) => id === 'b_deepsea_light' || id === 'b_icerink';

  // ---- paddle skins that take the equipped glow's colour (o.color) or were added in 4.1
  P.p_classic = (ctx, w, h, t, o) => {
    const body = mixC(WHITE, o.color || WHITE, 0.72);  // white by default; takes the equipped glow's colour
    rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, cs(body));
    rrect(ctx, -w * 0.17, -h / 2 + w * 0.3, w * 0.34, h - w * 0.6, w * 0.17); fill(ctx, cs(mixC(body, WHITE, 0.75)));
  };
  P.p_plasma = (ctx, w, h, t, o) => {
    const f = 0.85 + 0.15 * Math.sin(t * 40) * Math.sin(t * 7);
    rrect(ctx, -w / 2, -h / 2, w, h, w / 2); fill(ctx, cs(alphaC(mixC(o.color || rgbA(0x00f0ff), WHITE, 0.15), 0.75 * f)));
    rrect(ctx, -w * 0.18, -h / 2 + w * 0.2, w * 0.36, h - w * 0.4, w * 0.18); fill(ctx, '#ffffff');
  };
  // dark chevrons streaming along a bar in the glow's colour
  P.p_chevron = (ctx, w, h, t, o) => {
    rrect(ctx, -w / 2, -h / 2, w, h, w * 0.35); fill(ctx, cs(mixC(o.color || rgbA(0x00f0ff), WHITE, 0.25)));
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.35); ctx.clip();
    const step = w * 1.1, off = (t * 40) % step;
    ctx.strokeStyle = '#07101a'; ctx.lineWidth = Math.max(1.5, w * 0.2); ctx.lineCap = 'round';
    for (let y = -h / 2 - step + off; y < h / 2 + step; y += step) { ctx.beginPath(); ctx.moveTo(-w * 0.42, y); ctx.lineTo(0, y + w * 0.45); ctx.lineTo(w * 0.42, y); ctx.stroke(); }
    ctx.restore();
  };
  // A knife: pointed clip-point blade with a bevelled cutting edge and fuller, a brass guard, and a riveted wooden handle.
  P.p_knife = (ctx, w, h) => {
    const bt = -h / 2, bb = -h * 0.06;
    ctx.beginPath(); ctx.moveTo(-w * 0.3, bb); ctx.lineTo(-w * 0.3, bt + h * 0.2); ctx.quadraticCurveTo(-w * 0.28, bt + h * 0.06, w * 0.02, bt);
    ctx.bezierCurveTo(w * 0.22, bt + h * 0.1, w * 0.38, bt + h * 0.3, w * 0.38, bb); ctx.closePath();
    const steel = ctx.createLinearGradient(-w * 0.3, 0, w * 0.38, 0); steel.addColorStop(0, '#8e95a3'); steel.addColorStop(0.3, '#e9edf3'); steel.addColorStop(0.52, '#c3c9d4'); steel.addColorStop(1, '#7d8492');
    ctx.fillStyle = steel; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.moveTo(w * 0.38, bb); ctx.bezierCurveTo(w * 0.38, bt + h * 0.3, w * 0.22, bt + h * 0.1, w * 0.02, bt);
    ctx.lineTo(w * 0.02, bt + h * 0.04); ctx.bezierCurveTo(w * 0.2, bt + h * 0.16, w * 0.28, bt + h * 0.34, w * 0.28, bb); ctx.closePath(); fill(ctx, 'rgba(255,255,255,0.72)'); ctx.restore();
    ctx.strokeStyle = 'rgba(40,48,62,0.55)'; ctx.lineWidth = Math.max(1, w * 0.07); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w * 0.14, bt + h * 0.2); ctx.lineTo(-w * 0.14, bb - h * 0.03); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-w * 0.3, bb); ctx.lineTo(-w * 0.3, bt + h * 0.2); ctx.quadraticCurveTo(-w * 0.28, bt + h * 0.06, w * 0.02, bt); ctx.bezierCurveTo(w * 0.22, bt + h * 0.1, w * 0.38, bt + h * 0.3, w * 0.38, bb); ctx.closePath();
    stroke(ctx, 'rgba(30,36,48,0.6)', Math.max(0.8, w * 0.04));
    const brass = ctx.createLinearGradient(0, bb, 0, bb + h * 0.06); brass.addColorStop(0, '#e8c36a'); brass.addColorStop(1, '#8a6a1f');
    rrect(ctx, -w * 0.46, bb, w * 0.92, h * 0.05, w * 0.12); ctx.fillStyle = brass; ctx.fill();
    const hy = bb + h * 0.05, hh = h / 2 - hy;
    const wood = ctx.createLinearGradient(-w * 0.3, 0, w * 0.3, 0); wood.addColorStop(0, '#3a2414'); wood.addColorStop(0.45, '#8a5a33'); wood.addColorStop(1, '#3a2414');
    rrect(ctx, -w * 0.3, hy, w * 0.6, hh, w * 0.22); ctx.fillStyle = wood; ctx.fill();
    for (let i = 0; i < 3; i++) { circle(ctx, 0, hy + hh * (0.2 + i * 0.28), Math.max(1.1, w * 0.07)); fill(ctx, '#e6d3a0'); }
    rrect(ctx, -w * 0.32, h / 2 - h * 0.035, w * 0.64, h * 0.035, w * 0.12); fill(ctx, '#8a6a1f');
  };
  // A surfboard: pointed nose, widest just above centre, rounded tail with three fins, stringer, wax patch and painted panels.
  P.p_surfboard = (ctx, w, h) => {
    const outline = () => {
      ctx.beginPath(); ctx.moveTo(0, -h / 2);
      ctx.bezierCurveTo(w * 0.36, -h * 0.4, w * 0.52, -h * 0.2, w * 0.5, h * 0.04);
      ctx.bezierCurveTo(w * 0.49, h * 0.3, w * 0.34, h * 0.49, 0, h * 0.5);
      ctx.bezierCurveTo(-w * 0.34, h * 0.49, -w * 0.49, h * 0.3, -w * 0.5, h * 0.04);
      ctx.bezierCurveTo(-w * 0.52, -h * 0.2, -w * 0.36, -h * 0.4, 0, -h / 2); ctx.closePath();
    };
    const deck = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); deck.addColorStop(0, '#e9d6b4'); deck.addColorStop(0.5, '#fff6e3'); deck.addColorStop(1, '#e0cba6');
    outline(); ctx.fillStyle = deck; ctx.fill();
    ctx.save(); outline(); ctx.clip();
    ctx.fillStyle = '#ff6a3d'; ctx.beginPath(); ctx.moveTo(-w, -h * 0.22); ctx.quadraticCurveTo(0, -h * 0.27, w, -h * 0.22); ctx.lineTo(w, -h * 0.08); ctx.quadraticCurveTo(0, -h * 0.13, -w, -h * 0.08); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b8fa3'; ctx.beginPath(); ctx.moveTo(-w, -h * 0.06); ctx.quadraticCurveTo(0, -h * 0.11, w, -h * 0.06); ctx.lineTo(w, -h * 0.045); ctx.quadraticCurveTo(0, -h * 0.095, -w, -h * 0.045); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, h * 0.16, w * 0.26, h * 0.085, 0, 0, TAU); fill(ctx, 'rgba(255,255,255,0.55)');
    ctx.fillStyle = 'rgba(70,80,96,0.85)';
    for (const s of [-1, 0, 1]) { const fx = s * w * 0.3, fh = s === 0 ? h * 0.1 : h * 0.07; ctx.beginPath(); ctx.moveTo(fx - w * 0.06, h * 0.45); ctx.lineTo(fx, h * 0.45 - fh); ctx.lineTo(fx + w * 0.06, h * 0.45); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = 'rgba(120,90,50,0.75)'; ctx.lineWidth = Math.max(0.9, w * 0.05); ctx.beginPath(); ctx.moveTo(0, -h * 0.47); ctx.lineTo(0, h * 0.44); ctx.stroke();
    outline(); stroke(ctx, 'rgba(90,60,30,0.85)', Math.max(1, w * 0.06));
  };
  // A soccer goal seen from above: dark turf inside a white frame with a fine diamond net.
  P.p_soccergoal = (ctx, w, h) => {
    const turf = ctx.createLinearGradient(0, -h / 2, 0, h / 2); turf.addColorStop(0, '#14622b'); turf.addColorStop(1, '#0a3c1b');
    rrect(ctx, -w / 2, -h / 2, w, h, w * 0.2); ctx.fillStyle = turf; ctx.fill();
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.2); ctx.clip();
    ctx.strokeStyle = 'rgba(235,255,240,0.34)'; ctx.lineWidth = Math.max(0.6, w * 0.035);
    const cell = w * 0.42;
    for (let o = -h; o < h; o += cell) {
      ctx.beginPath(); ctx.moveTo(-w / 2, o); ctx.lineTo(w / 2, o + w); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w / 2, o + w); ctx.lineTo(w / 2, o); ctx.stroke();
    }
    ctx.restore();
    rrect(ctx, -w / 2 + w * 0.06, -h / 2 + w * 0.06, w - w * 0.12, h - w * 0.12, w * 0.18); stroke(ctx, '#f4fff6', Math.max(1.4, w * 0.13));
    for (const sy of [-1, 1]) for (const sx of [-1, 1]) { circle(ctx, sx * (w / 2 - w * 0.06), sy * (h / 2 - w * 0.06), Math.max(1.2, w * 0.09)); fill(ctx, '#ffffff'); }
  };
  P.p_lightsaber = (ctx, w, h, t, o) => {
    const hum = 0.9 + 0.1 * Math.sin(t * 40) * Math.sin(t * 6.3), hiltH = h * 0.18, bladeH = h - hiltH, col = o.color || rgbA(0x00f0ff);
    ctx.save(); ctx.translate(0, -hiltH / 2);
    rrect(ctx, -w * 0.32, -bladeH / 2, w * 0.64, bladeH, w * 0.3); fill(ctx, cs(alphaC(col, 0.78 * hum)));
    rrect(ctx, -w * 0.14, -bladeH / 2 + 2, w * 0.28, bladeH - 4, w * 0.14); fill(ctx, '#ffffff');
    ctx.restore();
    ctx.save(); ctx.translate(0, h / 2 - hiltH / 2);
    const hilt = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); hilt.addColorStop(0, '#3a3a42'); hilt.addColorStop(0.5, '#8b8f9c'); hilt.addColorStop(1, '#3a3a42');
    rrect(ctx, -w * 0.4, -hiltH / 2, w * 0.8, hiltH, w * 0.12); ctx.fillStyle = hilt; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = Math.max(1, w * 0.05);
    for (let y = -hiltH * 0.25; y <= hiltH * 0.25 + 0.01; y += hiltH * 0.25) { ctx.beginPath(); ctx.moveTo(-w * 0.4, y); ctx.lineTo(w * 0.4, y); ctx.stroke(); }
    ctx.restore();
  };
  P.p_pencil = (ctx, w, h) => {
    const top = -h / 2, tipH = h * 0.13, bodyT = top + tipH, eraB = h / 2, eraH = h * 0.08, ferH = h * 0.06, bodyB = eraB - eraH - ferH;
    ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(w * 0.5, bodyT); ctx.lineTo(-w * 0.5, bodyT); ctx.closePath(); fill(ctx, '#e8c391');
    ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(w * 0.17, top + tipH * 0.36); ctx.lineTo(-w * 0.17, top + tipH * 0.36); ctx.closePath(); fill(ctx, '#2b2b33');
    const body = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); body.addColorStop(0, '#d9a300'); body.addColorStop(0.4, '#ffd93a'); body.addColorStop(1, '#e0a800');
    ctx.fillStyle = body; ctx.fillRect(-w / 2, bodyT, w, bodyB - bodyT);
    ctx.strokeStyle = 'rgba(120,80,0,0.55)'; ctx.lineWidth = Math.max(0.8, w * 0.05); ctx.beginPath(); ctx.moveTo(-w * 0.17, bodyT); ctx.lineTo(-w * 0.17, bodyB); ctx.moveTo(w * 0.17, bodyT); ctx.lineTo(w * 0.17, bodyB); ctx.stroke();
    const fer = ctx.createLinearGradient(0, bodyB, 0, bodyB + ferH); fer.addColorStop(0, '#f3f5f8'); fer.addColorStop(0.5, '#9aa2b0'); fer.addColorStop(1, '#d9dde5');
    ctx.fillStyle = fer; ctx.fillRect(-w / 2, bodyB, w, ferH);
    ctx.strokeStyle = 'rgba(60,66,80,0.6)'; ctx.lineWidth = Math.max(0.8, w * 0.05); for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-w / 2, bodyB + ferH * i / 3); ctx.lineTo(w / 2, bodyB + ferH * i / 3); ctx.stroke(); }
    rrect(ctx, -w / 2, bodyB + ferH, w, eraH, w * 0.35); fill(ctx, '#ff8fb0');
  };
  P.p_bamboo = (ctx, w, h, t) => {
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#2f7a2a'); g.addColorStop(0.35, '#8fdc5c'); g.addColorStop(0.7, '#4fae3a'); g.addColorStop(1, '#2a6a26');
    rrect(ctx, -w / 2, -h / 2, w, h, w * 0.3); ctx.fillStyle = g; ctx.fill();
    ctx.save(); rrect(ctx, -w / 2, -h / 2, w, h, w * 0.3); ctx.clip();
    for (let i = 1; i < 5; i++) { const y = -h / 2 + h * i / 5; ctx.fillStyle = '#22581f'; ctx.fillRect(-w / 2, y - w * 0.09, w, w * 0.18); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-w / 2, y - w * 0.18, w, w * 0.06); }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-w * 0.28, -h / 2, w * 0.1, h);
    ctx.restore();
    for (const s of [-1, 1]) {
      const y = -h / 2 + h * (s < 0 ? 0.4 : 0.6), sw = Math.sin(t * 1.6 + s) * 0.12;
      ctx.save(); ctx.translate(s * w * 0.45, y); ctx.rotate(s * (0.9 + sw)); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(w * 0.25, -w * 0.5, w * 0.05, -w * 1.0); ctx.quadraticCurveTo(-w * 0.3, -w * 0.5, 0, 0); fill(ctx, '#5cc24a'); ctx.restore();
    }
  };
  P.p_crystal = (ctx, w, h, t, o) => {
    const base = mixC(rgbA(0x56b8ff), o.color || rgbA(0x56b8ff), 0.3);
    const facet = (x0, y0, x1, y1, x2, y2, x3, y3, a) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); fill(ctx, cs(alphaC(mixC(base, WHITE, a * 0.7), 0.8 + 0.2 * a))); };
    const hw = w / 2, tip = h * 0.06, n = 6;
    for (let i = 0; i < n; i++) {
      const y0 = -h / 2 + tip + (h - tip * 2) * i / n, y1 = -h / 2 + tip + (h - tip * 2) * (i + 1) / n;
      const w0 = i === 0 ? 0.4 : 1, w1 = i === n - 1 ? 0.4 : 1, sh = 0.25 + 0.5 * Math.abs(Math.sin(t * 0.9 + i * 1.3));
      facet(-hw * w0, y0, 0, y0, 0, y1, -hw * w1, y1, sh * 0.6);
      facet(0, y0, hw * w0, y0, hw * w1, y1, 0, y1, 0.15 + sh * 0.5);
    }
    ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(hw * 0.4, -h / 2 + tip); ctx.lineTo(-hw * 0.4, -h / 2 + tip); ctx.closePath(); fill(ctx, cs(alphaC(mixC(base, WHITE, 0.7), 0.9)));
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(hw * 0.4, h / 2 - tip); ctx.lineTo(-hw * 0.4, h / 2 - tip); ctx.closePath(); fill(ctx, cs(alphaC(base, 0.8)));
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = Math.max(0.8, w * 0.05); ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(0, h / 2); ctx.stroke();
    const y = ((t * 0.45) % 1.5 - 0.25) * h - h / 2;
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, -h / 2); ctx.lineTo(hw, -h / 2 + tip); ctx.lineTo(hw, h / 2 - tip); ctx.lineTo(0, h / 2); ctx.lineTo(-hw, h / 2 - tip); ctx.lineTo(-hw, -h / 2 + tip); ctx.closePath(); ctx.clip();
    const s = ctx.createLinearGradient(0, y - h * 0.08, 0, y + h * 0.08); s.addColorStop(0, 'rgba(255,255,255,0)'); s.addColorStop(0.5, 'rgba(255,255,255,0.85)'); s.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = s; ctx.fillRect(-hw, y - h * 0.08, w, h * 0.16);
    ctx.restore();
  };
  P.p_rocket = (ctx, w, h, t) => {
    const top = -h / 2, bot = h / 2 - h * 0.13, noseH = h * 0.16, fl = 0.75 + 0.25 * Math.sin(t * 35) * Math.sin(t * 9);
    add(ctx, true);
    const fg = ctx.createLinearGradient(0, bot, 0, bot + h * 0.15 * fl); fg.addColorStop(0, 'rgba(255,240,160,0.95)'); fg.addColorStop(0.5, 'rgba(255,140,40,0.8)'); fg.addColorStop(1, 'rgba(255,40,20,0)');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(-w * 0.26, bot); ctx.quadraticCurveTo(0, bot + h * 0.2 * fl, w * 0.26, bot); ctx.closePath(); ctx.fill();
    add(ctx, false);
    const body = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); body.addColorStop(0, '#aeb6c6'); body.addColorStop(0.4, '#ffffff'); body.addColorStop(1, '#9aa3b6');
    ctx.beginPath(); ctx.moveTo(-w * 0.42, bot); ctx.lineTo(-w * 0.42, top + noseH); ctx.quadraticCurveTo(-w * 0.4, top + noseH * 0.3, 0, top); ctx.quadraticCurveTo(w * 0.4, top + noseH * 0.3, w * 0.42, top + noseH); ctx.lineTo(w * 0.42, bot); ctx.closePath(); ctx.fillStyle = body; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.moveTo(-w * 0.45, top + noseH); ctx.quadraticCurveTo(-w * 0.4, top + noseH * 0.3, 0, top); ctx.quadraticCurveTo(w * 0.4, top + noseH * 0.3, w * 0.45, top + noseH); ctx.closePath(); ctx.clip(); ctx.fillStyle = '#e8203f'; ctx.fillRect(-w, top - 2, w * 2, noseH + 2); ctx.restore();
    ctx.fillStyle = '#e8203f';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * w * 0.4, bot - h * 0.2); ctx.lineTo(s * w * 0.66, bot + h * 0.02); ctx.lineTo(s * w * 0.4, bot); ctx.closePath(); ctx.fill(); }
    for (let i = 0; i < 2; i++) { const y = top + noseH + h * 0.12 + i * h * 0.17; circle(ctx, 0, y, w * 0.2); fill(ctx, '#1a2b44'); circle(ctx, -w * 0.05, y - w * 0.05, w * 0.07); fill(ctx, 'rgba(160,220,255,0.9)'); }
    rrect(ctx, -w * 0.42, bot - h * 0.03, w * 0.84, h * 0.03, w * 0.05); fill(ctx, '#6a7386');
  };
  P.p_ruler = (ctx, w, h) => {
    const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#e3b94f'); g.addColorStop(0.5, '#ffe289'); g.addColorStop(1, '#d9ac3f');
    rrect(ctx, -w / 2, -h / 2, w, h, w * 0.14); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#3b2b08'; ctx.lineWidth = Math.max(0.8, w * 0.05); ctx.lineCap = 'butt';
    const n = 36;
    for (let i = 0; i <= n; i++) { const y = -h / 2 + h * 0.04 + (h * 0.92) * i / n, len = i % 6 === 0 ? w * 0.5 : i % 3 === 0 ? w * 0.34 : w * 0.2; ctx.beginPath(); ctx.moveTo(-w / 2 + w * 0.04, y); ctx.lineTo(-w / 2 + w * 0.04 + len, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(w * 0.28, -h / 2, w * 0.1, h);
    rrect(ctx, -w / 2, -h / 2, w, h, w * 0.14); stroke(ctx, 'rgba(90,60,10,0.7)', Math.max(0.8, w * 0.05));
  };
  NP.paddleIds = Object.keys(P);

  // ---- auras. All are stateless (positions come from time + hash), so they cost a handful of shapes per frame.
  function boltPath(ctx, x0, y0, x1, y1, segs, jitter, seed) {
    ctx.beginPath(); ctx.moveTo(x0, y0);
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) + 0.001, nx = -dy / len, ny = dx / len;
    for (let i = 1; i < segs; i++) { const f = i / segs, j = (hash(seed + i * 3.1) - 0.5) * 2 * jitter * Math.sin(f * Math.PI); ctx.lineTo(x0 + dx * f + nx * j, y0 + dy * f + ny * j); }
    ctx.lineTo(x1, y1);
  }
  function drawAura(ctx, id, w, h, t, o) {
    if (!id || id === 'a_none') return;
    const col = o.color || WHITE, colS = cs(col), hitAge = o.hitAge == null ? 9 : o.hitAge;
    ctx.save();
    if (id === 'a_halo') {
      for (let j = 0; j < 3; j++) { const a = t * 1.6 + j * 2.094; glow(ctx, colS, 8); circle(ctx, Math.cos(a) * (w * 0.5 + 16), Math.sin(a) * h * 0.45, 3.2); fill(ctx, colS); }
    } else if (id === 'a_sparks') {
      for (let j = 0; j < 14; j++) {
        const a = j * 2.4 + t * 0.9, xx = Math.sin(a) * (w * 0.5 + 8 + (j % 3) * 5), yy = Math.cos(a * 1.4) * (h / 2 + 6);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + j * 1.7));
        ctx.fillStyle = cs(alphaC(j % 2 ? WHITE : col, tw)); ctx.fillRect(xx - 1, yy - 1, 2.4, 2.4);
      }
    } else if (id === 'a_comet') {
      for (let j = 1; j <= 6; j++) {
        const yy = Math.sin(t * 4 - j * 0.6) * 12, a = Math.max(0, 0.34 - j * 0.05);
        ctx.fillStyle = cs(alphaC(col, a)); rrect(ctx, -w / 2 - 6 * j, -h / 2 + yy, 3, h, 1.5); ctx.fill();
        rrect(ctx, w / 2 + 6 * j - 3, -h / 2 - yy, 3, h, 1.5); ctx.fill();
      }
    } else if (id === 'a_hearts') {
      for (let j = 0; j < 3; j++) {
        const a = t * 1.3 + j * 2.094, hx = Math.cos(a) * (w * 0.5 + 14), hy = Math.sin(a) * h * 0.4, s = 5 + Math.sin(t * 5 + j) * 1.2;
        ctx.save(); ctx.translate(hx, hy); glow(ctx, '#ff4d7a', 8);
        ctx.beginPath(); ctx.moveTo(0, s * 0.9); ctx.bezierCurveTo(-s * 1.3, 0, -s * 0.8, -s, 0, -s * 0.4); ctx.bezierCurveTo(s * 0.8, -s, s * 1.3, 0, 0, s * 0.9);
        fill(ctx, '#ff5a8a'); ctx.restore();
      }
    } else if (id === 'a_clovers') {
      for (let j = 0; j < 3; j++) {
        const a = j * 2.4 + t * 0.6, xx = Math.sin(a) * (w * 0.5 + 10), yy = Math.cos(a * 1.3) * (h / 2 + 10);
        ctx.save(); ctx.translate(xx, yy); ctx.rotate(t * 0.8 + j); glow(ctx, '#39ff6a', 6);
        for (let k = 0; k < 4; k++) { ctx.save(); ctx.rotate(k * Math.PI / 2); circle(ctx, 0, -3.2, 3.2); fill(ctx, 'rgba(57,255,106,0.85)'); ctx.restore(); }
        ctx.restore();
      }
    } else if (id === 'a_diamond') {
      for (let j = 0; j < 5; j++) {
        const ph = (t * 0.7 + j / 5) % 1, a = j * 1.9, xx = Math.sin(a) * (w * 0.5 + 10 + ph * 6), yy = Math.cos(a * 1.6) * (h / 2 + 6), tw = Math.max(0, Math.sin(ph * Math.PI));
        ctx.save(); ctx.translate(xx, yy); ctx.rotate(t * 2 + j); glow(ctx, '#9ad8ff', 8 * tw);
        poly(ctx, 4, 4.5 * tw, 0, 1.3); fill(ctx, `rgba(223,246,255,${tw})`);
        ctx.restore();
      }
    } else if (id === 'a_blades') {
      for (let j = 0; j < 4; j++) {
        const a = j * (TAU / 4) + t * 3.2;
        ctx.save(); ctx.translate(Math.cos(a) * (w * 0.5 + 12), Math.sin(a) * h * 0.42); ctx.rotate(a + Math.PI / 2); glow(ctx, '#d8dee8', 6);
        ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(2, 2); ctx.lineTo(-2, 2); ctx.closePath(); fill(ctx, '#c7d0dc');
        ctx.restore();
      }
    } else if (id === 'a_money') {
      for (let j = 0; j < 5; j++) {
        const ph = (t * 0.5 + j / 5) % 1, xx = (hash(j + 1) - 0.5) * (w + 20), yy = h * 0.6 - ph * h * 1.4, a2 = Math.max(0, 1 - ph);
        ctx.save(); ctx.translate(xx, yy); ctx.font = '700 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(125,255,176,${a2})`; ctx.fillText('$', 0, 0);
        ctx.restore();
      }
    } else if (id === 'a_lightning') {
      // short electric arcs that jump off the paddle's edges, re-rolled ~14 times a second, with a spark at each tip
      const k = mixC(col, rgbA(0x9fd2ff), 0.55), slot = Math.floor(t * 14);
      add(ctx, true); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let b = 0; b < 4; b++) {
        const sd = slot * 5 + b * 17; if (hash(sd) < 0.22) continue;
        const side = hash(sd + 1) < 0.5 ? -1 : 1, y0 = (hash(sd + 2) - 0.5) * (h - w), len = 14 + hash(sd + 3) * 28;
        const x0 = side * w / 2, x1 = side * (w / 2 + len), y1 = y0 + (hash(sd + 4) - 0.5) * 44;
        boltPath(ctx, x0, y0, x1, y1, 6, 5, sd);
        ctx.strokeStyle = cs(alphaC(k, 0.4)); ctx.lineWidth = 5; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.3; ctx.stroke();
        circle(ctx, x1, y1, 2.2); fill(ctx, cs(alphaC(mixC(k, WHITE, 0.5), 0.9)));
        if (hash(sd + 6) < 0.5) { boltPath(ctx, (x0 + x1) / 2, (y0 + y1) / 2, x1 + side * 8, y1 + (hash(sd + 7) - 0.5) * 26, 4, 3, sd + 9); ctx.strokeStyle = cs(alphaC(k, 0.8)); ctx.lineWidth = 1.1; ctx.stroke(); }
      }
      add(ctx, false);
    } else if (id === 'a_frost') {
      // soft drifting mist, falling snow and small ice crystals that flash in and out along the edges
      const k = mixC(col, rgbA(0x9fd8ff), 0.75);
      for (let j = 0; j < 6; j++) {
        const ph = fract01(t * 0.16 + j / 6), xx = (hash(j + 1) - 0.5) * (w + 30) + Math.sin(t * 0.8 + j) * 7, yy = (fract01(t * 0.05 + hash(j + 3)) - 0.5) * (h + 40), rr = 22 + hash(j + 7) * 20;
        const g = ctx.createRadialGradient(xx, yy, 0, xx, yy, rr); g.addColorStop(0, cs(alphaC(k, 1))); g.addColorStop(1, cs(alphaC(k, 0)));
        ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.4; ctx.fillStyle = g; ctx.fillRect(xx - rr, yy - rr, rr * 2, rr * 2); ctx.restore();
      }
      for (let j = 0; j < 12; j++) {
        const xx = (hash(j + 11) - 0.5) * (w + 36) + Math.sin(t * 1.3 + j * 2) * 4, yy = (fract01(t * (0.12 + hash(j + 5) * 0.1) + hash(j + 2)) - 0.5) * (h + 30);
        circle(ctx, xx, yy, 0.9 + hash(j + 8) * 1.1); fill(ctx, `rgba(234,248,255,${0.4 + 0.5 * Math.abs(Math.sin(t * 3 + j))})`);
      }
      for (let j = 0; j < 5; j++) {
        const ph = fract01(t * 0.55 + j / 5), a = Math.sin(ph * Math.PI), side = j % 2 ? 1 : -1, yy = (hash(j * 3 + 1) - 0.5) * (h - 8), xx = side * (w / 2 + 4 + hash(j + 4) * 5);
        ctx.save(); ctx.translate(xx, yy); ctx.rotate(t * 1.5 + j); ctx.globalAlpha = a; poly(ctx, 4, 4.4, 0, 1.6); fill(ctx, 'rgba(230,250,255,0.85)'); stroke(ctx, '#fff', 0.8); ctx.restore();
      }
    } else if (id === 'a_fire') {
      // flame tongues lick off both sides and rise, cooling yellow -> orange -> red, with embers drifting higher
      for (let j = 0; j < 30; j++) {
        const ph = fract01(t * (0.9 + hash(j) * 0.6) + hash(j + 5)), side = j % 2 ? 1 : -1, y0 = (hash(j + 2) - 0.5) * h * 0.98;
        const xx = side * (w / 2 - 1 + ph * 7 + Math.sin(t * 6 + j) * 1.8), yy = y0 - ph * (18 + hash(j + 9) * 22), s = (1 - ph * 0.8) * (5 + hash(j + 4) * 4.5);
        const k = ph < 0.28 ? rgbA(0xffc933) : ph < 0.62 ? rgbA(0xff7a1a) : rgbA(0xe02a14);
        ctx.beginPath(); ctx.ellipse(xx, yy, s * 0.7, s * 1.6, side * 0.15, 0, TAU); fill(ctx, cs(alphaC(k, (1 - ph) * 0.95)));
        ctx.beginPath(); ctx.ellipse(xx, yy + s * 0.2, s * 0.32, s * 0.8, side * 0.15, 0, TAU); fill(ctx, cs(alphaC(rgbA(0xffe9a0), (1 - ph) * 0.7)));
      }
      add(ctx, true);
      for (let j = 0; j < 9; j++) {
        const ph = fract01(t * 0.42 + j / 9), side = j % 2 ? 1 : -1, xx = side * (w / 2 + 6 + Math.sin(t * 3 + j * 1.7) * 6), yy = (hash(j + 30) - 0.5) * h * 0.8 - ph * (h * 0.25 + 24);
        circle(ctx, xx, yy, 1.3); fill(ctx, `rgba(255,179,71,${(1 - ph) * 0.9})`);
      }
      add(ctx, false);
    } else if (id === 'a_shockwave') {
      // one pair of expanding rings per real paddle hit (hitAge restarts at each hit, so nothing repeats on its own)
      if (hitAge < 0.62) {
        const k = mixC(col, WHITE, 0.4); add(ctx, true);
        for (let r = 0; r < 2; r++) {
          const u = (hitAge - r * 0.07) / 0.5; if (u <= 0 || u >= 1) continue;
          const e = 1 - Math.pow(1 - u, 2.2), rx = w / 2 + e * (52 + r * 16), ry = h * 0.3 + e * (46 + r * 12);
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.strokeStyle = cs(alphaC(k, Math.pow(1 - u, 1.4) * 0.85)); ctx.lineWidth = 3.2 * (1 - u) + 0.8; ctx.stroke();
        }
        add(ctx, false);
      }
    } else if (id === 'a_petals') {
      for (let j = 0; j < 8; j++) {
        const ph = fract01(t * 0.17 + j / 8), xx = Math.sin(ph * 7 + j * 1.3) * (w * 0.5 + 12) + (hash(j) - 0.5) * 8, yy = -h * 0.6 + ph * h * 1.2;
        ctx.save(); ctx.translate(xx, yy); ctx.rotate(t * 1.6 + j * 2); ctx.globalAlpha = Math.sin(ph * Math.PI);
        ctx.beginPath(); ctx.ellipse(0, 0, 3.6, 1.9, 0, 0, TAU); fill(ctx, '#ffb7d5');
        ctx.beginPath(); ctx.ellipse(-0.8, 0, 1.8, 1.0, 0, 0, TAU); fill(ctx, 'rgba(255,240,246,0.8)');
        ctx.restore();
      }
    } else if (id === 'a_bubbles') {
      for (let j = 0; j < 9; j++) {
        const ph = fract01(t * (0.16 + hash(j) * 0.1) + hash(j + 4)), side = hash(j + 2) < 0.5 ? -1 : 1;
        const xx = side * (w / 2 + 3 + hash(j + 6) * 12) + Math.sin(t * 2 + j * 1.9) * 2.5, yy = h / 2 - ph * (h + 20) + 10, r = 1.6 + hash(j + 8) * 2.2;
        ctx.save(); ctx.globalAlpha = Math.min(1, Math.sin(ph * Math.PI) * 1.4);
        circle(ctx, xx, yy, r); fill(ctx, 'rgba(191,234,255,0.12)'); stroke(ctx, 'rgba(216,244,255,0.75)', 1);
        circle(ctx, xx - r * 0.35, yy - r * 0.35, r * 0.28); fill(ctx, 'rgba(255,255,255,0.85)');
        ctx.restore();
      }
    } else if (id === 'a_orbit') {
      // three tiny worlds on tilted orbits: nearer ones are larger and brighter, farther ones dim behind the paddle
      const cols = ['#c9ced9', '#ffb088', '#7fb6ff'];
      for (let j = 0; j < 3; j++) {
        const a = t * (1.1 + j * 0.45) + j * 2.1, z = Math.sin(a), xx = Math.cos(a) * (w / 2 + 15 + j * 7), yy = z * (h * 0.1 + j * 20) + (j - 1) * 6, r = 2.6 + 1.1 * z + j * 0.4;
        ctx.save(); ctx.globalAlpha = 0.65 + 0.35 * z; ctx.translate(xx, yy);
        circle(ctx, 0, 0, r); fill(ctx, cols[j]);
        circle(ctx, -r * 0.3, -r * 0.3, r * 0.45); fill(ctx, 'rgba(255,255,255,0.35)');
        if (j === 1) { ctx.beginPath(); ctx.ellipse(0, 0, r * 1.9, r * 0.55, -0.4, 0, TAU); stroke(ctx, 'rgba(255,224,196,0.8)', 1); }
        ctx.restore();
      }
    }
    ctx.restore(); noGlow(ctx);
  }

  NP.drawPaddle = function (ctx, skinId, glowId, w, h, t, o = {}) {
    const L = glowLook(glowId || 'o_none', t, o.bpm || 168, !!o.calm);
    const o2 = Object.assign({}, o, { color: L.color });
    if (o.lightBoard) drawContactShadow(ctx, w, h, 0.55);
    drawGlowBloom(ctx, w, h, L, o.lightBoard ? 0.6 : 1);   // light emitted by the paddle, behind it
    drawAura(ctx, o.aura, w, h, t, o2);
    ctx.save(); (P[skinId] || P.p_classic)(ctx, w, h, t, o2); ctx.restore(); noGlow(ctx);
    if (o.lightBoard) { rrect(ctx, -w / 2, -h / 2, w, h, w / 2); stroke(ctx, 'rgba(14,20,32,0.62)', 1.3); }  // crisp dark rim so even a white paddle reads on a pale board
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
  // ---- boards added or reworked in 4.1 (ported from source/art.h)
  const stepDt = (st, t) => { const dt = st.last == null ? 0 : Math.max(0, Math.min(0.05, t - st.last)); st.last = t; return dt; };
  const GRID_PALS = {
    b_grid: ['#0a0620', '#12052a', 'rgba(255,43,214,1)', 'rgba(255,43,214,0.55)'],
    b_grid_cyan: ['#041320', '#02192a', 'rgba(0,240,255,1)', 'rgba(0,240,255,0.5)'],
    b_grid_green: ['#03140a', '#031f10', 'rgba(57,255,106,1)', 'rgba(57,255,106,0.5)'],
    b_grid_orange: ['#1a0c03', '#241003', 'rgba(255,122,26,1)', 'rgba(255,122,26,0.5)'],
    b_grid_red: ['#1a0508', '#24060a', 'rgba(255,43,58,1)', 'rgba(255,43,58,0.5)'],
  };
  function boardGridPal(ctx, w, h, t, p) {
    fillBg(ctx, w, h, p[0], p[1]);
    const hz = h * 0.42, g = ctx.createLinearGradient(0, hz - 30, 0, hz + 10);
    g.addColorStop(0, p[2].replace(',1)', ',0)')); g.addColorStop(1, p[2].replace(',1)', ',0.35)')); ctx.fillStyle = g; ctx.fillRect(0, hz - 30, w, 40);
    grid(ctx, w, h, t, hz, p[3]);
  }
  for (const id of Object.keys(GRID_PALS)) BD[id] = (ctx, w, h, t) => boardGridPal(ctx, w, h, t, GRID_PALS[id]);

  function streamBoard(ctx, w, h, t, st, bg, head, tail) {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    const fs = Math.max(8, Math.round(h / 26)), cols = Math.ceil(w / fs), chars = '0123456789ABCDEF01';
    if (!st.cols || st.cols.length !== cols) { st.cols = Array.from({ length: cols }, (_, i) => ({ y: hash(i) * h, v: 40 + hash(i + 5) * 90 })); }
    const dt = stepDt(st, t);
    ctx.font = `${fs}px monospace`; ctx.textAlign = 'center';
    st.cols.forEach((c, i) => {
      c.y += c.v * dt * (h / 300); if (c.y - fs * 14 > h) c.y = -hash(t + i) * h * 0.4;
      for (let k = 0; k < 14; k++) { const y = c.y - k * fs; if (y < -fs || y > h + fs) continue; const ch = chars[Math.floor(hash(i * 31 + k + Math.floor(t * 6)) * 18) % 18]; ctx.fillStyle = k === 0 ? head : `rgba(${tail},${(1 - k / 14) * 0.8})`; ctx.fillText(ch, i * fs + fs / 2, y); }
    });
  }
  BD.b_purplestream = (ctx, w, h, t, st) => streamBoard(ctx, w, h, t, st, '#0a0512', '#f6ecff', '179,107,255');

  const lavaLamp = (blue) => (ctx, w, h, t) => {
    if (blue) fillBg(ctx, w, h, '#06163a', '#020a1e'); else fillBg(ctx, w, h, '#2a0636', '#12021c');
    add(ctx, true);
    for (let i = 0; i < 7; i++) {
      const x = w * (0.15 + 0.7 * hash(i)) + Math.sin(t * 0.3 + i) * w * 0.08, y = h * (0.5 + 0.45 * Math.sin(t * 0.25 * (0.6 + hash(i + 3)) + i * 1.7)), r = Math.min(w, h) * (0.1 + 0.08 * hash(i + 9));
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      if (blue) g.addColorStop(0, i % 2 ? 'rgba(40,170,255,0.85)' : 'rgba(90,110,255,0.8)'); else g.addColorStop(0, i % 2 ? 'rgba(255,120,40,0.9)' : 'rgba(255,43,214,0.8)');
      g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    add(ctx, false);
  };
  BD.b_lavalamp = lavaLamp(false); BD.b_lavalamp_blue = lavaLamp(true);

  BD.b_soccerfield = (ctx, w, h) => {
    fillBg(ctx, w, h, '#0f4a22', '#0a2f16');
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)'; ctx.fillRect(i * w / 10, 0, w / 10, h); }
    const lw = Math.max(1.5, w * 0.0035);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.15, 0, TAU); ctx.stroke();
    circle(ctx, w / 2, h / 2, lw * 1.4); fill(ctx, 'rgba(255,255,255,0.7)');
    const bx = w * 0.09, bh = h * 0.46, by = (h - bh) / 2;
    ctx.strokeRect(0, by, bx, bh); ctx.strokeRect(w - bx, by, bx, bh);
    const sx2 = w * 0.035, sh = h * 0.2, sy2 = (h - sh) / 2;
    ctx.strokeRect(0, sy2, sx2, sh); ctx.strokeRect(w - sx2, sy2, sx2, sh);
  };
  BD.b_footballfield = (ctx, w, h) => {
    fillBg(ctx, w, h, '#123018', '#0c2211');
    const lanes = 10, flw = Math.max(1.2, w * 0.003);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = flw;
    ctx.beginPath(); for (let i = 1; i < lanes; i++) { ctx.moveTo(i * w / lanes, 0); ctx.lineTo(i * w / lanes, h); } ctx.stroke();
    ctx.lineWidth = flw * 0.8;
    for (let i = 0; i < lanes; i++) for (let k = 1; k < 4; k++) {
      const x = i * w / lanes + k * (w / lanes) / 4;
      ctx.beginPath(); ctx.moveTo(x, h * 0.44); ctx.lineTo(x, h * 0.48); ctx.moveTo(x, h * 0.52); ctx.lineTo(x, h * 0.56); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(200,60,60,0.22)'; ctx.fillRect(0, 0, w * 0.06, h);
    ctx.fillStyle = 'rgba(60,90,220,0.22)'; ctx.fillRect(w * 0.94, 0, w * 0.06, h);
    // a worn dirt patch in front of each end zone: one irregular blob shape, mirrored so the left and right patches match exactly
    for (let side = 0; side < 2; side++) {
      const sg = side ? -1 : 1, cx = side ? w * 0.905 : w * 0.095, cy = h * 0.5, rx = w * 0.058, ry = h * 0.2;
      const blob = (k) => { ctx.beginPath(); for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, rr = (0.93 + 0.07 * hash(i * 1.7 + 3)) * k, px = cx + sg * Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); };
      blob(1.12); fill(ctx, 'rgba(40,92,44,0.35)');
      blob(1); fill(ctx, 'rgba(86,58,32,0.96)');
      blob(0.74); fill(ctx, 'rgba(122,86,50,0.92)');
      blob(0.42); fill(ctx, 'rgba(146,106,66,0.5)');
      for (let i = 0; i < 40; i++) {
        const a = hash(i * 1.3) * TAU, d = Math.sqrt(hash(i * 2.1 + 5)) * 0.85, px = cx + sg * Math.cos(a) * d * rx, py = cy + Math.sin(a) * d * ry;
        ctx.fillStyle = i % 3 ? 'rgba(60,40,22,0.6)' : 'rgba(182,144,100,0.55)'; ctx.fillRect(px, py, 1.8 + hash(i + 7) * 2.4, 1.4 + hash(i + 9) * 1.6);
      }
      ctx.strokeStyle = 'rgba(54,36,20,0.4)'; ctx.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) { const y = cy + (i - 2.5) * ry * 0.28; ctx.beginPath(); ctx.moveTo(cx - sg * rx * 0.55, y); ctx.quadraticCurveTo(cx, y + (i % 2 ? 5 : -5), cx + sg * rx * 0.55, y + 2); ctx.stroke(); }
    }
    const haze = ctx.createLinearGradient(0, 0, 0, h * 0.12); haze.addColorStop(0, 'rgba(255,240,200,0.12)'); haze.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = haze; ctx.fillRect(0, 0, w, h * 0.12);
  };
  BD.b_snowstorm = (ctx, w, h, t, st, o = {}) => {
    fillBg(ctx, w, h, '#141a24', '#080a10');
    if (!st.fl || st.fl.length !== 90 || st.fl[0].dy == null) st.fl = Array.from({ length: 90 }, (_, i) => ({ x: hash(i) * w, y: hash(i + 2) * h, dy: 1, v: 60 + hash(i + 5) * 90 }));
    const dt = stepDt(st, t), calm = o.reduceFlashing ? 0.5 : 1;
    ctx.strokeStyle = 'rgba(235,242,255,0.6)'; ctx.lineCap = 'round'; ctx.lineWidth = 1.2;
    for (const fl of st.fl) {
      fl.y += fl.v * dt * calm; fl.x -= fl.v * 0.55 * dt * calm;
      if (fl.y > h + 10 || fl.x < -10) { fl.y = -10 - hash(t + fl.x) * 40; fl.x = w * (0.3 + hash(t * 2 + fl.y) * 1.2); fl.v = 60 + hash(fl.x + t) * 90; }
      ctx.beginPath(); ctx.moveTo(fl.x, fl.y); ctx.lineTo(fl.x + fl.v * 0.1, fl.y - fl.v * 0.18); ctx.stroke();
    }
    ctx.fillStyle = '#05070a';
    for (let i = 0; i < 7; i++) { const x = i * w / 6.5, hgt = h * (0.12 + 0.05 * hash(i + 1)); ctx.beginPath(); ctx.moveTo(x - w * 0.03, h); ctx.lineTo(x, h - hgt); ctx.lineTo(x + w * 0.03, h); ctx.closePath(); ctx.fill(); }
  };
  BD.b_spaceship = (ctx, w, h, t, st) => {
    // A ship's interior in one-point perspective: ribbed corridor walls receding to a viewport onto space.
    const vx = w / 2, vy = h * 0.46, iw = w * 0.34, ih = h * 0.32;
    const lerpR = (u) => ({ x: (vx - iw / 2) * u, y: (vy - ih / 2) * u, w: w * (1 - u) + iw * u, h: h * (1 - u) + ih * u });
    ctx.fillStyle = '#080b14'; ctx.fillRect(0, 0, w, h);
    const I = lerpR(1);
    ctx.save(); rrect(ctx, I.x, I.y, I.w, I.h, 6); ctx.clip();
    fillBg(ctx, w, h, '#02030a', '#060a18');
    if (!st.stars || st.stars.length !== 70 || st.stars[0].ship == null) st.stars = Array.from({ length: 70 }, (_, i) => ({ x: hash(i) * w, y: hash(i + 11) * h, z: 0.4 + hash(i + 3) * 0.6, ship: 1 }));
    for (const s of st.stars) { const tw = 0.5 + 0.5 * Math.sin(t * (0.6 + s.z) + s.x); ctx.fillStyle = `rgba(223,232,255,${tw * s.z * 0.9})`; ctx.fillRect(I.x + (s.x % I.w), I.y + (s.y % I.h), 1.3, 1.3); }
    { const pr = I.h * 0.34, px = I.x + I.w * (0.3 + 0.04 * Math.sin(t * 0.1)), py = I.y + I.h * 0.62;
      const pg = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr); pg.addColorStop(0, '#7aa6d8'); pg.addColorStop(0.7, '#2a4a80'); pg.addColorStop(1, '#0a1630'); ctx.fillStyle = pg; circle(ctx, px, py, pr); ctx.fill();
      const at = ctx.createRadialGradient(px, py, pr * 0.9, px, py, pr * 1.25); at.addColorStop(0, 'rgba(120,180,255,0.35)'); at.addColorStop(1, 'rgba(120,180,255,0)'); ctx.fillStyle = at; ctx.fillRect(px - pr * 1.3, py - pr * 1.3, pr * 2.6, pr * 2.6); }
    ctx.restore();
    const K = 7, us = [0]; for (let k = 1; k <= K; k++) us.push(1 - 1 / (1 + 0.55 * k * (1 + 0.1 * k))); us[K] = 1;
    const lum = (hex, sh) => { const k = mixC(rgbA(hex), WHITE, sh); return cs(k); };
    const quad = (ax, ay, bx, by, cx, cy, dx, dy, colr) => { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.lineTo(dx, dy); ctx.closePath(); fill(ctx, colr); };
    for (let k = 0; k < K; k++) {
      const a = lerpR(us[k]), b = lerpR(us[k + 1]), shade = k % 2 ? 0 : 0.05;
      quad(a.x, a.y, a.x, a.y + a.h, b.x, b.y + b.h, b.x, b.y, lum(0x242d44, shade));
      quad(a.x + a.w, a.y, a.x + a.w, a.y + a.h, b.x + b.w, b.y + b.h, b.x + b.w, b.y, lum(0x242d44, shade));
      quad(a.x, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x, b.y, lum(0x2e3a58, shade * 0.8));
      quad(a.x, a.y + a.h, a.x + a.w, a.y + a.h, b.x + b.w, b.y + b.h, b.x, b.y + b.h, lum(0x151a28, shade * 0.6));
    }
    ctx.strokeStyle = 'rgba(150,170,210,0.28)'; ctx.lineWidth = 1.4;
    for (let k = 0; k <= K; k++) { const r = lerpR(us[k]); ctx.strokeRect(r.x, r.y, r.w, r.h); }
    ctx.beginPath(); { const ro = lerpR(0), inn = lerpR(1); ctx.moveTo(ro.x, ro.y); ctx.lineTo(inn.x, inn.y); ctx.moveTo(ro.x + ro.w, ro.y); ctx.lineTo(inn.x + inn.w, inn.y); ctx.moveTo(ro.x, ro.y + ro.h); ctx.lineTo(inn.x, inn.y + inn.h); ctx.moveTo(ro.x + ro.w, ro.y + ro.h); ctx.lineTo(inn.x + inn.w, inn.y + inn.h); }
    ctx.stroke();
    for (let side = 0; side < 2; side++) for (let k = 0; k < K; k++) {
      const a = lerpR(us[k]), ph = fract01(t * 0.35 - k * 0.14), lit = 0.25 + 0.75 * Math.max(0, 1 - Math.abs(ph - 0.5) * 2.2);
      const lc = side ? [255, 154, 60] : [60, 207, 255], ya = side ? a.y + a.h : a.y, off = (side ? -1 : 1) * 3;
      add(ctx, true); ctx.strokeStyle = `rgba(${lc[0]},${lc[1]},${lc[2]},${0.55 * lit})`; ctx.lineWidth = 3 * (1 - us[k] * 0.6) + 0.8;
      ctx.beginPath(); ctx.moveTo(a.x + a.w * 0.2, ya + off); ctx.lineTo(a.x + a.w * 0.8, ya + off); ctx.stroke(); add(ctx, false);
    }
    for (let side = 0; side < 2; side++) {
      const cx = side ? w - w * 0.045 : 0, cw = w * 0.045;
      ctx.fillStyle = 'rgba(10,14,24,0.9)'; ctx.fillRect(cx, h * 0.18, cw, h * 0.64);
      for (let i = 0; i < 12; i++) {
        const on = hash(i * 3 + side * 7 + Math.floor(t * (0.6 + hash(i + 2)))) > 0.45, m = (i + side) % 3, lc = m === 0 ? [255, 90, 90] : m === 1 ? [90, 255, 154] : [90, 200, 255];
        ctx.fillStyle = `rgba(${lc[0]},${lc[1]},${lc[2]},${on ? 0.85 : 0.15})`; ctx.fillRect(cx + cw * 0.3, h * 0.2 + i * h * 0.05, cw * 0.4, h * 0.012);
      }
    }
    { const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.75); v.addColorStop(0, 'rgba(2,4,10,0.42)'); v.addColorStop(1, 'rgba(2,4,10,0.72)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); }
  };
  BD.b_grassyfield = (ctx, w, h, t) => {
    // Natural meadow, seen from above: soft patches, blades that sway in a travelling gust, drifting cloud shadows.
    fillBg(ctx, w, h, '#2f8f3a', '#1f6b2c');
    for (let i = 0; i < 12; i++) { const x = hash(i * 1.7) * w, y = hash(i * 2.9 + 4) * h, r = Math.max(w, h) * (0.12 + 0.12 * hash(i + 6)); const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, i % 2 ? 'rgba(150,230,110,0.28)' : 'rgba(10,60,20,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    const gust = t * 0.9, bladeCols = ['rgba(86,190,88,0.62)', 'rgba(46,138,58,0.7)', 'rgba(140,214,110,0.5)'];
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.1, w * 0.0012);
    const unit = Math.max(0.5, Math.min(w, h) / 360);
    for (let pass = 0; pass < 3; pass++) {
      ctx.strokeStyle = bladeCols[pass]; ctx.beginPath();
      for (let i = 0; i < 150; i++) {
        const x = hash(i * 1.7 + pass * 91) * w, y = hash(i * 2.3 + pass * 57) * h, len = (7 + hash(i + pass * 13) * 10) * unit;
        const wave = Math.sin(gust + x * 0.011 - y * 0.006) * 0.55 + Math.sin(gust * 1.7 + x * 0.027 + hash(i) * 6) * 0.3, sway = wave * len * 0.55;
        ctx.moveTo(x, y); ctx.lineTo(x + sway * 0.3, y - len * 0.55); ctx.lineTo(x + sway, y - len);
      }
      ctx.stroke();
    }
    for (let i = 0; i < 16; i++) { const x = hash(i * 5.1 + 2) * w, y = hash(i * 3.3 + 8) * h, sw = Math.sin(gust + x * 0.011) * 2; circle(ctx, x + sw, y, Math.max(1.2, 1.7 * unit)); fill(ctx, i % 2 ? 'rgba(255,255,255,0.85)' : 'rgba(255,232,106,0.85)'); }
    { const bx = ((t * 0.05) % 1.6) * w - w * 0.3, g = ctx.createLinearGradient(bx - w * 0.22, 0, bx + w * 0.22, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
    for (let i = 0; i < 2; i++) { const cx = (t * (6 + i * 4) + i * w * 0.5) % (w * 1.5) - w * 0.25, cy = h * (0.3 + 0.4 * i), r = w * 0.2; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(0,30,10,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2); }
  };
  BD.b_sunset_crt = (ctx, w, h, t, st, o = {}) => {
    BD.b_sunset(ctx, w, h, t, st, o);
    ctx.fillStyle = 'rgba(0,0,0,0.34)'; ctx.beginPath(); for (let y = 0; y < h; y += 3) ctx.rect(0, y, w, 1); ctx.fill();
    { const g = ctx.createRadialGradient(w / 2, h * 0.55, 0, w / 2, h * 0.55, Math.max(w, h) * 0.6); g.addColorStop(0, 'rgba(255,140,200,0.16)'); g.addColorStop(1, 'rgba(255,140,200,0)'); add(ctx, true); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); add(ctx, false); }
    if (!o.reduceFlashing) { const by = (t * 70) % (h + 120) - 60, g = ctx.createLinearGradient(0, by - 30, 0, by + 30); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, by - 30, w, 60); }
    if (!o.reduceFlashing) { ctx.fillStyle = `rgba(255,154,216,${0.012 + 0.012 * Math.sin(t * 47)})`; ctx.fillRect(0, 0, w, h); }
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.82)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
  };
  BD.b_classic = (ctx, w, h) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    const dash = Math.max(6, h / 26), lw = Math.max(3, w * 0.0065);
    ctx.fillStyle = '#fff';
    for (let y = dash * 0.5; y < h; y += dash * 2) ctx.fillRect(w / 2 - lw / 2, y, lw, dash);
    ctx.fillRect(0, 0, w, Math.max(2, h * 0.008)); ctx.fillRect(0, h - Math.max(2, h * 0.008), w, Math.max(2, h * 0.008));
  };
  BD.b_deepsea_light = (ctx, w, h, t, st) => {
    // pale water: white and black ink with red accents; paddles and ball get a dark contact shadow
    fillBg(ctx, w, h, '#f8fafb', '#dde5eb');
    for (let i = 0; i < 4; i++) { const x = w * (0.1 + 0.25 * i) + Math.sin(t * 0.2 + i) * w * 0.02, g = ctx.createLinearGradient(x - w * 0.05, 0, x + w * 0.05, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - w * 0.05, 0, w * 0.1, h); }
    if (!st.bub || st.bub.length !== 26) st.bub = Array.from({ length: 26 }, (_, i) => ({ x: hash(i) * w, y: hash(i + 3) * h, r: 1 + hash(i + 8) * 3, v: 14 + hash(i + 1) * 22 }));
    const dt = stepDt(st, t);
    ctx.strokeStyle = 'rgba(20,20,26,0.55)'; ctx.lineWidth = 1.1;
    st.bub.forEach((b, i) => { b.y -= b.v * dt; b.x += Math.sin(t * 2 + i) * 0.2; if (b.y < -5) { b.y = h + 5; b.x = hash(t + i) * w; } circle(ctx, b.x, b.y, b.r); ctx.stroke(); });
    for (let j = 0; j < 3; j++) {
      const x = w * (0.2 + j * 0.3) + Math.sin(t * 0.4 + j) * w * 0.05, y = h * (0.35 + 0.2 * Math.sin(t * 0.5 + j * 2)), s = Math.min(w, h) * 0.085, pulse = 1 + 0.12 * Math.sin(t * 3 + j);
      ctx.save(); ctx.translate(x, y);
      ctx.beginPath(); ctx.ellipse(0, 0, s * pulse, s * 0.72, 0, Math.PI, 0); ctx.closePath(); fill(ctx, 'rgba(214,34,52,0.2)'); stroke(ctx, 'rgba(14,14,18,0.8)', 1.8);
      circle(ctx, 0, -s * 0.2, s * 0.16); fill(ctx, 'rgba(214,34,52,0.85)');
      ctx.strokeStyle = 'rgba(14,14,18,0.7)'; ctx.lineWidth = 1.2;
      for (let kk = -2; kk <= 2; kk++) { ctx.beginPath(); ctx.moveTo(kk * s * 0.3, 0); for (let q = 1; q <= 8; q++) ctx.lineTo(kk * s * 0.3 + Math.sin(t * 3 + q * 0.7 + kk) * s * 0.12, q * s * 0.2); ctx.stroke(); }
      ctx.restore();
    }
    for (let i = 0; i < 10; i++) { const x = hash(i * 4 + 1) * w, y = fract01(t * 0.02 + hash(i + 5)) * h; circle(ctx, x, y, 1.6); fill(ctx, 'rgba(214,34,52,0.6)'); }
  };
  BD.b_city = (ctx, w, h, t) => {
    fillBg(ctx, w, h, '#05031a', '#2a0a40');
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * hash(i + Math.floor(t * 0.7))})`; ctx.fillRect(hash(i) * w, hash(i + 4) * h * 0.5, 1.3, 1.3); }
    circle(ctx, w * 0.78, h * 0.2, Math.min(w, h) * 0.07); fill(ctx, 'rgba(255,230,250,0.9)');
    for (let layer = 0; layer < 3; layer++) {
      const bw = w / (7 + layer * 2), speed = 3 + layer * 5, off = t * speed, base = Math.floor(off / bw), fr = off % bw, baseY = h * (0.92 - layer * 0.06);
      const body = layer === 0 ? '#1c0f33' : layer === 1 ? '#140a26' : '#0c0618';
      for (let k = -1; k < Math.floor(w / bw) + 3; k++) {
        const idx = k + base, x = k * bw - fr, bh = h * (0.18 + 0.2 * hash(idx * 1.37 + layer * 9) + (2 - layer) * 0.04);
        ctx.fillStyle = body; ctx.fillRect(x, baseY - bh, bw * 0.92, bh + h);
        const rows = Math.floor(bh / (h * 0.045)), cols = Math.max(2, Math.floor(bw / (w * 0.012)));
        for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) {
          const hv = hash(idx * 13 + r * 7 + cc * 3 + layer * 5); if (hv < 0.5) continue;
          const blink = hv > 0.93 && (t + hv * 10) % 3 < 0.5;
          ctx.fillStyle = blink ? 'rgba(255,90,208,0.7)' : 'rgba(255,217,138,0.18)'; ctx.fillRect(x + bw * 0.08 + cc * (bw * 0.84 / cols), baseY - bh + h * 0.015 + r * (h * 0.045), bw * 0.84 / cols * 0.55, h * 0.018);
        }
        if (layer === 1 && hash(idx * 4.1) > 0.6) { const nk = hash(idx * 5.1) > 0.5 ? '0,240,255' : '255,43,214'; add(ctx, true); ctx.strokeStyle = `rgba(${nk},0.65)`; ctx.lineWidth = 2; ctx.strokeRect(x + bw * 0.2, baseY - bh + h * 0.03, bw * 0.5, h * 0.035); add(ctx, false); }
      }
    }
    { const g = ctx.createLinearGradient(0, h * 0.9, 0, h); g.addColorStop(0, 'rgba(255,43,214,0)'); g.addColorStop(1, 'rgba(255,43,214,0.22)'); ctx.fillStyle = g; ctx.fillRect(0, h * 0.9, w, h * 0.1); }
  };
  let pcbTraces = null;
  BD.b_pcb = (ctx, w, h, t) => {
    ctx.fillStyle = '#04120b'; ctx.fillRect(0, 0, w, h);
    const cell = Math.max(18, h / 14);
    ctx.strokeStyle = 'rgba(40,200,120,0.22)'; ctx.lineWidth = Math.max(1.5, cell * 0.08); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (!pcbTraces) {
      pcbTraces = [];
      for (let i = 0; i < 70; i++) {
        const s = {}; s.x0 = Math.floor(hash(i * 1.1) * 64) / 64; s.y0 = Math.floor(hash(i * 2.3 + 3) * 40) / 40;
        const len = 0.06 + hash(i * 3.7) * 0.18, horiz = hash(i * 4.1) < 0.5;
        s.x1 = s.x0 + (horiz ? len : 0); s.y1 = s.y0 + (horiz ? 0 : len * 1.4);
        const bend = 0.03 + hash(i * 5.3) * 0.05;
        s.x2 = s.x1 + (horiz ? bend : (hash(i) < 0.5 ? bend : -bend)); s.y2 = s.y1 + (horiz ? (hash(i + 1) < 0.5 ? bend * 1.4 : -bend * 1.4) : bend * 1.4);
        pcbTraces.push(s);
      }
    }
    ctx.beginPath(); for (const s of pcbTraces) { ctx.moveTo(s.x0 * w, s.y0 * h); ctx.lineTo(s.x1 * w, s.y1 * h); ctx.lineTo(s.x2 * w, s.y2 * h); } ctx.stroke();
    for (const s of pcbTraces) { circle(ctx, s.x0 * w, s.y0 * h, cell * 0.11); fill(ctx, 'rgba(60,230,150,0.35)'); circle(ctx, s.x2 * w, s.y2 * h, cell * 0.11); fill(ctx, 'rgba(60,230,150,0.35)'); }
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.15 + 0.23 * i) + hash(i * 3) * w * 0.05, cy = h * (0.2 + 0.55 * hash(i * 2.2 + 1)), cw = cell * 2.2, ch = cell * 1.5;
      ctx.fillStyle = 'rgba(8,26,18,0.95)'; ctx.fillRect(cx, cy, cw, ch); ctx.strokeStyle = 'rgba(60,230,150,0.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(cx, cy, cw, ch);
      ctx.fillStyle = 'rgba(120,160,140,0.5)'; for (let p = 0; p < 6; p++) { ctx.fillRect(cx + p * cw / 6 + 1, cy - cell * 0.18, cw / 6 - 3, cell * 0.18); ctx.fillRect(cx + p * cw / 6 + 1, cy + ch, cw / 6 - 3, cell * 0.18); }
    }
    add(ctx, true);
    for (let i = 0; i < pcbTraces.length; i += 2) {
      const s = pcbTraces[i], ph = fract01(t * (0.25 + hash(i * 1.9) * 0.2) + hash(i * 0.7)); let px, py;
      if (ph < 0.5) { const u = ph * 2; px = s.x0 + (s.x1 - s.x0) * u; py = s.y0 + (s.y1 - s.y0) * u; } else { const u = ph * 2 - 1; px = s.x1 + (s.x2 - s.x1) * u; py = s.y1 + (s.y2 - s.y1) * u; }
      circle(ctx, px * w, py * h, cell * 0.13); fill(ctx, i % 4 ? 'rgba(125,255,192,0.85)' : 'rgba(111,232,255,0.85)');
    }
    add(ctx, false);
    { const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.7); v.addColorStop(0, 'rgba(2,10,6,0.35)'); v.addColorStop(1, 'rgba(2,10,6,0)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); }
  };
  BD.b_icerink = (ctx, w, h, t) => {
    fillBg(ctx, w, h, '#eaf5ff', '#cfe4f5'); ctx.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const x0 = hash(i * 2.1) * w, y0 = hash(i * 3.3 + 1) * h, len = w * (0.08 + 0.16 * hash(i + 5)), a = (hash(i + 8) - 0.5) * 0.5; ctx.strokeStyle = i % 2 ? 'rgba(255,255,255,0.7)' : 'rgba(120,160,200,0.25)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + len * 0.5, y0 + a * len, x0 + len, y0 + a * len * 0.3); ctx.stroke(); }
    const lw = Math.max(2, w * 0.006);
    ctx.strokeStyle = 'rgba(205,40,56,0.75)'; ctx.lineWidth = lw * 1.6; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    ctx.setLineDash([lw * 3, lw * 2]); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(40,90,200,0.7)'; ctx.lineWidth = lw * 2.2; ctx.beginPath(); ctx.moveTo(w * 0.3, 0); ctx.lineTo(w * 0.3, h); ctx.moveTo(w * 0.7, 0); ctx.lineTo(w * 0.7, h); ctx.stroke();
    ctx.strokeStyle = 'rgba(205,40,56,0.6)'; ctx.lineWidth = lw; circle(ctx, w / 2, h / 2, h * 0.18); ctx.stroke(); circle(ctx, w / 2, h / 2, lw * 2); fill(ctx, 'rgba(40,90,200,0.7)');
    for (let s = 0; s < 2; s++) for (let r = 0; r < 2; r++) { const cx = s ? w * 0.85 : w * 0.15, cy = h * (0.27 + 0.46 * r); circle(ctx, cx, cy, h * 0.1); stroke(ctx, 'rgba(205,40,56,0.5)', lw * 0.8); circle(ctx, cx, cy, lw * 1.4); fill(ctx, 'rgba(205,40,56,0.6)'); }
    const shine = fract01(t * 0.04), g = ctx.createLinearGradient(shine * w * 1.6 - w * 0.3, 0, shine * w * 1.6 - w * 0.1, h * 0.3); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  };
  BD.b_dunes = (ctx, w, h, t) => {
    fillBg(ctx, w, h * 0.62, '#2b1055', '#ff9a5a'); ctx.fillStyle = '#3a1a2a'; ctx.fillRect(0, h * 0.6, w, h * 0.4);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(255,255,255,${(0.3 + 0.5 * hash(i + Math.floor(t))) * (1 - hash(i + 4) * 0.8)})`; ctx.fillRect(hash(i) * w, hash(i + 4) * h * 0.35, 1.3, 1.3); }
    circle(ctx, w * 0.7, h * 0.5, Math.min(w, h) * 0.1); fill(ctx, 'rgba(255,226,170,0.95)');
    const cols = ['#d8744a', '#b4553f', '#7e3a47', '#4a2442'];
    for (let l = 0; l < 4; l++) {
      ctx.fillStyle = cols[l]; ctx.beginPath(); ctx.moveTo(0, h);
      const yb = h * (0.55 + l * 0.12), amp = h * (0.05 - l * 0.006), ph = l * 1.7;
      for (let x = 0; x <= w + 0.01; x += w / 40) ctx.lineTo(x, yb + Math.sin(x / w * 4.2 + ph) * amp + Math.sin(x / w * 9 + ph * 2) * amp * 0.3);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,170,0.14)'; ctx.lineWidth = 1;
      for (let r = 0; r < 4; r++) { ctx.beginPath(); for (let x = 0; x <= w + 0.01; x += w / 40) { const y = yb + amp * 0.6 + r * h * 0.014 + Math.sin(x / w * 4.2 + ph) * amp + Math.sin(x / w * 9 + ph * 2) * amp * 0.3; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
    }
    ctx.strokeStyle = 'rgba(255,220,180,0.3)'; ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 24; i++) { const y = h * (0.55 + hash(i * 2) * 0.45), x = (hash(i * 3) * w + t * (60 + hash(i) * 80)) % (w + 60) - 30; ctx.moveTo(x, y); ctx.lineTo(x + 18 + hash(i + 1) * 18, y - 1.5); }
    ctx.stroke();
  };
  BD.b_crt = (ctx, w, h, t) => {
    BD.b_grid(ctx, w, h, t);
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.75)'); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `rgba(120,255,200,${0.02 + 0.02 * Math.sin(t * 50)})`; ctx.fillRect(0, 0, w, h);
  };
  NP.boardIds = Object.keys(BD);
  NP.drawBoard = function (ctx, id, w, h, t, st = {}, o = {}) { ctx.save(); (BD[id] || BD.b_grid)(ctx, w, h, t, st, o); ctx.restore(); noGlow(ctx); };

  // ==========================================================
  // TRAILS — drawTrail(ctx, id, hist, t, st, color)  hist = [{x,y}] newest last
  // ==========================================================
  function parseC(s) {
    if (Array.isArray(s)) return s;
    if (typeof s === 'string') {
      let m = /^#([0-9a-f]{6})$/i.exec(s); if (m) return rgbA(parseInt(m[1], 16));
      m = /rgba?\(([^)]+)\)/.exec(s); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    }
    return rgbA(0x00f0ff);
  }
  NP.drawTrail = function (ctx, id, hist, t, st, color = C.cyan, r = 6) {
    const n = hist.length; st.parts = st.parts || [];
    const dt = st.last == null ? 0 : Math.max(0, Math.min(0.05, t - st.last)); st.last = t;
    if (!n) { st.parts.length = 0; return; }
    const head = hist[n - 1], colA = parseC(color), colS = cs(colA);
    const spawn = (p) => st.parts.push(p);
    ctx.save();
    if (id === 't_comet') {
      for (let i = 0; i < n; i++) { const a = i / n; ctx.globalAlpha = a * 0.6; glow(ctx, colS, 10); circle(ctx, hist[i].x, hist[i].y, r * (0.3 + 0.7 * a)); fill(ctx, colS); }
    } else if (id === 't_rainbow') {
      ctx.lineCap = 'round';
      for (let i = 1; i < n; i++) { ctx.strokeStyle = hsl((i * 14 + t * 240) % 360, 100, 60, i / n); ctx.lineWidth = r * 1.4 * (i / n); ctx.beginPath(); ctx.moveTo(hist[i - 1].x, hist[i - 1].y); ctx.lineTo(hist[i].x, hist[i].y); ctx.stroke(); }
    } else if (id === 't_afterimage') {
      for (let k = 1; k <= 5; k++) { const p = hist[Math.max(0, n - 1 - k * 3)]; ctx.globalAlpha = 0.5 - k * 0.08; glow(ctx, colS, 8); circle(ctx, p.x, p.y, r); ctx.strokeStyle = colS; ctx.lineWidth = 2; ctx.stroke(); }
    } else if (id === 't_pixels') {
      if (dt > 0 && Math.random() < 0.8) spawn({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 20, life: 0.6, max: 0.6, s: 2 + Math.random() * 3, c: Math.random() < 0.5 ? colS : C.white, kind: 0 });
    } else if (id === 't_bubbles') {
      if (dt > 0 && Math.random() < 0.35) spawn({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 10, vy: -15 - Math.random() * 15, life: 1, max: 1, s: 2 + Math.random() * 3, kind: 1 });
    } else if (id === 't_fire') {
      if (dt > 0) for (let k = 0; k < 2; k++) spawn({ x: head.x + (Math.random() - 0.5) * r, y: head.y + (Math.random() - 0.5) * r, vx: (Math.random() - 0.5) * 15, vy: -20 - Math.random() * 30, life: 0.5, max: 0.5, s: r * (0.6 + Math.random() * 0.6), kind: 2 });
    } else if (id === 't_sparkletrail') {
      for (let i = 0; i < n; i++) { const a = i / n; if (a < 0.15) continue; ctx.globalAlpha = a * 0.55; glow(ctx, colS, 6); circle(ctx, hist[i].x, hist[i].y, r * (0.18 + 0.25 * a)); fill(ctx, colS); }
      for (let k = 0; k < 3; k++) {
        const idx = Math.max(0, Math.floor((n - 1) * (0.25 + k * 0.28))); if (idx >= n) continue;
        const tw = 0.5 + 0.5 * Math.sin(t * 8 + k * 2.1);
        ctx.save(); ctx.translate(hist[idx].x, hist[idx].y); ctx.globalAlpha = tw; glow(ctx, '#fff', 8);
        starPath(ctx, 4, r * 0.55, r * 0.15, t * 3 + k); fill(ctx, '#fff');
        ctx.restore();
      }
    } else if (id === 't_ice') {
      for (let i = 0; i < n; i++) { const a = i / n; ctx.globalAlpha = a * 0.5; glow(ctx, '#bfe9ff', 8); circle(ctx, hist[i].x, hist[i].y, r * (0.25 + 0.45 * a)); fill(ctx, '#dff7ff'); }
      if (dt > 0 && Math.random() < 0.5) spawn({ x: head.x, y: head.y, vx: (Math.random() - 0.5) * 12, vy: 6 + Math.random() * 10, life: 0.8, max: 0.8, s: 2 + Math.random() * 2, kind: 3 });
    } else if (id === 't_shadow') {
      for (let i = 0; i < n; i++) { const a = i / n; if (a < 0.05) continue; ctx.globalAlpha = a * 0.5; circle(ctx, hist[i].x, hist[i].y, r * (0.4 + 0.9 * a)); fill(ctx, 'rgba(18,12,30,0.9)'); }
    } else if (id === 't_lightning') {
      // a jagged bolt that crackles along the ball's path (re-rolled 16x a second) with a couple of forks
      const k = mixC(colA, rgbA(0x9fd2ff), 0.55), slot = Math.floor(t * 16), stop = n > 4 ? n - 4 : 0;
      add(ctx, true); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= stop; i += 2) {
        const a = i / n, jx = (hash(slot * 5 + i * 2.7) - 0.5) * r * 2 * a, jy = (hash(slot * 7 + i * 1.9) - 0.5) * r * 2.4 * a;
        i === 0 ? ctx.moveTo(hist[i].x + jx, hist[i].y + jy) : ctx.lineTo(hist[i].x + jx, hist[i].y + jy);
      }
      ctx.strokeStyle = cs(alphaC(k, 0.38)); ctx.lineWidth = Math.max(2.5, r * 1.1); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = Math.max(1.1, r * 0.28); ctx.stroke();
      if (stop > 3) for (let b = 0; b < 3; b++) {
        const idx = Math.floor(hash(slot * 1.3 + b * 3.1) * stop * 0.9), p = hist[idx], ang = hash(slot + b * 9) * TAU, len = r * (2.2 + hash(slot + b * 4) * 3.2);
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang) * len * 0.5 + (hash(b + slot) - 0.5) * r, p.y + Math.sin(ang) * len * 0.5); ctx.lineTo(p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len);
        ctx.strokeStyle = cs(alphaC(k, 0.8)); ctx.lineWidth = Math.max(1, r * 0.2); ctx.stroke();
      }
      add(ctx, false);
    } else if (id === 't_glitch') {
      // chopped afterimages of the ball with the red and cyan channels pulled apart, re-jittered 12x a second
      const slot = Math.floor(t * 12); add(ctx, true);
      for (let k = 1; k <= 5; k++) {
        const p = hist[Math.max(0, n - 1 - k * 3)]; ctx.globalAlpha = Math.max(0, 0.62 - k * 0.1);
        for (let s = 0; s < 3; s++) {
          const sy = p.y - r + s * (2 * r / 3), sh = 2 * r / 3 - 0.6, dx = (hash(slot * 3 + k * 7 + s * 2.3) - 0.5) * r * 1.8;
          ctx.fillStyle = '#ff2846'; ctx.fillRect(p.x - r + dx - r * 0.18, sy, r * 2, sh);
          ctx.fillStyle = '#00f0ff'; ctx.fillRect(p.x - r - dx + r * 0.18, sy, r * 2, sh);
        }
      }
      ctx.globalAlpha = 1;
      if (hash(slot * 2.1) > 0.55 && n > 6) { const p = hist[n - 6]; ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(p.x - r * 3, p.y + (hash(slot) - 0.5) * r * 2, r * 6, 1.3); }
      add(ctx, false);
    }
    // particles
    for (const p of st.parts) p.life -= dt;
    st.parts = st.parts.filter((p) => p.life > 0);
    if (st.parts.length > 400) st.parts.splice(0, st.parts.length - 400);
    for (const p of st.parts) {
      p.x += p.vx * dt; p.y += p.vy * dt; const a = p.life / p.max;
      if (p.kind === 1) { ctx.globalAlpha = a; circle(ctx, p.x, p.y, p.s * (1.5 - a * 0.5)); stroke(ctx, '#bff6ff', 1); }
      else if (p.kind === 2) { add(ctx, true); ctx.globalAlpha = a; circle(ctx, p.x, p.y, p.s * a); fill(ctx, a > 0.6 ? '#ffe066' : a > 0.3 ? '#ff7a1a' : '#ff2b2b'); add(ctx, false); }
      else if (p.kind === 3) { ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = a; glow(ctx, '#cdefff', 4); poly(ctx, 4, p.s * (0.6 + 0.4 * a)); fill(ctx, '#e8fbff'); ctx.restore(); noGlow(ctx); }
      else { p.vy += 60 * dt; ctx.globalAlpha = a; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s); }
    }
    ctx.restore(); noGlow(ctx);
  };

  // ==========================================================
  // GOAL FX — one burst (q runs 0..1), goal on the right edge; the preview loop and the in-match effect share it
  // ==========================================================
  const easeOut = (u) => { u = Math.max(0, Math.min(1, u)); return 1 - (1 - u) * (1 - u) * (1 - u); };
  function goalBurst(ctx, id, w, h, q, dt, st, color, gx, gy, dir) {
    const colA = parseC(color), colS = cs(colA);
    ctx.save();
    if (id === 'g_flash') { ctx.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - q * 3)})`; ctx.fillRect(dir > 0 ? gx - 30 : gx - 6, 0, 36, h); }
    if (id === 'g_confetti') {
      if (!(st.fired & 1)) { st.fired |= 1; for (let i = 0; i < 70; i++) { const top = i % 2; st.parts.push({ x: gx, y: top ? 4 : h - 4, vx: -dir * (60 + Math.random() * 160), vy: (top ? 1 : -1) * (40 + Math.random() * 140), r: Math.random() * 6, vr: (Math.random() - 0.5) * 12, c: hsl(Math.random() * 360) }); } }
      for (const p of st.parts) { p.vy += 180 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-3, -1.5, 6, 3); ctx.restore(); }
    }
    if (id === 'g_fireworks') {
      const ds = [0, 0.2, 0.4], cl = [C.pink, C.cyan, C.amber];
      for (let k = 0; k < 3; k++) if (q > ds[k] && !(st.fired & (2 << k))) {
        st.fired |= 2 << k;
        const fx = dir > 0 ? w * (0.6 + 0.12 * k) : w * (0.4 - 0.12 * k), fy = h * (0.3 + 0.2 * (k % 2));
        for (let i = 0; i < 36; i++) { const a = i / 36 * TAU, v = 60 + Math.random() * 40; st.parts.push({ x: fx, y: fy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c: cl[k] }); }
      }
      for (const f of st.parts) { f.vy += 50 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt * 1.1; ctx.globalAlpha = Math.max(0, f.life); glow(ctx, f.c, 6); circle(ctx, f.x, f.y, 1.8); fill(ctx, f.c); }
    }
    if (id === 'g_pixelboom') {
      if (!(st.fired & 16)) { st.fired |= 16; for (let i = 0; i < 50; i++) { const a = (dir > 0 ? Math.PI / 2 : -Math.PI / 2) + Math.random() * Math.PI, v = 40 + Math.random() * 180; st.parts.push({ x: gx, y: gy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s: 3 + Math.random() * 5, c: [colS, '#fff', C.amber][i % 3], life: 1 }); } }
      for (const b of st.parts) { b.vy += 120 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; ctx.globalAlpha = Math.max(0, b.life); ctx.fillStyle = b.c; ctx.fillRect(b.x, b.y, b.s, b.s); }
    }
    if (id === 'g_shockwave') { for (let k = 0; k < 2; k++) { const rr = Math.max(0, q - k * 0.12) * w * 1.1; ctx.globalAlpha = Math.max(0, 1 - q * 1.3); glow(ctx, colS, 20); circle(ctx, gx, gy, rr); stroke(ctx, colS, 4 - k * 2); } }
    if (id === 'g_implosion') {
      // build-up (rings contract, particles spiral in, edges darken), collapse (core flares then snaps shut), fade (last flash ring)
      const qi = Math.min(1, q * 2.4 / 1.3), R = Math.min(w, h) * 0.62;
      const bu = Math.min(1, qi / 0.5), colp = qi < 0.5 ? 0 : Math.min(1, (qi - 0.5) / 0.14), fd = qi < 0.64 ? 0 : (qi - 0.64) / 0.36;
      { const v = ctx.createRadialGradient(gx, gy, R * 0.2, gx, gy, R * 1.7); v.addColorStop(0, 'rgba(2,0,14,0)'); v.addColorStop(1, 'rgba(2,0,14,0.5)'); ctx.save(); ctx.globalAlpha = bu * (1 - fd); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h); ctx.restore(); }
      add(ctx, true);
      if (qi < 0.66) for (let k = 0; k < 4; k++) {
        const s = Math.max(0, Math.min(1, bu * 1.25 - k * 0.15)), rr = R * Math.pow(1 - s, 1.6) + 3;
        ctx.beginPath(); ctx.arc(gx, gy, rr, 0, TAU); ctx.strokeStyle = cs(alphaC(mixC(colA, WHITE, s * 0.6), Math.sin(s * Math.PI) * 0.75 * (1 - colp))); ctx.lineWidth = 2.4 + s * 3; ctx.stroke();
      }
      ctx.lineCap = 'round';
      for (let i = 0; i < 64; i++) {
        const a0 = hash(i * 1.7) * TAU, r0 = R * (0.3 + 0.7 * hash(i * 2.9 + 1)), s = Math.max(0, Math.min(1, bu * 1.2 - hash(i * 3.3) * 0.22));
        if (s >= 1 || qi >= 0.52) continue;
        const s2 = Math.max(0, s - 0.07), rr = r0 * Math.pow(1 - s, 1.9), rr2 = r0 * Math.pow(1 - s2, 1.9), an = a0 + s * 2.6 * dir, an2 = a0 + s2 * 2.6 * dir;
        ctx.beginPath(); ctx.moveTo(gx + Math.cos(an2) * rr2, gy + Math.sin(an2) * rr2); ctx.lineTo(gx + Math.cos(an) * rr, gy + Math.sin(an) * rr);
        ctx.strokeStyle = cs(alphaC(mixC(colA, WHITE, s), (1 - s * s) * 0.9)); ctx.lineWidth = 1.2 + 1.6 * s; ctx.stroke();
      }
      const coreR = (10 + 44 * bu * bu) * (qi < 0.5 ? 1 : 1 - colp * 0.97) * (fd > 0 ? 1 - fd : 1);
      if (coreR > 0.6) {
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, coreR * 2.2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, cs(alphaC(mixC(colA, WHITE, 0.5), 0.8))); g.addColorStop(1, cs(alphaC(colA, 0)));
        ctx.save(); ctx.globalAlpha = Math.min(1, 0.3 + 0.8 * bu) * (1 - fd * 0.8); ctx.fillStyle = g; ctx.fillRect(gx - coreR * 2.3, gy - coreR * 2.3, coreR * 4.6, coreR * 4.6); ctx.restore();
      }
      if (qi >= 0.6) {
        const fl = Math.min(1, (qi - 0.6) / 0.4), rr = 14 + 110 * Math.sqrt(fl);
        ctx.beginPath(); ctx.arc(gx, gy, rr, 0, TAU); ctx.strokeStyle = cs(alphaC(mixC(colA, WHITE, 0.7), Math.pow(1 - fl, 2) * 0.9)); ctx.lineWidth = 3 * (1 - fl) + 0.8; ctx.stroke();
      }
      add(ctx, false);
    }
    if (id === 'g_starburst') {
      const e = easeOut(q * 1.5), base = dir > 0 ? Math.PI : 0; add(ctx, true);
      for (let i = 0; i < 18; i++) {
        const a = base + (i / 17 - 0.5) * Math.PI * 1.15, len = w * (0.12 + 0.38 * hash(i * 2.3 + 1)) * e, wd = (1 - q) * (6 + 6 * hash(i + 3));
        const px = -Math.sin(a) * wd * 0.5, py = Math.cos(a) * wd * 0.5;
        const g = ctx.createLinearGradient(gx, gy, gx + Math.cos(a) * len, gy + Math.sin(a) * len); g.addColorStop(0, cs(alphaC(mixC(colA, WHITE, 0.5), 0.85))); g.addColorStop(1, cs(alphaC(colA, 0)));
        ctx.beginPath(); ctx.moveTo(gx + px, gy + py); ctx.lineTo(gx + Math.cos(a) * len, gy + Math.sin(a) * len); ctx.lineTo(gx - px, gy - py); ctx.closePath(); ctx.save(); ctx.globalAlpha = 1 - q * q; ctx.fillStyle = g; ctx.fill(); ctx.restore();
      }
      for (let i = 0; i < 10; i++) {
        const a = base + (hash(i * 4.1) - 0.5) * Math.PI * 1.1, d = 30 + e * (140 + hash(i * 1.9) * 260), tw = 0.5 + 0.5 * Math.sin(q * 22 + i * 1.7);
        ctx.save(); ctx.translate(gx + Math.cos(a) * d, gy + Math.sin(a) * d); ctx.rotate(q * 4 + i); ctx.globalAlpha = Math.max(0, (1 - q) * (0.5 + 0.5 * tw)); starPath(ctx, 5, 7 * (1 - q * 0.6), 3 * (1 - q * 0.6)); fill(ctx, hsl((i * 47 + q * 200) % 360, 100, 70)); ctx.restore();
      }
      add(ctx, false);
    }
    if (id === 'g_lightning') {
      // forked bolts strike from the top of the court to the goal area, re-rolled 20x a second, with a white flash on impact
      const slot = Math.floor(q * 20), k = mixC(colA, rgbA(0x9fd2ff), 0.6);
      if (q < 0.08) { ctx.fillStyle = `rgba(200,220,255,${0.38 * (1 - q / 0.08)})`; ctx.fillRect(0, 0, w, h); }
      if (q < 0.6) {
        add(ctx, true); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let b = 0; b < 3; b++) {
          const fade = (1 - q / 0.6) * (hash(slot * 1.3 + b * 7) > 0.2 ? 1 : 0.35);
          const x0 = gx - dir * (120 + 190 * b) + (hash(slot + b) - 0.5) * 40, x1 = gx - dir * (30 + 130 * b), y1 = gy + (b - 1) * h * 0.22;
          boltPath(ctx, x0, -10, x1, y1, 9, 30, slot * 11 + b * 31);
          ctx.strokeStyle = cs(alphaC(k, 0.4 * fade)); ctx.lineWidth = 9; ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${0.95 * fade})`; ctx.lineWidth = 2.2; ctx.stroke();
          boltPath(ctx, (x0 + x1) / 2, (-10 + y1) / 2, x1 - dir * 90, y1 + 70, 5, 16, slot * 5 + b); ctx.strokeStyle = cs(alphaC(k, 0.8 * fade)); ctx.lineWidth = 1.6; ctx.stroke();
          const g = ctx.createRadialGradient(x1, y1, 0, x1, y1, 60); g.addColorStop(0, cs(alphaC(k, 0.8))); g.addColorStop(1, cs(alphaC(k, 0)));
          ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = g; ctx.fillRect(x1 - 60, y1 - 60, 120, 120); ctx.restore();
        }
        add(ctx, false);
      }
    }
    if (id === 'g_coinshower') {
      if (!(st.fired & 1)) { st.fired |= 1; for (let i = 0; i < 38; i++) st.parts.push({ x: gx - dir * (20 + Math.random() * 440), y: -12 - Math.random() * 220, vx: (Math.random() - 0.5) * 30, vy: 60 + Math.random() * 80, life: 1, max: 0, s: 5.5 + Math.random() * 2.5, r: Math.random() * 6, vr: 5 + Math.random() * 8 }); }
      const fadeA = q > 0.8 ? Math.max(0, (1 - q) / 0.2) : 1;
      for (const p of st.parts) {
        p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.y > h - 14 && p.vy > 0 && p.max < 2) { p.y = h - 14; p.vy = -p.vy * 0.42; p.max += 1; }
        const sx = Math.max(0.15, Math.abs(Math.cos(p.r)));
        ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = fadeA;
        ctx.beginPath(); ctx.ellipse(0, 0, p.s * sx, p.s, 0, 0, TAU); fill(ctx, '#ffc93a'); stroke(ctx, '#d99a12', 1.2);
        ctx.beginPath(); ctx.ellipse(0, 0, p.s * sx * 0.62, p.s * 0.62, 0, 0, TAU); stroke(ctx, 'rgba(217,154,18,0.9)', 1);
        ctx.fillStyle = `rgba(255,255,255,${0.6 * sx})`; ctx.fillRect(-p.s * sx * 0.5, -p.s * 0.55, p.s * sx * 0.25, p.s * 0.5);
        ctx.restore();
      }
    }
    if (id === 'g_laser') {
      const a = (q < 0.1 ? q / 0.1 : 1) * Math.pow(1 - q, 0.7), base = dir > 0 ? Math.PI : 0; add(ctx, true); ctx.lineCap = 'round';
      const cl = [rgbA(0x00f0ff), rgbA(0xff2bd6), rgbA(0xb6ff3b)];
      for (let b = 0; b < 6; b++) {
        const ang = base + Math.sin(q * 8 + b * 1.2) * 0.5 + (b - 2.5) * 0.2, len = w * 1.2, ex = gx + Math.cos(ang) * len, ey = gy + Math.sin(ang) * len, k = cl[b % 3];
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(ex, ey); ctx.strokeStyle = cs(alphaC(k, 0.2 * a)); ctx.lineWidth = 11; ctx.stroke(); ctx.strokeStyle = cs(alphaC(mixC(k, WHITE, 0.5), 0.9 * a)); ctx.lineWidth = 2.2; ctx.stroke();
      }
      { const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, 90); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(gx - 90, gy - 90, 180, 180); ctx.restore(); }
      add(ctx, false);
    }
    ctx.restore(); noGlow(ctx);
  }
  NP.drawGoalFx = function (ctx, id, w, h, t, st, color = C.cyan) {
    const T = 2.4, cyc = Math.floor(t / T), p = (t % T) / T, gx = w - 6, gy = h / 2;
    if (st.cyc !== cyc) { st.cyc = cyc; st.parts = []; st.fired = 0; }
    const dt = st.last == null ? 0 : Math.max(0, Math.min(0.05, t - st.last)); st.last = t;
    NP.drawBoard(ctx, 'b_grid', w, h, t, st.bst || (st.bst = {}));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    // ball travelling into goal
    if (p < 0.3) { const x = w * 0.3 + (gx - w * 0.3) * (p / 0.3); ctx.save(); ctx.translate(x, gy - 10 + p * 30); NP.drawBall(ctx, 'circle', 5, t); ctx.restore(); return; }
    goalBurst(ctx, id, w, h, (p - 0.3) / 0.7, dt, st, color, gx, gy, 1);
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
