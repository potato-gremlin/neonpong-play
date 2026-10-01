(function () {
  'use strict';
  const cat = PONG.buildCatalog(window.CATALOG_RAW);
  let save = NPSave.load(cat);
  const game = new PONG.Game();
  const cpu = PONG.newCpu();
  const U = PONG.U;

  // CPU_PADDLE/CPU_GLOW: the CPU has no wallet, so it always wears a fixed, neutral look.
  const CPU_PADDLE = 'p_classic', CPU_GLOW = 'o_pink', CPU_HUD = 'h_arcade';
  const CPU_LEVELS = [
    { label: 'EASY', reaction: 0.17, error: 62, strat: PONG.Strat.Random },
    { label: 'NORMAL', reaction: 0.09, error: 34, strat: PONG.Strat.SaveMod },
    { label: 'HARD', reaction: 0.045, error: 15, strat: PONG.Strat.SaveUlt },
  ];

  // ---------------------------------------------------------------- screen nav
  const screens = {};
  document.querySelectorAll('.screen').forEach((el) => { screens[el.id.replace('scr-', '')] = el; });
  let curScreen = 'title';
  function go(name) {
    if (!screens[name]) return;
    if (curScreen === 'match' && name !== 'match') { pauseMusic('gameplay'); }
    screens[curScreen] && screens[curScreen].classList.remove('active');
    screens[name].classList.add('active');
    curScreen = name;
    if (name === 'menu') { renderMenu(); playMusic('title'); }
    if (name === 'setup') { renderSetup(); playMusic('title'); }
    if (name === 'cos') { renderCosmetics(); playMusic('title'); }
    if (name === 'help') renderHelp();
    if (name === 'settings') renderSettings();
    if (name === 'match') { playMusic('gameplay'); requestAnimationFrame(resizeCourt); }
    if (name === 'over') playMusic('gameover');
  }
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-go]'); if (el) go(el.dataset.go); });
  document.getElementById('scr-title').addEventListener('click', () => go('menu'));
  document.addEventListener('keydown', (e) => { if (curScreen === 'title' && (e.key === 'Enter' || e.key === ' ')) go('menu'); });

  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._h); toast._h = setTimeout(() => t.classList.remove('show'), 1600); }

  // ---------------------------------------------------------------- audio (best-effort; browser autoplay rules may block until a tap happens, which go('menu') from the title tap satisfies)
  const AU = {
    title: document.getElementById('au-title'), gameplay: document.getElementById('au-gameplay'),
    gameover: document.getElementById('au-gameover'), miss: document.getElementById('au-miss'),
  };
  // Format pick: the iPhone app bundles lossless WAVs (perfect loops, size doesn't matter offline);
  // browsers get OGG where supported, AAC (.m4a) otherwise (older iPhone Safari).
  const AUDIO = (() => {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return { dir: 'audio/hq/', ext: 'wav' };
    const probe = document.createElement('audio');
    return probe.canPlayType('audio/ogg; codecs="vorbis"') ? { dir: 'audio/', ext: 'ogg' } : { dir: 'audio/', ext: 'm4a' };
  })();
  ['title', 'gameplay', 'gameover', 'miss'].forEach((k) => { AU[k].src = AUDIO.dir + k + '.' + AUDIO.ext; });
  let curTrack = null;
  function applyVolumes() { const m = save.settings.muted ? 0 : save.settings.music / 100; [AU.title, AU.gameplay, AU.gameover].forEach((a) => { a.volume = m; }); AU.miss.volume = save.settings.muted ? 0 : save.settings.sfx / 100; }
  function playMusic(which) {
    if (curTrack === which) return;
    Object.values(AU).forEach((a) => { if (a !== AU.miss) a.pause(); });
    curTrack = which; applyVolumes();
    const a = AU[which]; if (!a) return;
    a.currentTime = 0; a.play().catch(() => {});
  }
  function pauseMusic() { /* handled by playMusic switching tracks */ }
  function playMiss() { if (!save.settings.miss) return; try { AU.miss.currentTime = 0; AU.miss.play().catch(() => {}); } catch (e) {} }

  // ---------------------------------------------------------------- preview canvases (used in setup + cosmetics)
  function makePreview(container, item, opts) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128;
    container.appendChild(c);
    const ctx = c.getContext('2d');
    drawPreviewFrame(ctx, item, opts, 0);
    return { canvas: c, ctx };
  }
  function drawPreviewFrame(ctx, item, opts, t) {
    const W = 128, H = 128; ctx.clearRect(0, 0, W, H); ctx.fillStyle = '#00000030'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    if (item.cat === 'ball') { ctx.translate(W / 2, H / 2); NP.drawBall(ctx, item.id, 32, t); }
    else if (item.cat === 'paddle' || item.cat === 'glow') {
      ctx.translate(W / 2, H / 2);
      const skin = item.cat === 'paddle' ? item.id : (opts && opts.pairedPaddle) || 'p_classic';
      const glowId = item.cat === 'glow' ? item.id : (opts && opts.pairedGlow) || 'o_none';
      NP.drawPaddle(ctx, skin, glowId, 16, 78, t, { calm: save.settings.reduceFlashing, hitAge: t % 2 });
    } else if (item.cat === 'aura') {
      ctx.translate(W / 2, H / 2);
      NP.drawPaddle(ctx, 'p_classic', (opts && opts.pairedGlow) || 'o_none', 16, 60, t, { aura: item.id, hitAge: t % 2, calm: save.settings.reduceFlashing });
    } else if (item.cat === 'trail') {
      const hist = []; for (let i = 0; i < 14; i++) hist.push({ x: 16 + i * 7, y: 64 + Math.sin(i * 0.5) * 14 });
      previewTrailState[item.id] = previewTrailState[item.id] || {};
      NP.drawTrail(ctx, item.id, hist, t, previewTrailState[item.id], NP.glowColorAt((opts && opts.pairedGlow) || 'o_cyan', t), 6);
      ctx.save(); ctx.translate(hist[hist.length - 1].x, hist[hist.length - 1].y); NP.drawBall(ctx, 'circle', 7, t); ctx.restore();
    } else if (item.cat === 'goalfx') {
      previewGoalState[item.id] = previewGoalState[item.id] || { cyc: -1 };
      NP.drawGoalFx(ctx, item.id, W, H, t, previewGoalState[item.id], NP.glowColorAt((opts && opts.pairedGlow) || 'o_cyan', t));
    } else if (item.cat === 'hud') {
      ctx.translate(0, 0); NP.drawScore(ctx, item.id, '7', W / 2, H / 2, 30, t, NP.colors.cyan, 'center');
    } else if (item.cat === 'board') {
      previewBoardState[item.id] = previewBoardState[item.id] || {};
      NP.drawBoard(ctx, item.id, W, H, t, previewBoardState[item.id], { intensity: 0.3, reduceFlashing: save.settings.reduceFlashing });
    }
    ctx.restore();
  }
  const previewTrailState = {}, previewGoalState = {}, previewBoardState = {};
  // animate all currently-visible preview canvases
  let previewAnimT = 0, previewList = [];
  function tickPreviews(dt) {
    previewAnimT += dt;
    for (const p of previewList) drawPreviewFrame(p.ctx, p.item, p.opts, previewAnimT);
  }

  // ---------------------------------------------------------------- MENU
  function renderMenu() { document.getElementById('menu-coins').textContent = save.player.coins; }

  // ---------------------------------------------------------------- SETUP
  let pendingCpuLevel = save.lastSetup.cpuLevel || 1;
  function renderSetup() {
    previewList = [];
    const pc = document.getElementById('points-chips'); pc.innerHTML = '';
    for (const p of cat.pointOptions) { const c = document.createElement('div'); c.className = 'chip' + (p === save.lastSetup.points ? ' on' : ''); c.textContent = 'TO ' + p; c.onclick = () => { save.lastSetup.points = p; NPSave.save(save); renderSetup(); }; pc.appendChild(c); }
    const cc = document.getElementById('cpu-chips'); cc.innerHTML = '';
    CPU_LEVELS.forEach((lv, i) => { const c = document.createElement('div'); c.className = 'chip' + (i === pendingCpuLevel ? ' on' : ''); c.textContent = lv.label; c.onclick = () => { pendingCpuLevel = i; save.lastSetup.cpuLevel = i; NPSave.save(save); renderSetup(); }; cc.appendChild(c); });
    const uc = document.getElementById('upgrades-chip'); uc.innerHTML = '';
    const u1 = document.createElement('div'); u1.className = 'chip' + (save.lastSetup.upgrades ? ' on' : ''); u1.textContent = save.lastSetup.upgrades ? 'ON' : 'OFF';
    u1.onclick = () => { save.lastSetup.upgrades = !save.lastSetup.upgrades; NPSave.save(save); renderSetup(); }; uc.appendChild(u1);

    document.getElementById('ball-name').textContent = (PONG.catItem(cat, save.lastSetup.ball) || {}).name || '';
    document.getElementById('board-name').textContent = (PONG.catItem(cat, save.lastSetup.board) || {}).name || '';
    const bg = document.getElementById('ball-grid'); bg.innerHTML = '';
    for (const id of save.player.owned) { const it = PONG.catItem(cat, id); if (!it || it.cat !== 'ball') continue; addSetupCard(bg, it, 'ball'); }
    const brg = document.getElementById('board-grid'); brg.innerHTML = '';
    for (const id of save.player.owned) { const it = PONG.catItem(cat, id); if (!it || it.cat !== 'board') continue; addSetupCard(brg, it, 'board'); }
    document.getElementById('start-match').onclick = startMatch;
  }
  function addSetupCard(container, item, kind) {
    const card = document.createElement('div'); card.className = 'cos-card'; card.style.setProperty('--rar', PONG.catRarity(cat, item.rarity).color);
    if (save.lastSetup[kind] === item.id) card.classList.add('equipped');
    const preview = makePreview(card, item, {});
    previewList.push({ ctx: preview.ctx, item, opts: {} });
    const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = item.name; card.appendChild(nm);
    card.onclick = () => { save.lastSetup[kind] = item.id; NPSave.save(save); renderSetup(); };
    container.appendChild(card);
  }

  function startMatch() {
    const rules = { points: save.lastSetup.points, upgrades: save.lastSetup.upgrades, resetUpOnConcede: save.lastSetup.resetUpOnConcede, underdogComeback: save.lastSetup.underdogComeback, underdogDiscount: save.lastSetup.underdogDiscount, breakTimerOn: save.lastSetup.breakTimerOn, breakTimerSec: save.lastSetup.breakTimerSec };
    game.start(cat, rules);
    const lv = CPU_LEVELS[pendingCpuLevel];
    cpu.reaction = lv.reaction; cpu.error = lv.error; cpu.timer = 0; cpu.seenHits = -1; cpu.rng = (Math.random() * 4294967295) >>> 0;
    cpuStrat = lv.strat;
    matchClockT = 0; lastPhase = game.phase; lastEvHit = game.ev.hit;
    ballHist = Array.from({ length: 6 }, () => []); lastHitT = [-10, -10];
    boardState = {}; goalState = { cyc: -1 };
    matchStats = { longestRally: 0 };
    document.getElementById('pause-panel').classList.remove('show');
    document.getElementById('break-panel').classList.remove('show');
    go('match'); resumeLoop();
  }
  let cpuStrat = PONG.Strat.SaveMod;

  // ---------------------------------------------------------------- COSMETICS
  let curCat = 'paddle';
  function renderCosmetics() {
    previewList = [];
    document.getElementById('cos-coins').textContent = save.player.coins;
    const tabs = document.getElementById('cat-tabs'); tabs.innerHTML = '';
    for (const c of cat.cats) { const chip = document.createElement('div'); chip.className = 'chip' + (c.id === curCat ? ' on' : ''); chip.textContent = c.name; chip.onclick = () => { curCat = c.id; renderCosmetics(); }; tabs.appendChild(chip); }
    const cd = cat.cats.find((c) => c.id === curCat); document.getElementById('cat-desc').textContent = cd ? cd.desc : '';
    const grid = document.getElementById('cos-grid'); grid.innerHTML = '';
    for (const it of cat.cos) {
      if (it.cat !== curCat) continue;
      const owned = save.player.owned.includes(it.id);
      const equipped = curCat === 'board' || curCat === 'ball' ? save.lastSetup[curCat] === it.id : save.player.equip[curCat] === it.id;
      const card = document.createElement('div'); card.className = 'cos-card' + (equipped ? ' equipped' : '');
      const rarity = PONG.catRarity(cat, it.rarity); card.style.setProperty('--rar', rarity.color);
      const preview = makePreview(card, it, { pairedPaddle: save.player.equip.paddle, pairedGlow: save.player.equip.glow });
      previewList.push({ ctx: preview.ctx, item: it, opts: { pairedPaddle: save.player.equip.paddle, pairedGlow: save.player.equip.glow } });
      if (owned) { const tag = document.createElement('div'); tag.className = 'owned-tag'; tag.textContent = equipped ? 'ON' : 'OWNED'; card.appendChild(tag); }
      const nm = document.createElement('div'); nm.className = 'nm'; nm.textContent = it.name; card.appendChild(nm);
      const pr = document.createElement('div'); pr.className = 'pr'; pr.textContent = owned ? rarity.label : (it.price ? it.price + ' coins' : 'FREE'); card.appendChild(pr);
      card.onclick = () => {
        const r = NPSave.buy(save, cat, it.id);
        if (!r.ok) { toast(r.why); return; }
        NPSave.save(save); renderCosmetics();
      };
      grid.appendChild(card);
    }
  }
  document.getElementById('cheat-go').onclick = doCheat;
  document.getElementById('cheat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doCheat(); });
  function doCheat() {
    const inp = document.getElementById('cheat-input');
    if (NPSave.applyCheat(save, cat, inp.value)) { NPSave.save(save); toast('+5000 COINS'); renderCosmetics(); }
    else toast('INVALID CODE');
    inp.value = '';
  }

  // ---------------------------------------------------------------- HELP
  function renderHelp() {
    const body = document.getElementById('help-body'); if (body.childElementCount) return;
    const secs = [
      ['CONTROLS', 'Drag anywhere on the court to move your paddle up/down. Tap the ability buttons (bottom-right) for Dash, Mod, Ultimate and Legendary once you\'ve bought them.'],
      ['MATCH RULES', 'First to your chosen target (11/21/31); reaching it wins immediately. A MATCH POINT banner shows one point before the target. Play pauses after every point for a 15s Upgrade Break.'],
      ['UP — UPGRADE POINTS', 'Score a point, earn 1 UP. If the CPU scores, your unspent UP resets to 0 (upgrades already bought stay). Trailing by 4+ and conceding keeps your UP and gives +1 bonus. Trailing by 5+ discounts Tier 2/3 upgrades by 1 (min 1).'],
      ['UPGRADES', 'One active ability per tier: buying an active replaces the one you hold in that tier. Passives are unlimited. Tier 1 Tune-Ups (1 UP, stack): Long Paddle, Quick Hands, Heavy Hitter, Grip Tape, Dash (the active), Steady Serve. Tier 2 Mods (2 UP): Titan Paddle, Overdrive, Curveball, plus one active: Mirage, Bullet Time or Magnet. Tier 3 Ultimates (3 UP): Twin Paddle, Guardian Drone, plus one active: Cryo Beam, Black Hole, Supernova Smash or Shrink Ray. Tier 4 Legendary (5 UP): Shield Wall, plus one active: Snare, Second Wind or Barrage. Timed abilities have a 30s cooldown (Dash 4s). Second Wind works once per round and refreshes whenever a point is awarded.'],
      ['COINS & COSMETICS', '+50 for a win, +10 for a loss, +2 per point, +10 per 15+ hit rally (up to 5 bonus/match). 114 cosmetics across 8 categories. Type NEONRICH on the Cosmetics screen for +5000 coins.'],
    ];
    for (const [h, t] of secs) { const p = document.createElement('div'); p.className = 'panel'; p.innerHTML = '<div class="sub" style="color:var(--cyan);font-weight:700;">' + h + '</div><div style="font-size:12.5px;line-height:1.5;opacity:.85;">' + t + '</div>'; body.appendChild(p); }
  }

  // ---------------------------------------------------------------- SETTINGS
  function renderSettings() {
    const body = document.getElementById('settings-body'); body.innerHTML = '';
    const row = (label, el) => { const p = document.createElement('div'); p.className = 'panel row'; const l = document.createElement('div'); l.textContent = label; l.style.flex = '1'; l.style.fontSize = '13px'; p.appendChild(l); p.appendChild(el); body.appendChild(p); };
    const mk = (checked, onchange) => { const inp = document.createElement('input'); inp.type = 'checkbox'; inp.checked = checked; inp.style.width = '22px'; inp.style.height = '22px'; inp.onchange = onchange; return inp; };
    const mkSlider = (val, onchange) => { const inp = document.createElement('input'); inp.type = 'range'; inp.min = 0; inp.max = 100; inp.value = val; inp.style.width = '140px'; inp.oninput = onchange; return inp; };
    row('Music volume', mkSlider(save.settings.music, (e) => { save.settings.music = +e.target.value; NPSave.save(save); applyVolumes(); }));
    row('SFX volume', mkSlider(save.settings.sfx, (e) => { save.settings.sfx = +e.target.value; NPSave.save(save); applyVolumes(); }));
    row('Mute', mk(save.settings.muted, (e) => { save.settings.muted = e.target.checked; NPSave.save(save); applyVolumes(); }));
    row('Miss sound', mk(save.settings.miss, (e) => { save.settings.miss = e.target.checked; NPSave.save(save); }));
    row('Screen shake', mk(save.settings.shake, (e) => { save.settings.shake = e.target.checked; NPSave.save(save); }));
    row('Reduce flashing', mk(save.settings.reduceFlashing, (e) => { save.settings.reduceFlashing = e.target.checked; NPSave.save(save); }));
    const resetBtn = document.createElement('button'); resetBtn.className = 'btn ghost'; resetBtn.textContent = 'RESET SAVE'; resetBtn.style.marginTop = '10px';
    let resetArmed = false, resetTimer = null;
    resetBtn.onclick = () => {
      if (!resetArmed) {
        resetArmed = true; resetBtn.textContent = 'TAP AGAIN TO ERASE EVERYTHING'; resetBtn.classList.add('pink');
        clearTimeout(resetTimer); resetTimer = setTimeout(() => { resetArmed = false; resetBtn.textContent = 'RESET SAVE'; resetBtn.classList.remove('pink'); }, 3000);
        return;
      }
      clearTimeout(resetTimer);
      try { localStorage.removeItem(NPSave.KEY); } catch (e) {}
      save = NPSave.defaultSave(cat); toast('SAVE RESET'); go('menu');
    };
    body.appendChild(resetBtn);
  }

  // ================================================================== MATCH
  const canvas = document.getElementById('court'); const ctx = canvas.getContext('2d');
  let courtScale = 1, matchClockT = 0, lastPhase = 'Idle', lastEvHit = 0;
  let ballHist = Array.from({ length: 6 }, () => []); let lastHitT = [-10, -10];
  let boardState = {}, goalState = { cyc: -1 };
  let matchStats = { longestRally: 0 };
  let humanTargetY = 300, activePointerId = null;
  let goalStartT = 0; // drawGoalFx's celebration timeline is 2.4s and keyed off the t it's given, so each goal
  // needs its own zeroed clock — feeding it the ever-increasing match clock would start mid-animation.

  function resizeCourt() {
    const wrap = document.getElementById('court-wrap');
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (w < 4 || h < 4) return;
    let cw = w, ch = w * PONG.CH / PONG.CW;
    if (ch > h) { ch = h; cw = h * PONG.CW / PONG.CH; }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    courtScale = canvas.width / PONG.CW;
    updateRotateHint();
  }
  window.addEventListener('resize', resizeCourt);
  window.addEventListener('orientationchange', () => setTimeout(resizeCourt, 200));
  function updateRotateHint() {
    const wrap = document.getElementById('court-wrap');
    const portrait = wrap.clientHeight > wrap.clientWidth;
    document.getElementById('rotate-hint').classList.toggle('show', portrait && curScreen === 'match');
  }

  canvas.addEventListener('pointerdown', (e) => { activePointerId = e.pointerId; try { canvas.setPointerCapture(e.pointerId); } catch (er) {} setTargetFromEvent(e); e.preventDefault(); });
  canvas.addEventListener('pointermove', (e) => { if (e.pointerId === activePointerId) { setTargetFromEvent(e); e.preventDefault(); } });
  window.addEventListener('pointerup', (e) => { if (e.pointerId === activePointerId) activePointerId = null; });
  window.addEventListener('pointercancel', (e) => { if (e.pointerId === activePointerId) activePointerId = null; });
  function setTargetFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const y = (e.clientY - rect.top) / rect.height * PONG.CH;
    humanTargetY = Math.max(PONG.WallTop, Math.min(PONG.WallBot, y));
  }
  // keyboard fallback for desktop testing
  const keys = {};
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (curScreen !== 'match') return;
    if (e.key === '1' || e.key.toLowerCase() === 'q') tapAbility('dash');
    if (e.key === '2' || e.key.toLowerCase() === 'e') tapAbility('mod');
    if (e.key === '3' || e.key.toLowerCase() === 'r') tapAbility('ult');
    if (e.key === '4' || e.key.toLowerCase() === 'f') tapAbility('legend');
    if (e.key === 'Escape') togglePause();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });

  // ---------------------------------------------------------------- ability buttons
  const abilitiesEl = document.getElementById('abilities');
  const ABILITY_DEFS = [
    { key: 'dash', label: () => 'DASH', get: () => (game.p[0].lvl[U.Dash] ? U.Dash : -1), show: () => game.p[0].lvl[U.Dash] > 0 },
    { key: 'mod', label: (k) => cat.up[k] ? cat.up[k].name.split(' ')[0].toUpperCase() : 'MOD', get: () => (game.p[0].mod >= 0 && game.p[0].lvl[game.p[0].mod] ? game.p[0].mod : -1), show: () => game.p[0].mod >= 0 && game.p[0].lvl[game.p[0].mod] > 0 },
    { key: 'ult', label: (k) => cat.up[k] ? cat.up[k].name.split(' ')[0].toUpperCase() : 'ULT', get: () => (game.p[0].ult >= 0 && game.p[0].lvl[game.p[0].ult] ? game.p[0].ult : -1), show: () => game.p[0].ult >= 0 && game.p[0].lvl[game.p[0].ult] > 0 },
    { key: 'legend', label: (k) => cat.up[k] ? cat.up[k].name.split(' ')[0].toUpperCase() : 'LGND', get: () => (game.p[0].legend >= 0 && game.p[0].lvl[game.p[0].legend] ? game.p[0].legend : -1), show: () => game.p[0].legend >= 0 && game.p[0].lvl[game.p[0].legend] > 0 },
  ];
  const abilityBtns = {};
  ABILITY_DEFS.forEach((def) => {
    const btn = document.createElement('div'); btn.className = 'ability-btn off';
    btn.innerHTML = '<div class="ring"></div><span class="lbl"></span>';
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); tapAbility(def.key); btn.style.transform = 'scale(0.9)'; });
    btn.addEventListener('pointerup', () => { btn.style.transform = ''; });
    abilitiesEl.appendChild(btn); abilityBtns[def.key] = btn;
  });
  function tapAbility(key) { if (game.phase !== 'Playing') return; game.p[0].in[key]++; }
  function updateAbilityButtons() {
    for (const def of ABILITY_DEFS) {
      const btn = abilityBtns[def.key], k = def.get();
      if (!def.show() || k < 0) { btn.classList.add('off'); continue; }
      btn.classList.remove('off');
      btn.querySelector('.lbl').textContent = def.label(k);
      btn.style.setProperty('--pct', Math.max(0, Math.min(1, game.ready01(0, k))));
      btn.classList.toggle('armed', game.armed(0, k));
    }
  }

  // ---------------------------------------------------------------- pause
  document.getElementById('pause-btn').onclick = togglePause;
  document.getElementById('resume-btn').onclick = togglePause;
  function togglePause() {
    if (game.phase === 'Finished' || curScreen !== 'match') return;
    game.paused = !game.paused;
    document.getElementById('pause-panel').classList.toggle('show', game.paused);
  }

  // ---------------------------------------------------------------- break/shop panel
  const breakPanel = document.getElementById('break-panel');
  function renderBreakShop() {
    document.getElementById('break-up').textContent = game.p[0].up;
    const tiersEl = document.getElementById('break-tiers'); tiersEl.innerHTML = '';
    for (const td of cat.tiers) {
      const lbl = document.createElement('div'); lbl.className = 'break-tier-label'; lbl.style.color = td.color;
      lbl.textContent = 'TIER ' + td.tier + ' · ' + td.name.toUpperCase() + ' (' + td.cost + ' UP)'; tiersEl.appendChild(lbl);
      for (const k of td.items) {
        const u = cat.up[k]; const lvl = game.p[0].lvl[k];
        const row = document.createElement('div'); row.className = 'up-item'; row.style.setProperty('--tc', u.color);
        const canBuy = game.canBuy(0, k); const cost = game.cost(0, k);
        row.innerHTML = '<div class="nm">' + u.name + (lvl ? ' <span class="lvl">Lv' + lvl + (u.maxStacks > 1 ? '/' + u.maxStacks : '') + '</span>' : '') + '<div class="eff">' + u.effect + '</div></div>';
        const btn = document.createElement('button'); btn.textContent = game.maxed(0, k) ? 'MAX' : cost + ' UP';
        btn.disabled = !canBuy; btn.onclick = () => { if (game.buy(0, k)) renderBreakShop(); };
        row.appendChild(btn); tiersEl.appendChild(row);
      }
    }
  }
  const readyBtn = document.getElementById('ready-btn');
  readyBtn.onclick = () => { game.setReady(0, !game.p[0].ready); readyBtn.textContent = game.p[0].ready ? '✓ READY' : 'READY'; readyBtn.classList.toggle('ready', game.p[0].ready); };

  // ---------------------------------------------------------------- game over
  function showGameOver() {
    const won = game.winner === 0;
    const w = document.getElementById('over-winner'); w.textContent = won ? 'YOU WIN' : 'CPU WINS'; w.style.color = won ? 'var(--lime)' : 'var(--red)';
    { const sec = Math.floor(game.matchMs / 1000), mm = String(Math.floor(sec / 60)).padStart(2, '0'), ss = String(sec % 60).padStart(2, '0'); document.getElementById('over-score').textContent = game.p[0].score + ' – ' + game.p[1].score + '  ·  ' + mm + ':' + ss; }
    const c = game.coins(0);
    const grid = document.getElementById('over-coins'); grid.innerHTML = '';
    const row = (k, v) => { const a = document.createElement('div'); a.className = 'k'; a.textContent = k; const b = document.createElement('div'); b.className = 'v'; b.textContent = '+' + v; grid.appendChild(a); grid.appendChild(b); };
    row(won ? 'WIN BONUS' : 'LOSS BONUS', c.base); row('POINTS SCORED', c.points); row('LONG RALLIES', c.rally);
    save.player.coins += c.total; save.player.stats.matches++; if (won) save.player.stats.wins++; else save.player.stats.losses++;
    save.player.stats.longestRally = Math.max(save.player.stats.longestRally, matchStats.longestRally);
    NPSave.save(save);
    go('over');
  }

  // ---------------------------------------------------------------- main loop
  let lastT = 0, running = false;
  function resumeLoop() { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); } }
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
    if (curScreen === 'cos' || curScreen === 'setup') tickPreviews(dt);
    if (curScreen !== 'match') return;
    if (!game.paused) matchClockT += dt;

    if (!game.paused && game.phase === 'Playing') {
      PONG.cpuThink(game, 1, cpu, dt);
      if (keys.ArrowUp || keys.w || keys.W) humanTargetY = Math.max(PONG.WallTop, humanTargetY - 900 * dt);
      if (keys.ArrowDown || keys.s || keys.S) humanTargetY = Math.min(PONG.WallBot, humanTargetY + 900 * dt);
      game.p[0].in.mouse = true; game.p[0].in.target = humanTargetY;
    }
    if (!game.paused) game.step(dt);

    // ---- phase transitions ----
    if (game.phase !== lastPhase) {
      if (game.phase === 'Break') { PONG.cpuShop(game, 1, cpuStrat, cpu); game.setReady(1, true); breakPanel.classList.add('show'); readyBtn.textContent = 'READY'; readyBtn.classList.remove('ready'); renderBreakShop(); }
      else breakPanel.classList.remove('show');
      if (game.phase === 'Goal') { goalStartT = matchClockT; goalState = { cyc: -1 }; }
      if (game.phase === 'Finished') { setTimeout(showGameOver, 900); }
      lastPhase = game.phase;
    }
    if (game.phase === 'Break') { document.getElementById('break-timer').textContent = Math.max(0, Math.ceil(game.breakT)); document.getElementById('break-up').textContent = game.p[0].up; }
    if (game.ev.hit !== lastEvHit) { lastEvHit = game.ev.hit; if (game.ev.hitter >= 0) lastHitT[game.ev.hitter] = matchClockT; }
    matchStats.longestRally = Math.max(matchStats.longestRally, game.rally);

    const banner = document.getElementById('banner');
    banner.classList.toggle('show', game.phase === 'Playing' && game.anyMatchPoint());
    if (game.phase === 'Playing') banner.textContent = game.matchPoint(0) && game.matchPoint(1) ? 'MATCH POINT' : (game.matchPoint(0) ? 'MATCH POINT — YOU' : 'MATCH POINT — CPU');

    updateAbilityButtons();
    render();
  }

  function render() {
    if (canvas.width === 0) resizeCourt();
    ctx.save();
    ctx.setTransform(courtScale, 0, 0, courtScale, 0, 0);
    ctx.clearRect(0, 0, PONG.CW, PONG.CH);

    if (game.phase === 'Goal') {
      const id = game.ev.scorer === 0 ? save.player.equip.goalfx : 'g_flash';
      const col = game.ev.scorer === 0 ? NP.glowColorAt(save.player.equip.glow, matchClockT) : NP.colors.red;
      NP.drawGoalFx(ctx, id, PONG.CW, PONG.CH, matchClockT - goalStartT, goalState, col);
      ctx.restore();
      return;
    }

    NP.drawBoard(ctx, save.lastSetup.board, PONG.CW, PONG.CH, matchClockT, boardState, { intensity: Math.min(1, game.rally / 20), reduceFlashing: save.settings.reduceFlashing });
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.setLineDash([8, 10]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(PONG.CW / 2, 0); ctx.lineTo(PONG.CW / 2, PONG.CH); ctx.stroke(); ctx.restore();

    // trails (behind balls), human-hit balls only
    for (let i = 0; i < game.balls.length; i++) {
      const b = game.balls[i];
      if (!b.active || b.held) { ballHist[i].length = 0; continue; }
      ballHist[i].push({ x: b.x, y: b.y }); if (ballHist[i].length > 18) ballHist[i].shift();
      if (b.owner === 0 && save.player.equip.trail && save.player.equip.trail !== 't_none') {
        trailStates[i] = trailStates[i] || {};
        NP.drawTrail(ctx, save.player.equip.trail, ballHist[i], matchClockT, trailStates[i], NP.glowColorAt(save.player.equip.glow, matchClockT), PONG.BallR * 0.7);
      }
    }

    // paddles
    drawPaddleSet(0, save.player.equip.paddle, save.player.equip.glow);
    drawPaddleSet(1, CPU_PADDLE, CPU_GLOW);

    // black hole visual
    if (game.hole.on) { ctx.save(); ctx.translate(game.hole.x, game.hole.y); const r = 16 + Math.sin(matchClockT * 6) * 3; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(20,0,40,0.85)'; ctx.shadowColor = NP.colors.violet; ctx.shadowBlur = 24; ctx.fill(); ctx.restore(); }

    // balls
    for (const b of game.balls) {
      if (!b.active) continue;
      const spd = Math.hypot(b.vx, b.vy) / game.ballCap(true);
      ctx.save(); ctx.translate(b.x, b.y);
      if (NP.boardIsLight(save.lastSetup.board)) NP.drawBallShadow(ctx, PONG.BallR);
      NP.drawBall(ctx, save.lastSetup.ball, PONG.BallR, matchClockT, { speed: spd, spin: matchClockT * 2 + b.x * 0.02 });
      ctx.restore();
    }

    drawHud();
    ctx.restore();
  }
  const trailStates = Array.from({ length: 6 }, () => ({}));
  function drawPaddleSet(i, skin, glowId) {
    const q = game.p[i], half = game.len(i) / 2, x = i === 0 ? PONG.FaceL : PONG.FaceR;
    ctx.save(); ctx.translate(x, q.y);
    const po = { hitAge: matchClockT - lastHitT[i], bpm: 168, calm: save.settings.reduceFlashing, lightBoard: NP.boardIsLight(save.lastSetup.board) };
    NP.drawPaddle(ctx, skin, glowId, 14, game.len(i), matchClockT, i === 0 ? Object.assign({ aura: save.player.equip.aura }, po) : po);
    ctx.restore();
    if (q.lvl[U.Twin]) { ctx.save(); ctx.translate(game.twinX(i), q.twinY); NP.drawPaddle(ctx, skin, glowId, 10, game.twinLen(i), matchClockT, { calm: po.calm, lightBoard: po.lightBoard }); ctx.restore(); }
    if (q.lvl[U.Guardian]) { ctx.save(); ctx.translate(game.droneX(i), q.droneY); NP.drawPaddle(ctx, skin, glowId, 8, game.droneLen(i), matchClockT, { calm: po.calm, lightBoard: po.lightBoard }); ctx.restore(); }
    if (q.shield) { ctx.save(); const bx = i === 0 ? PONG.BallR : PONG.CW - PONG.BallR; ctx.strokeStyle = 'rgba(120,220,255,0.8)'; ctx.shadowColor = NP.colors.cyan; ctx.shadowBlur = 14; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, PONG.WallTop); ctx.lineTo(bx, PONG.WallBot); ctx.stroke(); ctx.restore(); }
  }
  function drawHud() {
    NP.drawScore(ctx, save.player.equip.hud, game.p[0].score, PONG.CW * 0.32, 44, 30, matchClockT, NP.glowColorAt(save.player.equip.glow, matchClockT), 'center');
    NP.drawScore(ctx, CPU_HUD, game.p[1].score, PONG.CW * 0.68, 44, 30, matchClockT, NP.colors.pink, 'center');
    if (game.rules.upgrades) { ctx.save(); ctx.font = '13px "Chakra Petch", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.textAlign = 'center'; ctx.fillText('UP ' + game.p[0].up, PONG.CW * 0.32, 68); ctx.fillText('UP ' + game.p[1].up, PONG.CW * 0.68, 68); ctx.restore(); }
    if (game.serve > 0 && game.phase === 'Playing') { ctx.save(); ctx.font = '11px "Chakra Petch", sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center'; ctx.fillText('serving…', PONG.CW / 2, PONG.CH - 16); ctx.restore(); }
  }

  // ---------------------------------------------------------------- boot
  applyVolumes();
  resizeCourt();
  resumeLoop();
})();
