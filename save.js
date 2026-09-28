// localStorage save, shaped after source/profile.h but collapsed to a single human profile
// (this build is VS CPU only, so there's no second local wallet to track).
(function (root) {
  'use strict';
  const KEY = 'neonpong-mobile-save-v1';
  const slotCats = ['paddle', 'glow', 'aura', 'trail', 'goalfx', 'hud'];

  function defaultPlayer() {
    return { name: 'PLAYER 1', coins: 0, owned: [], equip: {}, color: 0x00f0ff, glow: 65, glowMode: 0, hudColor: 0x00f0ff, stats: { wins: 0, losses: 0, matches: 0, longestRally: 0 } };
  }
  function sanitize(p, cat) {
    const ok = [];
    for (const id of p.owned) if (PONG.catItem(cat, id) && !ok.includes(id)) ok.push(id);
    for (const c of cat.cos) if (c.price === 0 && !ok.includes(c.id)) ok.push(c.id);
    p.owned = ok;
    for (const c of cat.cats) {
      if (c.id === 'board' || c.id === 'ball') continue; // match-level picks, not per-player equip
      const id = p.equip[c.id]; const d = id ? PONG.catItem(cat, id) : null;
      if (!d || d.cat !== c.id || !p.owned.includes(id)) p.equip[c.id] = PONG.catDefaultFor(cat, c.id);
    }
    p.coins = Math.max(0, Math.min(99999999, p.coins | 0));
    p.glow = Math.max(0, Math.min(100, p.glow)); p.glowMode = Math.max(0, Math.min(2, p.glowMode));
    if (!p.name) p.name = 'PLAYER 1';
    return p;
  }
  function defaultSave(cat) {
    const s = {
      version: 1, player: defaultPlayer(), cheated: false,
      lastSetup: { points: cat.pointsToWin, winBy2: cat.winByTwo, upgrades: true, resetUpOnConcede: cat.econ.resetOnConcede, underdogComeback: true, underdogDiscount: true, breakTimerOn: true, breakTimerSec: Math.round(cat.econ.breakTimer), board: 'b_grid', ball: 'circle', cpuLevel: 1 },
      settings: { music: 70, sfx: 80, miss: true, shake: true, reduceFlashing: false, muted: false },
    };
    sanitize(s.player, cat);
    return s;
  }
  function load(cat) {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { /* private mode / blocked storage */ }
    if (!raw) return defaultSave(cat);
    try {
      const j = JSON.parse(raw);
      const s = defaultSave(cat);
      if (j.player) Object.assign(s.player, j.player);
      if (j.lastSetup) Object.assign(s.lastSetup, j.lastSetup);
      if (j.settings) Object.assign(s.settings, j.settings);
      s.cheated = !!j.cheated;
      sanitize(s.player, cat);
      if (!cat.pointOptions.includes(s.lastSetup.points)) s.lastSetup.points = cat.pointsToWin;
      if (!PONG.catItem(cat, s.lastSetup.board)) s.lastSetup.board = 'b_grid';
      if (!PONG.catItem(cat, s.lastSetup.ball)) s.lastSetup.ball = 'circle';
      return s;
    } catch (e) { return defaultSave(cat); }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage full/blocked — play on without persistence */ }
  }
  function applyCheat(s, cat, code) {
    if (code.trim().toUpperCase() !== cat.coins.cheat) return false;
    s.player.coins = Math.min(99999999, s.player.coins + 5000);
    s.cheated = true;
    return true;
  }
  function buy(s, cat, itemId) {
    const it = PONG.catItem(cat, itemId); if (!it) return { ok: false, why: 'UNKNOWN ITEM' };
    if (s.player.owned.includes(itemId)) { equip(s, cat, itemId); return { ok: true, equipped: true }; }
    if (s.player.coins < it.price) return { ok: false, why: 'NOT ENOUGH COINS' };
    s.player.coins -= it.price;
    s.player.owned.push(itemId);
    equip(s, cat, itemId);
    return { ok: true, bought: true };
  }
  function equip(s, cat, itemId) {
    const it = PONG.catItem(cat, itemId); if (!it || !s.player.owned.includes(itemId)) return false;
    if (it.cat === 'board' || it.cat === 'ball') { s.lastSetup[it.cat] = itemId; }
    else s.player.equip[it.cat] = itemId;
    return true;
  }

  root.NPSave = { KEY, defaultSave, load, save, sanitize, applyCheat, buy, equip, slotCats };
})(typeof window !== 'undefined' ? window : globalThis);
