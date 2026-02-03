import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { generateGradientWallpaper } from "./generators/gradient.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static frontend
app.use(express.static(path.join(__dirname, "..", "public")));

// health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// main generator
app.post("/api/generate", async (req, res) => {
  try {
    const {
      width = 1920,
      height = 1080,
      seed = Date.now(),
      palette = ["#0B132B", "#1C2541", "#3A506B"],
      grain = 0.08,
      vignette = 0.22,
      format = "png"
    } = req.body || {};

    // basic validation
    const w = clampInt(width, 320, 7680);
    const h = clampInt(height, 320, 7680);
    const g = clampNum(grain, 0, 0.35);
    const v = clampNum(vignette, 0, 0.6);

    const buffer = await generateGradientWallpaper({
      width: w,
      height: h,
      seed: Number(seed) || 1,
      palette: Array.isArray(palette) ? palette : ["#111111", "#333333"],
      grain: g,
      vignette: v,
      format: format === "png" ? "png" : "png"
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="wallpaper_${w}x${h}_${seed}.png"`);
    res.send(buffer);
  } catch (err) {
    res.status(400).json({
      error: "Generation failed",
      message: err?.message || String(err)
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Wallpaper Generator running on http://localhost:${PORT}`);
});

function clampInt(x, min, max) {
  const n = Number(x);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function clampNum(x, min, max) {
  const n = Number(x);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}