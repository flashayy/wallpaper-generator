import { createCanvas } from "canvas";
import { makeRng } from "../utils/seed.js";
import { normalizeHex, lerpColor } from "../utils/color.js";

export async function generateGradientWallpaper({
  width,
  height,
  seed,
  palette,
  grain = 0.08,
  vignette = 0.22,
  format = "png"
}) {
  const rng = makeRng(seed);

  const colors = palette
    .map((c) => normalizeHex(c))
    .filter(Boolean);

  if (colors.length < 2) {
    throw new Error("Palette must contain at least 2 valid hex colors, e.g. #112233");
  }

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background gradient (pick two or three stops)
  const angle = rng() * Math.PI * 2;
  const x0 = width * (0.5 - Math.cos(angle) * 0.5);
  const y0 = height * (0.5 - Math.sin(angle) * 0.5);
  const x1 = width - x0;
  const y1 = height - y0;

  const grad = ctx.createLinearGradient(x0, y0, x1, y1);

  const c1 = colors[Math.floor(rng() * colors.length)];
  let c2 = colors[Math.floor(rng() * colors.length)];
  if (c2 === c1 && colors.length > 1) c2 = colors[(colors.indexOf(c1) + 1) % colors.length];

  grad.addColorStop(0, c1);

  if (rng() < 0.65 && colors.length >= 3) {
    const cMid = colors[Math.floor(rng() * colors.length)];
    grad.addColorStop(0.5, cMid);
  } else {
    // subtle mid blend for premium look
    grad.addColorStop(0.5, lerpColor(c1, c2, 0.5));
  }

  grad.addColorStop(1, c2);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft vignette (darken edges)
  if (vignette > 0) {
    const vg = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      Math.min(width, height) * 0.1,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.75
    );
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, `rgba(0,0,0,${vignette})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);
  }

  // Grain/noise overlay
  if (grain > 0) {
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;

    // Grain intensity scales with grain param
    const intensity = grain * 40; // tweakable

    for (let i = 0; i < data.length; i += 4) {
      // centered random noise (-0.5..0.5)
      const n = (rng() - 0.5) * intensity;

      data[i] = clamp255(data[i] + n);
      data[i + 1] = clamp255(data[i + 1] + n);
      data[i + 2] = clamp255(data[i + 2] + n);
      // alpha stays
    }

    ctx.putImageData(img, 0, 0);
  }

  if (format === "png") {
    return canvas.toBuffer("image/png");
  }
  return canvas.toBuffer("image/png");
}

function clamp255(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}