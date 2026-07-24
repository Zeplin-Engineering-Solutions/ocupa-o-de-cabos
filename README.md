# Zeplin — Ocupação de Cabos

Aplicação de mesa para verificar a ocupação de eletrodutos, eletrocalhas e perfilados.
O projetista informa os cabos e a infraestrutura planejada; o app calcula a taxa de
ocupação, diz se atende à norma, desenha a vista de corte e exporta em DXF para o projeto.

## Instalar

O instalador está em `dist/`:

    Zeplin-Ocupacao-de-Cabos-Setup-1.1.0.exe

Copie esse arquivo para a máquina de destino e execute. Ele instala por usuário
(não pede senha de administrador), permite escolher a pasta e cria atalhos na
Área de Trabalho e no Menu Iniciar.

> O instalador não é assinado digitalmente. Na primeira execução o Windows
> SmartScreen mostra "Windows protegeu o computador" — clique em
> **Mais informações → Executar assim mesmo**. Para eliminar o aviso é preciso
> um certificado de assinatura de código (EV Code Signing).

Alternativa sem instalar: a pasta `dist/win-unpacked/` roda direto pelo
`Zeplin Ocupacao de Cabos.exe`. Pode ser copiada para um pendrive ou pasta de rede.

## Como usar

O app tem três abas, e a aba escolhida define **qual limite normativo é aplicado**:

| Aba | Cabos disponíveis | Limite aplicado |
|---|---|---|
| **Elétrica — NBR 5410** | catálogo Prysmian (energia, BT e MT) | 53 % / 31 % / 40 % conforme o nº de cabos |
| **Cabeamento estruturado — NBR 16415** | CAT 5e a CAT 7 **+** linha WaveOne | 40 % fixo (60 % considerado cheio) |
| **Som / sinal — NBR 5410** | linha WaveOne | 53 % / 31 % / 40 % conforme o nº de cabos |

Os cabos WaveOne aparecem em duas abas de propósito: o mesmo cabo, com o mesmo
diâmetro, muda de critério conforme o contexto do projeto.

O campo Ø é editável em todas as linhas — o catálogo é ponto de partida, não camisa de força.

## Exportação DXF

O botão **Exportar vista de corte (DXF)** grava o desenho em `Downloads` e abre o
Explorer destacando o arquivo. O conteúdo, em escala **1:1 mm**:

- contorno da infraestrutura (círculo ou retângulo) na layer `INFRA`;
- cada cabo como um `CIRCLE` na posição calculada, em layer por tipo de cabo;
- legenda e legenda-título abaixo do desenho: bitola, Ø, quantidade, ocupação,
  limite, situação e norma aplicada;
- aviso de cabos que não couberam, em layer `AVISO` vermelha.

Formato **DXF R2000 (AC1015)**. Detalhes que importam se for mexer no gerador:

- O Revit e o AutoCAD **não aceitam R12 (AC1009)** — é anterior à faixa suportada.
- Cada registro da tabela `LAYER` precisa do código **390 (PlotStyleName)**
  apontando para um objeto válido em `OBJECTS`. Sem ele o parser da Autodesk
  descarta o **arquivo inteiro** (`Invalid or incomplete DXF input -- drawing discarded`).
- O texto é escrito em ASCII puro (`2x2 mm2`, `diam.`): fontes SHX de CAD não têm
  glifo para `×`, `²`, `Ø` e acentos, e o texto sai corrompido.

### Importar no Revit

Precisa ser numa **vista de desenho** (Exibir → Criar → Vista de desenho) — não
funciona com uma vista 3D ativa. Depois: Inserir → Importar CAD, com
**unidades em milímetro** e posicionamento *Automático — Centro para centro*.

Para diagnosticar um DXF recusado, abra-o antes no **DWG TrueView**: ele usa o
parser da Autodesk e informa o erro exato, enquanto o Revit só mostra uma
mensagem genérica sobre ActiveX/PROXYGRAPHICS.

## Desenvolver e reconstruir

Requer Node.js.

    npm install
    node node_modules/electron/install.js   # baixa o binário do Electron
    npm start                               # roda em modo desenvolvimento
    npm run dist                            # gera o instalador em dist/

A segunda linha é necessária porque o npm desta máquina bloqueia install scripts
por padrão; sem ela o binário do Electron não é baixado e o `npm start` falha.

## Estrutura

    index.html          aplicação inteira (interface, cálculo, catálogos e gerador DXF)
    main.js             processo principal do Electron: janela, menu, gravação de arquivo
    preload.js          ponte segura entre a página e o processo principal (contextBridge)
    logo.png            logotipo Zeplin, usado no cabeçalho
    scripts/make-icon.js  recorta o símbolo do logo e gera build/icon.png (512×512)
    build/icon.png      ícone do app; electron-builder converte para .ico no build
    package.json        dependências e configuração do electron-builder

Para trocar o logotipo, substitua `logo.png` e rode `npm run icone`.

O salvamento passa pelo processo principal via IPC. O download por blob do
navegador (`<a download>`) é bloqueado no Electron e falha em silêncio — por isso
`preload.js` existe.

## Critérios normativos

- **ABNT NBR 5410:2004**, 6.2.11.1.6 a) — eletroduto: 53 % (um condutor),
  31 % (dois), 40 % (três ou mais).
- **ABNT NBR 16415:2015**, Anexo B — cabeamento estruturado: 40 % de projeto,
  60 % considerado cheio.
- Eletrocalha e perfilado em instalação **elétrica** ou de **som/sinal**: a NBR 5410
  não fixa taxa. O app adota 40 % por analogia à NBR 16415 e sinaliza que é
  critério de engenharia, não requisito normativo.
- Cabo de som/sinal é **linha de sinal** (NBR 5410, 1.2.2 d), por isso a aba
  Som/sinal aplica os limites da 5410 em vez dos 40 % fixos da 16415.

## Origem dos diâmetros

- **Cabeamento estruturado:** NBR 16415, Tabelas B.1 e B.2.
- **Cabos de energia:** catálogo Prysmian *Cabos de Baixa e Média Tensão*.
  É o **portfólio europeu** (designações EN/UNE: H07V-K, RV-K, RZ1-K, RHZ1;
  os cabos de MT são de alumínio, normalizados por Iberdrola/Endesa/Naturgy).
  Se o projeto for detalhado com produto Prysmian Brasil, confira os diâmetros.
- **Cabos de som/sinal (WaveOne):** ⚠️ a WaveOne **não publica o diâmetro externo**
  — verificado no catálogo comercial, no catálogo profissional e no varejo.
  Os valores são **estimativa de engenharia**, obtidos da formação do condutor mais
  parede típica de PVC e dos diâmetros padrão de coaxiais (RG-58 ≈ 5 mm, RG-59 ≈ 6 mm).
  O app marca esses cabos como "Ø est." na tela e no DXF. **Confirme com paquímetro
  antes de fechar o projeto.**

O resultado é uma verificação de ocupação. A responsabilidade técnica pelo
projeto permanece do profissional habilitado.

---

© 2026 Marco Deouro Deritti — todos os direitos reservados.
