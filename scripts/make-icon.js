/*
 * Gera build/icon.png (512x512) a partir de logo.png.
 * Recorta apenas o símbolo "Z" — o logotipo completo é largo demais e ficaria
 * ilegível num ícone. electron-builder converte este PNG para .ico no build.
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const RAIZ = path.join(__dirname, "..");
const ENTRADA = path.join(RAIZ, "logo.png");
const SAIDA = path.join(RAIZ, "build", "icon.png");
const LADO = 512;
const MARGEM = 0.10;          // folga proporcional em volta do símbolo
const LIMIAR = 240;           // abaixo disto o pixel não é fundo branco

const png = PNG.sync.read(fs.readFileSync(ENTRADA));
const { width: W, height: H, data } = png;

const tinta = (x, y) => {
  const i = (y * W + x) << 2;
  if (data[i + 3] < 32) return false;                       // transparente
  return data[i] < LIMIAR || data[i+1] < LIMIAR || data[i+2] < LIMIAR;
};

// perfil por linha -> primeiro agrupamento vertical = faixa do símbolo
const linhas = [];
for (let y = 0; y < H; y++) {
  let n = 0;
  for (let x = 0; x < W; x++) if (tinta(x, y)) n++;
  linhas.push(n);
}
function primeiroGrupo(perfil, folga) {
  let ini = perfil.findIndex(v => v > 0);
  if (ini < 0) throw new Error("logo.png parece estar em branco");
  let fim = ini, vazios = 0;
  for (let i = ini; i < perfil.length; i++) {
    if (perfil[i] > 0) { fim = i; vazios = 0; }
    else if (++vazios > folga) break;
  }
  return [ini, fim];
}
const [y0, y1] = primeiroGrupo(linhas, Math.round(H * 0.02));

// dentro da faixa, primeiro agrupamento horizontal = símbolo
// (o ponto vermelho do "İ" fica na mesma faixa vertical, mas bem à direita)
const colunas = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = y0; y <= y1; y++) if (tinta(x, y)) n++;
  colunas.push(n);
}
const [x0, x1] = primeiroGrupo(colunas, Math.round(W * 0.03));

const lg = x1 - x0 + 1, al = y1 - y0 + 1;

// Tela quadrada branca com apenas o símbolo colado no centro. Recortar um
// quadrado direto da imagem original traria o topo do logotipo junto, porque o
// símbolo é mais largo do que alto.
const lado = Math.round(Math.max(lg, al) * (1 + 2 * MARGEM));
const desX = Math.round((lado - lg) / 2), desY = Math.round((lado - al) / 2);
const tela = new Float64Array(lado * lado * 3).fill(255);
for (let y = 0; y < al; y++) {
  for (let x = 0; x < lg; x++) {
    const k = ((y0 + y) * W + (x0 + x)) << 2;
    const a = data[k + 3] / 255;
    const o = ((desY + y) * lado + (desX + x)) * 3;
    tela[o]     = data[k]     * a + 255 * (1 - a);
    tela[o + 1] = data[k + 1] * a + 255 * (1 - a);
    tela[o + 2] = data[k + 2] * a + 255 * (1 - a);
  }
}

// reamostragem por média de área (box filter)
const out = new PNG({ width: LADO, height: LADO });
const passo = lado / LADO;
for (let j = 0; j < LADO; j++) {
  for (let i = 0; i < LADO; i++) {
    let r = 0, g = 0, b = 0, n = 0;
    const sy0 = Math.floor(j * passo), sy1 = Math.max(sy0 + 1, Math.ceil((j + 1) * passo));
    const sx0 = Math.floor(i * passo), sx1 = Math.max(sx0 + 1, Math.ceil((i + 1) * passo));
    for (let sy = sy0; sy < sy1 && sy < lado; sy++) {
      for (let sx = sx0; sx < sx1 && sx < lado; sx++) {
        const o = (sy * lado + sx) * 3;
        r += tela[o]; g += tela[o + 1]; b += tela[o + 2]; n++;
      }
    }
    const o = (j * LADO + i) << 2;
    out.data[o]     = Math.round(r / n);
    out.data[o + 1] = Math.round(g / n);
    out.data[o + 2] = Math.round(b / n);
    out.data[o + 3] = 255;
  }
}

fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
fs.writeFileSync(SAIDA, PNG.sync.write(out));
console.log(
  "icone gerado:", path.relative(RAIZ, SAIDA),
  `(simbolo ${lg}x${al} em ${x0},${y0} -> ${LADO}x${LADO})`
);
