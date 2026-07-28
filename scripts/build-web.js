/*
 * Monta dist-web/ com só o que precisa ser servido como PWA — index.html,
 * manifest, service worker e ícones. É essa pasta que se arrasta para um
 * host estático (Netlify Drop, Cloudflare Pages, etc.).
 */
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const SAIDA = path.join(RAIZ, "dist-web");
const ARQUIVOS = ["index.html", "manifest.webmanifest", "sw.js", "icon-192.png", "icon-512.png"];

fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

ARQUIVOS.forEach(function(f){
  const orig = path.join(RAIZ, f);
  if (!fs.existsSync(orig)) throw new Error("faltando: " + f + " (rode: npm run icone-pwa)");
  fs.copyFileSync(orig, path.join(SAIDA, f));
});

console.log("dist-web/ pronto com:", ARQUIVOS.join(", "));
console.log("Arraste a pasta dist-web para um host estatico (HTTPS) para publicar a PWA.");
