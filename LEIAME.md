# Zeplin — Ocupação de Cabos

Aplicação de mesa para verificar a ocupação de eletrodutos, eletrocalhas e perfilados.

## Instalar

O instalador está em `dist/`:

    Zeplin-Ocupacao-de-Cabos-Setup-1.0.0.exe

Copie esse arquivo para a máquina de destino e execute. Ele instala por usuário
(não pede senha de administrador), permite escolher a pasta e cria atalhos na
Área de Trabalho e no Menu Iniciar.

> O instalador não é assinado digitalmente. Na primeira execução o Windows
> SmartScreen mostra "Windows protegeu o computador" — clique em
> **Mais informações → Executar assim mesmo**. Para eliminar o aviso é preciso
> um certificado de assinatura de código (EV Code Signing).

Alternativa sem instalar: a pasta `dist/win-unpacked/` roda direto pelo
`Zeplin Ocupacao de Cabos.exe`. Pode ser copiada para um pendrive ou pasta de rede.

## Desenvolver e reconstruir

Requer Node.js.

    npm install
    node node_modules/electron/install.js   # baixa o binário do Electron
    npm start                               # roda em modo desenvolvimento
    npm run dist                            # gera o instalador em dist/

A segunda linha é necessária porque o npm desta máquina bloqueia install scripts
por padrão; sem ela o binário do Electron não é baixado e o `npm start` falha.

## Estrutura

    index.html          aplicação inteira (interface, cálculo e catálogo de cabos)
    main.js             processo principal do Electron: janela, menu, impressão
    logo.png            logotipo Zeplin, usado no cabeçalho
    scripts/make-icon.js  recorta o símbolo do logo e gera build/icon.png (512×512)
    build/icon.png      ícone do app; electron-builder converte para .ico no build
    package.json        dependências e configuração do electron-builder

Para trocar o logotipo, substitua `logo.png` e rode `npm run icone`.

## Critérios normativos

- **ABNT NBR 5410:2004**, 6.2.11.1.6 a) — eletroduto: 53 % (um condutor),
  31 % (dois), 40 % (três ou mais).
- **ABNT NBR 16415:2015**, Anexo B — cabeamento estruturado: 40 % de projeto,
  60 % considerado cheio.
- Eletrocalha e perfilado em instalação **elétrica**: a NBR 5410 não fixa taxa.
  O app adota 40 % por analogia à NBR 16415 e sinaliza que é critério de
  engenharia, não requisito normativo.

## Origem dos diâmetros

- Cabeamento estruturado: NBR 16415, Tabelas B.1 e B.2.
- Cabos de energia: catálogo Prysmian *Cabos de Baixa e Média Tensão*.
  É o **portfólio europeu** (designações EN/UNE: H07V-K, RV-K, RZ1-K, RHZ1;
  os cabos de MT são de alumínio, normalizados por Iberdrola/Endesa/Naturgy).
  Se o projeto for detalhado com produto Prysmian Brasil, confira os diâmetros —
  o campo Ø é editável em todas as linhas.

O resultado é uma verificação de ocupação. A responsabilidade técnica pelo
projeto permanece do profissional habilitado.

---

© 2026 Marco Deouro Deritti — todos os direitos reservados.
