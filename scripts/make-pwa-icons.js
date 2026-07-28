/*
 * Gera icon-192.png e icon-512.png (ícones da PWA) a partir de build/icon.png,
 * que já é o símbolo "Z" recortado num quadrado 512×512 por make-icon.js.
 * Roda `make-icon.js` antes se o build/icon.png não existir.
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { PNG } = require("pngjs");

const RAIZ = path.join(__dirname, "..");
const BASE = path.join(RAIZ, "build", "icon.png");

if (!fs.existsSync(BASE)) {
  execFileSync(process.execPath, [path.join(__dirname, "make-icon.js")], { stdio: "inherit" });
}

const src = PNG.sync.read(fs.readFileSync(BASE));

// Reamostragem por média de área (box filter) para um lado alvo.
function redimensionar(png, lado){
  const out = new PNG({ width: lado, height: lado });
  const passo = png.width / lado;
  for (let j = 0; j < lado; j++) {
    for (let i = 0; i < lado; i++) {
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const y0 = Math.floor(j * passo), y1 = Math.max(y0 + 1, Math.ceil((j + 1) * passo));
      const x0 = Math.floor(i * passo), x1 = Math.max(x0 + 1, Math.ceil((i + 1) * passo));
      for (let sy = y0; sy < y1 && sy < png.height; sy++) {
        for (let sx = x0; sx < x1 && sx < png.width; sx++) {
          const o = (sy * png.width + sx) << 2;
          r += png.data[o]; g += png.data[o+1]; b += png.data[o+2]; a += png.data[o+3]; n++;
        }
      }
      const o = (j * lado + i) << 2;
      out.data[o]   = Math.round(r / n);
      out.data[o+1] = Math.round(g / n);
      out.data[o+2] = Math.round(b / n);
      out.data[o+3] = Math.round(a / n);
    }
  }
  return out;
}

[[512, "icon-512.png"], [192, "icon-192.png"]].forEach(function(par){
  const png = par[0] === src.width ? src : redimensionar(src, par[0]);
  fs.writeFileSync(path.join(RAIZ, par[1]), PNG.sync.write(png));
  console.log("gerado:", par[1], par[0] + "x" + par[0]);
});
