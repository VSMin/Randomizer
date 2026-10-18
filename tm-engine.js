/* BrainBoy Time Machine — Machine Renderer, Audio Engine, Effects. Visual only: never selects winners. */
(function () {
'use strict';
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOutBounce = x => { const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mod10 = v => ((v % 10) + 10) % 10;
function rgba(hex, a) { let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
function rr(g, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const FIG = 'Figtree, system-ui, sans-serif', CAP = 'Caprasimo, Georgia, serif';
const LOCK_MS = 650;

const SKINS = {
  classic: { bg: ['#2a2019', '#0b0806', '#030202'], bgStyle: 'stone', metal: ['#5c3d18', '#e6bd72', '#7d5524', '#f8e2a6', '#6a4519', '#c9964c', '#4e3212', '#e0b062', '#5c3d18'], dark: ['#3b2711', '#140d06'], hi: '#ffe8b0', lo: '#1d1107', glow: '#ffae42', glow2: '#ff7b2e', face: '#efe0bf', ink: '#2b1c0c', flap: '#1d1712', flapInk: '#f3e2bd', paper: '#f2e7cf', paperInk: '#2b1c0c', strip: '#8e2b1c', holo: '#ffc46b', pin: '#f4ead6', pinStripe: '#9b2a1a', balls: ['#c0392b', '#e2a33b', '#2f6d8c', '#5b7f3a', '#7d3c98'], numerals: 'roman', ring: 'metal', confetti: ['#ffcf6b', '#ff8a3d', '#f6e7c1', '#c0392b', '#8fa073'] },
  cyber: { bg: ['#0b2533', '#03101a', '#010508'], bgStyle: 'grid', metal: ['#0d1922', '#2f4a5c', '#0a131a', '#4f7891', '#0d1922', '#29404f', '#0a131a', '#3d6176', '#0d1922'], dark: ['#08121a', '#02070b'], hi: '#8ff6ff', lo: '#01050a', glow: '#22e5ff', glow2: '#3b6bff', face: '#04121b', ink: '#7ff5ff', flap: '#06141d', flapInk: '#9ff8ff', paper: '#dff7fb', paperInk: '#052230', strip: '#1b6bff', holo: '#35f0ff', pin: '#e6fbff', pinStripe: '#1b8cff', balls: ['#00a3e0', '#00c9ab', '#3b5bff', '#8a5cff', '#00b894'], numerals: 'hex', ring: 'neon', confetti: ['#22e5ff', '#3b6bff', '#bff9ff', '#00ffc8', '#ffffff'] },
  golden: { bg: ['#2a1f0c', '#0b0803', '#000000'], bgStyle: 'rays', metal: ['#6b4c0c', '#ffe9a0', '#a87a12', '#fff6d0', '#7c5a0e', '#f0c75a', '#5e420a', '#ffdf7a', '#6b4c0c'], dark: ['#2b1f07', '#0b0802'], hi: '#fff4c4', lo: '#140e03', glow: '#ffd25e', glow2: '#fff0b0', face: '#0f0b05', ink: '#ffd672', flap: '#120d05', flapInk: '#ffdc80', paper: '#f7eccb', paperInk: '#3a2a05', strip: '#151107', holo: '#ffe08a', pin: '#fbf3dc', pinStripe: '#b8860b', balls: ['#d4a017', '#2a2a2a', '#c9a24a', '#8b6914', '#e8c158'], numerals: 'deco', ring: 'metal', confetti: ['#ffd25e', '#fff0b0', '#b8860b', '#ffffff', '#e8c158'] },
  steel: { bg: ['#2b3035', '#101214', '#050607'], bgStyle: 'plates', metal: ['#4a5056', '#dfe4e8', '#6c737a', '#ffffff', '#4d5359', '#b4bcc3', '#3f454a', '#d0d6db', '#4a5056'], dark: ['#2a2e32', '#0f1113'], hi: '#ffffff', lo: '#0b0c0d', glow: '#dff1ff', glow2: '#8cc8ff', face: '#e7ebee', ink: '#14171a', flap: '#16191c', flapInk: '#f2f5f7', paper: '#eef1f3', paperInk: '#16191c', strip: '#3a4046', holo: '#cfeaff', pin: '#f3f5f6', pinStripe: '#d23b2a', balls: ['#d23b2a', '#5d6670', '#2f80c2', '#e8b923', '#3a4046'], numerals: 'arabic', ring: 'metal', confetti: ['#ffffff', '#bfe3ff', '#d23b2a', '#e8b923', '#9aa4ad'] },
  neon: { bg: ['#2a0b4a', '#0d0221', '#04000c'], bgStyle: 'stars', metal: ['#1c0a35', '#6b2fb0', '#160629', '#a24bff', '#1c0a35', '#4f2290', '#140526', '#8a3cf0', '#1c0a35'], dark: ['#12052a', '#05010d'], hi: '#ff8bf0', lo: '#04000a', glow: '#ff2bd6', glow2: '#5b6bff', face: '#0b0418', ink: '#ff7ae9', flap: '#10052a', flapInk: '#ff9cf0', paper: '#fbe8ff', paperInk: '#3a0a5a', strip: '#ff2bd6', holo: '#ff5ce1', pin: '#fff0ff', pinStripe: '#ff2bd6', balls: ['#e0179f', '#4b5bff', '#00a9cc', '#9b3bff', '#e8457a'], numerals: 'hex', ring: 'neon', confetti: ['#ff2bd6', '#5b6bff', '#00e1ff', '#ffffff', '#b14bff'] },
  brand: { bg: ['#2e2406', '#0c0a03', '#000000'], bgStyle: 'comic', metal: ['#3a2c00', '#ffd84a', '#c99a0c', '#fff1a8', '#4a3800', '#f5c02c', '#2e2200', '#ffdf5e', '#3a2c00'], dark: ['#1a1a1a', '#050505'], hi: '#fff4b8', lo: '#000000', glow: '#ffc72c', glow2: '#ff2a2a', face: '#f8c62e', ink: '#111111', flap: '#111111', flapInk: '#f8c62e', paper: '#fff7d6', paperInk: '#111111', strip: '#d80018', holo: '#ffd23a', pin: '#fffbe8', pinStripe: '#d80018', balls: ['#d80018', '#e0a800', '#1a1a1a', '#ff7a00', '#b30014'], numerals: 'arabic', ring: 'metal', confetti: ['#f5c02c', '#d80018', '#111111', '#ffffff', '#ffdf5e'], amb: 'quiz' },
  newyear: { bg: ['#123a6a', '#071a36', '#020814'], bgStyle: 'winter', metal: ['#3a4c62', '#e8f4ff', '#7f97b2', '#ffffff', '#3f526a', '#bcd4ec', '#2c3a4c', '#d6e8fa', '#3a4c62'], dark: ['#16263a', '#060d18'], hi: '#ffffff', lo: '#0a1322', glow: '#7fd8ff', glow2: '#ffd25e', face: '#eef6ff', ink: '#0d2340', flap: '#0d1d33', flapInk: '#e6f4ff', paper: '#f2f8ff', paperInk: '#0d2340', strip: '#c0262d', holo: '#9fe6ff', pin: '#ffffff', pinStripe: '#c0262d', balls: ['#c0262d', '#2f80c2', '#e8b923', '#2e9e5b', '#9b59b6'], numerals: 'arabic', ring: 'metal', confetti: ['#ffffff', '#7fd8ff', '#ffd25e', '#c0262d', '#bcd4ec'], amb: 'snow', garland: ['#ff3b3b', '#ffd23a', '#3bd16f', '#3b9dff', '#ff7ae0'] },
  valentine: { bg: ['#5a0f2e', '#250514', '#0c0107'], bgStyle: 'hearts', metal: ['#6a3a3a', '#ffd6cc', '#a8625a', '#fff0ea', '#74403e', '#e9a59a', '#552e2e', '#f6c2b8', '#6a3a3a'], dark: ['#3a0b1e', '#14030a'], hi: '#ffe4ec', lo: '#1a0510', glow: '#ff4f8b', glow2: '#ff9ec0', face: '#fff0f3', ink: '#8a0f3a', flap: '#2a0614', flapInk: '#ffb3cc', paper: '#fff3f6', paperInk: '#8a0f3a', strip: '#d6245e', holo: '#ff7aa8', pin: '#fff6f8', pinStripe: '#d6245e', balls: ['#d6245e', '#ff6f9f', '#b0123e', '#e0588a', '#7a0f2e'], numerals: 'roman', ring: 'metal', confetti: ['#ff4f8b', '#ff9ec0', '#ffffff', '#d6245e', '#ffd6cc'], confShape: 'heart', amb: 'hearts' },
  march8: { bg: ['#5a2a5e', '#2a0f30', '#100414'], bgStyle: 'floral', metal: ['#6a4a6a', '#ffe6f6', '#a07aa0', '#ffffff', '#735273', '#e2b8de', '#553a55', '#f2d2ee', '#6a4a6a'], dark: ['#3a1a40', '#150818'], hi: '#fff0fb', lo: '#1a0a1c', glow: '#ffd23a', glow2: '#ff6fb5', face: '#fff6fb', ink: '#7a1f6a', flap: '#2a0f30', flapInk: '#ffd6f0', paper: '#fff8fc', paperInk: '#7a1f6a', strip: '#2e8a4a', holo: '#ff9ad5', pin: '#fffafd', pinStripe: '#e0358a', balls: ['#e0358a', '#e8b400', '#9b59b6', '#ff6fa5', '#2e8a4a'], numerals: 'roman', ring: 'metal', confetti: ['#ff6fb5', '#ffd23a', '#ffffff', '#c77dff', '#ff9ad5'], confShape: 'petal', amb: 'petals' },
  nauryz: { bg: ['#0f4a4a', '#06262a', '#021214'], bgStyle: 'ornament', metal: ['#6b4c0c', '#ffe9a0', '#a87a12', '#fff6d0', '#7c5a0e', '#f0c75a', '#5e420a', '#ffdf7a', '#6b4c0c'], dark: ['#0b3a3c', '#031a1c'], hi: '#fff4c4', lo: '#06201f', glow: '#3ee0d0', glow2: '#ffd25e', face: '#f6efe0', ink: '#0b4a4a', flap: '#0b3a3c', flapInk: '#ffe08a', paper: '#fbf3e0', paperInk: '#0b4a4a', strip: '#c0392b', holo: '#5ff5e5', pin: '#fffaf0', pinStripe: '#1aa59a', balls: ['#1aa59a', '#e2a33b', '#c0392b', '#3f8a3a', '#2a6fb0'], numerals: 'arabic', ring: 'metal', confetti: ['#3ee0d0', '#ffd25e', '#ffffff', '#e74c3c', '#7fd36a'], amb: 'blossom' },
  may1: { bg: ['#1d6fb8', '#0b3a6a', '#041a33'], bgStyle: 'spring', metal: ['#2e5a2a', '#d6f5a0', '#5e9a3a', '#f4ffd8', '#335f2e', '#a8d86a', '#234620', '#c4ea86', '#2e5a2a'], dark: ['#0e3a5a', '#041a2a'], hi: '#ffffff', lo: '#06233a', glow: '#ffd23a', glow2: '#ff5a7a', face: '#ffffff', ink: '#0b3a6a', flap: '#0b2f52', flapInk: '#ffe066', paper: '#fffdf2', paperInk: '#0b3a6a', strip: '#e8433a', holo: '#ffe066', pin: '#ffffff', pinStripe: '#2a9df4', balls: ['#e8433a', '#2a9df4', '#e8b400', '#2ea85a', '#9b59b6'], numerals: 'arabic', ring: 'metal', confetti: ['#ffd23a', '#2a9df4', '#e8433a', '#3ec26a', '#ffffff'], amb: 'balloons' },
  victory: { bg: ['#5a0b0b', '#250404', '#0a0101'], bgStyle: 'victory', metal: ['#4a2a10', '#e8b46a', '#7a4a1e', '#ffe0a8', '#55321a', '#c98a44', '#3a200c', '#dca060', '#4a2a10'], dark: ['#2a0606', '#0c0202'], hi: '#ffe7b0', lo: '#140404', glow: '#ff5a2a', glow2: '#ffd25e', face: '#f6ead0', ink: '#5a0b0b', flap: '#1a0505', flapInk: '#ffd25e', paper: '#f7ecd6', paperInk: '#5a0b0b', strip: '#b3121b', holo: '#ffcc55', pin: '#fbf3e2', pinStripe: '#b3121b', balls: ['#b3121b', '#d4a017', '#2a2a2a', '#8b1a1a', '#c9962a'], numerals: 'roman', ring: 'metal', confetti: ['#ffd25e', '#b3121b', '#ffffff', '#e8c158', '#ff6a3a'], amb: 'fireworks' },
  halloween: { bg: ['#2b1238', '#0e0614', '#030104'], bgStyle: 'halloween', metal: ['#1b1410', '#5a4636', '#251a12', '#8a6a4a', '#1b1410', '#4a3828', '#120c08', '#6e5640', '#1b1410'], dark: ['#140c08', '#050302'], hi: '#ffb066', lo: '#000000', glow: '#ff7a1a', glow2: '#9dff3a', face: '#1a0f08', ink: '#ff9a3a', flap: '#140a14', flapInk: '#ff9a3a', paper: '#f3e2c2', paperInk: '#3a1a00', strip: '#5a1a7a', holo: '#9dff3a', pin: '#f6eedd', pinStripe: '#ff7a1a', balls: ['#ff7a1a', '#6a2a9a', '#2a2a2a', '#5a9a1a', '#c0392b'], numerals: 'roman', ring: 'neon', confetti: ['#ff7a1a', '#9dff3a', '#6a2a9a', '#1a1a1a', '#ffd166'], amb: 'bats' },
  independence: { bg: ['#0a7fa8', '#044a66', '#012233'], bgStyle: 'steppe', metal: ['#6b4c0c', '#ffe9a0', '#a87a12', '#fff6d0', '#7c5a0e', '#f0c75a', '#5e420a', '#ffdf7a', '#6b4c0c'], dark: ['#03384e', '#011520'], hi: '#fff4c4', lo: '#011a26', glow: '#ffd23a', glow2: '#5fe3ff', face: '#e8f8fc', ink: '#035a78', flap: '#023a50', flapInk: '#ffd23a', paper: '#f5fbfd', paperInk: '#035a78', strip: '#00afca', holo: '#ffe066', pin: '#ffffff', pinStripe: '#00afca', balls: ['#00a3c0', '#e8b400', '#035a78', '#c9962a', '#2a8fb0'], numerals: 'arabic', ring: 'metal', confetti: ['#00afca', '#ffd23a', '#ffffff', '#5fe3ff', '#e8b923'], amb: 'sparkle' },
  christmas: { bg: ['#4a0f12', '#1e0507', '#080102'], bgStyle: 'xmas', metal: ['#5c3d0a', '#ffe08a', '#9a6a10', '#fff3c4', '#6a4810', '#e8b84a', '#4a3008', '#f7cf6a', '#5c3d0a'], dark: ['#173a22', '#06150b'], hi: '#fff1c4', lo: '#120804', glow: '#ffcf6b', glow2: '#ff3b3b', face: '#f8efdc', ink: '#5a0e12', flap: '#0f2a18', flapInk: '#ffe08a', paper: '#fbf3e2', paperInk: '#5a0e12', strip: '#1f6b3a', holo: '#ffd77a', pin: '#fffaf0', pinStripe: '#c0262d', balls: ['#c0262d', '#1f6b3a', '#d4a017', '#8e1b1f', '#2e8a4a'], numerals: 'roman', ring: 'metal', confetti: ['#c0262d', '#1f6b3a', '#ffd25e', '#ffffff', '#e8b923'], amb: 'snow', garland: ['#ff3b3b', '#ffd23a', '#3bd16f', '#ffb347'] },
  winter: { bg: ['#2a3f5e', '#101c30', '#050a14'], bgStyle: 'winter', metal: ['#4a4f6a', '#eef0ff', '#8a90b0', '#ffffff', '#50567a', '#c8cce8', '#3a3e56', '#dfe2f8', '#4a4f6a'], dark: ['#1c2236', '#080b14'], hi: '#ffffff', lo: '#141a2c', glow: '#bfe6ff', glow2: '#d6c8ff', face: '#f4f7ff', ink: '#1c2a4a', flap: '#141c30', flapInk: '#e8f0ff', paper: '#f6f9ff', paperInk: '#1c2a4a', strip: '#5a6fb0', holo: '#cfeeff', pin: '#ffffff', pinStripe: '#5a6fb0', balls: ['#5a6fb0', '#4a7ab8', '#3a4a7a', '#8a70c8', '#6a8ac0'], numerals: 'roman', ring: 'metal', confetti: ['#ffffff', '#bfe6ff', '#d6c8ff', '#8fb8e8', '#e8f0ff'], amb: 'snow' },
  spring: { bg: ['#3a6a3a', '#163a1e', '#07180b'], bgStyle: 'meadow', metal: ['#3a5a2a', '#e8f5c0', '#7a9a4a', '#fbffe8', '#40602e', '#c4dc8a', '#2c4620', '#d8eca6', '#3a5a2a'], dark: ['#1e3a1e', '#0a180c'], hi: '#fbffe8', lo: '#142410', glow: '#b8f070', glow2: '#ff9ec8', face: '#fbfff2', ink: '#2a4a1a', flap: '#16301a', flapInk: '#e0f8b0', paper: '#fbfff2', paperInk: '#2a4a1a', strip: '#e85a8a', holo: '#c8ff8a', pin: '#fffff8', pinStripe: '#e85a8a', balls: ['#e85a8a', '#4aa04a', '#e8b400', '#8a5ac8', '#2a8ac0'], numerals: 'arabic', ring: 'metal', confetti: ['#ff9ec8', '#b8f070', '#ffffff', '#ffd23a', '#c8a0ff'], amb: 'blossom' },
  summer: { bg: ['#1a8ac0', '#0a4a78', '#03203a'], bgStyle: 'summer', metal: ['#6a4a1a', '#ffe8b0', '#b08040', '#fff6dc', '#74521e', '#e8c07a', '#5a3c14', '#f4d494', '#6a4a1a'], dark: ['#0a3a5a', '#031a2a'], hi: '#fff6dc', lo: '#2a1a08', glow: '#ffd23a', glow2: '#ff7a3a', face: '#fffaf0', ink: '#0a4a78', flap: '#073454', flapInk: '#ffe066', paper: '#fffaf0', paperInk: '#0a4a78', strip: '#ff7a3a', holo: '#ffe680', pin: '#ffffff', pinStripe: '#1aa0e0', balls: ['#ff7a3a', '#1aa0e0', '#e8b400', '#2ab07a', '#e84a6a'], numerals: 'arabic', ring: 'metal', confetti: ['#ffd23a', '#ff7a3a', '#1aa0e0', '#ffffff', '#2ab07a'], amb: 'butterflies' },
  autumn: { bg: ['#5a2e10', '#2a1406', '#0e0602'], bgStyle: 'autumn', metal: ['#5a2e14', '#f8c49a', '#9a5a2a', '#ffe4cc', '#64361a', '#d88a54', '#46220e', '#eaa672', '#5a2e14'], dark: ['#2e1608', '#100702'], hi: '#ffe4cc', lo: '#1a0a02', glow: '#ff9a2a', glow2: '#ffcf4a', face: '#fbf0e0', ink: '#5a2e10', flap: '#2a1206', flapInk: '#ffc46a', paper: '#fbf0e0', paperInk: '#5a2e10', strip: '#b8401a', holo: '#ffb04a', pin: '#fff8ee', pinStripe: '#b8401a', balls: ['#b8401a', '#d88a1a', '#7a5a1a', '#a02a1a', '#c8a020'], numerals: 'roman', ring: 'metal', confetti: ['#ff9a2a', '#ffcf4a', '#b8401a', '#e8641a', '#8a5a1a'], amb: 'leaves' }
};

function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * 0.5); g.bezierCurveTo(x - s * 0.15, y + s * 0.3, x - s * 0.55, y + s * 0.1, x - s * 0.55, y - s * 0.15); g.bezierCurveTo(x - s * 0.55, y - s * 0.45, x - s * 0.15, y - s * 0.55, x, y - s * 0.25); g.bezierCurveTo(x + s * 0.15, y - s * 0.55, x + s * 0.55, y - s * 0.45, x + s * 0.55, y - s * 0.15); g.bezierCurveTo(x + s * 0.55, y + s * 0.1, x + s * 0.15, y + s * 0.3, x, y + s * 0.5); g.closePath(); }
function bat(g, s, f) { const w = 0.35 + 0.65 * (0.5 + 0.5 * f); g.beginPath(); g.moveTo(0, -s * 0.15); g.quadraticCurveTo(-s * 0.5, -s * 0.6 * w, -s * 1.2, -s * 0.35 * w); g.quadraticCurveTo(-s * 1.0, -s * 0.05, -s * 0.95, s * 0.12); g.quadraticCurveTo(-s * 0.75, -s * 0.02, -s * 0.55, s * 0.18); g.quadraticCurveTo(-s * 0.35, s * 0.02, -s * 0.15, s * 0.22); g.lineTo(0, s * 0.3); g.lineTo(s * 0.15, s * 0.22); g.quadraticCurveTo(s * 0.35, s * 0.02, s * 0.55, s * 0.18); g.quadraticCurveTo(s * 0.75, -s * 0.02, s * 0.95, s * 0.12); g.quadraticCurveTo(s * 1.0, -s * 0.05, s * 1.2, -s * 0.35 * w); g.quadraticCurveTo(s * 0.5, -s * 0.6 * w, 0, -s * 0.15); g.closePath(); g.moveTo(-s * 0.13, -s * 0.08); g.lineTo(-s * 0.11, -s * 0.36); g.lineTo(-s * 0.03, -s * 0.2); g.lineTo(s * 0.03, -s * 0.2); g.lineTo(s * 0.11, -s * 0.36); g.lineTo(s * 0.13, -s * 0.08); g.closePath(); }

function drawTiming(T, k) {
  const R = Math.min(Math.max(T * 0.28, 1100), 3800);
  const stop = T - R, accel = Math.min(T * 0.14, 1800), decel = accel + (stop - accel) * 0.5;
  const span = R - LOCK_MS - 150, locks = [];
  for (let i = 0; i < k; i++) locks.push(stop - R * 0.05 + span * ((i + 1) / k));
  return { T, R, stop, accel, decel, locks, celebrate: locks[k - 1] + LOCK_MS };
}

const gearCache = new Map();
function gearPath(r, n, spokes) {
  const key = r.toFixed(1) + '|' + n + '|' + spokes; let p = gearCache.get(key); if (p) return p;
  if (gearCache.size > 60) gearCache.clear();
  p = new Path2D(); const s = TAU / n, ri = r * 0.85;
  for (let i = 0; i < n; i++) { const a = i * s; [[ri, a], [r, a + s * 0.22], [r, a + s * 0.5], [ri, a + s * 0.72]].forEach(([rad, an], j) => { const x = Math.cos(an) * rad, y = Math.sin(an) * rad; if (i === 0 && j === 0) p.moveTo(x, y); else p.lineTo(x, y); }); }
  p.closePath(); p.moveTo(r * 0.15, 0); p.arc(0, 0, r * 0.15, 0, TAU);
  for (let i = 0; i < spokes; i++) { const a0 = i / spokes * TAU + 0.2, a1 = (i + 1) / spokes * TAU - 0.2; p.moveTo(Math.cos(a0) * r * 0.3, Math.sin(a0) * r * 0.3); p.arc(0, 0, r * 0.66, a0, a1); p.arc(0, 0, r * 0.3, a1, a0, true); p.closePath(); }
  gearCache.set(key, p); return p;
}

const PIN = [[0, 0], [0.05, 0.13], [0.14, 0.2], [0.24, 0.17], [0.33, 0.105], [0.42, 0.125], [0.58, 0.26], [0.72, 0.3], [0.86, 0.265], [0.96, 0.2], [1, 0.17]];
function pinHW(y) { for (let i = 1; i < PIN.length; i++) if (y <= PIN[i][0]) { const [y0, w0] = PIN[i - 1], [y1, w1] = PIN[i]; const s = (1 - Math.cos(((y - y0) / (y1 - y0)) * Math.PI)) / 2; return w0 + (w1 - w0) * s; } return 0.17; }

/* ───────────── Music ───────────── */
const NOTE = s => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); return 12 * (+m[3] + 1) + { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); };
const CHQ = { '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11], dim: [0, 3, 6], sus4: [0, 5, 7] };
const chordOf = s => { const m = /^([A-G][#b]?)(.*)$/.exec(s); return { r: NOTE(m[1] + '4') - 60, iv: CHQ[m[2]] || CHQ[''] }; };
const tone = (c, i, base) => { const n = c.iv.length; return base + c.r + c.iv[((i % n) + n) % n] + 12 * Math.floor(i / n); };
const ACC = {
  waltz: (c, B, p, o) => { p(0, 'bass', tone(c, 0, 36), .9, .26); for (let b = 1; b < B; b++) [0, 1, 2].forEach(i => p(b, o.inst || 'box', tone(c, i, 60), .5, .05)); },
  arp16: (c, B, p, o) => { const q = [0, 1, 2, 3, 2, 1, 2, 1]; for (let s = 0; s < B * 4; s++) p(s / 4, o.inst || 'sq', tone(c, q[s % 8], 60), .2, .045); },
  arp8: (c, B, p, o) => { const q = [0, 2, 1, 2, 3, 2, 1, 2]; for (let s = 0; s < B * 2; s++) p(s / 2, o.inst || 'pluck', tone(c, q[s % 8], 48), .45, .08); },
  pad: (c, B, p, o) => [0, 1, 2].forEach(i => p(0, o.pad || 'pad', tone(c, i, 60), B - .1, .035)),
  comp: (c, B, p) => { [1, 3].forEach(b => { if (b < B) [1, 2, 3].forEach(i => p(b, 'ep', tone(c, i, 48), .5, .045)); }); for (let b = 0; b < B; b++) p(b, 'bass', tone(c, [0, 1, 2, 1][b % 4], 36), .9, .24); },
  pulse: (c, B, p) => { for (let s = 0; s < B * 2; s++) p(s / 2, 'sawbass', tone(c, 0, 36), .4, .16); },
  stab: (c, B, p) => { for (let b = 0; b < B; b++) { p(b, 'bass', tone(c, b % 2 ? 2 : 0, 36), .45, .24); [0, 1, 2].forEach(i => p(b + .5, 'pluck', tone(c, i, 60), .2, .04)); } },
  strum: (c, B, p) => { for (let b = 0; b < B; b++) { [0, 2].forEach(i => p(b, 'dombra', tone(c, i, 48), .3, .09)); [.5, .75].forEach(h => [2, 3].forEach(i => p(b + h, 'dombra', tone(c, i, 48), .2, .06))); } },
  march: (c, B, p, o) => { p(0, 'bass', tone(c, 0, 36), .8, .26); if (B > 2) p(2, 'bass', tone(c, 2, 36), .8, .22); [1, 3].forEach(b => { if (b < B) [0, 1, 2].forEach(i => p(b, o.inst || 'pluck', tone(c, i, 60), .3, .04)); }); },
  ballad: (c, B, p) => { p(0, 'bass', tone(c, 0, 36), B - .1, .18); const q = [0, 1, 2, 3, 2, 1, 2, 3]; for (let s = 0; s < B * 2; s++) p(s / 2, 'ep', tone(c, q[s % 8], 48), .9, .04); },
  pizz: (c, B, p) => { for (let b = 0; b < B; b++) p(b, 'pluck', tone(c, b % 2 ? 2 : 0, 36), .25, .16); },
  bossa: (c, B, p) => { [[0, 0], [1.5, 2], [2, 0], [3.5, 2]].forEach(([t, i]) => { if (t < B) p(t, 'bass', tone(c, i, 36), .45, .22); }); [0, 1.5, 2.5, 3].forEach(t => { if (t < B) [1, 2, 3].forEach(i => p(t, 'pluck', tone(c, i, 48), .3, .035)); }); }
};
const DRUMS = {
  soft: (B, d) => { d(0, 'kick', .22); if (B > 2) d(2, 'kick', .18); for (let s = 0; s < B * 2; s++) d(s / 2, 'hat', s % 2 ? .035 : .02); },
  brush: (B, d) => { for (let b = 0; b < B; b++) { d(b, 'hat', .03); d(b + .5, 'hat', .02); if (b % 2) d(b, 'brush', .06); } },
  industrial: (B, d) => { d(0, 'kick', .25); d(1.5, 'kick', .16); d(1, 'clank', .05); if (B > 3) d(3, 'clank', .05); for (let s = 0; s < B * 4; s++) d(s / 4, 'hat', .012); },
  synth: (B, d) => { for (let b = 0; b < B; b++) { d(b, 'kick', .22); d(b + .5, 'hat', .03); if (b % 2) d(b, 'snare', .07); } },
  pop: (B, d) => { d(0, 'kick', .22); d(1.5, 'kick', .14); d(2, 'kick', .2); for (let b = 0; b < B; b++) { if (b % 2) d(b, 'snare', .07); d(b, 'hat', .025); d(b + .5, 'hat', .02); } },
  hoof: (B, d) => { for (let b = 0; b < B; b += 2) { d(b, 'thump', .2); d(b + .75, 'thump', .12); d(b + 1, 'thump', .16); } },
  march: (B, d) => { d(0, 'kick', .2); if (B > 2) d(2, 'kick', .16); d(1, 'snare', .06); if (B > 3) { d(3, 'snare', .06); d(3.5, 'snare', .03); } },
  timp: (B, d, c) => d(0, 'timp', .22, tone(c, 0, 36)),
  sleigh: (B, d) => { for (let s = 0; s < B * 2; s++) d(s / 2, 'jingle', s % 2 ? .02 : .04); },
  shaker: (B, d) => { for (let s = 0; s < B * 2; s++) d(s / 2, 'shaker', s % 2 ? .03 : .018); }
};
const MK = 'B4/.5 C#5/.5 D5/.5 E5/.5 F#5/.5 D5/.5 F#5/1 F5/.5 C#5/.5 F5/1 E5/.5 C5/.5 E5/1 B4/.5 C#5/.5 D5/.5 E5/.5 F#5/.5 D5/.5 F#5/.5 B5/.5 A5/.5 F#5/.5 D5/.5 F#5/.5 A5/2';
const JB = 'E4/1 E4/1 E4/2 E4/1 E4/1 E4/2 E4/1 G4/1 C4/1.5 D4/.5 E4/4 F4/1 F4/1 F4/1.5 F4/.5 F4/1 E4/1 E4/1 E4/.5 E4/.5 E4/1 D4/1 D4/1 E4/1 D4/2 G4/2 E4/1 E4/1 E4/2 E4/1 E4/1 E4/2 E4/1 G4/1 C4/1.5 D4/.5 E4/4 F4/1 F4/1 F4/1.5 F4/.5 F4/1 E4/1 E4/1 E4/.5 E4/.5 G4/1 G4/1 F4/1 D4/1 C4/4';
const SN = 'G4/1.5 A4/.5 G4/1 E4/3 G4/1.5 A4/.5 G4/1 E4/3 D5/2 D5/1 B4/3 C5/2 C5/1 G4/3 A4/2 A4/1 C5/1.5 B4/.5 A4/1 G4/1.5 A4/.5 G4/1 E4/3 A4/2 A4/1 C5/1.5 B4/.5 A4/1 G4/1.5 A4/.5 G4/1 E4/3 D5/2 D5/1 F5/1.5 D5/.5 B4/1 C5/3 E5/3 C5/1 G4/1 E4/1 G4/1.5 F4/.5 D4/1 C4/3 -/3';
const MUSIC = {
  classic: { bpm: 100, B: 3, ch: 'Am Dm G C F Dm E7 Am', acc: ['waltz'], lead: 'box', lo: 72, leadAmp: .07, mot: [[[0, 2, 1], [1, 1, .5], [1.5, 0, .5], [2, 1, 1]], [[0, 3, 1.5], [1.5, 2, .5], [2, 1, 1]]] },
  cyber: { bpm: 112, B: 4, ch: 'Am Am F F C C G G', acc: ['pad', 'arp16'], drums: 'soft', lead: 'saw', lo: 60, leadAmp: .04, mot: [[[0, 2, 1.5], [1.5, 1, .5], [2, 0, 2]], [[0, 3, .75], [.75, 2, .75], [1.5, 1, .5], [2, 2, 2]]] },
  golden: { bpm: 88, B: 4, swing: true, ch: 'Cmaj7 Am7 Dm7 G7', acc: ['comp'], drums: 'brush', lead: 'vib', lo: 60, leadAmp: .07, mot: [[[0, 3, 1.5], [1.5, 2, .5], [2, 1, 1], [3, 0, 1]], [[.5, 2, 1], [1.5, 3, 1], [2.5, 4, 1.5]]] },
  steel: { bpm: 96, B: 4, ch: 'Em Em C D', acc: ['pulse', 'pad'], drums: 'industrial', lead: 'bell', lo: 72, leadAmp: .05, mot: [[[0, 2, 2]], [[0, 1, 1], [2, 0, 2]]] },
  neon: { bpm: 104, B: 4, ch: 'Fm Db Ab Eb', acc: ['pad', 'arp16'], drums: 'synth', lead: 'saw', lo: 60, leadAmp: .04, mot: [[[0, 2, .75], [.75, 3, .75], [1.5, 4, 2.5]], [[0, 4, .75], [.75, 3, .75], [1.5, 2, 1], [2.5, 1, 1.5]]] },
  brand: { bpm: 124, B: 4, ch: 'C Am F G', acc: ['stab'], drums: 'pop', lead: 'pluck', lo: 72, leadAmp: .07, mot: [[[0, 0, .5], [.5, 1, .5], [1, 2, .5], [1.5, 3, 1], [3, 2, .5], [3.5, 3, .5]], [[0, 4, 1], [1, 3, .5], [1.5, 2, .5], [2, 1, 1.5]]] },
  nauryz: { bpm: 116, B: 4, ch: 'Dm C Bb C', acc: ['strum'], drums: 'hoof', lead: 'flute', lo: 72, leadAmp: .06, mot: [[[0, 2, .75], [.75, 3, .25], [1, 2, .5], [1.5, 1, .5], [2, 0, 2]], [[0, 1, .5], [.5, 2, .5], [1, 3, 1], [2, 2, .75], [2.75, 1, .25], [3, 0, 1]]] },
  may1: { bpm: 112, B: 4, ch: 'G D Em C', acc: ['march'], drums: 'march', lead: 'flute', lo: 72, leadAmp: .06, mot: [[[0, 0, 1], [1, 1, .5], [1.5, 2, .5], [2, 3, 2]], [[0, 2, 1], [1, 1, 1], [2, 0, 2]]] },
  victory: { bpm: 76, B: 4, ch: 'C Am F G', acc: ['pad'], drums: 'timp', lead: 'brass', lo: 60, leadAmp: .06, mot: [[[0, 0, 1.5], [1.5, 1, .5], [2, 2, 2]], [[0, 3, 2], [2, 2, 1], [3, 1, 1]]] },
  valentine: { bpm: 72, B: 4, ch: 'Fmaj7 Em7 Dm7 Cmaj7', acc: ['ballad'], lead: 'ep', lo: 72, leadAmp: .06, mot: [[[0, 3, 1.5], [1.5, 2, .5], [2, 1, 2]], [[1, 2, 1], [2, 3, 1], [3, 4, 1]]] },
  march8: { bpm: 132, B: 3, ch: 'D Bm G A', acc: ['waltz'], accO: { inst: 'pluck' }, lead: 'flute', lo: 72, leadAmp: .06, mot: [[[0, 2, 2], [2, 3, 1]], [[0, 4, 1], [1, 3, 1], [2, 2, 1]]] },
  halloween: { bpm: 126, B: 4, ch: 'Bm Bm Bm Bm F#m F#m F#m F#m', acc: ['pizz'], lead: 'pluck', leadAmp: .08, mel: MK, melRep: [0, 7] },
  independence: { bpm: 96, B: 4, ch: 'D A Bm G', acc: ['strum', 'pad'], drums: 'timp', lead: 'brass', lo: 60, leadAmp: .055, mot: [[[0, 0, 1], [1, 1, 1], [2, 2, 2]], [[0, 3, 1.5], [1.5, 2, .5], [2, 1, 1], [3, 2, 1]]] },
  newyear: { bpm: 132, B: 4, ch: 'C C C C F C D7 G C C C C F C G7 C', acc: ['march'], drums: 'sleigh', lead: 'bell', leadAmp: .08, mel: JB, melShift: 12 },
  christmas: { bpm: 84, B: 3, ch: 'C C C C G G C C F F C C F F C C G G C C C G C C', acc: ['pad', 'arp8'], lead: 'bell', leadAmp: .08, mel: SN },
  winter: { bpm: 66, B: 4, ch: 'Am Fmaj7 C G', acc: ['pad'], lead: 'box', lo: 72, leadAmp: .06, mot: [[[0, 2, 1], [1, 4, 1], [2, 3, 2]], [[.5, 2, 1], [1.5, 1, 1], [2.5, 0, 1.5]]] },
  spring: { bpm: 108, B: 4, ch: 'C G Am F', acc: ['arp8'], drums: 'shaker', lead: 'flute', lo: 72, leadAmp: .05, mot: [[[0, 2, .5], [.5, 3, .5], [1, 4, 1], [2, 3, .5], [2.5, 2, .5], [3, 1, 1]], [[0, 2, 1.5], [1.5, 1, .5], [2, 0, 2]]] },
  summer: { bpm: 100, B: 4, ch: 'Am7 D7 Gmaj7 Cmaj7', acc: ['bossa'], drums: 'shaker', lead: 'marimba', lo: 72, leadAmp: .08, mot: [[[0, 3, .5], [.5, 2, .5], [1.5, 1, .5], [2, 2, 1], [3.5, 3, .5]], [[0, 4, .75], [.75, 3, .75], [1.5, 2, 1], [2.5, 1, 1.5]]] },
  autumn: { bpm: 76, B: 4, ch: 'Am Dm G C F Dm E E', acc: ['arp8'], lead: 'vib', lo: 72, leadAmp: .05, mot: [[[0, 2, 2], [2, 1, 1], [3, 0, 1]], [[0, 1, 1], [1, 2, 1], [2, 3, 2]]] }
};
function buildTrack(T) {
  const B = T.B, chs = T.ch.split(/\s+/).map(chordOf), ev = [];
  const p = (t, inst, m, d, a) => ev.push({ t, inst, m, d, a });
  const dr = (t, drum, a, m) => ev.push({ t, drum, a, m });
  let melLen = 0;
  if (T.mel) { let t = 0; (T.melRep || [0]).forEach(tr => T.mel.split(/\s+/).filter(Boolean).forEach(tok => { const [n, d] = tok.split('/'), dd = +d; if (n !== '-') p(t, T.lead, NOTE(n) + tr + (T.melShift || 0), dd * .95, T.leadAmp || .08); t += dd; })); melLen = t; }
  chs.forEach((c, bar) => {
    const o = bar * B, pp = (t, i, m, d, a) => p(o + t, i, m, d, a), dd = (t, k, a, m) => dr(o + t, k, a, m);
    (T.acc || []).forEach(k => ACC[k](c, B, pp, T.accO || {}));
    if (T.drums) DRUMS[T.drums](B, dd, c);
    if (!T.mel && T.mot) T.mot[bar % T.mot.length].forEach(([t, i, d]) => pp(t, T.lead, tone(c, i, T.lo || 60), d * .95, T.leadAmp || .07));
  });
  if (T.swing) ev.forEach(e => { if (Math.abs((e.t % 1) - .5) < 1e-6) e.t += .17; });
  ev.sort((a, b) => a.t - b.t);
  return { ev, L: Math.max(chs.length * B, melLen), spb: 60 / T.bpm };
}

/* ───────────── Audio Engine ───────────── */
class AudioEngine {
  constructor() { this.ctx = null; this.cfg = { sound: true, fanfare: true, vol: 0.8, volMech: 0.7, volFan: 0.85, set: 'brass', mute: {}, music: true, volMus: 0.5, duckMusic: true }; this.lastTick = 0; }
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.connect(c.destination);
      this.mech = c.createGain(); this.mech.connect(this.master);
      this.fan = c.createGain(); this.fan.connect(this.master);
      this.musG = c.createGain(); this.musG.gain.value = 0; this.musG.connect(this.master); this.tracks = {}; this._mi = setInterval(() => { try { this.musTick(); } catch (e) {} }, 90);
      const b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = b;
      this.apply();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  setConfig(c) { this.cfg = Object.assign({}, this.cfg, c); this.apply(); }
  apply() { if (!this.ctx) return; const t = this.ctx.currentTime, c = this.cfg; this.master.gain.setTargetAtTime(c.sound ? c.vol : 0, t, 0.03); this.mech.gain.setTargetAtTime(c.volMech, t, 0.03); this.fan.gain.setTargetAtTime(c.volFan, t, 0.03); }
  ok(type) { return !!(this.ctx && this.ctx.state === 'running' && this.cfg.sound && !(this.cfg.mute || {})[type]); }
  nz() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; return s; }
  env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  tick(level) {
    if (!this.ok('ticks')) return; const c = this.ctx, t = c.currentTime; if (t - this.lastTick < 0.032) return; this.lastTick = t;
    const s = this.nz(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = this.cfg.set === 'electro' ? 5200 : this.cfg.set === 'box' ? 2400 : 3300; f.Q.value = 7;
    this.env(g, t, 0.002, 0.3 * (0.35 + 0.65 * (level || 1)), 0.035); s.connect(f).connect(g).connect(this.mech); s.start(t, Math.random() * 0.5); s.stop(t + 0.07);
  }
  clunk() {
    if (!this.ok('impacts')) return; const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.18); this.env(g, t, 0.004, 0.55, 0.22); o.connect(g).connect(this.mech); o.start(t); o.stop(t + 0.3);
    const s = this.nz(), f = c.createBiquadFilter(), g2 = c.createGain(); f.type = 'lowpass'; f.frequency.value = 1400; this.env(g2, t, 0.002, 0.35, 0.06); s.connect(f).connect(g2).connect(this.mech); s.start(t); s.stop(t + 0.1);
  }
  servo() {
    if (!this.ok('impacts')) return; const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(420, t + 0.4); f.type = 'lowpass'; f.frequency.value = 900;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(f).connect(g).connect(this.mech); o.start(t); o.stop(t + 0.55);
  }
  chime(final) {
    if (!this.ok('chimes')) return; this.duck(1.6); const c = this.ctx, t0 = c.currentTime;
    const notes = final ? [784, 1175] : [988];
    notes.forEach((f, k) => { const t = t0 + k * 0.16; [1, 2.76, 5.4].forEach((m, j) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * m; this.env(g, t, 0.004, [0.22, 0.08, 0.03][j], 1.3 - j * 0.3); o.connect(g).connect(this.master); o.start(t); o.stop(t + 1.5); }); });
  }
  beep(go) {
    if (!this.ok('chimes')) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = go ? 1320 : 740;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(go ? 0.4 : 0.3, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + (go ? 0.6 : 0.22)); o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.7);
  }
  whoosh() {
    if (!this.ok('motor')) return; const c = this.ctx, t = c.currentTime; const s = this.nz(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(2600, t + 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); s.connect(f).connect(g).connect(this.mech); s.start(t); s.stop(t + 1.3);
  }
  motor(e, off) {
    if (!this.ctx) return; const c = this.ctx;
    if (!this.mot) { const o1 = c.createOscillator(), o2 = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); o1.type = 'sawtooth'; o2.type = 'square'; lp.type = 'lowpass'; g.gain.value = 0; o1.connect(lp); o2.connect(lp); lp.connect(g).connect(this.mech); o1.start(); o2.start(); this.mot = { o1, o2, lp, g }; }
    const t = c.currentTime, m = this.mot, on = this.ok('motor') && !off;
    m.o1.frequency.setTargetAtTime(36 + 120 * e, t, 0.12); m.o2.frequency.setTargetAtTime(54 + 170 * e, t, 0.12); m.lp.frequency.setTargetAtTime(200 + 1500 * e, t, 0.12);
    m.g.gain.setTargetAtTime(on && e > 0.02 ? 0.025 + 0.1 * e : 0, t, 0.15);
  }
  boom(t, a) { const c = this.ctx; const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.5); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9); o.connect(g).connect(this.fan); o.start(t); o.stop(t + 1); }
  voice(midi, t, dur, amp, set) {
    const c = this.ctx, f = 440 * Math.pow(2, (midi - 69) / 12), g = c.createGain(); g.connect(this.fan);
    if (set === 'box') { [[f * 2, 'sine', 1], [f * 4, 'triangle', 0.25]].forEach(([fr, ty, a]) => { const o = c.createOscillator(), gg = c.createGain(); o.type = ty; o.frequency.value = fr; gg.gain.value = a; o.connect(gg).connect(g); o.start(t); o.stop(t + dur + 0.8); }); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.7); return; }
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; lp.connect(g);
    const types = set === 'electro' ? ['square', 'sawtooth'] : ['sawtooth', 'sawtooth'];
    [-7, 7].forEach((det, i) => { const o = c.createOscillator(); o.type = types[i]; o.frequency.value = f; o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 0.35); });
    const base = set === 'electro' ? 2600 : 950; lp.frequency.setValueAtTime(base * 0.5, t); lp.frequency.linearRampToValueAtTime(base * 3, t + 0.06); lp.frequency.exponentialRampToValueAtTime(base, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.03); g.gain.setValueAtTime(amp * 0.8, t + Math.max(0.05, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
  }
  fanfare(force) {
    if (!this.ctx || this.ctx.state !== 'running' || !this.cfg.sound) return; if (!force && !this.cfg.fanfare) return; this.duck(4.5);
    const t0 = this.ctx.currentTime + 0.03, set = this.cfg.set || 'brass';
    [[67, 0, 0.13], [67, 0.15, 0.13], [67, 0.3, 0.13], [72, 0.45, 0.55], [67, 1.02, 0.15], [72, 1.2, 1.6, 1]].forEach(([m, at, dur, ch]) => { (ch ? [m, m + 4, m + 7, m + 12] : [m]).forEach(n => this.voice(n, t0 + at, dur, ch ? 0.14 : 0.22, set)); });
    if (set !== 'box') { this.boom(t0 + 0.45, 0.35); this.boom(t0 + 1.2, 0.6); }
  }
  duck(sec) { if (this.ctx) this.duckUntil = Math.max(this.duckUntil || 0, this.ctx.currentTime + sec); }
  setMusic(key, url) {
    if (!this.ctx) return; const id = key ? key + '|' + (url || '') : ''; if (id === this.musId) return; this.musId = id;
    const had = !!this.cur; this.stopMus(); this.pend = key ? { key, url, at: this.ctx.currentTime + (had ? 0.7 : 0.05) } : null;
  }
  stopMus() { const cur = this.cur; this.cur = null; if (cur && cur.kind === 'file') { try { cur.g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2); } catch (e) {} setTimeout(() => { try { cur.el.pause(); cur.src.disconnect(); } catch (e) {} }, 1200); } }
  startMus(key, url) {
    const c = this.ctx;
    if (url) { try { const el = new Audio(); el.src = url; el.loop = true; const src = c.createMediaElementSource(el), g = c.createGain(); g.gain.value = 0.9; src.connect(g).connect(this.musG); el.play().catch(() => {}); this.cur = { kind: 'file', el, src, g }; return; } catch (e) {} }
    const T = this.tracks[key] || (this.tracks[key] = buildTrack(MUSIC[key] || MUSIC.classic));
    this.cur = { kind: 'synth', T, i: 0, t0: c.currentTime + 0.08 };
  }
  musTick() {
    const c = this.ctx; if (!c) return; const now = c.currentTime, cfg = this.cfg;
    if (this.pend && now >= this.pend.at) { const pd = this.pend; this.pend = null; this.startMus(pd.key, pd.url); }
    const cur = this.cur; let target = 0;
    if (cur && cfg.music) target = cfg.volMus * 1.25 * (cfg.duckMusic && now < (this.duckUntil || 0) ? 0.18 : 1);
    this.musG.gain.setTargetAtTime(target, now, 0.3);
    if (!cur || cur.kind !== 'synth' || c.state !== 'running') return;
    const T = cur.T, ev = T.ev, spb = T.spb, hz = now + 0.35; if (!ev.length) return;
    if (cur.t0 + T.L * spb < now - 0.5) { cur.t0 = now + 0.05; cur.i = 0; }
    for (let k = 0; k < 400; k++) { const e = ev[cur.i], et = cur.t0 + e.t * spb; if (et > hz) break; if (et >= now - 0.02) { if (e.drum) this.drum(e.drum, et, e.a, e.m); else this.note(e.inst, e.m, et, e.d * spb, e.a); } cur.i++; if (cur.i >= ev.length) { cur.i = 0; cur.t0 += T.L * spb; } }
  }
  note(inst, m, t, d, a) {
    const c = this.ctx, f = 440 * Math.pow(2, (m - 69) / 12), g = c.createGain(); g.connect(this.musG);
    const O = (type, fr, det) => { const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(fr, t); if (det) o.detune.value = det; return o; };
    const go = (os, end) => os.forEach(o => { o.start(t); o.stop(end); });
    const perc = dec => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); return t + dec + 0.05; };
    const sus = (att, rel) => { const h = Math.max(att + 0.01, d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + att); g.gain.setValueAtTime(a, t + h); g.gain.exponentialRampToValueAtTime(0.0001, t + h + rel); return t + h + rel + 0.05; };
    const add = (parts, end) => go(parts.map(([k, w]) => { const o = O('sine', f * k), gg = c.createGain(); gg.gain.value = w; o.connect(gg).connect(g); return o; }), end);
    const filt = (type, fr, q) => { const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(fr, t); if (q) fl.Q.value = q; fl.connect(g); return fl; };
    if (inst === 'box') add([[1, 1], [4, .22], [7, .06]], perc(1.4));
    else if (inst === 'bell') add([[1, 1], [2.76, .35], [5.4, .12], [8.93, .04]], perc(2.2));
    else if (inst === 'marimba') add([[1, 1], [3.93, .2]], perc(.55));
    else if (inst === 'vib') { const end = perc(1.8); add([[1, 1], [4, .08]], end); const l = O('sine', 5), lg = c.createGain(); lg.gain.value = a * .35; l.connect(lg).connect(g.gain); go([l], end); }
    else if (inst === 'ep') add([[1, 1], [2, .18], [3, .04]], perc(Math.min(2.6, .5 + d)));
    else if (inst === 'pluck' || inst === 'dombra') { const D = inst === 'dombra', end = perc(D ? .45 : Math.min(1.4, .35 + d)), o = O('sawtooth', f * (D ? 1.012 : 1)); if (D) o.frequency.exponentialRampToValueAtTime(f, t + .05); const fl = filt('lowpass', Math.min(12000, f * 9)); fl.frequency.exponentialRampToValueAtTime(Math.max(180, f * 1.3), t + (D ? .18 : .4)); o.connect(fl); go([o], end); }
    else if (inst === 'flute') { const end = sus(.07, .18), o = O('sine', f), o2 = O('sine', f * 2), g2 = c.createGain(); g2.gain.value = .08; o.connect(g); o2.connect(g2).connect(g); const l = O('sine', 5.2), lg = c.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * .006, t + .3); l.connect(lg).connect(o.frequency); go([o, o2, l], end); }
    else if (inst === 'brass' || inst === 'saw' || inst === 'pad') { const B = inst === 'brass', P = inst === 'pad', end = P ? sus(.45, .9) : B ? sus(.06, .22) : sus(.012, .2), fl = filt('lowpass', P ? 900 : B ? f * 2 : 2400, P ? 0 : 1); if (B) { fl.frequency.linearRampToValueAtTime(f * 5, t + .08); fl.frequency.exponentialRampToValueAtTime(f * 3, t + .4); } const os = [O('sawtooth', f, -9), O('sawtooth', f, 9)]; os.forEach(o => o.connect(fl)); go(os, end); }
    else if (inst === 'sq') { const end = perc(.22), o = O('square', f); o.connect(filt('lowpass', 2200)); go([o], end); }
    else if (inst === 'organ') add([[1, 1], [2, .5], [3, .3], [4, .18]], sus(.02, .12));
    else if (inst === 'bass') { const end = sus(.01, .1), o = O('triangle', f), o2 = O('sine', f), g2 = c.createGain(); g2.gain.value = .6; o.connect(g); o2.connect(g2).connect(g); go([o, o2], end); }
    else if (inst === 'sawbass') { const end = perc(.24), o = O('sawtooth', f); o.connect(filt('lowpass', 520, 3)); go([o], end); }
    else if (inst === 'timp') { const end = perc(1.1), o = O('sine', f * 1.03); o.frequency.exponentialRampToValueAtTime(f, t + .15); o.connect(g); go([o], end); }
  }
  drum(k, t, a, m) {
    if (k === 'timp') { this.note('timp', m, t, 1, a); return; }
    const c = this.ctx, g = c.createGain(); g.connect(this.musG);
    const nz = (type, f, q, dec, att) => { const s = this.nz(), fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + (att || 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); s.connect(fl).connect(g); s.start(t, Math.random() * 0.5); s.stop(t + dec + 0.05); };
    const kick = (f0, f1, dec) => { const o = c.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.12); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(a, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec); o.connect(g); o.start(t); o.stop(t + dec + 0.05); };
    if (k === 'kick') kick(120, 45, 0.32); else if (k === 'thump') kick(90, 50, 0.22);
    else if (k === 'hat') nz('highpass', 7500, 0, 0.045); else if (k === 'shaker') nz('bandpass', 6200, 1.2, 0.08, 0.015);
    else if (k === 'snare') nz('bandpass', 1900, 0.8, 0.16); else if (k === 'brush') nz('lowpass', 4000, 0, 0.2, 0.03);
    else if (k === 'clank') nz('bandpass', 3100, 14, 0.28); else if (k === 'jingle') nz('highpass', 8500, 0, 0.16, 0.004);
  }
  previewMech() { this.unlock(); if (!this.cfg.sound) return; this.duck(2.4); this.whoosh(); let n = 0; const iv = setInterval(() => { this.lastTick = 0; this.tick(0.6 + 0.4 * Math.sin(n / 3)); if (++n > 22) { clearInterval(iv); this.clunk(); } }, 55); }
}

/* ───────────── Machine Renderer ───────────── */
class Machine {
  constructor(canvas, audio, win) {
    this.win = win || window; this.cv = canvas; this.g = canvas.getContext('2d'); this.audio = audio;
    this.cfg = { skin: 'classic', mode: 'dial', intensity: 1, fx: 1, lowGfx: false, flashes: true, digitSpeed: 1, confetti: true, numScale: 1, decor: true, minimal: false };
    this.skin = SKINS.classic; this.scene = { kind: 'boot', N: 150 }; this.key = '';
    this.e = 0; this.power = 0.1; this.t = 0; this.t0 = Date.now();
    this.ang = { dish: 0, ring: 0, scale: 0, gear: 0, arm1: 0.6, arm2: 2.1, vortex: 0, sub: 0, ball: 0, team1: 0, team2: 0 };
    this.chase = 0; this.lastChase = 0; this.anno = 2026; this.dg = []; this.conf = []; this.sparks = []; this.flash = 0; this.shock = null; this.celebrated = true; this.lastTau = 0; this.lastMotor = 0; this.segOn = 0; this.jewelMode = 'off'; this.calibU = 0; this.dishV = 0;
    this.ro = new (this.win.ResizeObserver || ResizeObserver)(() => this.resize()); this.ro.observe(canvas);
    try { const fs = this.win.document.fonts; const bump = () => { this._fontsV = (this._fontsV || 0) + 1; this._trKey = null; }; fs.ready.then(bump); fs.addEventListener('loadingdone', bump); } catch (e) {} this.resize();
    this.lastTs = performance.now(); this.frame = this.frame.bind(this); this.raf = this.win.requestAnimationFrame(this.frame);
  }
  destroy() { try { this.win.cancelAnimationFrame(this.raf); } catch (e) {} this.ro.disconnect(); if (this.audio) this.audio.motor(0, true); }
  resize() { const r = this.cv.getBoundingClientRect(); this.W = Math.max(1, r.width); this.H = Math.max(1, r.height); this.dpr = Math.min(this.win.devicePixelRatio || 1, this.cfg.lowGfx ? 1 : 2); this.cv.width = Math.round(this.W * this.dpr); this.cv.height = Math.round(this.H * this.dpr); this.layout(); }
  layout() { const ins = Math.min(this.cfg.leftInset || 0, this.W * 0.3), w = this.W - ins; this.cx = ins + w / 2; this.cy = this.H * 0.52; this.R = Math.min(this.H * 0.35, w * 0.245); this.bg = null; }
  setConfig(c) { const p = this.cfg; this.cfg = Object.assign({}, p, c); this.skin = SKINS[this.cfg.skin] || SKINS.classic; if (p.skin !== this.cfg.skin || p.minimal !== this.cfg.minimal) { this.bg = null; this.amb = []; this._ambInit = false; } if (p.lowGfx !== this.cfg.lowGfx) this.resize(); else if (p.leftInset !== this.cfg.leftInset) this.layout(); }
  setScene(sc) {
    const key = [sc.kind, sc.cd ? 1 : 0, sc.startAt || 0, sc.ticket || 0, sc.team || '', sc.N || 0, sc.duration || 0, sc.preview ? 1 : 0].join('|'); if (key === this.key) return;
    this.key = key; this.scene = sc; const now = Date.now(), N = sc.N || 150, k = String(N).length; this.t0 = now;
    this.lastCd = null;
    if (sc.kind === 'draw' && sc.team) {
      sc.tm = drawTiming(sc.duration, 1); sc.tm.celebrate = sc.tm.stop + 700; const tau = now - sc.startAt; this.dg = [];
      sc.tA0 = [this.ang.team1, this.ang.team2]; sc.tKey = null; this.celebrated = tau >= sc.tm.celebrate; this.lastTau = tau;
    } else if (sc.kind === 'draw') {
      sc.tm = drawTiming(sc.duration, k); const str = String(sc.ticket).padStart(k, '0'), lead = k - String(sc.ticket).length, tau = now - sc.startAt;
      this.dg = [...str].map((ch, i) => { const d = { d: +ch, lead: i < lead, lockAt: sc.tm.locks[i], pos: Math.random() * 10, locked: false, lockU: 0 }; if (tau >= d.lockAt + LOCK_MS) Object.assign(d, { locked: true, pos: d.d, p0: d.d, tgt: d.d, lt: d.lockAt, lockU: 1 }); return d; });
      this.celebrated = tau >= sc.tm.celebrate; this.lastTau = tau;
    } else if (sc.kind === 'calib') {
      const D = sc.duration; this.dg = Array.from({ length: k }, (_, i) => ({ d: 0, lead: i < k - 1, lockAt: D * 0.84 + D * 0.1 * (i / k), pos: (this.dg[i] && this.dg[i].pos) || 0, locked: false, lockU: 0 })); this.lastTau = now - sc.startAt;
    } else if (sc.kind === 'idle') {
      const prev = this.dg; this.dg = Array.from({ length: k }, (_, i) => ({ d: 0, lead: i < k - 1, lockAt: 80 + i * 150, pos: (prev.length === k && prev[i]) ? prev[i].pos : 0, locked: false, lockU: 0 })); this.lastTau = 0;
    } else {
      this.dg = Array.from({ length: k }, (_, i) => ({ d: 0, lead: i < k - 1, pos: 0, locked: true, lockU: 1, p0: 0, tgt: 0, lt: -1e9 }));
    }
  }
  frame(ts) { if (this.win.closed) return; this.raf = this.win.requestAnimationFrame(this.frame); const dt = Math.min(0.05, Math.max(0.001, (ts - this.lastTs) / 1000)); this.lastTs = ts; this.t += dt; try { this.update(Date.now(), dt); this.draw(dt); } catch (err) { if (!this._errLogged) { console.error(err); this._errLogged = true; } } }
  updDigits(tau, dt, speed, silent) {
    for (const d of this.dg) {
      if (!d.locked) {
        if (d.lockAt != null && tau >= d.lockAt) { d.locked = true; d.p0 = d.pos; const fl = Math.floor(d.p0); d.tgt = fl + 10 + (((d.d - (fl % 10)) % 10) + 10) % 10; d.lt = d.lockAt; if (!silent && tau - d.lockAt < 250 && this.audio) this.audio.clunk(); }
        else { d.pos += speed * dt; if (d.pos > 1e5) d.pos -= 1e5; }
      }
      if (d.locked) { const u = clamp((tau - d.lt) / LOCK_MS); d.lockU = u; d.pos = u >= 1 ? d.tgt : d.p0 + (d.tgt - d.p0) * easeOutBack(u); }
    }
  }
  update(now, dt) {
    const sc = this.scene, ds = this.cfg.digitSpeed || 1, A = this.audio; let eT = 0.08, pT = 1, tau = 0, speed = 0, silent = false; this.segOn = 1; this.jewelMode = 'idle';
    const cross = m => this.lastTau < m && tau >= m;
    if (sc.kind === 'boot') { eT = 0; pT = 0.1; this.segOn = 0; this.jewelMode = 'off'; }
    else if (sc.kind === 'calib') {
      tau = now - sc.startAt; const D = sc.duration, u = clamp(tau / D), B = [0, 0.22, 0.48, 0.82, 1.0001]; let i = 0; while (i < 3 && u >= B[i + 1]) i++; const v = clamp((u - B[i]) / (B[i + 1] - B[i])); this.calibU = u; this.jewelMode = 'calib';
      if (i === 0) { eT = 0.02 + 0.1 * v; pT = 0.1 + 0.9 * easeInOut(v); this.segOn = 0; }
      else if (i === 1) { eT = 0.12 + 0.3 * v; this.segOn = v; }
      else if (i === 2) { eT = 0.42 + 0.58 * Math.sin(v * Math.PI); speed = (4 + 20 * this.e) * ds; }
      else { const w = easeOutCubic(v); eT = 0.42 * (1 - w) + 0.08 * w; speed = 4 * ds; }
      if (A) { if (cross(D * B[1]) || cross(D * B[2])) A.servo(); if (cross(D * 0.7)) A.chime(false); if (cross(D)) A.chime(true); }
    } else if (sc.kind === 'draw') {
      tau = now - sc.startAt; const tm = sc.tm;
      if (tau < 0) eT = 0.08; else if (tau < tm.accel) eT = 0.08 + 0.92 * Math.pow(tau / tm.accel, 2); else if (tau < tm.decel) eT = 1; else if (tau < tm.stop) eT = 0.06 + 0.94 * Math.pow(1 - (tau - tm.decel) / (tm.stop - tm.decel), 2); else eT = 0.06;
      speed = (2.5 + 24 * this.e) * ds; this.jewelMode = tau >= tm.celebrate ? 'win' : 'spin';
      if (tau < 0 && sc.cd) { const n = Math.ceil(-tau / 1000); if (n !== this.lastCd && n <= 5) { if (A && -tau > 250) A.beep(false); this.lastCd = n; } }
      if (A && cross(0)) { A.whoosh(); if (this.lastCd !== null) A.beep(true); }
      if (!this.celebrated && tau >= tm.celebrate) { this.celebrated = true; if (tau - tm.celebrate < 1500) this.celebrate(); }
    } else { tau = now - this.t0; speed = 7 * ds; silent = true; }
    this.updDigits(tau, dt, speed, silent); this.lastTau = tau;
    this.e += (eT - this.e) * clamp(dt * 8); this.power += (pT - this.power) * clamp(dt * 4);
    const sp = this.e * (this.cfg.intensity || 1), a = this.ang;
    this.dishV = 0.15 + 9 * sp; a.dish += dt * this.dishV; a.ring += dt * (0.05 + 2.2 * sp); a.scale -= dt * (0.04 + 3 * sp); a.gear += dt * (0.1 + 1.6 * sp); a.arm1 += dt * (0.1 + 1.4 * sp); a.arm2 += dt * (0.07 + 1.1 * sp); a.vortex += dt * (0.3 + 6 * sp); a.sub += dt * (0.4 + 8 * sp); a.ball += dt * (0.25 + 5 * this.e); a.team1 += dt * (0.05 + 1.2 * sp); a.team2 -= dt * (0.04 + 0.9 * sp);
    if (sc.kind === 'draw' && sc.team) this.teamSteer(sc);
    this.chase += dt * (3 + 45 * sp); this.anno += dt * this.e * this.e * 260;
    const ci = Math.floor(this.chase); if (ci !== this.lastChase) { this.lastChase = ci; if (A && (sc.kind === 'draw' || sc.kind === 'calib') && this.e > 0.1) A.tick(this.e); }
    if (A && now - this.lastMotor > 60) { this.lastMotor = now; A.motor(sc.kind === 'boot' ? 0 : this.e); }
    // sparks
    const fxm = [0.4, 1, 1.7][this.cfg.fx] || 1;
    if (!this.cfg.lowGfx && this.e > 0.45 && (sc.kind === 'draw' || sc.kind === 'calib')) { let n = (this.e - 0.45) * 140 * fxm * dt; while (n > 0) { if (Math.random() < n) { const an = Math.random() * TAU, rr2 = this.R * 1.22; this.sparks.push({ x: this.cx + Math.cos(an) * rr2, y: this.cy + Math.sin(an) * rr2, vx: -Math.sin(an) * 420 + Math.cos(an) * 90, vy: Math.cos(an) * 420 + Math.sin(an) * 90, l: 0 }); } n -= 1; } }
    this.sparks = this.sparks.filter(p => { p.l += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; return p.l < 0.55; });
    this.conf = this.conf.filter(p => { p.l += dt; p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) + 720 * dt; p.x += (p.vx + Math.sin(p.l * p.w + p.ph) * 40) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.flip += p.vf * dt; return p.y < this.H + 40 && p.l < 9; });
    this.updAmb(dt);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 1.6);
    if (this.shock) { this.shock.t += dt; if (this.shock.t > 1) this.shock = null; }
  }
  celebrate() {
    const m = [0.45, 1, 1.7][this.cfg.fx] || 1;
    if (this.cfg.confetti) { const n = Math.round(280 * m), C = this.skin.confetti; for (let i = 0; i < n && this.conf.length < 1000; i++) { const side = i % 3; let x, y, vx, vy; if (side < 2) { const an = (side === 0 ? -1.05 : -2.09) + (Math.random() - 0.5) * 0.6, s = 900 + Math.random() * 900; x = side === 0 ? -10 : this.W + 10; y = this.H * 0.85; vx = Math.cos(an) * s; vy = Math.sin(an) * s; } else { x = Math.random() * this.W; y = -20 - Math.random() * 200; vx = (Math.random() - 0.5) * 120; vy = 60 + Math.random() * 200; } this.conf.push({ x, y, vx, vy, l: 0, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 12, flip: Math.random() * TAU, vf: 4 + Math.random() * 8, w: 2 + Math.random() * 4, ph: Math.random() * TAU, s: 7 + Math.random() * 9, c: C[i % C.length], sh: i % 4 }); } }
    if (this.cfg.flashes) this.flash = 1;
    this.shock = { t: 0 };
    if (this.audio) this.audio.fanfare();
  }
  glow(g, x, y, r, col, a) { if (a <= 0.004 || r <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(col, Math.min(1, a))); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); }
  metal(g, x, y, stops, rot) { if (g.createConicGradient && !this.cfg.lowGfx) { const cg = g.createConicGradient((rot || 0) - Math.PI / 2, x, y); stops.forEach((c, i) => cg.addColorStop(i / (stops.length - 1), c)); return cg; } const R = this.R, lg = g.createLinearGradient(x - R, y - R, x + R, y + R); stops.forEach((c, i) => lg.addColorStop(i / (stops.length - 1), c)); return lg; }
  linMetal(g, x0, y0, x1, y1) { const S = this.skin, lg = g.createLinearGradient(x0, y0, x1, y1); [S.metal[4], S.metal[3], S.metal[1], S.metal[0]].forEach((c, i) => lg.addColorStop(i / 3, c)); return lg; }
  ann(g, x, y, r1, r2) { g.beginPath(); g.arc(x, y, r2, 0, TAU); g.arc(x, y, r1, 0, TAU, true); g.closePath(); }
  ring(g, r1, r2, rot, darken) {
    const S = this.skin, { cx, cy, R } = this; this.ann(g, cx, cy, r1, r2); g.fillStyle = this.metal(g, cx, cy, S.metal, rot); g.fill();
    if (darken) { g.fillStyle = 'rgba(0,0,0,' + darken + ')'; g.fill(); }
    const lw = Math.max(1, R * 0.006); g.lineWidth = lw; g.strokeStyle = rgba(S.hi, 0.5); g.beginPath(); g.arc(cx, cy, r2 - lw / 2, 0, TAU); g.stroke(); g.strokeStyle = rgba(S.lo, 0.85); g.beginPath(); g.arc(cx, cy, r1 + lw / 2, 0, TAU); g.stroke();
    if (S.ring === 'neon') { g.save(); g.globalCompositeOperation = 'lighter'; const a = this.power * (0.35 + 0.65 * this.e); [r1, r2].forEach(r => { g.strokeStyle = rgba(S.glow, 0.15 * a); g.lineWidth = R * 0.03; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); g.strokeStyle = rgba(S.glow, 0.8 * a); g.lineWidth = Math.max(1, R * 0.005); g.stroke(); }); g.restore(); }
  }
  renderBg() {
    const b = document.createElement('canvas'), dpr = this.dpr; b.width = Math.round(this.W * dpr); b.height = Math.round(this.H * dpr); const g = b.getContext('2d'); g.scale(dpr, dpr);
    const S = this.skin, { W, H, cx, cy, R } = this, big = Math.hypot(W, H) * 0.6;
    let gr = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, big); gr.addColorStop(0, S.bg[0]); gr.addColorStop(0.5, S.bg[1]); gr.addColorStop(1, S.bg[2]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (!this.cfg.minimal) {
      const st = S.bgStyle;
      if (st === 'stone') {
        const rh = H / 8, bw = W / 6; for (let r = 0; r < 9; r++) { const off = (r % 2) * bw / 2; for (let x = -bw + off; x < W + bw; x += bw) { const sh = hash(r * 31 + Math.round(x)); g.fillStyle = 'rgba(255,220,170,' + (0.012 + sh * 0.025) + ')'; rr(g, x + 3, r * rh + 3, bw - 6, rh - 6, 6); g.fill(); } }
        const fy = cy + R * 1.2; gr = g.createLinearGradient(0, fy, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, fy, W, H - fy);
        g.save(); g.translate(cx, cy + R * 1.3); g.scale(1, 0.2); gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.8); gr.addColorStop(0, rgba(S.glow, 0.14)); gr.addColorStop(1, rgba(S.glow, 0)); g.fillStyle = gr; g.fillRect(-R * 2, -R * 2, R * 4, R * 4); g.restore();
      } else if (st === 'grid' || st === 'stars') {
        if (st === 'stars') for (let i = 0; i < 320; i++) { const s = hash(i + 77); g.fillStyle = 'rgba(255,255,255,' + (0.12 + s * 0.6) + ')'; g.beginPath(); g.arc(hash(i) * W, hash(i + 999) * H * 0.75, 0.4 + s * 1.3, 0, TAU); g.fill(); }
        else { g.fillStyle = rgba(S.glow, 0.1); for (let x = 18; x < W; x += 36) for (let y = 18; y < cy + R * 0.9; y += 36) g.fillRect(x, y, 1.5, 1.5); }
        const hy = cy + R * 0.95; g.strokeStyle = rgba(st === 'stars' ? S.glow : S.glow, 0.16); g.lineWidth = 1;
        for (let i = -26; i <= 26; i++) { g.beginPath(); g.moveTo(cx + i * W * 0.02, hy); g.lineTo(cx + i * W * 0.16, H); g.stroke(); }
        for (let j = 1; j < 14; j++) { const y = hy + (H - hy) * Math.pow(j / 14, 1.8); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
        gr = g.createLinearGradient(0, hy - R * 0.5, 0, hy + R * 0.3); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.62, rgba(S.glow2, 0.22)); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, hy - R * 0.5, W, R * 0.8);
      } else if (st === 'rays') {
        g.save(); g.translate(cx, cy); for (let i = 0; i < 56; i++) { const a = i / 56 * TAU; g.fillStyle = rgba(S.glow, i % 2 ? 0.022 : 0.045); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, big * 1.4, a, a + TAU / 112); g.closePath(); g.fill(); }
        [1.62, 1.85, 2.15].forEach((k, i) => { g.strokeStyle = rgba(S.glow, 0.12 - i * 0.03); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * k, 0, TAU); g.stroke(); }); g.restore();
      } else if (st === 'plates') {
        const pw = W / 6, ph = H / 4; for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { const x = i * pw - (j % 2) * pw / 2, y = j * ph; const lg = g.createLinearGradient(x, y, x + pw, y + ph); lg.addColorStop(0, 'rgba(255,255,255,0.04)'); lg.addColorStop(1, 'rgba(0,0,0,0.14)'); g.fillStyle = lg; rr(g, x + 2, y + 2, pw - 4, ph - 4, 5); g.fill(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.stroke(); g.fillStyle = 'rgba(255,255,255,.09)'; [[x + 14, y + 14], [x + pw - 14, y + 14], [x + 14, y + ph - 14], [x + pw - 14, y + ph - 14]].forEach(([a, c]) => { g.beginPath(); g.arc(a, c, 3, 0, TAU); g.fill(); }); }
      }
    }
    if (!this.cfg.minimal) this.bgExtra(g, S.bgStyle);
    gr = g.createRadialGradient(cx, cy, Math.min(W, H) * 0.35, cx, cy, big); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.78)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    this.bg = b;
  }
  bgExtra(g, st) {
    const S = this.skin, { W, H, cx, cy, R } = this, big = Math.hypot(W, H);
    const stars = (n, maxY, a) => { for (let i = 0; i < n; i++) { const s = hash(i + 41); g.fillStyle = 'rgba(255,255,255,' + (a * (0.3 + s * 0.7)) + ')'; g.beginPath(); g.arc(hash(i * 3 + 1) * W, hash(i * 7 + 2) * maxY, 0.5 + s * 1.4, 0, TAU); g.fill(); } };
    const hills = (cols, base) => cols.forEach((c, k) => { g.beginPath(); g.moveTo(0, H); const y0 = H * (base + k * 0.05); for (let x = 0; x <= W + 20; x += 20) g.lineTo(x, y0 + Math.sin(x / W * 5 + k * 2) * H * 0.025 + Math.sin(x / W * 13 + k) * H * 0.01); g.lineTo(W, H); g.closePath(); g.fillStyle = c; g.fill(); });
    const fir = (x, y, h, col) => { g.fillStyle = col; for (let k = 0; k < 3; k++) { const w = h * (0.36 - k * 0.08), ty = y - h * (0.2 + k * 0.24); g.beginPath(); g.moveTo(x, ty - h * 0.32); g.lineTo(x - w, ty + h * 0.06); g.lineTo(x + w, ty + h * 0.06); g.closePath(); g.fill(); } g.fillRect(x - h * 0.04, y - h * 0.16, h * 0.08, h * 0.16); };
    const rays = (x, y, n, col, a, len) => { g.save(); g.translate(x, y); for (let i = 0; i < n; i++) { const an = i / n * TAU; g.fillStyle = rgba(col, i % 2 ? a * 0.5 : a); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, len, an, an + TAU / n / 2); g.closePath(); g.fill(); } g.restore(); };
    const star5 = (x, y, r, col) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath(); g.fillStyle = col; g.fill(); };
    const horn = (x, y, s, rot, col, lw) => { g.save(); g.translate(x, y); g.rotate(rot); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, s * 0.5); g.lineTo(0, 0); [-1, 1].forEach(m => { g.moveTo(0, 0); g.bezierCurveTo(m * s * 0.05, -s * 0.45, m * s * 0.75, -s * 0.55, m * s * 0.78, -s * 0.12); g.bezierCurveTo(m * s * 0.8, s * 0.22, m * s * 0.38, s * 0.24, m * s * 0.36, -s * 0.04); g.bezierCurveTo(m * s * 0.35, -s * 0.18, m * s * 0.52, -s * 0.2, m * s * 0.55, -s * 0.08); }); g.stroke(); g.restore(); };
    if (st === 'comic') {
      rays(cx, cy, 36, S.glow, 0.07, big);
      for (let y = 10, row = 0; y < H; y += 22, row++) for (let x = 10 + (row % 2) * 11; x < W; x += 22) { const r = clamp((Math.hypot(x - cx, y - cy) / (big * 0.5) - 0.35) * 7, 0, 7); if (r > 0.3) { g.fillStyle = rgba(S.glow, 0.15); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
      g.save(); g.fillStyle = '#111'; g.fillRect(0, H - 14, W, 14); g.beginPath(); g.rect(0, H - 14, W, 14); g.clip(); g.fillStyle = rgba(S.glow, 0.9); for (let x = -40; x < W + 40; x += 40) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + 20, H - 14); g.lineTo(x + 40, H - 14); g.lineTo(x + 20, H); g.closePath(); g.fill(); } g.restore();
    } else if (st === 'halloween') {
      stars(160, H * 0.6, 0.8);
      const mx = W * 0.84, my = H * 0.24, mr = Math.min(W, H) * 0.09;
      this.glow(g, mx, my, mr * 3.4, '#ffcf8a', 0.22);
      const mg = g.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr); mg.addColorStop(0, '#fff2cc'); mg.addColorStop(1, '#f2b25a'); g.fillStyle = mg; g.beginPath(); g.arc(mx, my, mr, 0, TAU); g.fill();
      [[0.3, -0.2, 0.18], [-0.35, 0.25, 0.12], [0.1, 0.45, 0.09]].forEach(([a, b, c]) => { g.beginPath(); g.arc(mx + a * mr, my + b * mr, c * mr, 0, TAU); g.fillStyle = 'rgba(160,90,30,.25)'; g.fill(); });
      const web = (x, y, sx, s) => { g.save(); g.translate(x, y); g.scale(sx, 1); g.strokeStyle = 'rgba(230,220,255,.2)'; g.lineWidth = 1.2; for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * s, Math.sin(a) * s); g.stroke(); } for (let k = 1; k <= 5; k++) { const r = s * k / 5.5; g.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; if (!i) g.moveTo(r, 0); else { const pa = (i - 0.5) / 6 * Math.PI / 2; g.quadraticCurveTo(Math.cos(pa) * r * 0.86, Math.sin(pa) * r * 0.86, Math.cos(a) * r, Math.sin(a) * r); } } g.stroke(); } g.restore(); };
      web(W, 0, -1, Math.min(W, H) * 0.26);
      hills(['#170b20', '#0a050e'], 0.85);
      const pumpkin = (x, y, s) => { this.glow(g, x, y, s * 2.4, '#ff8a1a', 0.3); for (let k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(x + k * s * 0.26, y, s * 0.4, s * 0.6, 0, 0, TAU); g.fillStyle = k % 2 ? '#c9580c' : '#ea7414'; g.fill(); } g.fillStyle = '#3d6b1f'; g.fillRect(x - s * 0.06, y - s * 0.78, s * 0.12, s * 0.22); g.fillStyle = '#ffd34a'; [-0.3, 0.3].forEach(a => { g.beginPath(); g.moveTo(x + a * s - s * 0.13, y - s * 0.02); g.lineTo(x + a * s, y - s * 0.26); g.lineTo(x + a * s + s * 0.13, y - s * 0.02); g.closePath(); g.fill(); }); g.beginPath(); g.arc(x, y + s * 0.02, s * 0.42, 0.15 * Math.PI, 0.85 * Math.PI); g.arc(x, y - s * 0.14, s * 0.46, 0.78 * Math.PI, 0.22 * Math.PI, true); g.closePath(); g.fill(); };
      pumpkin(W * 0.9, H * 0.9, H * 0.055); pumpkin(W * 0.96, H * 0.94, H * 0.035); pumpkin(W * 0.04, H * 0.93, H * 0.04);
    } else if (st === 'ornament') {
      rays(cx, cy, 48, S.glow2, 0.03, big);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; horn(cx + Math.cos(a) * R * 1.68, cy + Math.sin(a) * R * 1.68, R * 0.2, a + Math.PI / 2, rgba(S.glow2, 0.3), 3); }
      g.strokeStyle = rgba(S.glow2, 0.22); g.lineWidth = 2; [1.5, 1.86].forEach(k => { g.beginPath(); g.arc(cx, cy, R * k, 0, TAU); g.stroke(); });
      const bh = Math.min(64, H * 0.075); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, H - bh, W, bh);
      for (let x = bh * 0.6; x < W; x += bh * 1.25) horn(x, H - bh * 0.42, bh * 0.7, 0, rgba(S.glow2, 0.45), 2.5);
    } else if (st === 'winter' || st === 'xmas') {
      if (st === 'winter') stars(220, H * 0.7, 0.9);
      else { for (let i = 0; i < 70; i++) star5(hash(i * 5 + 3) * W, hash(i * 11 + 7) * H * 0.8, 2 + hash(i) * 5, rgba(S.glow, 0.1 + hash(i + 9) * 0.2)); }
      hills(st === 'winter' ? ['rgba(190,215,240,.28)', 'rgba(225,238,252,.45)'] : ['rgba(255,240,230,.18)', 'rgba(255,250,245,.32)'], 0.86);
      const fc = st === 'winter' ? '#0b2238' : '#0f3a1e';
      [[0.03, 0.17], [0.08, 0.12], [0.12, 0.08], [0.88, 0.1], [0.93, 0.16], [0.975, 0.12]].forEach(([fx, fh]) => { const x = fx * W, y = H * 0.93, hh = H * fh; fir(x, y, hh, fc); if (st === 'xmas') star5(x, y - hh * 0.84, hh * 0.08, '#ffd25e'); });
    } else if (st === 'hearts') {
      for (let i = 0; i < 46; i++) { const s = 20 + hash(i + 5) * 90; heart(g, hash(i * 3 + 2) * W, hash(i * 7 + 1) * H, s); g.fillStyle = rgba(i % 3 ? S.glow : S.glow2, 0.04 + hash(i + 13) * 0.08); g.fill(); }
    } else if (st === 'victory') {
      rays(cx, cy, 40, '#ffd25e', 0.045, big);
      star5(cx, cy, R * 2, rgba('#ffd25e', 0.06));
      for (let i = 0; i < 26; i++) star5(hash(i * 13 + 1) * W, hash(i * 17 + 4) * H * 0.9, 3 + hash(i + 2) * 6, rgba('#ffd25e', 0.12 + hash(i + 8) * 0.2));
      hills(['rgba(0,0,0,.35)'], 0.9);
    } else if (st === 'spring') {
      const sx = W * 0.86, sy = H * 0.14; rays(sx, sy, 28, '#ffe066', 0.07, big * 0.8); this.glow(g, sx, sy, H * 0.25, '#ffe066', 0.4); g.beginPath(); g.arc(sx, sy, H * 0.06, 0, TAU); g.fillStyle = '#ffe680'; g.fill();
      [[0.12, 0.16, 1], [0.3, 0.08, 0.7], [0.68, 0.2, 0.8]].forEach(([x, y, k]) => { g.fillStyle = 'rgba(255,255,255,.14)'; [[0, 0, 1], [0.7, 0.1, 0.8], [-0.7, 0.12, 0.75], [0.25, -0.35, 0.7]].forEach(([a, b, c]) => { g.beginPath(); g.arc(x * W + a * 60 * k, y * H + b * 60 * k, 46 * k * c, 0, TAU); g.fill(); }); });
      hills(['#1c5e33', '#24753f'], 0.87);
    } else if (st === 'floral') {
      for (let i = 0; i < 50; i++) { g.fillStyle = rgba(i % 2 ? S.glow2 : '#c77dff', 0.03 + hash(i + 3) * 0.07); g.beginPath(); g.arc(hash(i * 3 + 9) * W, hash(i * 5 + 1) * H, 12 + hash(i) * 60, 0, TAU); g.fill(); }
      for (let x = 14, i = 0; x < W; x += 34, i++) { const hh = H * (0.08 + hash(i + 77) * 0.08), top = H - hh, w = 9 + hash(i + 7) * 5; g.strokeStyle = 'rgba(46,138,74,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, H); g.quadraticCurveTo(x + (hash(i) - 0.5) * 20, H - hh * 0.5, x, top + w); g.stroke(); g.fillStyle = rgba(S.balls[i % S.balls.length], 0.75); g.beginPath(); g.moveTo(x - w, top); g.quadraticCurveTo(x - w, top + w * 1.5, x, top + w * 1.5); g.quadraticCurveTo(x + w, top + w * 1.5, x + w, top); g.lineTo(x + w * 0.45, top + w * 0.45); g.lineTo(x, top - w * 0.25); g.lineTo(x - w * 0.45, top + w * 0.45); g.closePath(); g.fill(); }
    } else if (st === 'steppe') {
      rays(cx, cy, 32, '#ffd23a', 0.08, big);
      hills(['rgba(0,30,50,.3)'], 0.9);
      const bw = Math.min(70, W * 0.05); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 0, bw, H);
      for (let y = bw * 0.6; y < H; y += bw * 1.25) horn(bw * 0.5, y, bw * 0.7, Math.PI / 2, rgba('#ffd23a', 0.5), 2.5);
    } else if (st === 'meadow') {
      for (let i = 0; i < 40; i++) { g.fillStyle = rgba(i % 2 ? S.glow : S.glow2, 0.03 + hash(i + 3) * 0.06); g.beginPath(); g.arc(hash(i * 3 + 9) * W, hash(i * 5 + 1) * H * 0.8, 14 + hash(i) * 60, 0, TAU); g.fill(); }
      hills(['#24502a', '#2f6634'], 0.86);
      for (let i = 0; i < 70; i++) { const x = hash(i * 7 + 3) * W, y = H * (0.9 + hash(i * 11 + 5) * 0.09), s = 3 + hash(i + 1) * 4; g.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.ellipse(x + Math.cos(a) * s, y + Math.sin(a) * s, s * 0.8, s * 0.45, a, 0, TAU); g.fill(); } g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(x, y, s * 0.55, 0, TAU); g.fill(); }
      const branch = (x0, y0, dir) => { g.strokeStyle = 'rgba(70,40,25,.85)'; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + dir * W * 0.12, y0 + H * 0.02, x0 + dir * W * 0.22, y0 + H * 0.12); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(x0 + dir * W * 0.08, y0 + H * 0.01); g.quadraticCurveTo(x0 + dir * W * 0.12, y0 + H * 0.08, x0 + dir * W * 0.1, y0 + H * 0.16); g.stroke(); for (let i = 0; i < 22; i++) { const u = hash(i + (dir > 0 ? 3 : 50)), bx = x0 + dir * W * (0.03 + u * 0.19), by = y0 + H * (0.005 + u * u * 0.12) + (hash(i + 9) - 0.5) * 22; g.fillStyle = i % 3 ? 'rgba(255,190,215,.85)' : 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(bx, by, 5 + hash(i + 31) * 6, 0, TAU); g.fill(); } };
      branch(0, H * 0.06, 1); branch(W, H * 0.04, -1);
    } else if (st === 'summer') {
      const sx = W * 0.84, sy = H * 0.14; rays(sx, sy, 24, '#fff0a0', 0.08, big); this.glow(g, sx, sy, H * 0.3, '#ffe066', 0.5); g.beginPath(); g.arc(sx, sy, H * 0.07, 0, TAU); g.fillStyle = '#fff2a0'; g.fill();
      for (let k = 0; k < 4; k++) { const y0 = H * (0.82 + k * 0.045); g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) g.lineTo(x, y0 + Math.sin(x / 70 + k * 1.7) * 6); g.lineTo(W, H); g.closePath(); g.fillStyle = 'rgba(' + (20 + k * 10) + ',' + (110 + k * 15) + ',' + (190 - k * 10) + ',' + (0.5 + k * 0.12) + ')'; g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 60; i++) g.fillRect(hash(i * 3 + 1) * W, H * (0.84 + hash(i * 5) * 0.14), 6 + hash(i) * 14, 2);
    } else if (st === 'autumn') {
      for (let i = 0; i < 46; i++) { g.fillStyle = rgba(i % 2 ? S.glow : S.glow2, 0.03 + hash(i + 3) * 0.07); g.beginPath(); g.arc(hash(i * 3 + 9) * W, hash(i * 5 + 1) * H, 12 + hash(i) * 55, 0, TAU); g.fill(); }
      hills(['#3a1c08', '#241004'], 0.87);
      const tree = (x, y, h) => { g.fillStyle = '#2a1406'; g.fillRect(x - h * 0.04, y - h * 0.55, h * 0.08, h * 0.55); [[0, -0.7, 0.3, '#c8501a'], [-0.18, -0.58, 0.22, '#e07a1a'], [0.2, -0.6, 0.22, '#b8401a'], [0, -0.92, 0.2, '#e8a02a']].forEach(([a, b, c, col]) => { g.beginPath(); g.arc(x + a * h, y + b * h, c * h, 0, TAU); g.fillStyle = rgba(col, 0.85); g.fill(); }); };
      tree(W * 0.06, H * 0.95, H * 0.3); tree(W * 0.13, H * 0.96, H * 0.2); tree(W * 0.93, H * 0.95, H * 0.28); tree(W * 0.86, H * 0.97, H * 0.18);
    }
  }
  teamSteer(sc) {
    const pos = this._trPos && this._trPos[sc.team]; if (!pos) return;
    if (sc.tKey !== this._trKey) { sc.tKey = this._trKey; const A0 = sc.tA0[pos.row], dir = pos.row ? -1 : 1, base = -pos.ang, turns = 4 + Math.round(sc.duration / 2500);
      let F = base + Math.round((A0 - base) / TAU) * TAU; if (dir > 0) { while (F < A0 + turns * TAU) F += TAU; } else { while (F > A0 - turns * TAU) F -= TAU; } sc.tF = F; sc.tRow = pos.row; sc.tW = pos.w; }
    const tm = sc.tm, u = clamp(this.lastTau / tm.stop), a = 0.12, b = 0.45, S = a / 2 + (b - a) + (1 - b) / 3;
    let p; if (u <= a) p = (u * u / (2 * a)); else if (u <= b) p = a / 2 + (u - a); else { const v = (u - b) / (1 - b); p = a / 2 + (b - a) + (1 - b) * (1 - Math.pow(1 - v, 3)) / 3; }
    const ang = sc.tA0[sc.tRow] + (sc.tF - sc.tA0[sc.tRow]) * (p / S); if (sc.tRow) this.ang.team2 = ang; else this.ang.team1 = ang;
  }
  teamRing(g, dr) {
    const { cx, cy, R } = this, rows = [[R * 1.0, R * 1.118], [R * 1.122, dr]];
    const key = this.cfg.teams.join('\u0001') + '|' + Math.round(R) + '|' + this.cfg.skin + '|' + this.dpr + '|' + (this._fontsV || 0);
    if (this._trKey !== key) { this._trKey = key; this._tr = this.buildTeamRing(rows); }
    rows.forEach(([a, b], i) => { this.ring(g, a, b, 0.6 + i * 1.3, 0.1); const img = this._tr[i]; if (!img) return; const s = img.width / this.dpr; g.save(); g.translate(cx, cy); g.rotate(i ? this.ang.team2 : this.ang.team1); g.drawImage(img, -s / 2, -s / 2, s, s); g.restore(); });
    if (this.cfg.drawTarget === 'teams') {
      const S = this.skin, sc = this.scene, stopped = sc.kind === 'draw' && sc.team && sc.tRow != null && this.lastTau >= sc.tm.stop;
      if (stopped) { const [a, b] = rows[sc.tRow], w = sc.tW + 0.06, pul = 0.55 + 0.3 * Math.sin(this.t * 5); g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(S.glow, 0.35 * pul); g.lineWidth = (b - a) * 1.25; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, (a + b) / 2, -Math.PI / 2 - w / 2, -Math.PI / 2 + w / 2); g.stroke(); g.restore(); }
      const py = cy - dr - R * 0.012, pw = R * 0.055; g.beginPath(); g.moveTo(cx, py + R * 0.07); g.lineTo(cx - pw, py - R * 0.03); g.lineTo(cx + pw, py - R * 0.03); g.closePath(); g.fillStyle = this.linMetal(g, cx - pw, 0, cx + pw, 0); g.fill(); g.strokeStyle = S.lo; g.lineWidth = 1.5; g.stroke();
      g.beginPath(); g.arc(cx, py, R * 0.02, 0, TAU); g.fillStyle = S.glow2; g.fill(); this.glow(g, cx, py, R * 0.09, S.glow2, 0.5 + (stopped ? 0.4 * Math.sin(this.t * 6) : 0));
    }
  }
  wrapName(g, name, maxW, maxH) {
    const words = String(name).split(/\s+/); let fs = this.R * 0.2, lines = [];
    for (let it = 0; it < 30; it++) { g.font = '400 ' + fs + 'px Caprasimo, Nunito, Georgia, serif'; lines = []; let cur = ''; for (const w of words) { const t = cur ? cur + ' ' + w : w; if (g.measureText(t).width <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; } } if (cur) lines.push(cur);
      const wide = Math.max.apply(null, lines.map(l => g.measureText(l).width)); if (wide <= maxW && lines.length * fs * 1.12 <= maxH) break; fs *= 0.92; }
    return { fs, lines };
  }
  mTeam(g) {
    const S = this.skin, sc = this.scene, { cx, cy, R } = this, names = (this.cfg.teams && this.cfg.teams.length) ? this.cfg.teams : (sc.team ? [sc.team] : []); if (!names.length) return;
    const pw = R * 1.08, ph = R * 0.62, x = cx - pw / 2, y = cy - ph / 2;
    rr(g, x - R * 0.03, y - R * 0.03, pw + R * 0.06, ph + R * 0.06, R * 0.12); g.fillStyle = this.linMetal(g, x, y, x, y + ph); g.fill(); g.strokeStyle = S.lo; g.lineWidth = 2; g.stroke();
    rr(g, x, y, pw, ph, R * 0.1); g.fillStyle = S.face; g.fill();
    const draw = sc.kind === 'draw' && sc.team, tau = this.lastTau, stopped = draw && tau >= sc.tm.stop;
    let name, al = 1, sc2 = 1;
    if (stopped) { name = sc.team; const u = clamp((tau - sc.tm.stop) / 600); sc2 = 0.6 + 0.4 * easeOutBack(u); al = clamp(u * 2); }
    else if (draw && tau >= 0) { name = names[Math.floor(this.chase / 2.5) % names.length]; al = 0.55; }
    else { name = '?'; al = 0.6; }
    const key = name + '|' + Math.round(R), wr = this._wrap && this._wrap.k === key ? this._wrap.v : (this._wrap = { k: key, v: this.wrapName(g, name, pw * 0.86, ph * 0.8) }).v;
    g.save(); g.translate(cx, cy); g.scale(sc2, sc2); g.font = '400 ' + wr.fs + 'px Caprasimo, Nunito, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba(S.ink, al);
    if (stopped && !this.cfg.lowGfx) { g.shadowColor = S.glow; g.shadowBlur = R * 0.06; }
    const lh = wr.fs * 1.12; wr.lines.forEach((l, i) => g.fillText(l, 0, (i - (wr.lines.length - 1) / 2) * lh)); g.restore();
    const sh = g.createLinearGradient(0, y, 0, y + ph); sh.addColorStop(0, 'rgba(0,0,0,.25)'); sh.addColorStop(0.2, 'rgba(0,0,0,0)'); sh.addColorStop(0.8, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)'); rr(g, x, y, pw, ph, R * 0.1); g.fillStyle = sh; g.fill();
  }
  mCountdown(g) {
    const S = this.skin, { cx, cy, R } = this, rem = -this.lastTau, n = Math.ceil(rem / 1000), f = 1 - (rem % 1000) / 1000;
    g.save(); g.translate(cx, cy);
    g.lineWidth = R * 0.03; g.strokeStyle = rgba(S.glow, 0.25); g.beginPath(); g.arc(0, 0, R * 0.42, 0, TAU); g.stroke();
    g.strokeStyle = S.glow; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, R * 0.42, -Math.PI / 2, -Math.PI / 2 + TAU * f); g.stroke();
    const s = 1.25 - 0.25 * easeOutCubic(clamp(f * 3)); g.scale(s, s); g.font = '400 ' + R * 0.5 + 'px Caprasimo, Nunito, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (!this.cfg.lowGfx) { g.shadowColor = S.glow; g.shadowBlur = R * 0.12; } g.fillStyle = rgba(S.holo || S.glow, 1 - 0.4 * clamp((f - 0.7) / 0.3)); g.fillText(String(Math.max(1, n)), 0, R * 0.03);
    g.restore();
  }
  buildTeamRing(rows) {
    const S = this.skin, R = this.R, names = this.cfg.teams, dpr = this.dpr, FONT = 'Figtree, Nunito, system-ui, sans-serif', SEP = 2.4;
    const mc = document.createElement('canvas').getContext('2d'); mc.font = '700 100px ' + FONT;
    const wOf = s => { let w = 0; for (const ch of s) w += mc.measureText(ch).width; return w / 100; };
    const radii = rows.map(([a, b]) => (a + b) / 2), circ = radii.map(r => TAU * r), widths = names.map(wOf), total = widths.reduce((x, y) => x + y, 0);
    let groups;
    if (names.length > 6) { const target = total * circ[0] / (circ[0] + circ[1]); let acc = 0, k = 0; while (k < names.length - 1 && acc + widths[k] / 2 < target) { acc += widths[k]; k++; } groups = [names.slice(0, k), names.slice(k)]; }
    else groups = [[], names];
    let fs = 0.056 * R; groups.forEach((gr, i) => { if (!gr.length) return; const w = gr.reduce((x, n) => x + wOf(n), 0) + gr.length * SEP; fs = Math.min(fs, circ[i] * 0.98 / w); });
    fs = Math.min(fs, (rows[0][1] - rows[0][0]) * 0.62);
    const neon = S.ring === 'neon', ink = neon ? S.glow : S.lo, hi = rgba(S.hi, 0.45); this._trPos = {};
    return groups.map((gr, i) => {
      if (!gr.length) return null; const r = radii[i], size = Math.ceil(2 * rows[i][1] * dpr) + 4, c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); x.scale(dpr, dpr); x.translate(size / dpr / 2, size / dpr / 2);
      x.font = '700 ' + fs + 'px ' + FONT; x.textAlign = 'center'; x.textBaseline = 'middle';
      let used = 0; gr.forEach(n => { for (const ch of n) used += x.measureText(ch).width; }); const gap = (TAU * r - used) / gr.length; let a = 0;
      gr.forEach(name => { const a0 = a; let nw = 0; for (const ch of name) nw += x.measureText(ch).width; this._trPos[name] = { row: i, ang: a0 + nw / 2 / r, w: nw / r }; for (const ch of name) { const cw = x.measureText(ch).width; x.save(); x.rotate(a + cw / 2 / r); if (!neon) { x.fillStyle = hi; x.fillText(ch, 0, -r + 1); } x.fillStyle = ink; x.fillText(ch, 0, -r); x.restore(); a += cw / r; }
        x.save(); x.rotate(a + gap / 2 / r); x.fillStyle = S.glow2; const d = fs * 0.2; x.beginPath(); x.moveTo(0, -r - d); x.lineTo(d, -r); x.lineTo(0, -r + d); x.lineTo(-d, -r); x.closePath(); x.fill(); x.restore(); a += gap / r; });
      return c;
    });
  }
  spawnAmb(k, init) {
    const { W, H } = this, r = Math.random, S = this.skin, C = S.confetti, B = S.balls;
    const p = { k, l: 0, ph: r() * TAU, w: 0.5 + r() * 1.5, rot: r() * TAU, vr: 0, sw: 0, vx: 0, vy: 0, x: r() * W, y: 0, s: 1, c: C[Math.floor(r() * C.length)] };
    if (k === 'snow') { p.s = 1 + r() * 3.2; p.vy = 18 + p.s * 14; p.sw = 12 + r() * 18; p.y = init ? r() * H : -10; }
    else if (k === 'petals' || k === 'blossom' || k === 'leaves') { p.s = k === 'leaves' ? 8 + r() * 9 : 5 + r() * 7; p.vy = 30 + r() * 40; p.sw = 30 + r() * 30; p.vr = (r() - 0.5) * 3; p.y = init ? r() * H : -20; if (k === 'blossom') p.c = r() < 0.6 ? '#ffffff' : '#ffc4d6'; }
    else if (k === 'hearts') { p.s = 12 + r() * 24; p.vy = -(18 + r() * 30); p.sw = 18; p.y = init ? r() * H : H + 30; p.c = B[Math.floor(r() * B.length)]; }
    else if (k === 'balloons') { p.s = 16 + r() * 16; p.vy = -(25 + r() * 25); p.sw = 14; p.y = init ? r() * H : H + 50; p.c = B[Math.floor(r() * B.length)]; }
    else if (k === 'sparkle') { p.s = 1.5 + r() * 3; p.vy = -(12 + r() * 25); p.sw = 8; p.y = init ? r() * H : H + 10; p.c = r() < 0.7 ? S.glow : '#ffffff'; }
    else if (k === 'quiz') { p.s = 18 + r() * 34; p.vy = -(14 + r() * 20); p.sw = 14; p.y = init ? r() * H : H + 40; p.ch = r() < 0.75 ? '?' : '!'; p.c = r() < 0.75 ? S.glow : S.glow2; }
    else if (k === 'bats') { p.s = 12 + r() * 16; const dir = r() < 0.5 ? 1 : -1; p.vx = dir * (60 + r() * 70); p.x = init ? r() * W : (dir > 0 ? -60 : W + 60); p.y = H * (0.06 + r() * 0.45); }
    else if (k === 'butterflies') { p.s = 8 + r() * 8; const dir = r() < 0.5 ? 1 : -1; p.vx = dir * (30 + r() * 40); p.vy = (r() - 0.5) * 16; p.x = init ? r() * W : (dir > 0 ? -40 : W + 40); p.y = H * (0.15 + r() * 0.6); p.c = B[Math.floor(r() * B.length)]; }
    return p;
  }
  updAmb(dt) {
    const S = this.skin, type = this.cfg.minimal ? null : S.amb, { W, H } = this, t = this.t, r = Math.random;
    if (!type) { this.amb = []; return; }
    const A = this.amb || (this.amb = []), fxm = ([0.5, 1, 1.6][this.cfg.fx] || 1) * (this.cfg.lowGfx ? 0.5 : 1);
    if (type === 'fireworks') {
      this.fwT = (this.fwT || 0) - dt;
      if (this.fwT <= 0 && A.length < 700) { this.fwT = 0.6 + r() * 0.9; const x = W * (0.08 + r() * 0.84), y = H * (0.1 + r() * 0.3), c = S.confetti[Math.floor(r() * S.confetti.length)], n = Math.round(56 * fxm); for (let i = 0; i < n; i++) { const a = i / n * TAU, sp = 70 + r() * 90; A.push({ k: 'fw', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 0, L: 1.1 + r() * 0.7, c }); } }
    } else {
      const target = Math.round(({ snow: 150, hearts: 22, petals: 45, blossom: 45, bats: 7, balloons: 12, sparkle: 60, quiz: 16, leaves: 40, butterflies: 10 })[type] * fxm), init = !this._ambInit;
      let cnt = 0; for (const p of A) if (p.k === type) cnt++;
      while (cnt < target) { A.push(this.spawnAmb(type, init)); cnt++; }
    }
    this._ambInit = true;
    for (let i = A.length - 1; i >= 0; i--) {
      const p = A[i]; p.l += dt;
      if (p.k === 'fw') { p.vx *= 1 - 1.2 * dt; p.vy = p.vy * (1 - 1.2 * dt) + 50 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.l > p.L) A.splice(i, 1); continue; }
      if (p.k !== type) { A.splice(i, 1); continue; }
      p.x += (p.vx + Math.sin(t * p.w + p.ph) * p.sw) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > H + 60 || p.y < -90 || p.x < -130 || p.x > W + 130) A[i] = this.spawnAmb(type, false);
    }
  }
  drawAmb(g, layer) {
    const A = this.amb, t = this.t, front = { snow: 1, petals: 1, blossom: 1, leaves: 1 };
    if (A && A.length) {
      g.save();
      for (const p of A) {
        if ((layer === 'front') !== !!front[p.k]) continue;
        g.globalCompositeOperation = p.k === 'fw' || p.k === 'sparkle' ? 'lighter' : 'source-over';
        if (p.k === 'snow') { g.globalAlpha = 0.3 + 0.15 * p.s; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(p.x, p.y, p.s, 0, TAU); g.fill(); }
        else if (p.k === 'leaves') { g.globalAlpha = 0.85; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(0.5 + 0.5 * Math.abs(Math.cos(t * 1.5 + p.ph)), 1); const s = p.s; g.fillStyle = p.c; g.beginPath(); g.moveTo(0, -s); g.quadraticCurveTo(s * 0.9, -s * 0.2, 0, s); g.quadraticCurveTo(-s * 0.9, -s * 0.2, 0, -s); g.fill(); g.strokeStyle = 'rgba(60,25,5,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -s * 0.8); g.lineTo(0, s * 1.3); g.stroke(); g.restore(); }
        else if (p.k === 'butterflies') { g.globalAlpha = 0.9; g.save(); g.translate(p.x, p.y + Math.sin(t * 1.6 + p.ph) * 18); if (p.vx < 0) g.scale(-1, 1); const s = p.s, f = 0.25 + 0.75 * Math.abs(Math.sin(t * 11 + p.ph)); g.fillStyle = p.c; [-1, 1].forEach(m => { g.save(); g.scale(m * f, 1); g.beginPath(); g.ellipse(s * 0.55, -s * 0.35, s * 0.55, s * 0.42, -0.5, 0, TAU); g.fill(); g.beginPath(); g.ellipse(s * 0.4, s * 0.3, s * 0.38, s * 0.3, 0.5, 0, TAU); g.fill(); g.restore(); }); g.fillStyle = '#2a1a0a'; g.fillRect(-s * 0.06, -s * 0.5, s * 0.12, s); g.restore(); }
        else if (p.k === 'petals' || p.k === 'blossom') { g.globalAlpha = 0.75; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, 0.4 + 0.6 * Math.abs(Math.cos(t * 2 + p.ph))); g.fillStyle = p.c; g.beginPath(); g.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, TAU); g.fill(); g.restore(); }
        else if (p.k === 'hearts') { g.globalAlpha = 0.5; g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(t + p.ph) * 0.3); heart(g, 0, 0, p.s); g.fillStyle = p.c; g.fill(); g.restore(); }
        else if (p.k === 'balloons') { g.globalAlpha = 0.85; const x = p.x, y = p.y, s = p.s; g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y + s * 1.2); g.quadraticCurveTo(x + Math.sin(t * 2 + p.ph) * 8, y + s * 2, x, y + s * 2.8); g.stroke(); const bgr = g.createRadialGradient(x - s * 0.3, y - s * 0.4, s * 0.1, x, y, s * 1.1); bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(0.25, p.c); bgr.addColorStop(1, p.c); g.fillStyle = bgr; g.beginPath(); g.ellipse(x, y, s * 0.85, s * 1.05, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x, y + s); g.lineTo(x - s * 0.15, y + s * 1.22); g.lineTo(x + s * 0.15, y + s * 1.22); g.closePath(); g.fill(); }
        else if (p.k === 'sparkle') { const tw = 0.5 + 0.5 * Math.sin(t * 5 + p.ph), s = p.s * (0.6 + tw * 0.6); g.globalAlpha = 0.3 + 0.7 * tw; g.fillStyle = p.c; g.beginPath(); g.moveTo(p.x, p.y - s * 2); g.lineTo(p.x + s * 0.4, p.y); g.lineTo(p.x, p.y + s * 2); g.lineTo(p.x - s * 0.4, p.y); g.closePath(); g.moveTo(p.x - s * 2, p.y); g.lineTo(p.x, p.y + s * 0.4); g.lineTo(p.x + s * 2, p.y); g.lineTo(p.x, p.y - s * 0.4); g.closePath(); g.fill(); }
        else if (p.k === 'quiz') { g.globalAlpha = 0.24; g.save(); g.translate(p.x, p.y); g.rotate(Math.sin(t * 0.7 + p.ph) * 0.35); g.font = '900 ' + p.s + 'px ' + FIG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = p.s * 0.12; g.strokeStyle = '#000000'; g.strokeText(p.ch, 0, 0); g.fillStyle = p.c; g.fillText(p.ch, 0, 0); g.restore(); }
        else if (p.k === 'bats') { g.globalAlpha = 0.9; g.save(); g.translate(p.x, p.y + Math.sin(t * 2 + p.ph) * 14); if (p.vx < 0) g.scale(-1, 1); bat(g, p.s, Math.sin(t * 14 + p.ph)); g.fillStyle = '#050208'; g.fill(); g.restore(); }
        else if (p.k === 'fw') { const a = 1 - p.l / p.L; g.globalAlpha = a; g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, 1.4 + a * 1.4, 0, TAU); g.fill(); }
      }
      g.restore();
    }
    if (layer === 'front') this.drawGarland(g);
  }
  drawGarland(g) {
    const S = this.skin; if (!S.garland || this.cfg.minimal) return;
    const W = this.W, t = this.t, sag = 26, seg = W / 3, n = Math.max(9, Math.round(W / 52)), yAt = x => -4 + sag * Math.sin(((x % seg) / seg) * Math.PI);
    g.strokeStyle = 'rgba(15,25,15,.9)'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 90; i++) { const x = i / 90 * W; g.lineTo(x, yAt(x)); } g.stroke();
    for (let i = 0; i < n; i++) { const x = (i + 0.5) / n * W, y = yAt(x) + 9, c = S.garland[i % S.garland.length], b = 0.4 + 0.6 * Math.max(0, Math.sin(t * 2.4 + i * 1.7)); g.fillStyle = '#2a2a2a'; g.fillRect(x - 2.5, y - 9, 5, 5); g.beginPath(); g.ellipse(x, y, 5, 8, 0, 0, TAU); g.fillStyle = rgba(c, 0.35 + 0.65 * b); g.fill(); this.glow(g, x, y, 26, c, b * 0.5); }
  }
  hand(g, ang, len, w, col) { g.save(); g.rotate(ang); g.beginPath(); g.moveTo(-w, len * 0.18); g.lineTo(0, -len); g.lineTo(w, len * 0.18); g.closePath(); g.fillStyle = col; g.fill(); g.restore(); }
  subDial(g, x, y, r, kind, label) {
    const S = this.skin, P = this.power, e = this.e, low = this.cfg.lowGfx; g.save(); g.translate(x, y);
    g.save(); if (!low) { g.shadowColor = 'rgba(0,0,0,.65)'; g.shadowBlur = r * 0.35; g.shadowOffsetY = r * 0.08; } g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fillStyle = S.dark[1]; g.fill(); g.restore();
    this.ann(g, 0, 0, r * 0.8, r); g.fillStyle = this.metal(g, 0, 0, S.metal, 0.4); g.fill(); g.strokeStyle = rgba(S.lo, 0.8); g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.arc(0, 0, r * 0.8, 0, TAU); g.fillStyle = S.face; g.fill(); const fg = g.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 0.8); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,' + (0.35 + 0.4 * (1 - P)) + ')'); g.fillStyle = fg; g.fill();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0, r0 = r * 0.76, r1 = r0 - (big ? r * 0.12 : r * 0.06); g.strokeStyle = rgba(S.ink, big ? 0.85 : 0.5); g.lineWidth = big ? 2 : 1; g.beginPath(); g.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); g.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1); g.stroke(); }
    const a = this.ang.sub;
    if (kind === 'chrono') { this.hand(g, a * 0.15, r * 0.45, r * 0.05, S.ink); this.hand(g, a, r * 0.66, r * 0.03, S.ink); this.hand(g, a * 7, r * 0.7, r * 0.015, S.glow2); }
    else if (kind === 'gauge') { const a0 = -Math.PI * 0.75, a1 = Math.PI * 0.75; g.lineWidth = r * 0.08; g.strokeStyle = rgba(S.ink, 0.35); g.beginPath(); g.arc(0, 0, r * 0.56, a0 - Math.PI / 2, a1 - Math.PI / 2); g.stroke(); g.strokeStyle = rgba(S.glow2, 0.9); g.beginPath(); g.arc(0, 0, r * 0.56, a1 - Math.PI / 2 - 0.9, a1 - Math.PI / 2); g.stroke(); const nv = clamp(e * 0.95 + 0.03 * Math.sin(this.t * 31) * e + (this.scene.kind === 'calib' && this.calibU > 0.48 && this.calibU < 0.82 ? 0.15 : 0)); this.hand(g, lerp(a0, a1, nv), r * 0.66, r * 0.035, S.glow2); }
    else if (kind === 'anno') { const v = Math.floor(this.anno) % 10000, s = String(v).padStart(4, '0'), cw = r * 0.25; rr(g, -cw * 2.1, -r * 0.18, cw * 4.2, r * 0.36, r * 0.06); g.fillStyle = S.dark[1]; g.fill(); g.font = '800 ' + (r * 0.26) + 'px ' + FIG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba(S.glow, 0.35 + 0.65 * P); for (let i = 0; i < 4; i++) g.fillText(s[i], -cw * 1.5 + i * cw, r * 0.01); }
    else { this.hand(g, a * 1.7, r * 0.62, r * 0.035, S.ink); this.hand(g, -a * 0.6, r * 0.46, r * 0.05, S.glow2); }
    g.beginPath(); g.arc(0, 0, r * 0.07, 0, TAU); g.fillStyle = S.metal[3]; g.fill(); g.strokeStyle = S.lo; g.lineWidth = 1; g.stroke();
    g.beginPath(); g.ellipse(-r * 0.2, -r * 0.36, r * 0.5, r * 0.22, -0.5, 0, TAU); g.fillStyle = 'rgba(255,255,255,0.07)'; g.fill();
    if (this.cfg.decor) { g.font = '700 ' + Math.max(9, r * 0.15) + 'px ' + FIG; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = rgba(S.hi, 0.5); g.fillText(label, 0, r * 1.22); }
    g.restore();
  }
  draw(dt) {
    const g = this.g, S = this.skin, { W, H, cx, cy, R } = this, P = this.power, e = this.e, low = this.cfg.lowGfx, min = this.cfg.minimal, sc = this.scene;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this.bg) this.renderBg(); g.drawImage(this.bg, 0, 0, W, H);
    this.glow(g, cx, cy, R * 2, S.glow, 0.04 + 0.12 * P * (0.3 + e));
    this.drawAmb(g, 'back');
    // back gears
    if (!min) [[-0.86, -0.84, 0.42, 22, 1], [0.9, 0.82, 0.48, 26, -0.86], [0.98, -0.92, 0.27, 14, 1.55], [-1.02, 0.9, 0.31, 16, -1.4]].forEach(([gx, gy, gr, n, w], i) => {
      const r = R * gr; g.save(); g.translate(cx + gx * R, cy + gy * R); g.rotate(this.ang.gear * w + i); const p = gearPath(r, n, 5);
      const rg = g.createRadialGradient(0, 0, r * 0.1, 0, 0, r); rg.addColorStop(0, S.metal[3]); rg.addColorStop(0.35, S.metal[2]); rg.addColorStop(0.7, S.metal[1]); rg.addColorStop(1, S.metal[4]);
      g.fillStyle = rg; g.fill(p, 'evenodd'); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill(p, 'evenodd'); g.lineWidth = 1.5; g.strokeStyle = rgba(S.lo, 0.8); g.stroke(p); g.restore();
    });
    // armillary rings
    if (!min && !low) [[this.ang.arm1, -0.35, 1.46], [this.ang.arm2, 0.55, 1.38]].forEach(([an, tilt, k]) => {
      const rx = R * k, ry = Math.max(R * 0.03, Math.abs(Math.cos(an)) * rx); g.save(); g.translate(cx, cy); g.rotate(tilt); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, TAU);
      const lg = g.createLinearGradient(-rx, -ry, rx, ry); S.metal.forEach((c, i) => lg.addColorStop(i / (S.metal.length - 1), c)); g.strokeStyle = lg; g.lineWidth = R * 0.04; g.stroke(); g.strokeStyle = rgba(S.lo, 0.6); g.lineWidth = R * 0.008; g.stroke();
      if (S.ring === 'neon') { g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(S.glow, 0.25 * P); g.lineWidth = R * 0.012; g.stroke(); g.globalCompositeOperation = 'source-over'; }
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + an * 0.5; g.beginPath(); g.arc(Math.cos(a) * rx, Math.sin(a) * ry, R * 0.013, 0, TAU); g.fillStyle = S.hi; g.fill(); }
      g.restore();
    });
    // rear dish with vanes
    const dr = R * 1.24; g.beginPath(); g.arc(cx, cy, dr, 0, TAU); const dg = g.createRadialGradient(cx, cy, R * 0.5, cx, cy, dr); dg.addColorStop(0, S.dark[0]); dg.addColorStop(1, S.dark[1]); g.fillStyle = dg; g.fill();
    if (this.cfg.teamsRing && this.cfg.teams && this.cfg.teams.length) this.teamRing(g, dr);
    else { const n = low ? 24 : 44, w = TAU / n * 0.45, blur = Math.min(0.5, this.dishV * 0.02), copies = low || blur < 0.03 ? 1 : 4;
      const vg = g.createRadialGradient(cx, cy, R * 0.9, cx, cy, dr); vg.addColorStop(0, S.metal[4]); vg.addColorStop(0.5, S.metal[1]); vg.addColorStop(1, S.metal[3]);
      for (let c = 0; c < copies; c++) { const off = copies > 1 ? -blur * (copies - 1 - c) / (copies - 1) : 0; g.save(); g.globalAlpha = copies > 1 ? 0.22 + 0.78 * (c / (copies - 1)) * (1 - blur) : 0.9; g.fillStyle = vg; g.beginPath(); const b = this.ang.dish + off; for (let i = 0; i < n; i++) { const a = b + i / n * TAU; g.moveTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9); g.arc(cx, cy, dr * 0.95, a, a + w); g.arc(cx, cy, R * 0.9, a + w, a, true); g.closePath(); } g.fill(); g.restore(); }
      if (blur > 0.06) { this.ann(g, cx, cy, R * 0.95, dr * 0.95); g.fillStyle = rgba(S.metal[1], clamp(blur * 0.9) * 0.55); g.fill(); }
      this.ring(g, dr * 0.94, dr, 0.8);
    }
    // struts + side instruments
    const sides = [[-1.4, -0.44, 0.25, 'chrono', 'CHRONO'], [-1.33, 0.46, 0.2, 'gauge', 'ENERGIA'], [1.4, -0.44, 0.25, 'anno', 'ANNO'], [1.33, 0.46, 0.2, 'twin', 'TEMPUS']];
    if (!min) {
      sides.forEach(([sx, sy]) => { const x1 = cx + Math.sign(sx) * R * 0.95, y1 = cy + sy * R * 0.75, x2 = cx + sx * R, y2 = cy + sy * R; const lg = g.createLinearGradient(x1, y1 - R * 0.04, x1, y1 + R * 0.04); lg.addColorStop(0, S.metal[4]); lg.addColorStop(0.4, S.metal[3]); lg.addColorStop(1, S.metal[0]); g.lineCap = 'round'; g.strokeStyle = lg; g.lineWidth = R * 0.075; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = rgba(S.lo, 0.6); g.lineWidth = R * 0.012; g.stroke(); });
      sides.forEach(([sx, sy, sr, kind, label]) => this.subDial(g, cx + sx * R, cy + sy * R, R * sr, kind, label));
    }
    // main body
    g.save(); if (!low) { g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = R * 0.18; g.shadowOffsetY = R * 0.05; } g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fillStyle = S.dark[1]; g.fill(); g.restore();
    this.ring(g, R * 0.94, R, 0);
    for (let i = 0; i < 32; i++) { if (i % 4 === 2) continue; const a = i / 32 * TAU, x = cx + Math.cos(a) * R * 0.97, y = cy + Math.sin(a) * R * 0.97, rv = R * 0.011; const rg = g.createRadialGradient(x - rv * 0.4, y - rv * 0.4, 0, x, y, rv); rg.addColorStop(0, S.hi); rg.addColorStop(1, S.lo); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rv, 0, TAU); g.fill(); }
    // engraved ring
    this.ring(g, R * 0.83, R * 0.94, 1.3, 0.08);
    g.save(); g.translate(cx, cy); g.rotate(this.ang.ring);
    const engr = S.ring === 'neon' ? rgba(S.glow, 0.35 + 0.6 * P) : rgba(S.lo, 0.85);
    g.strokeStyle = engr; for (let i = 0; i < 120; i++) { const a = i / 120 * TAU, L = i % 10 === 0 ? R * 0.04 : R * 0.018; g.lineWidth = i % 10 === 0 ? 2 : 1; g.beginPath(); g.moveTo(Math.sin(a) * R * 0.93, -Math.cos(a) * R * 0.93); g.lineTo(Math.sin(a) * (R * 0.93 - L), -Math.cos(a) * (R * 0.93 - L)); g.stroke(); }
    const ROM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    g.font = (S.numerals === 'roman' || S.numerals === 'deco' ? '400 ' + R * 0.05 + 'px ' + CAP : '700 ' + R * 0.042 + 'px ' + FIG); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) { const lab = S.numerals === 'roman' ? ROM[i] : S.numerals === 'hex' ? (i * 30).toString(16).toUpperCase().padStart(3, '0') : S.numerals === 'deco' ? (i % 3 === 0 ? ROM[i] : '◆') : String(i * 5).padStart(2, '0'); g.save(); g.rotate(i / 12 * TAU); g.fillStyle = rgba(S.hi, 0.35); g.fillText(lab, 0, -R * 0.862 + 1); g.fillStyle = engr; g.fillText(lab, 0, -R * 0.862); g.restore(); }
    g.restore();
    // lamp ring
    this.ann(g, cx, cy, R * 0.785, R * 0.83); g.fillStyle = S.dark[1]; g.fill();
    { const n = 48, head = this.chase % n, tail = 2 + 10 * e, lr = R * 0.015;
      for (let i = 0; i < n; i++) { let b; if (i / n >= this.segOn) b = 0.03; else if (sc.kind === 'idle' || this.jewelMode === 'win') b = 0.35 + 0.25 * Math.sin(this.t * 2.2 + i * 0.5); else { const dist = (head - i + n) % n; b = 0.15 + 0.85 * Math.exp(-dist / tail); } b *= P;
        const a = i / n * TAU - Math.PI / 2, x = cx + Math.cos(a) * R * 0.807, y = cy + Math.sin(a) * R * 0.807;
        g.beginPath(); g.arc(x, y, lr, 0, TAU); g.fillStyle = rgba(S.glow, 0.12 + 0.88 * b); g.fill(); if (b > 0.7) { g.beginPath(); g.arc(x, y, lr * 0.45, 0, TAU); g.fillStyle = 'rgba(255,255,255,' + (b - 0.6) + ')'; g.fill(); }
        if (!low && b > 0.25) this.glow(g, x, y, lr * 4, S.glow, b * 0.3); }
    }
    // scale ring
    this.ring(g, R * 0.66, R * 0.785, 2.2, 0.2);
    g.save(); g.translate(cx, cy); g.rotate(this.ang.scale); g.font = '700 ' + R * 0.05 + 'px ' + FIG; g.textAlign = 'center'; g.textBaseline = 'middle';
    const sInk = S.ring === 'neon' ? rgba(S.glow, 0.4 + 0.5 * P) : rgba(S.lo, 0.9);
    for (let i = 0; i < 30; i++) { g.save(); g.rotate(i / 30 * TAU); g.fillStyle = sInk; g.fillText(String(i % 10), 0, -R * 0.722); g.fillRect(-1, -R * 0.78, 2, R * 0.022); g.restore(); g.save(); g.rotate((i + 0.5) / 30 * TAU); g.fillStyle = sInk; g.fillRect(-0.75, -R * 0.775, 1.5, R * 0.012); g.restore(); }
    g.restore();
    // inner rim + portal
    this.ring(g, R * 0.6, R * 0.66, 3.1);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + 0.2, x = cx + Math.cos(a) * R * 0.63, y = cy + Math.sin(a) * R * 0.63; g.beginPath(); g.arc(x, y, R * 0.009, 0, TAU); g.fillStyle = S.lo; g.fill(); }
    g.beginPath(); g.arc(cx, cy, R * 0.6, 0, TAU); g.fillStyle = S.dark[1]; g.fill();
    this.glow(g, cx, cy, R * 0.6, S.glow, (0.08 + 0.3 * e) * P);
    g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (let k = 0; k < 7; k++) { const r = R * (0.1 + 0.068 * k), a0 = this.ang.vortex * (1 + k * 0.18) * (k % 2 ? -1 : 1) + k; g.strokeStyle = rgba(k % 2 ? S.glow2 : S.glow, (0.05 + 0.3 * e) * P); g.lineWidth = R * (0.006 + 0.004 * e); g.beginPath(); g.arc(cx, cy, r, a0, a0 + 0.9 + e * 1.4); g.stroke(); }
    g.restore();
    g.save(); g.translate(cx, cy); g.rotate(-this.ang.ring * 1.6); g.fillStyle = rgba(S.glow, 0.3 * P); for (let i = 0; i < 72; i++) { g.save(); g.rotate(i / 72 * TAU); g.fillRect(-0.75, -R * 0.575, 1.5, i % 6 ? R * 0.012 : R * 0.03); g.restore(); } g.restore();
    const ig = g.createRadialGradient(cx, cy, R * 0.42, cx, cy, R * 0.6); ig.addColorStop(0, 'rgba(0,0,0,0)'); ig.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = ig; g.beginPath(); g.arc(cx, cy, R * 0.6, 0, TAU); g.fill();
    // pointer
    g.beginPath(); g.moveTo(cx, cy - R * 0.69); g.lineTo(cx - R * 0.05, cy - R * 0.93); g.lineTo(cx + R * 0.05, cy - R * 0.93); g.closePath(); g.fillStyle = this.linMetal(g, cx - R * 0.05, 0, cx + R * 0.05, 0); g.fill(); g.strokeStyle = S.lo; g.lineWidth = 1.5; g.stroke();
    g.beginPath(); g.arc(cx, cy - R * 0.885, R * 0.022, 0, TAU); g.fillStyle = rgba(S.glow2, 0.3 + 0.7 * P * (0.5 + e * 0.5)); g.fill(); this.glow(g, cx, cy - R * 0.885, R * 0.08, S.glow2, P * (0.2 + 0.5 * e));
    // jewels
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * TAU, x = cx + Math.cos(a) * R * 0.97, y = cy + Math.sin(a) * R * 0.97, m = this.jewelMode; let b = m === 'off' ? 0.06 : m === 'calib' ? (i < Math.floor(this.calibU * 9) ? 1 : 0.12) : m === 'spin' ? (Math.floor(this.chase / 5) % 8 === i ? 1 : 0.28) : m === 'win' ? 0.6 + 0.4 * Math.sin(this.t * 6 + i) : 0.45 + 0.25 * Math.sin(this.t * 1.6 + i * 0.8); b *= P;
      g.beginPath(); g.arc(x, y, R * 0.022, 0, TAU); g.fillStyle = S.lo; g.fill(); g.beginPath(); g.arc(x, y, R * 0.016, 0, TAU); g.fillStyle = rgba(S.glow2, 0.15 + 0.85 * b); g.fill(); if (!low) this.glow(g, x, y, R * 0.07, S.glow2, b * 0.45); }
    // plaque
    if (this.cfg.decor) { const lines = String(this.cfg.plaque || 'BRAINBOY · TIME MACHINE').split('\n'), fs = R * 0.046; g.font = '400 ' + fs + 'px Caprasimo, Nunito, Georgia, serif'; const tw = Math.max.apply(null, lines.map(l => g.measureText(l).width)), pw = Math.min(R * 1.5, Math.max(R * 0.62, tw + R * 0.12)), lh = fs * 1.2, ph = lines.length * lh + R * 0.04, px = cx - pw / 2, py = cy + R * 0.93, sc = Math.min(1, (pw - R * 0.08) / tw);
      rr(g, px, py, pw, ph, Math.min(ph * 0.45, R * 0.05)); g.fillStyle = this.linMetal(g, 0, py, 0, py + ph); g.fill(); g.strokeStyle = S.lo; g.lineWidth = 1.5; g.stroke(); g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach((l, i) => { g.save(); g.translate(cx, py + R * 0.02 + lh * (i + 0.5)); g.scale(sc, 1); g.fillStyle = rgba(S.hi, 0.5); g.fillText(l, 0, 1); g.fillStyle = S.lo; g.fillText(l, 0, 0); g.restore(); }); }
    // reveal
    const win = sc.kind === 'draw' && this.lastTau >= sc.tm.celebrate;
    if (win) this.glow(g, cx, cy, R * 0.95, S.glow, 0.22 + 0.08 * Math.sin(this.t * 3));
    const cells = this.layoutCells(this.dg.length);
    g.save(); g.globalAlpha = 0.25 + 0.75 * P;
    const mode = this.cfg.mode; try { if (sc.kind === 'draw' && sc.cd && this.lastTau < 0) this.mCountdown(g); else if (sc.team || (this.cfg.drawTarget === 'teams' && sc.kind !== 'draw')) this.mTeam(g); else if (mode === 'balls') this.mBalls(g, cells); else if (mode === 'calendar') this.mCal(g, cells); else if (mode === 'pins') this.mPins(g, cells); else if (mode === 'flip') this.mFlip(g, cells); else if (mode === 'holo') this.mHolo(g, cells); else this.mDial(g, cells); } finally { g.restore(); }
    // effects
    if (this.sparks.length) { g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; this.sparks.forEach(p => { g.strokeStyle = rgba(S.glow2, 1 - p.l / 0.55); g.lineWidth = 2; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025); g.stroke(); }); g.restore(); }
    if (this.shock) { const t = this.shock.t; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(S.glow, 0.7 * (1 - t)); g.lineWidth = R * 0.04 * (1 - t) + 1; g.beginPath(); g.arc(cx, cy, R * (0.6 + t * 2.4), 0, TAU); g.stroke(); g.restore(); }
    if (this.flash > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const fg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.8); fg.addColorStop(0, rgba(S.glow2, this.flash * 0.6)); fg.addColorStop(1, rgba(S.glow2, 0)); g.fillStyle = fg; g.fillRect(0, 0, W, H); g.restore(); }
    this.drawAmb(g, 'front');
    if (this.conf.length) this.conf.forEach(p => { g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.cos(p.flip)); g.fillStyle = p.c; if (S.confShape === 'heart' && p.sh < 2) { heart(g, 0, 0, p.s * 1.3); g.fill(); } else if (S.confShape === 'petal' && p.sh < 2) { g.beginPath(); g.ellipse(0, 0, p.s * 0.6, p.s * 0.3, 0, 0, TAU); g.fill(); } else if (p.sh === 1) { g.beginPath(); g.arc(0, 0, p.s * 0.4, 0, TAU); g.fill(); } else if (p.sh === 2) g.fillRect(-p.s * 0.15, -p.s, p.s * 0.3, p.s * 2); else g.fillRect(-p.s / 2, -p.s * 0.3, p.s, p.s * 0.6); g.restore(); });
  }
  layoutCells(k) {
    const R = this.R, ns = this.cfg.numScale || 1, gap = 0.14; let cw = R * 0.33 * ns; const maxW = R * (k <= 3 ? 1.12 : 1.26) * ns;
    if (k * cw + (k - 1) * gap * cw > maxW) cw = maxW / (k + (k - 1) * gap); const ch = cw * 1.42, total = k * cw + (k - 1) * gap * cw, x0 = this.cx - total / 2;
    return Array.from({ length: k }, (_, i) => ({ x: x0 + i * cw * (1 + gap), y: this.cy - ch / 2, w: cw, h: ch }));
  }
  dA(d) { const k = this.scene.kind; if (k === 'boot') return 0.3; if (k === 'idle') return 0.4; if (k === 'calib') return d.locked ? 0.55 : 0.95; return d.locked && d.lead && d.lockU >= 1 ? 0.22 : 1; }
  glyph(g, ch, x, y, size, weight, fam, col) { g.font = weight + ' ' + size + 'px ' + fam; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(ch, x, y + size * 0.04); }
  mDial(g, cells) {
    const S = this.skin; cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const { x, y, w, h } = c, pad = w * 0.1, al = this.dA(d);
      rr(g, x - pad, y - pad, w + pad * 2, h + pad * 2, w * 0.2); g.fillStyle = this.linMetal(g, x, y - pad, x, y + h + pad); g.fill(); g.lineWidth = 2; g.strokeStyle = rgba(S.lo, 0.8); g.stroke();
      g.save(); rr(g, x, y, w, h, w * 0.14); g.fillStyle = S.face; g.fill(); g.clip();
      const v = mod10(d.pos), base = Math.floor(v), f = v - base, step = h * 0.8;
      for (let j = -1; j <= 2; j++) this.glyph(g, String((base + j + 10) % 10), x + w / 2, y + h / 2 + (j - f) * step, h * 0.62, '800', FIG, rgba(S.ink, al));
      const sh = g.createLinearGradient(0, y, 0, y + h); sh.addColorStop(0, 'rgba(0,0,0,.65)'); sh.addColorStop(0.28, 'rgba(0,0,0,0)'); sh.addColorStop(0.72, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.65)'); g.fillStyle = sh; g.fillRect(x, y, w, h);
      rr(g, x + w * 0.06, y + h * 0.04, w * 0.88, h * 0.28, w * 0.1); g.fillStyle = 'rgba(255,255,255,.10)'; g.fill(); g.restore();
      g.fillStyle = S.glow2; [[x - pad * 0.9, 1], [x + w + pad * 0.9, -1]].forEach(([px, s]) => { g.beginPath(); g.moveTo(px, y + h / 2 - pad * 0.5); g.lineTo(px + s * pad * 0.7, y + h / 2); g.lineTo(px, y + h / 2 + pad * 0.5); g.closePath(); g.fill(); });
    });
  }
  mFlip(g, cells) {
    const S = this.skin; cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const { x, y, w, h } = c, pad = w * 0.08, mid = y + h / 2, al = this.dA(d);
      rr(g, x - pad, y - pad, w + pad * 2, h + pad * 2, w * 0.14); g.fillStyle = S.dark[1]; g.fill(); g.strokeStyle = this.linMetal(g, x, y - pad, x, y + h + pad); g.lineWidth = 3; g.stroke();
      const v = mod10(d.pos), base = Math.floor(v), f = v - base, cur = base, nxt = (base + 1) % 10;
      const half = (dig, top, sy) => { g.save(); g.beginPath(); if (top) g.rect(x, y, w, h / 2 - 1); else g.rect(x, mid + 1, w, h / 2 - 1); g.clip(); g.translate(0, mid); g.scale(1, Math.max(0.001, sy)); g.translate(0, -mid);
        rr(g, x, y, w, h, w * 0.1); const fg = g.createLinearGradient(0, y, 0, y + h); fg.addColorStop(0, rgba(S.flap, 1)); fg.addColorStop(0.5, rgba(S.flapInk, 0.06)); fg.addColorStop(1, rgba(S.flap, 1)); g.fillStyle = S.flap; g.fill(); g.fillStyle = fg; g.fill();
        this.glyph(g, String(dig), x + w / 2, mid, h * 0.72, '800', FIG, rgba(S.flapInk, al)); g.fillStyle = 'rgba(0,0,0,' + ((1 - sy) * 0.6 + (top ? 0 : 0.12)) + ')'; g.fillRect(x, y, w, h); g.restore(); };
      half(nxt, true, 1); half(cur, false, 1); if (f < 0.5) half(cur, true, 1 - f * 2); else half(nxt, false, (f - 0.5) * 2);
      g.fillStyle = 'rgba(0,0,0,.85)'; g.fillRect(x, mid - 1.5, w, 3); g.fillStyle = this.linMetal(g, 0, mid - pad * 0.4, 0, mid + pad * 0.4); g.fillRect(x - pad * 0.8, mid - pad * 0.35, pad * 0.8, pad * 0.7); g.fillRect(x + w, mid - pad * 0.35, pad * 0.8, pad * 0.7);
    });
  }
  mCal(g, cells) {
    const S = this.skin; cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const { x, y, w, h } = c, sH = h * 0.14, py = y + sH * 0.6, ph = h - sH * 0.6, al = this.dA(d);
      for (let s = 3; s >= 1; s--) { rr(g, x + s * 1.5, py + s * 3, w, ph, w * 0.06); g.fillStyle = 'rgba(0,0,0,' + (0.15 + s * 0.08) + ')'; g.fill(); rr(g, x + s * 1.2, py + s * 2.4, w, ph, w * 0.06); g.fillStyle = S.paper; g.globalAlpha *= 0.95; g.fill(); g.globalAlpha /= 0.95; }
      const page = dig => { rr(g, x, py, w, ph, w * 0.06); g.fillStyle = S.paper; g.fill(); const pg = g.createLinearGradient(0, py, 0, py + ph); pg.addColorStop(0, 'rgba(0,0,0,.10)'); pg.addColorStop(0.2, 'rgba(0,0,0,0)'); pg.addColorStop(1, 'rgba(0,0,0,.08)'); g.fillStyle = pg; g.fill();
        this.glyph(g, 'BRAINBOY', x + w / 2, py + ph * 0.13, Math.max(8, ph * 0.065), '700', FIG, rgba(S.paperInk, 0.45 * al)); this.glyph(g, String(dig), x + w / 2, py + ph * 0.58, ph * 0.62, '400', CAP, rgba(S.paperInk, al)); g.fillStyle = rgba(S.strip, 0.6 * al); g.fillRect(x + w * 0.2, py + ph * 0.9, w * 0.6, 2); };
      const v = mod10(d.pos), base = Math.floor(v), f = v - base, side = i % 2 ? 1 : -1;
      page((base + 1) % 10);
      g.save(); g.translate(x + w / 2, py); g.rotate(side * f * 0.9); g.translate(side * f * w * 0.6, -f * h * 0.5); g.globalAlpha *= 1 - f * f; g.translate(-(x + w / 2), -py); page(base); g.restore();
      rr(g, x - w * 0.04, y, w * 1.08, sH, w * 0.05); g.fillStyle = S.strip; g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1; g.stroke();
      [0.28, 0.72].forEach(k => { g.beginPath(); g.arc(x + w * k, y + sH * 0.5, sH * 0.32, 0, TAU); g.fillStyle = this.linMetal(g, 0, y, 0, y + sH); g.fill(); g.strokeStyle = S.lo; g.stroke(); });
    });
  }
  pin(g, x, y, h, dig, al) {
    const S = this.skin; g.save(); g.beginPath(); const n = 36; for (let i = 0; i <= n; i++) { const t = i / n; const hw = pinHW(t) * h; if (i === 0) g.moveTo(x + hw, y); else g.lineTo(x + hw, y + t * h); } for (let i = n; i >= 0; i--) { const t = i / n; g.lineTo(x - pinHW(t) * h, y + t * h); } g.closePath();
    const lg = g.createLinearGradient(x - h * 0.3, 0, x + h * 0.3, 0); lg.addColorStop(0, 'rgba(0,0,0,.35)'); lg.addColorStop(0.3, S.pin); lg.addColorStop(0.42, '#ffffff'); lg.addColorStop(0.7, S.pin); lg.addColorStop(1, 'rgba(0,0,0,.4)'); g.fillStyle = S.pin; g.fill(); g.fillStyle = lg; g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.stroke();
    g.clip(); g.fillStyle = S.pinStripe; g.fillRect(x - h, y + h * 0.29, h * 2, h * 0.035); g.fillRect(x - h, y + h * 0.36, h * 2, h * 0.035);
    this.glyph(g, String(dig), x, y + h * 0.7, h * 0.3, '800', FIG, rgba('#1e1a17', al)); g.restore();
  }
  mPins(g, cells) {
    const S = this.skin; cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const { x, y, w, h } = c, al = this.dA(d), cxp = x + w / 2;
      rr(g, x - w * 0.06, y - w * 0.06, w * 1.12, h + w * 0.12, w * 0.3); g.fillStyle = this.linMetal(g, x, y, x, y + h); g.fill();
      g.save(); rr(g, x, y, w, h, w * 0.26); const lg = g.createLinearGradient(x, 0, x + w, 0); lg.addColorStop(0, S.dark[1]); lg.addColorStop(0.5, S.dark[0]); lg.addColorStop(1, S.dark[1]); g.fillStyle = lg; g.fill(); g.clip();
      const v = mod10(d.pos), base = Math.floor(v), f = v - base, su = d.locked ? clamp(1 - d.lockU / 0.3) : 1;
      if (su > 0) { g.save(); g.globalAlpha *= su * 0.9; for (let j = -1; j <= 1; j++) this.pin(g, cxp, y + (f + j) * h * 0.6 - h * 0.05, h * 0.55, (base - j + 10) % 10, al); g.restore(); }
      if (d.locked) { const u = d.lockU, ph = h * 0.86, rest = y + h * 0.07, py = lerp(y - h * 0.95, rest, easeOutBounce(clamp(u * 1.1))); this.pin(g, cxp, py, ph, d.d, al);
        const j = clamp((u - 0.7) / 0.3), jy = rest + ph * 0.72; g.fillStyle = this.linMetal(g, 0, jy - h * 0.05, 0, jy + h * 0.05); rr(g, x - w * 0.1 + j * w * 0.1, jy - h * 0.04, w * 0.12, h * 0.08, h * 0.03); g.fill(); rr(g, x + w * 0.98 - j * w * 0.1, jy - h * 0.04, w * 0.12, h * 0.08, h * 0.03); g.fill(); }
      rr(g, x + w * 0.1, y + h * 0.03, w * 0.18, h * 0.94, w * 0.09); g.fillStyle = 'rgba(255,255,255,.07)'; g.fill(); g.restore();
      if (d.locked && d.lockU >= 1 && this.scene.kind === 'draw') this.glow(g, cxp, y + h, w * 0.7, S.glow, 0.35);
    });
  }
  ball(g, x, y, r, col, txt, al, rot) {
    g.save(); g.globalAlpha *= al; const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, col); gr.addColorStop(1, col); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = gr; g.fill();
    const sh = g.createRadialGradient(x, y, r * 0.5, x, y, r); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = sh; g.fill();
    g.beginPath(); g.arc(x, y, r * 0.54, 0, TAU); g.fillStyle = 'rgba(255,255,255,.94)'; g.fill(); g.translate(x, y); g.rotate(rot || 0); this.glyph(g, txt, 0, 0, r * 0.72, '800', FIG, '#1e1a17'); g.restore();
  }
  mBalls(g, cells) {
    const S = this.skin, { cx, cy, R } = this, dr = R * 0.55, e = this.e, n = Math.round([12, 18, 24][this.cfg.fx] || 18), br = R * 0.062;
    const allL = this.dg.every(d => d.locked && d.lockU >= 1) && this.scene.kind === 'draw';
    g.save(); g.beginPath(); g.arc(cx, cy, dr, 0, TAU); g.clip(); const dg = g.createRadialGradient(cx, cy - dr * 0.3, 0, cx, cy, dr); dg.addColorStop(0, 'rgba(255,255,255,.08)'); dg.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = dg; g.fillRect(cx - dr, cy - dr, dr * 2, dr * 2);
    const m = clamp((e - 0.06) * 5);
    for (let j = 0; j < n; j++) { const a = hash(j) * TAU + this.ang.ball * (0.7 + hash(j + 3)) * (j % 2 ? 1 : -1), rad = dr * (0.25 + 0.55 * Math.abs(Math.sin(this.ang.ball * 0.9 * (0.5 + hash(j + 5)) + j))); const row = Math.floor(j / 6), hx = cx + ((j % 6) - 2.5) * br * 2.05 + (row % 2) * br, hy = cy + dr - br * 1.15 - row * br * 1.8;
      this.ball(g, lerp(hx, cx + Math.cos(a) * rad, m), lerp(hy, cy + Math.sin(a) * rad, m), br, S.balls[j % S.balls.length], String(j % 10), allL ? 0.3 : 0.9, a); }
    g.restore();
    g.lineWidth = R * 0.022; g.strokeStyle = this.metal(g, cx, cy, S.metal, 0.5); g.beginPath(); g.arc(cx, cy, dr, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, dr * 0.94, -2.6, -1.6); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = R * 0.012; g.stroke();
    cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const bx = c.x + c.w / 2, bR = c.w * 0.5;
      g.beginPath(); g.arc(bx, cy, bR * 1.06, 0, TAU); g.fillStyle = 'rgba(0,0,0,.42)'; g.fill(); g.strokeStyle = rgba(S.metal[3], 0.6); g.lineWidth = 2; g.stroke();
      if (d.locked && this.scene.kind !== 'idle' && this.scene.kind !== 'boot') { const u = d.lockU; this.ball(g, lerp(cx, bx, easeOutCubic(u)), lerp(cy + dr * 0.6, cy, easeOutBack(u)), bR * lerp(0.35, 1, easeOutBack(u)), S.balls[i % S.balls.length], String(d.d), this.dA(d), (1 - u) * 3); } });
  }
  mHolo(g, cells) {
    const S = this.skin, { cx, cy, R } = this, P = this.power, t = this.t, e = this.e, low = this.cfg.lowGfx;
    const by = cy + R * 0.47; g.beginPath(); g.ellipse(cx, by, R * 0.34, R * 0.06, 0, 0, TAU); g.fillStyle = this.linMetal(g, cx - R * 0.34, 0, cx + R * 0.34, 0); g.fill(); g.strokeStyle = S.lo; g.stroke();
    g.save(); g.globalCompositeOperation = 'lighter'; const c0 = cells[0], cN = cells[cells.length - 1];
    if (c0) { g.beginPath(); g.moveTo(cx - R * 0.3, by); g.lineTo(c0.x - c0.w * 0.3, c0.y - c0.h * 0.1); g.lineTo(cN.x + cN.w * 1.3, cN.y - cN.h * 0.1); g.lineTo(cx + R * 0.3, by); g.closePath(); const cg = g.createLinearGradient(0, by, 0, c0.y); cg.addColorStop(0, rgba(S.holo, 0.3 * P)); cg.addColorStop(1, rgba(S.holo, 0)); g.fillStyle = cg; g.fill(); }
    g.beginPath(); g.ellipse(cx, by, R * 0.26, R * 0.035, 0, 0, TAU); g.fillStyle = rgba(S.holo, 0.6 * P); g.fill();
    cells.forEach((c, i) => { const d = this.dg[i]; if (!d) return; const { x, y, w, h } = c, al = this.dA(d), ccx = x + w / 2, ccy = y + h / 2, size = h * 0.82;
      if (!d.locked || d.lockU < 0.15) { const dig = String(Math.floor(mod10(d.pos))), fr = Math.floor(t * 20); for (let b = 0; b < 4; b++) { g.save(); g.beginPath(); g.rect(x - w, y + b * h / 4, w * 3, h / 4); g.clip(); const off = (hash(fr + b + i * 7) - 0.5) * w * 0.3 * (0.2 + e); this.glyph(g, dig, ccx + off, ccy, size, '800', FIG, rgba(S.holo, (0.35 + 0.4 * hash(fr * 3 + b)) * al)); g.restore(); } }
      else { const u = easeOutCubic(d.lockU); for (let p = 0; p < 26; p++) { const an = hash(p + i * 31) * TAU, dist = R * 0.75 * (1 - u); if (dist < 2) continue; g.beginPath(); g.arc(ccx + Math.cos(an) * dist, ccy + Math.sin(an) * dist * 0.7, 1.5 + hash(p) * 2.5, 0, TAU); g.fillStyle = rgba(S.holo, 1 - u); g.fill(); }
        g.save(); g.translate(ccx, ccy); const s = 1.35 - 0.35 * u; g.scale(s, s); if (!low) { g.shadowColor = S.holo; g.shadowBlur = h * 0.25; } this.glyph(g, String(d.d), 0, 0, size, '800', FIG, rgba(S.holo, u * al * (0.85 + 0.15 * Math.sin(t * 9 + i)))); g.restore(); }
    });
    g.restore();
    if (c0) { g.fillStyle = 'rgba(0,0,0,.28)'; const off = (t * 40) % 5; for (let yy = c0.y + off; yy < c0.y + c0.h; yy += 5) g.fillRect(c0.x - c0.w * 0.2, yy, (cN.x + cN.w) - c0.x + c0.w * 0.4, 1.5); }
  }
}

window.TM = { Machine, AudioEngine, SKINS, drawTiming, MUSIC, buildTrack };
})();
