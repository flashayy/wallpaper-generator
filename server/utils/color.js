export function normalizeHex(hex) {
  if (typeof hex !== "string") return null;
  let h = hex.trim().toLowerCase();
  if (!h.startsWith("#")) h = `#${h}`;

  // #rgb
  if (/^#[0-9a-f]{3}$/.test(h)) {
    const r = h[1], g = h[2], b = h[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  // #rrggbb
  if (/^#[0-9a-f]{6}$/.test(h)) return h;

  return null;
}

export function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return rgbToHex(r, g, bl);
}

function hexToRgb(hex) {
  const h = normalizeHex(hex);
  const r = parseInt(h.slice(1, 3), 16);
  const g = parseInt(h.slice(3, 5), 16);
  const b = parseInt(h.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

function to2(n) {
  const s = Math.max(0, Math.min(255, n)).toString(16);
  return s.length === 1 ? `0${s}` : s;
}