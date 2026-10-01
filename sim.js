// Ported from source/game.h + source/catalog.h (Neon Pong 4.1, native C++). No DOM dependency —
// runs identically under Node (for headless smoke tests) and in the browser.
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;
  else root.PONG = mod;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CW = 1000, CH = 600, WallTop = 30, WallBot = 570, BallR = 9, FaceL = 64, FaceR = 936;
  const DEG = Math.PI / 180;

  const U = { Long: 0, Quick: 1, Heavy: 2, Grip: 3, Dash: 4, Steady: 5, Titan: 6, Overdrive: 7, Curve: 8, Shield: 9, Mirage: 10, Bullet: 11, Magnet: 12, Twin: 13, Cryo: 14, BlackHole: 15, Smash: 16, Guardian: 17, Shrink: 18, Snare: 19, SecondWind: 20, Barrage: 21 };
  const UCount = 22;
  const upgradeIds = ['t1_long', 't1_quick', 't1_heavy', 't1_grip', 't1_dash', 't1_steady', 't2_titan', 't2_overdrive', 't2_curve', 't4_shield', 't2_mirage',
    't2_bullet', 't2_magnet', 't3_twin', 't3_cryo', 't3_blackhole', 't3_smash', 't3_guardian', 't3_shrink', 't4_snare', 't4_secondwind', 't4_barrage'];

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const pnum = (u, key, def) => { const v = u.params ? u.params[key] : undefined; return (v === undefined || v === null || typeof v === 'object') ? def : v; };
  const pat = (u, key, stack, def) => {
    const v = u.params ? u.params[key] : undefined;
    if (Array.isArray(v)) { if (!v.length) return def; return v[clamp(stack, 0, v.length - 1)]; }
    return v === undefined ? def : v;
  };

  // ---------------------------------------------------------------- catalog (mirrors catalog.h::loadCatalog)
  function buildCatalog(raw) {
    const c = { pointsToWin: 21, matchPointAt: 20, pointOptions: [11, 21, 31], econ: {}, coins: {}, tiers: [], up: new Array(UCount), rarities: [], cats: [], cos: [], balls: [], ballGroups: [], cosIndex: {} };
    const m = raw.match || {};
    c.pointsToWin = m.pointsToWin || 21; c.matchPointAt = m.matchPointBannerAt != null ? m.matchPointBannerAt : c.pointsToWin - 1;
    if (Array.isArray(m.pointsToWinOptions)) c.pointOptions = m.pointsToWinOptions.map((v) => Math.max(1, v || 21));
    const e = raw.upgradeEconomy || {}; const E = c.econ;
    E.earn = e.earnPerPointScored != null ? e.earnPerPointScored : 1;
    const ue = e.underdogEarn || {}; E.underdogTrail = ue.trailingBy != null ? ue.trailingBy : 4; E.underdogBonus = ue.bonusUPWhenConceding != null ? ue.bonusUPWhenConceding : 1; E.keepUnspent = ue.keepUnspent !== false;
    const ud = e.underdogDiscount || {}; E.discountTrail = ud.trailingBy != null ? ud.trailingBy : 5; E.discount = ud.discount != null ? ud.discount : 1; E.minCost = ud.minCost != null ? ud.minCost : 1;
    E.discountTiers = Array.isArray(ud.tiers) ? ud.tiers.slice() : [2, 3];
    E.resetOnConcede = e.resetUnspentOnConcede !== false;
    const br = e.upgradeBreak || {};
    E.breakEvery = Math.max(1, br.everyNTotalPoints || 1); E.breakTimer = br.timerSeconds != null ? br.timerSeconds : 15; E.skipWhenBothReady = br.skipWhenBothReady !== false;
    E.noBreakAtMatchPoint = !!br.noBreakAtMatchPoint; E.goalBeat = br.goalBeatSec != null ? br.goalBeatSec : 1.4;
    const cp = e.caps || {};
    E.lenMax = cp.paddleLengthMax != null ? cp.paddleLengthMax : 1.6; E.lenMin = cp.paddleLengthMin != null ? cp.paddleLengthMin : 0.6; E.speedMax = cp.paddleSpeedMax != null ? cp.paddleSpeedMax : 1.5;
    E.ballMax = cp.ballSpeedMax != null ? cp.ballSpeedMax : 2.2; E.ballMaxSmash = cp.ballSpeedMaxDuringSmash != null ? cp.ballSpeedMaxDuringSmash : 2.6;
    const b = e.base || {};
    E.baseLen = b.paddleLength != null ? b.paddleLength : 108; E.baseSpeed = b.paddleSpeed != null ? b.paddleSpeed : 650; E.baseBall = b.ballSpeed != null ? b.ballSpeed : 443;
    E.hitMult = b.hitSpeedMult != null ? b.hitSpeedMult : 1.045; E.maxAngleDeg = b.maxAngleDeg != null ? b.maxAngleDeg : 59; E.accelSec = b.paddleAccelSec != null ? b.paddleAccelSec : 0.08; E.serveDelay = b.serveDelaySec != null ? b.serveDelaySec : 1.5;
    let found = 0;
    for (const t of (raw.upgradeTiers || [])) {
      const td = { tier: t.tier || 1, cost: t.cost != null ? t.cost : (t.tier || 1), name: t.name, rule: t.rule, color: t.color, items: [] };
      for (const it of (t.items || [])) {
        const id = it.id; const k = upgradeIds.indexOf(id); if (k < 0) continue;
        const u = { kind: k, id, name: it.name || id, icon: it.icon || 'target', type: it.type || 'passive', key: it.key || '', slot: it.slot || '', effect: it.effect || '', tier: td.tier, cost: td.cost, maxStacks: Math.max(1, it.maxStacks || 1), color: td.color, active: it.type === 'active', params: it.params || {} };
        // tiers 3 and 4 are single-stack; each tier allows ONE active ability (see Game.activeIn); passives never take that slot
        if (u.tier >= 3) u.maxStacks = 1;
        u.slot = u.active ? (u.tier === 2 ? 'mod' : u.tier === 3 ? 'ultimate' : u.tier === 4 ? 'legendary' : '') : '';
        c.up[k] = u; td.items.push(k); found++;
      }
      c.tiers.push(td);
    }
    if (found !== UCount && JSON.stringify(raw).match(/"t1_tracer"|"t3_barrage"/)) throw new Error('catalog is from an older Neon Pong (it still lists Tracer or a Tier 3 Barrage)');
    if (found !== UCount) throw new Error('catalog.json must list all ' + UCount + ' upgrades (' + found + ' found)');
    const ce = raw.coinEconomy || {};
    const cea = ce.earn || {}, rb = cea.rallyBonus || {};
    c.coins = { win: cea.win != null ? cea.win : 50, loss: cea.loss != null ? cea.loss : 10, perPoint: cea.perPointScored != null ? cea.perPointScored : 2, rallyMin: rb.minHits != null ? rb.minHits : 15, rallyCoins: rb.coins != null ? rb.coins : 10, rallyMax: rb.maxPerMatch != null ? rb.maxPerMatch : 5, cheat: (ce.cheatCode && ce.cheatCode.code) || 'NEONRICH' };
    for (const [id, v] of Object.entries(ce.rarities || {})) c.rarities.push({ id, label: v.label || id, price: v.price || 0, color: v.color || '#8b88b3', animated: !!v.animatedBorder });
    if (!c.rarities.length) c.rarities.push({ id: 'default', label: 'Default', price: 0, color: '#8b88b3', animated: false });
    for (const k of (raw.cosmeticCategories || [])) c.cats.push({ id: k.id, name: k.name, slot: k.slot, desc: k.desc });
    for (const x of (raw.cosmetics || [])) {
      const rarityDef = c.rarities.find((r) => r.id === (x.rarity || 'common'));
      const d = { id: x.id, cat: x.cat, name: x.name || x.id, rarity: x.rarity || 'common', desc: x.desc || '', price: x.price != null ? x.price : (rarityDef ? rarityDef.price : 0), rank: rarityDef ? c.rarities.indexOf(rarityDef) : 0 };
      if (!d.id || !c.cats.find((cc) => cc.id === d.cat)) continue;
      c.cosIndex[d.id] = c.cos.length; c.cos.push(d);
    }
    for (const x of ((raw.balls && raw.balls.items) || [])) { const d = { id: x.id, name: x.name, group: x.group || 'Shapes', note: x.note || '' }; if (!d.id) continue; c.balls.push(d); if (!c.ballGroups.includes(d.group)) c.ballGroups.push(d.group); }
    if (!c.balls.length) c.balls.push({ id: 'circle', name: 'Classic', group: 'Shapes', note: '' });
    return c;
  }
  const catItem = (c, id) => (c.cosIndex[id] !== undefined ? c.cos[c.cosIndex[id]] : null);
  const catRarity = (c, id) => c.rarities.find((r) => r.id === id) || c.rarities[0];
  const catDefaultFor = (c, cat) => { let f = c.cos.find((x) => x.cat === cat && x.price === 0); if (f) return f.id; f = c.cos.find((x) => x.cat === cat); return f ? f.id : ''; };

  // ---------------------------------------------------------------- entities
  function newInput() { return { dir: 0, target: 300, mouse: false, dash: 0, mod: 0, ult: 0, legend: 0 }; }
  function newPlayer() {
    return {
      y: 300, v: 0, score: 0, up: 0, lvl: new Array(UCount).fill(0), mod: -1, ult: -1, legend: -1,
      dashT: 0, dashCd: 0, modCd: 0, ultCd: 0, legendCd: 0, bulletT: 0, magnetT: 0, cryoTele: 0, cryoT: 0, shrinkT: 0,
      mirageArmed: false, mirageUsed: false, barrageArmed: false, smashArmed: false, snareArmed: false, secondWindArmed: false, secondWindUsed: false, shield: false, ready: false,
      barrageAt: 0, shieldAt: 0, twinY: 300, droneY: 300, handicap: 1,
      seenDash: 0, seenMod: 0, seenUlt: 0, seenLegend: 0, cursor: 0, in: newInput(),
      longest: 0, bought: 0, ults: 0, shieldsBroken: 0, longRallies: 0, fastest: 0,
    };
  }
  function newBall() { return { x: 500, y: 300, vx: 0, vy: 0, curve: 0, normal: 0, decoyEnd: 0, catchSpeed: 0, active: false, decoy: false, smash: false, owner: -1, bounces: 0, held: false, heldBy: -1, holdT: 0 }; }

  function defaultRules(cat) { return { points: cat.pointsToWin, upgrades: true, resetUpOnConcede: cat.econ.resetOnConcede, underdogComeback: true, underdogDiscount: true, breakTimerOn: true, breakTimerSec: Math.round(cat.econ.breakTimer) }; }

  // ---------------------------------------------------------------- Game (mirrors game.h::Game)
  class Game {
    constructor() {
      this.cat = null; this.rules = null; this.phase = 'Idle'; this.phaseT = 0; this.serve = 0; this.breakT = 0; this.paused = false;
      this.p = [newPlayer(), newPlayer()]; this.balls = Array.from({ length: 6 }, newBall);
      this.hole = { on: false, x: 0, y: 0, t: 0, owner: -1 };
      this.ev = { hit: 0, wall: 0, point: 0, buy: 0, ult: 0, shieldHit: 0, serve: 0, arm: 0, hitter: -1, scorer: -1, buyer: -1, ultBy: -1, dice: 1 };
      this.rally = 0; this.total = 0; this.winner = -1; this.token = 1; this.rng = 0x9e3779b9;
      this.matchAcc = 0; this.matchMs = 0;  // elapsed match time: runs while unpaused, stops on the deciding point
    }
    E() { return this.cat.econ; }
    U_(k) { return this.cat.up[k]; }
    rnd() { this.rng ^= this.rng << 13; this.rng ^= this.rng >>> 17; this.rng ^= this.rng << 5; this.rng >>>= 0; return (this.rng & 0xffffff) / 16777216; }
    lenMult(i) { const q = this.p[i], E = this.E(); let m = 1 + pnum(this.U_(U.Long), 'paddleLength', 0.12) * q.lvl[U.Long] + pnum(this.U_(U.Titan), 'paddleLength', 0.3) * q.lvl[U.Titan]; if (q.shrinkT > 0) m *= pnum(this.U_(U.Shrink), 'lengthMult', 0.7); return clamp(m, E.lenMin, E.lenMax); }
    len(i) { return this.E().baseLen * this.lenMult(i); }
    speedMult(i) { const q = this.p[i], E = this.E(); return Math.min(E.speedMax, 1 + pnum(this.U_(U.Quick), 'paddleSpeed', 0.1) * q.lvl[U.Quick] + pnum(this.U_(U.Overdrive), 'paddleSpeed', 0.25) * q.lvl[U.Overdrive]); }
    speed(i) { return this.E().baseSpeed * this.speedMult(i) * this.p[i].handicap; }
    moveSpeed(i) { const q = this.p[i]; let s = this.speed(i); if (q.cryoT > 0) s *= pnum(this.U_(U.Cryo), 'slowMult', 0.4); if (q.dashT > 0) s *= pnum(this.U_(U.Dash), 'burstMult', 2); return s; }
    ballCap(smash) { const E = this.E(); return E.baseBall * (smash ? E.ballMaxSmash : E.ballMax); }
    maxAngle(i) { return (this.E().maxAngleDeg + pnum(this.U_(U.Grip), 'maxAngleDeg', 6) * this.p[i].lvl[U.Grip]) * DEG; }
    twinX(i) { const d = pnum(this.U_(U.Twin), 'depth', 0.35); return i === 0 ? 50 + (CW / 2 - 50) * d : CW - 50 - (CW / 2 - 50) * d; }
    droneX(i) { return i === 0 ? 28 : CW - 28; }
    twinLen(i) { return this.len(i) * pnum(this.U_(U.Twin), 'lengthMult', 0.55); }
    droneLen(i) { return this.len(i) * pnum(this.U_(U.Guardian), 'lengthMult', 0.35); }
    trailing(i) { return this.p[1 - i].score - this.p[i].score; }
    underdog(i) { return this.rules.underdogDiscount && this.trailing(i) >= this.E().discountTrail; }
    cost(i, k) { const u = this.U_(k), E = this.E(); let c = u.cost; if (this.underdog(i) && E.discountTiers.includes(u.tier)) c = Math.max(E.minCost, c - E.discount); return c; }
    // the one-active-ability-per-tier rule: the owned ACTIVE upgrade in this tier (other than except), or -1. Passives never count.
    activeIn(i, tier, except) { for (let k = 0; k < UCount; k++) if (k !== except && this.p[i].lvl[k] && this.U_(k).tier === tier && this.U_(k).active) return k; return -1; }
    loadoutValid(i) {
      const q = this.p[i], actives = [0, 0, 0, 0, 0];
      for (let k = 0; k < UCount; k++) { const n = q.lvl[k]; if (!n) continue; const u = this.U_(k); if (n > u.maxStacks || (u.active && ++actives[u.tier] > 1)) return false; }
      const slot = (s, tier) => s === -1 || (s >= 0 && s < UCount && q.lvl[s] > 0 && this.U_(s).active && this.U_(s).tier === tier);
      return slot(q.mod, 2) && slot(q.ult, 3) && slot(q.legend, 4);
    }
    maxed(i, k) { return this.p[i].lvl[k] >= this.U_(k).maxStacks; }
    matchPoint(i) { return this.p[i].score + 1 >= this.rules.points; }
    anyMatchPoint() { return this.phase !== 'Finished' && this.winner < 0 && (this.matchPoint(0) || this.matchPoint(1)); }
    decided() { for (let i = 0; i < 2; i++) if (this.p[i].score >= this.rules.points) return true; return false; }
    ready01(i, k) {
      const q = this.p[i], u = this.U_(k);
      switch (k) {
        case U.Dash: { const cd = pat(u, 'cooldownSec', q.lvl[U.Dash] - 1, 4); return q.dashCd <= 0 ? 1 : 1 - q.dashCd / cd; }
        case U.Mirage: return q.mirageUsed ? 0 : 1;
        case U.Bullet: case U.Magnet: { const cd = pnum(u, 'cooldownSec', 30); return q.modCd <= 0 ? 1 : 1 - q.modCd / cd; }
        case U.Barrage: { const cp = pnum(u, 'cooldownPoints', 3); const left = q.barrageAt - this.total; return left <= 0 ? 1 : 1 - left / cp; }
        case U.Cryo: case U.BlackHole: case U.Smash: case U.Shrink: { const cd = pnum(u, 'cooldownSec', 30); return q.ultCd <= 0 ? 1 : 1 - q.ultCd / cd; }
        case U.Snare: { const cd = pnum(u, 'cooldownSec', 30); return q.legendCd <= 0 ? 1 : 1 - q.legendCd / cd; }
        case U.SecondWind: return q.secondWindUsed ? 0 : 1;  // one use per round; refreshes when a point is awarded
        default: return 1;
      }
    }
    armed(i, k) { const q = this.p[i]; return (k === U.Mirage && q.mirageArmed) || (k === U.Barrage && q.barrageArmed) || (k === U.Smash && q.smashArmed) || (k === U.Bullet && q.bulletT > 0) || (k === U.Magnet && q.magnetT > 0) || (k === U.Snare && q.snareArmed) || (k === U.SecondWind && q.secondWindArmed); }

    start(cat, rules) {
      const keep = [this.p[0].handicap, this.p[1].handicap];
      this.cat = cat; this.rules = rules; this.p = [newPlayer(), newPlayer()]; this.p[0].handicap = keep[0]; this.p[1].handicap = keep[1];
      this.balls = Array.from({ length: 6 }, newBall);
      this.hole = { on: false, x: 0, y: 0, t: 0, owner: -1 }; this.rally = 0; this.total = 0; this.winner = -1; this.paused = false; this.matchAcc = 0; this.matchMs = 0; this.token++;
      this.rng = (this.rng ^ ((rules.points * 7919 + 17) >>> 0)) >>> 0;
      this.serveBall(1);
    }
    serveBall(toward) {
      this.balls = Array.from({ length: 6 }, newBall); this.hole.on = false;
      const b = this.balls[0], E = this.E();
      let s = E.baseBall;
      if (this.p[toward].lvl[U.Steady]) s *= 1 + pnum(this.U_(U.Steady), 'incomingServeSpeed', -0.15);
      const a = Math.atan2(140, 420) * (this.total % 2 ? 1 : -1);
      b.active = true; b.x = CW / 2; b.y = CH / 2; b.vx = (toward === 1 ? 1 : -1) * s * Math.cos(a); b.vy = s * Math.sin(a);
      this.phase = 'Playing'; this.phaseT = 0; this.serve = E.serveDelay; this.rally = 0; this.token++; this.ev.serve++;
      for (const q of this.p) { q.mirageUsed = false; q.ready = false; }
    }
    setReady(i, v) { if (this.phase !== 'Break') return; this.p[i].ready = v; if (this.E().skipWhenBothReady && this.p[0].ready && this.p[1].ready) this.endBreak(); }
    endBreak() { if (this.phase === 'Break') this.serveBall(this.ev.scorer >= 0 ? this.ev.scorer : 1); }
    canBuy(i, k) { if (this.phase !== 'Break') return false; if (!this.rules.upgrades) return false; if (this.p[i].ready) return false; if (this.maxed(i, k)) return false; if (this.p[i].up < this.cost(i, k)) return false; return true; }
    buyReason(i, k) {
      if (this.phase !== 'Break') return 'SHOP IS CLOSED';
      if (!this.rules.upgrades) return 'UPGRADES ARE OFF';
      if (this.p[i].ready) return 'UN-READY TO SHOP';
      if (this.maxed(i, k)) return 'ALREADY MAXED';
      if (this.p[i].up < this.cost(i, k)) return 'NOT ENOUGH UP';
      return '';
    }
    // gives the upgrade with no cost/phase checks; an active replaces whichever active the player holds in that tier
    equip(i, k) {
      const q = this.p[i], u = this.U_(k);
      if (q.lvl[k] >= u.maxStacks) return false;
      if (u.active) {
        const old = this.activeIn(i, u.tier, k); if (old >= 0) q.lvl[old] = 0;
        if (u.tier === 2) { q.mod = k; q.mirageArmed = false; q.bulletT = q.magnetT = 0; }
        else if (u.tier === 3) { q.ult = k; q.smashArmed = false; q.ultCd = 0; }
        else if (u.tier === 4) { q.legend = k; q.snareArmed = q.secondWindArmed = q.barrageArmed = q.secondWindUsed = false; q.legendCd = 0; q.barrageAt = this.total; }
      }
      q.lvl[k]++;
      if (k === U.Shield) q.shield = true;
      if (k === U.Twin) q.twinY = CH - q.y;
      if (k === U.Guardian) q.droneY = CH / 2;
      return true;
    }
    buy(i, k) {
      if (!this.canBuy(i, k)) return false;
      this.p[i].up -= this.cost(i, k);
      if (!this.equip(i, k)) return false;
      this.p[i].bought++; this.ev.buy++; this.ev.buyer = i;
      return true;
    }
    replaces(i, k) { const u = this.U_(k); return u.active ? this.activeIn(i, u.tier, k) : -1; }
    coins(i) { const k = this.cat.coins; const c = {}; c.won = this.winner === i; c.base = this.winner < 0 ? 0 : (c.won ? k.win : k.loss); c.points = this.p[i].score * k.perPoint; c.rally = Math.min(this.p[i].longRallies, k.rallyMax) * k.rallyCoins; c.total = c.base + c.points + c.rally; return c; }

    useDash(i) { const q = this.p[i]; if (!q.lvl[U.Dash] || q.dashCd > 0) return; q.dashT = pnum(this.U_(U.Dash), 'burstSec', 0.2); q.dashCd = pat(this.U_(U.Dash), 'cooldownSec', q.lvl[U.Dash] - 1, 4); }
    useMod(i) {
      const q = this.p[i]; if (q.mod < 0 || !q.lvl[q.mod]) return; const u = this.U_(q.mod);
      if (q.mod === U.Mirage) { if (!q.mirageUsed && !q.mirageArmed) { q.mirageArmed = true; this.ev.arm++; } }
      else if (q.mod === U.Bullet) { if (q.modCd <= 0) { q.bulletT = pnum(u, 'durationSec', 1.2); q.modCd = pnum(u, 'cooldownSec', 30); this.ev.arm++; } }
      else if (q.mod === U.Magnet) { if (q.modCd <= 0) { q.magnetT = pnum(u, 'durationSec', 1.5); q.modCd = pnum(u, 'cooldownSec', 30); this.ev.arm++; } }
    }
    useLegend(i) {
      const q = this.p[i]; if (q.legend < 0 || !q.lvl[q.legend]) return;
      if (q.legend === U.Snare) { if (!q.snareArmed && q.legendCd <= 0) { q.snareArmed = true; this.ev.arm++; } }
      else if (q.legend === U.SecondWind) { if (!q.secondWindArmed && !q.secondWindUsed) { q.secondWindArmed = true; this.ev.arm++; } }
      else if (q.legend === U.Barrage) { if (!q.barrageArmed && q.barrageAt <= this.total) { q.barrageArmed = true; this.ev.arm++; } }
    }
    fired(i) { this.p[i].ults++; this.ev.ult++; this.ev.ultBy = i; }
    useUlt(i) {
      const q = this.p[i]; if (q.ult < 0 || !q.lvl[q.ult]) return; const u = this.U_(q.ult), o = 1 - i;
      if (q.ult === U.Smash) { if (!q.smashArmed && q.ultCd <= 0) { q.smashArmed = true; this.ev.arm++; } }
      else if (q.ult === U.Cryo) { if (q.ultCd <= 0) { this.p[o].cryoTele = pnum(u, 'telegraphSec', 0.3); q.ultCd = pnum(u, 'cooldownSec', 30); this.fired(i); } }
      else if (q.ult === U.Shrink) { if (q.ultCd <= 0) { this.p[o].shrinkT = pnum(u, 'durationSec', 10); q.ultCd = pnum(u, 'cooldownSec', 30); this.fired(i); } }
      else if (q.ult === U.BlackHole) {
        if (q.ultCd <= 0) {
          let b = this.balls[0]; for (const x of this.balls) if (x.active && !x.decoy) { b = x; break; }
          this.hole.on = true; this.hole.owner = i; this.hole.t = pnum(u, 'durationSec', 4);
          this.hole.x = i === 0 ? CW * 0.75 : CW * 0.25; this.hole.y = clamp(b.y, 150, 450);
          q.ultCd = pnum(u, 'cooldownSec', 30); this.fired(i);
        }
      }
    }

    static sgn(v) { return v < 0 ? -1 : 1; }
    keepHorizontal(b, minFrac = 0.35) { const s = Math.hypot(b.vx, b.vy); if (s < 1) return; if (Math.abs(b.vx) < s * minFrac) { const vx = Game.sgn(b.vx) * s * minFrac; b.vy = Game.sgn(b.vy) * Math.sqrt(Math.max(0, s * s - vx * vx)); b.vx = vx; } }
    rotateVel(b, a) { const c = Math.cos(a), s = Math.sin(a), vx = b.vx * c - b.vy * s, vy = b.vx * s + b.vy * c; if (Game.sgn(vx) !== Game.sgn(b.vx)) return; b.vx = vx; b.vy = vy; }
    setSpeed(b, s) { const c = Math.hypot(b.vx, b.vy); if (c > 0.001) { b.vx *= s / c; b.vy *= s / c; } }
    spawn() { for (const b of this.balls) if (!b.active) return b; return null; }

    movePaddle(i, dt) {
      const q = this.p[i], E = this.E(), spd = this.moveSpeed(i), half = this.len(i) / 2;
      const desired = q.in.mouse ? clamp((q.in.target - q.y) / dt, -spd, spd) : clamp(q.in.dir, -1, 1) * spd;
      if (q.lvl[U.Overdrive] || E.accelSec <= 0) q.v = desired;
      else {
        const acc = spd / E.accelSec * dt;
        if (Game.sgn(desired) === Game.sgn(q.v) && Math.abs(desired) <= Math.abs(q.v)) q.v = desired;
        else { if (desired * q.v < 0) q.v = 0; q.v += clamp(desired - q.v, -acc, acc); }
      }
      const ny = clamp(q.y + q.v * dt, WallTop + half, WallBot - half);
      if (ny !== q.y + q.v * dt) q.v = 0;
      q.y = ny;
      if (q.lvl[U.Twin]) { const th = this.twinLen(i) / 2; q.twinY = clamp(CH - q.y, WallTop + th, WallBot - th); }
      if (q.lvl[U.Guardian]) {
        const dh = this.droneLen(i) / 2; let goal = CH / 2, best = 1e9;
        for (const b of this.balls) if (b.active && (i === 0 ? b.vx < 0 : b.vx > 0)) { const d = Math.abs(b.x - this.droneX(i)); if (d < best) { best = d; goal = b.y; } }
        const ds = this.speed(i) * pnum(this.U_(U.Guardian), 'speedMult', 0.45) * dt;
        q.droneY = clamp(q.droneY + clamp(goal - q.droneY, -ds, ds), WallTop + dh, WallBot - dh);
      }
    }
    bounce(b, i, padY, half, padVel, main) {
      const q = this.p[i], E = this.E(), dirS = i === 0 ? 1 : -1;
      if (main && q.snareArmed) {
        q.snareArmed = false; b.held = true; b.heldBy = i; b.holdT = pnum(this.U_(U.Snare), 'holdSec', 1.2);
        b.catchSpeed = Math.hypot(b.vx, b.vy);  // the launch speed is a multiple of the ball's speed at the moment it was caught
        b.vx = 0; b.vy = 0; b.owner = i; b.curve = 0; b.smash = false; b.bounces = 0;
        this.rally++; this.ev.hit++; this.ev.hitter = i; this.ev.dice = 1 + (Math.floor(this.rnd() * 6) % 6);
        return;
      }
      const rel = clamp((b.y - padY) / (half + BallR), -1, 1), ang = rel * this.maxAngle(i);
      const cur = b.smash ? b.normal : Math.hypot(b.vx, b.vy);
      const mult = E.hitMult + pnum(this.U_(U.Heavy), 'returnSpeed', 0.06) * q.lvl[U.Heavy];
      const s = Math.min(this.ballCap(), cur * mult);
      b.vx = dirS * s * Math.cos(ang); b.vy = s * Math.sin(ang);
      b.owner = i; b.curve = 0; b.smash = false; b.bounces = 0;
      if (q.lvl[U.Curve] && main) {
        const k = clamp(padVel / Math.max(1, this.speed(i)), -1, 1), flight = Math.abs((i === 0 ? FaceR : FaceL) - b.x) / Math.max(50, Math.abs(b.vx));
        b.curve = k * pnum(this.U_(U.Curve), 'maxCurveDeg', 35) * DEG / Math.max(0.25, flight) * dirS;
      }
      this.rally++; this.ev.hit++; this.ev.hitter = i; this.ev.dice = 1 + (Math.floor(this.rnd() * 6) % 6);
      q.fastest = Math.max(q.fastest, s / E.baseBall);
      if (!main) return;
      if (q.smashArmed) {
        b.normal = s; this.setSpeed(b, Math.min(s * pnum(this.U_(U.Smash), 'speedMult', 1.8), this.ballCap(true))); b.smash = true;
        q.smashArmed = false; q.ultCd = pnum(this.U_(U.Smash), 'cooldownSec', 30); this.fired(i);
        q.fastest = Math.max(q.fastest, Math.hypot(b.vx, b.vy) / E.baseBall);
      }
      if (q.mirageArmed) {
        const d = this.spawn();
        if (d) {
          Object.assign(d, b); d.decoy = true; d.curve = 0;
          const off = pnum(this.U_(U.Mirage), 'decoyAngleOffsetDeg', 18) * DEG * (this.rnd() < 0.5 ? -1 : 1);
          this.rotateVel(d, off); this.keepHorizontal(d, 0.3);
          const farSide = i === 0 ? CW : 0; d.decoyEnd = b.x + (farSide - b.x) * pnum(this.U_(U.Mirage), 'decoyVanishAt', 0.7);
        }
        q.mirageArmed = false; q.mirageUsed = true;
      }
      if (q.barrageArmed) {
        const spread = pnum(this.U_(U.Barrage), 'spreadDeg', 15) * DEG, want = Math.max(2, pnum(this.U_(U.Barrage), 'balls', 2));
        let have = 0; for (const x of this.balls) if (x.active && !x.decoy) have++;
        // top the rally up to exactly `want` balls (the ball just hit counts as one; Mirage decoys never count)
        for (let k = 1; have < want; k++) { const d = this.spawn(); if (!d) break; Object.assign(d, b); d.curve = 0; this.rotateVel(d, (k % 2 ? 1 : -1) * spread * Math.floor((k + 1) / 2)); this.keepHorizontal(d, 0.3); have++; }
        q.barrageArmed = false; q.barrageAt = this.total + pnum(this.U_(U.Barrage), 'cooldownPoints', 3); this.fired(i);
      }
    }
    point(s) {
      const c = 1 - s, E = this.E();
      for (const b of this.balls) b.active = false;
      this.hole.on = false;
      const P = this.p[s], Q = this.p[c];
      P.score++; this.total++;
      for (const q of this.p) q.secondWindUsed = false;  // Second Wind is one use per round: a point being awarded refreshes it
      P.longest = Math.max(P.longest, this.rally);
      if (this.rally >= this.cat.coins.rallyMin) P.longRallies++;
      if (this.rules.upgrades) {
        P.up += E.earn;
        const tr = this.trailing(c);
        const bonus = this.rules.underdogComeback && tr >= E.underdogTrail;
        if (this.rules.resetUpOnConcede && !(bonus && E.keepUnspent)) Q.up = 0;
        if (bonus) Q.up += E.underdogBonus;
      }
      for (const q of this.p) if (q.lvl[U.Shield] && !q.shield && this.total >= q.shieldAt) q.shield = true;
      this.ev.point++; this.ev.scorer = s;
      if (this.decided()) this.winner = s;
      this.phase = 'Goal'; this.phaseT = 0; this.token++;
    }
    tickTimers(dt) {
      for (let i = 0; i < 2; i++) {
        const q = this.p[i];
        const dec = (k) => { q[k] = Math.max(0, q[k] - dt); };
        dec('dashT'); dec('dashCd'); dec('modCd'); dec('ultCd'); dec('legendCd'); dec('bulletT'); dec('magnetT'); dec('shrinkT'); dec('cryoT');
        if (q.cryoTele > 0) { q.cryoTele -= dt; if (q.cryoTele <= 0) { q.cryoTele = 0; q.cryoT = pnum(this.U_(U.Cryo), 'durationSec', 3); } }
      }
      if (this.hole.on) { this.hole.t -= dt; if (this.hole.t <= 0) this.hole.on = false; }
    }
    handleInput(i) {
      const q = this.p[i];
      if (q.in.dash !== q.seenDash) { q.seenDash = q.in.dash; this.useDash(i); }
      if (q.in.mod !== q.seenMod) { q.seenMod = q.in.mod; this.useMod(i); }
      if (q.in.ult !== q.seenUlt) { q.seenUlt = q.in.ult; this.useUlt(i); }
      if (q.in.legend !== q.seenLegend) { q.seenLegend = q.in.legend; this.useLegend(i); }
    }
    step(dt) {
      if (this.paused || this.phase === 'Idle' || this.phase === 'Finished') { for (let i = 0; i < 2; i++) { const q = this.p[i]; q.seenDash = q.in.dash; q.seenMod = q.in.mod; q.seenUlt = q.in.ult; q.seenLegend = q.in.legend; } return; }
      this.phaseT += dt;
      if (this.winner < 0) { this.matchAcc += dt; this.matchMs = Math.floor(this.matchAcc * 1000); }
      if (this.phase === 'Goal') { if (this.phaseT >= this.E().goalBeat) this.afterGoal(); return; }
      if (this.phase === 'Break') { this.breakT -= dt; for (let i = 0; i < 2; i++) this.handleInput(i); if (this.rules.breakTimerOn && this.breakT <= 0) this.endBreak(); return; }
      this.tickTimers(dt);
      for (let i = 0; i < 2; i++) { this.handleInput(i); this.movePaddle(i, dt); }
      if (this.serve > 0) { this.serve = Math.max(0, this.serve - dt); return; }
      const E = this.E();
      for (const b of this.balls) {
        if (!b.active) continue;
        if (b.held) {
          const hb = b.heldBy, q = this.p[hb], dirS = hb === 0 ? 1 : -1;
          b.x = (hb === 0 ? FaceL : FaceR) + dirS * (BallR + 6); b.y = q.y; b.holdT -= dt;
          if (b.holdT <= 0) {
            const k = clamp(q.v / Math.max(1, this.speed(hb)), -1, 1), ang = k * this.maxAngle(hb);
            // the launch travels at releaseBallSpeedMult (2x) the speed the ball had when it was caught
            const s = Math.min(this.ballCap(true), (b.catchSpeed > 1 ? b.catchSpeed : E.baseBall) * pnum(this.U_(U.Snare), 'releaseBallSpeedMult', 2));
            b.vx = dirS * s * Math.cos(ang); b.vy = s * Math.sin(ang);
            b.held = false; b.heldBy = -1; b.owner = hb;
            q.legendCd = pnum(this.U_(U.Snare), 'cooldownSec', 30); this.fired(hb);
          }
          continue;
        }
        let bdt = dt;
        for (let i = 0; i < 2; i++) if (this.p[i].bulletT > 0 && (i === 0 ? b.x < CW / 2 : b.x > CW / 2)) bdt *= pnum(this.U_(U.Bullet), 'ballSpeedMult', 0.5);
        if (!b.decoy) {
          const spd = Math.hypot(b.vx, b.vy);
          for (let i = 0; i < 2; i++) if (this.p[i].magnetT > 0) { b.vy += (this.p[i].y - b.y) * pnum(this.U_(U.Magnet), 'pullStrength', 0.6) * 7 * dt; this.setSpeed(b, spd); this.keepHorizontal(b); }
          if (b.curve !== 0) { this.rotateVel(b, b.curve * bdt); this.keepHorizontal(b); }
          if (this.hole.on && (this.hole.owner === 0 ? b.x > CW / 2 : b.x < CW / 2)) {
            const dx = this.hole.x - b.x, dy = this.hole.y - b.y, d = Math.hypot(dx, dy);
            const want = Math.atan2(dy, dx), have = Math.atan2(b.vy, b.vx);
            let diff = (want - have) % (2 * Math.PI); if (diff > Math.PI) diff -= 2 * Math.PI; if (diff < -Math.PI) diff += 2 * Math.PI;
            const rate = pnum(this.U_(U.BlackHole), 'strength', 0.9) * 2.6 / (1 + d / 180);
            this.rotateVel(b, clamp(diff, -rate * bdt, rate * bdt)); this.keepHorizontal(b);
          }
        }
        const ox = b.x;
        b.x += b.vx * bdt; b.y += b.vy * bdt;
        if (b.y < WallTop + BallR) { b.y = 2 * (WallTop + BallR) - b.y; b.vy = Math.abs(b.vy); this.wallBounce(b); }
        if (b.y > WallBot - BallR) { b.y = 2 * (WallBot - BallR) - b.y; b.vy = -Math.abs(b.vy); this.wallBounce(b); }
        if (b.decoy) { if ((b.vx > 0 && b.x >= b.decoyEnd) || (b.vx < 0 && b.x <= b.decoyEnd) || b.x < 0 || b.x > CW) b.active = false; continue; }
        for (let i = 0; i < 2; i++) {
          const toward = i === 0 ? b.vx < 0 : b.vx > 0; if (!toward) continue;
          const s = i === 0 ? 1 : -1;
          const crossed = (face) => { const line = face + s * BallR; return i === 0 ? (ox >= line && b.x <= line) : (ox <= line && b.x >= line); };
          const half = this.len(i) / 2;
          if (crossed(i === 0 ? FaceL : FaceR) && Math.abs(b.y - this.p[i].y) <= half + BallR) { b.x = (i === 0 ? FaceL : FaceR) + s * BallR; this.bounce(b, i, this.p[i].y, half, this.p[i].v, true); break; }
          if (this.p[i].lvl[U.Twin]) { const face = this.twinX(i) + s * 6, th = this.twinLen(i) / 2; if (crossed(face) && Math.abs(b.y - this.p[i].twinY) <= th + BallR) { b.x = face + s * BallR; this.bounce(b, i, this.p[i].twinY, th, this.p[i].v, false); break; } }
          if (this.p[i].lvl[U.Guardian]) { const face = this.droneX(i) + s * 5, dh = this.droneLen(i) / 2; if (crossed(face) && Math.abs(b.y - this.p[i].droneY) <= dh + BallR) { b.x = face + s * BallR; this.bounce(b, i, this.p[i].droneY, dh, 0, false); break; } }
          const back = i === 0 ? BallR : CW - BallR;
          if (this.p[i].shield && (i === 0 ? b.x < back : b.x > back)) { b.x = back; b.vx = -b.vx; this.p[i].shield = false; this.p[i].shieldAt = this.total + pnum(this.U_(U.Shield), 'rechargePoints', 3); this.p[1 - i].shieldsBroken++; this.ev.shieldHit++; this.ev.wall++; }
        }
        if (b.x < 0) {
          if (this.p[0].secondWindArmed) { this.p[0].secondWindArmed = false; this.p[0].secondWindUsed = true; this.fired(0); this.serveBall(1); return; }
          this.point(1); return;
        }
        if (b.x > CW) {
          if (this.p[1].secondWindArmed) { this.p[1].secondWindArmed = false; this.p[1].secondWindUsed = true; this.fired(1); this.serveBall(0); return; }
          this.point(0); return;
        }
      }
    }
    wallBounce(b) {
      this.ev.wall++;
      if (b.curve !== 0) b.curve = -b.curve;
      if (b.smash) { b.bounces++; if (b.bounces >= pnum(this.U_(U.Smash), 'decayAfterWallBounces', 1)) { b.smash = false; this.setSpeed(b, Math.min(b.normal, this.ballCap())); } }
    }
    afterGoal() {
      if (this.winner >= 0) { this.phase = 'Finished'; this.phaseT = 0; this.token++; return; }
      const due = this.rules.upgrades && (this.total % this.E().breakEvery === 0) && !(this.E().noBreakAtMatchPoint && this.anyMatchPoint());
      if (due) { this.phase = 'Break'; this.phaseT = 0; this.breakT = this.rules.breakTimerSec; this.p[0].ready = this.p[1].ready = false; this.token++; }
      else this.serveBall(this.ev.scorer >= 0 ? this.ev.scorer : 1);
    }
  }

  // ---------------------------------------------------------------- CPU player (mirrors game.h Cpu/cpuThink/cpuShop)
  function newCpu() { return { reaction: 0.09, error: 34, timer: 0, target: 300, err: 0, aim: 0, seenHits: -1, rng: 12345 }; }
  function cpuRnd(c) { c.rng ^= c.rng << 13; c.rng ^= c.rng >>> 17; c.rng ^= c.rng << 5; c.rng >>>= 0; return (c.rng & 0xffffff) / 16777216; }
  function cpuGauss(c) { const u = Math.max(1e-6, cpuRnd(c)), v = cpuRnd(c); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function predictY(b, x) {
    if (Math.abs(b.vx) < 1) return b.y;
    const t = (x - b.x) / b.vx; if (t < 0) return b.y;
    const lo = WallTop + BallR, hi = WallBot - BallR, span = hi - lo;
    let y = b.y + b.vy * t - lo;
    y = y % (2 * span); if (y < 0) y += 2 * span; if (y > span) y = 2 * span - y;
    return y + lo;
  }
  function cpuThink(g, i, c, dt) {
    const q = g.p[i], inp = q.in; inp.mouse = true;
    let threat = null, best = 1e9;
    for (const b of g.balls) if (b.active && (i === 0 ? b.vx < 0 : b.vx > 0)) { const t = Math.abs(((i === 0 ? FaceL : FaceR) - b.x) / b.vx); if (t < best) { best = t; threat = b; } }
    c.timer -= dt;
    if (c.timer <= 0) {
      c.timer = c.reaction;
      if (g.ev.hit !== c.seenHits) { c.seenHits = g.ev.hit; const sp = threat ? Math.hypot(threat.vx, threat.vy) / g.E().baseBall : 1; c.err = cpuGauss(c) * c.error * (0.6 + 0.4 * sp); c.aim = (cpuRnd(c) - 0.5) * g.len(i) * 0.7; }
      if (threat && g.phase === 'Playing') c.target = predictY(threat, i === 0 ? FaceL + BallR : FaceR - BallR) + c.err + c.aim;
      else c.target = CH / 2 + Math.sin(g.phaseT * 0.7 + i) * 40;
    }
    inp.target = c.target;
    if (g.phase !== 'Playing') return;
    const gap = Math.abs(c.target - q.y), half = g.len(i) / 2;
    if (q.lvl[U.Dash] && threat && best < 0.6 && gap > half * 1.1) inp.dash++;
    if (q.mod === U.Mirage && threat && best < 0.5 && !q.mirageArmed && !q.mirageUsed) inp.mod++;
    if (q.mod === U.Bullet && threat && best < 0.7 && Math.hypot(threat.vx, threat.vy) > g.E().baseBall * 1.4 && q.modCd <= 0) inp.mod++;
    if (q.mod === U.Magnet && threat && best < 0.8 && gap > half && q.modCd <= 0) inp.mod++;
    let away = false; for (const b of g.balls) if (b.active && !b.decoy && (i === 0 ? b.vx > 0 : b.vx < 0)) away = true;
    if (q.ult === U.Smash && !q.smashArmed && q.ultCd <= 0) inp.ult++;
    if ((q.ult === U.Cryo || q.ult === U.Shrink || q.ult === U.BlackHole) && away && q.ultCd <= 0 && g.serve <= 0) inp.ult++;
    if (q.legend === U.Snare && threat && best < 0.5 && !q.snareArmed && q.legendCd <= 0) inp.legend++;
    if (q.legend === U.SecondWind && !q.secondWindArmed && !q.secondWindUsed) inp.legend++;
    if (q.legend === U.Barrage && !q.barrageArmed && q.barrageAt <= g.total) inp.legend++;
  }
  const Strat = { Random: 'Random', SaveMod: 'SaveMod', SaveUlt: 'SaveUlt', Cheap: 'Cheap' };
  function cpuShop(g, i, strat, c) {
    for (let guard = 0; guard < 12; guard++) {
      const ok = [[], [], [], [], []];
      for (let k = 0; k < UCount; k++) if (g.canBuy(i, k)) ok[g.U_(k).tier].push(k);
      const pick = (v) => { const k = v[Math.floor(cpuRnd(c) * v.length) % v.length]; return g.buy(i, k); };
      const anyUlt = g.p[i].ult >= 0;
      if (strat === Strat.SaveUlt && !anyUlt) { if (ok[3].length) { pick(ok[3]); continue; } if (g.p[i].up < 3) return; }
      if (strat === Strat.SaveMod || (strat === Strat.SaveUlt && anyUlt)) {
        const mods = ok[2].filter((k) => !(g.U_(k).active && g.p[i].mod >= 0));
        if (mods.length) { pick(mods); continue; }
        let modsLeft = false; for (let k = 0; k < UCount; k++) if (g.U_(k).tier === 2 && !g.maxed(i, k)) modsLeft = true;
        if (modsLeft && g.p[i].up < 2) return;
      }
      const all = [];
      // the CPU never buys a second active in a tier that already has one (it would just replace it)
      for (let t = 1; t <= 4; t++) for (const k of ok[t]) if (g.replaces(i, k) < 0) all.push(k);
      if (strat === Strat.Cheap && ok[1].length) { pick(ok[1]); continue; }
      if (!all.length || (strat === Strat.Random && cpuRnd(c) < 0.25)) return;
      pick(all);
    }
  }

  return {
    CW, CH, WallTop, WallBot, BallR, FaceL, FaceR, DEG, U, UCount, upgradeIds,
    buildCatalog, catItem, catRarity, catDefaultFor,
    Game, newPlayer, newBall, defaultRules,
    newCpu, cpuThink, cpuShop, predictY, Strat,
  };
});
