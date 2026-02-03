const resolution = document.getElementById("resolution");
const seed = document.getElementById("seed");
const c1 = document.getElementById("c1");
const c2 = document.getElementById("c2");
const c3 = document.getElementById("c3");
const grain = document.getElementById("grain");
const vignette = document.getElementById("vignette");
const grainVal = document.getElementById("grainVal");
const vignetteVal = document.getElementById("vignetteVal");

const randomSeedBtn = document.getElementById("randomSeed");
const generateBtn = document.getElementById("generate");

function syncLabels() {
  grainVal.textContent = Number(grain.value).toFixed(2);
  vignetteVal.textContent = Number(vignette.value).toFixed(2);
}
syncLabels();

grain.addEventListener("input", syncLabels);
vignette.addEventListener("input", syncLabels);

randomSeedBtn.addEventListener("click", () => {
  seed.value = String(Math.floor(Math.random() * 1_000_000_000));
});

generateBtn.addEventListener("click", async () => {
  const [w, h] = resolution.value.split("x").map(Number);
  const body = {
    type: "gradient",
    width: w,
    height: h,
    seed: seed.value ? Number(seed.value) : Date.now(),
    palette: [c1.value, c2.value, c3.value],
    grain: Number(grain.value),
    vignette: Number(vignette.value),
    format: "png"
  };

  generateBtn.disabled = true;
  generateBtn.textContent = "Generujem… 🧪";

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Request failed");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `wallpaper_${w}x${h}_${body.seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (e) {
    alert(`Chyba: ${e.message}`);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate & Download ⬇️";
  }
});