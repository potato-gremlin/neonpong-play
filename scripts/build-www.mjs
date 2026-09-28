// Copies the web game into www/ for the iPhone app (Capacitor) and bundles the two fonts
// so the app looks right offline. The web game at the repo root is left untouched.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'www');
const WEB_FILES = ['index.html', 'style.css', 'catalog.js', 'render.js', 'sim.js', 'save.js', 'app.js'];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const f of WEB_FILES) {
  if (!existsSync(join(ROOT, f))) throw new Error(`missing ${f}`);
  cpSync(join(ROOT, f), join(OUT, f));
}
// the app only needs the lossless WAVs (audio/hq); skip the web ogg/m4a copies to keep the app lean
mkdirSync(join(OUT, 'audio', 'hq'), { recursive: true });
for (const f of readdirSync(join(ROOT, 'audio', 'hq'))) cpSync(join(ROOT, 'audio', 'hq', f), join(OUT, 'audio', 'hq', f));

// ---- fonts (SIL Open Font License) — best effort; falls back to Google Fonts link if offline
const FONTS = [
  { family: 'Press Start 2P', weight: 400, file: 'PressStart2P-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf' },
  { family: 'Chakra Petch', weight: 400, file: 'ChakraPetch-Regular.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/ChakraPetch-Regular.ttf' },
  { family: 'Chakra Petch', weight: 500, file: 'ChakraPetch-Medium.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/ChakraPetch-Medium.ttf' },
  { family: 'Chakra Petch', weight: 600, file: 'ChakraPetch-SemiBold.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/ChakraPetch-SemiBold.ttf' },
  { family: 'Chakra Petch', weight: 700, file: 'ChakraPetch-Bold.ttf', url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/ChakraPetch-Bold.ttf' },
];
const LICENSES = [
  ['OFL-PressStart2P.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/OFL.txt'],
  ['OFL-ChakraPetch.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/chakrapetch/OFL.txt'],
];

async function grab(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

let html = readFileSync(join(OUT, 'index.html'), 'utf8');
try {
  const dir = join(OUT, 'fonts');
  mkdirSync(dir, { recursive: true });
  for (const f of FONTS) writeFileSync(join(dir, f.file), await grab(f.url));
  for (const [name, url] of LICENSES) { try { writeFileSync(join(dir, name), await grab(url)); } catch { /* license text is nice-to-have */ } }
  const css = FONTS.map((f) => `@font-face { font-family: '${f.family}'; font-weight: ${f.weight}; font-style: normal; font-display: swap; src: url('${f.file}') format('truetype'); }`).join('\n');
  writeFileSync(join(dir, 'fonts.css'), css + '\n');
  html = html
    .replace(/<link[^>]*fonts\.googleapis\.com\/css2[^>]*>\s*/g, '<link rel="stylesheet" href="fonts/fonts.css">\n')
    .replace(/<link rel="preconnect"[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, '');
  console.log('fonts bundled for offline use');
} catch (e) {
  console.warn('font download failed, keeping Google Fonts link:', e.message);
}
writeFileSync(join(OUT, 'index.html'), html);
console.log('www/ ready');
