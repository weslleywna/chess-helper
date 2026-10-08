# ♞ Chess Helper

Assistente de xadrez que roda inteiro no navegador. O [Stockfish](https://github.com/official-stockfish/Stockfish) é executado localmente em WebAssembly: não há servidor, conta nem envio de dados — tudo acontece no seu computador ou celular.

**Acesse:** <https://weslleywna.github.io/chess-helper/>

## O que dá para fazer

### Analisar posições e partidas

- Mova as peças dos dois lados no tabuleiro e peça ao Stockfish a **melhor resposta**, mostrada com uma seta e descrita em português ("Cavalo captura em e4").
- No modo **Nível por rating**, o Stockfish sugere o lance que um jogador de ~1320 a ~3190 de rating faria — útil para treinar respostas realistas, e não só as de motor.
- A **barra de avaliação** ao lado do tabuleiro mostra em tempo real quem está melhor: vantagem em peões (`1.3`), mate forçado (`M4`) ou resultado final (`1-0`, `0-1`, `½-½`).
- O painel de avaliação traz a nota com sinal (`+2.09`), um resumo ("Vantagem clara das brancas"), a profundidade da busca e a **linha principal** que o motor espera.
- Navegue pela partida com os botões abaixo do tabuleiro ou com o teclado (`←` `→` `Home` `End`). Jogar um lance diferente no meio da partida cria uma nova continuação a partir dali.

### Continuar uma partida que já está em andamento

No painel **Partida em andamento** há três caminhos:

| Você tem…                                | Faça                                                                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| A lista de lances (**PGN**)              | Cole e clique em **Carregar**. O tabuleiro vai para o último lance e a partida inteira fica navegável.                        |
| Só a posição atual (**FEN**)             | Cole e clique em **Carregar**.                                                                                               |
| Um tabuleiro físico ou uma imagem        | Clique em **Montar posição**, coloque as peças, escolha de quem é a vez e clique em **Analisar esta posição**.                |

Onde encontrar o PGN/FEN:

- **Chess.com:** botão *Compartilhar* da partida → copie o PGN ou o FEN.
- **Lichess:** menu da partida → *Compartilhar e exportar*, ou o FEN abaixo do tabuleiro de análise.

O editor de posição recusa posições impossíveis (lado sem rei, peão na primeira ou última fileira, rei de quem não tem a vez em xeque). O roque é liberado automaticamente quando rei e torre estão nas casas de origem. Se você joga de pretas, use o botão de **virar o tabuleiro**.

### Jogar contra o Stockfish com um treinador

- Escolha a cor e o nível do adversário (de iniciante a grande mestre).
- Depois de cada lance seu, o treinador (Stockfish em força máxima) classifica a jogada: **Melhor lance**, **Bom lance**, **Imprecisão**, **Erro** ou **Capivara**.
- Em erros e capivaras a partida pausa: setas mostram a resposta que pune o seu lance (vermelha) e o que era melhor (verde). Você pode **desfazer e tentar de novo** ou continuar mesmo assim.
- **Pedir dica** mostra o melhor lance da posição. A barra de avaliação pode ser escondida para quem prefere jogar às cegas.

## Como funciona

- **Motor:** Stockfish 18 *lite single-threaded* compilado para WebAssembly ([Stockfish.js](https://github.com/nmrugg/stockfish.js)), rodando em Web Workers e controlado pelo protocolo UCI (`src/engine/stockfishClient.ts`). A análise contínua da barra usa um motor próprio, separado do que responde aos pedidos de sugestão; no modo Jogar, adversário e treinador também são motores separados.
- **Nível por rating:** opções `UCI_LimitStrength` e `UCI_Elo` do Stockfish.
- **Barra de avaliação e classificação dos lances:** a nota em centipeões é convertida em chance de vitória com a fórmula do Lichess. Um lance é imprecisão, erro ou capivara quando perde 5, 10 ou 15 pontos percentuais dessa chance — os mesmos limites do Lichess (`src/lib/coach.ts`, `src/lib/evaluation.ts`).
- **Regras e notação:** [chess.js](https://github.com/jhlywa/chess.js) valida lances, lê PGN/FEN e converte lances UCI para SAN. O tabuleiro é o [react-chessboard](https://github.com/Clariity/react-chessboard).

## Desenvolvimento

Requer Node.js 22 ou mais recente.

```bash
npm install
npm run dev       # servidor local com recarga automática
npm run lint      # oxlint
npm run build     # checagem de tipos + build de produção em dist/
npm run preview   # serve o build de produção localmente
```

O app é servido em `/chess-helper/` (configurado em `vite.config.ts`), então em desenvolvimento acesse `http://localhost:5173/chess-helper/`.

### Estrutura

```
src/
├── App.tsx                 # cabeçalho, abas Analisar/Jogar e rodapé
├── components/             # tabuleiro, barra de avaliação, painéis, editor de posição…
├── hooks/
│   ├── useChessGame.ts     # histórico de lances, navegação e importação PGN/FEN
│   ├── useEvaluation.ts    # avaliação contínua para a barra
│   ├── useStockfish.ts     # sugestão de lance sob demanda
│   ├── usePlayVsEngine.ts  # partida contra o Stockfish com treinador
│   └── usePositionEditor.ts
├── engine/                 # cliente UCI do Stockfish e conversão UCI → SAN
└── lib/                    # classificação de lances, avaliação, descrição de lances
public/stockfish/           # binários do Stockfish.js (WebAssembly)
```

### Deploy

Cada push na branch `main` roda lint e build e publica no GitHub Pages (`.github/workflows/deploy.yml`).

## Licença

Este projeto é distribuído sob a [GNU General Public License v3.0](LICENSE).

O motor de análise é o [Stockfish](https://github.com/official-stockfish/Stockfish), empacotado para o navegador pelo [Stockfish.js](https://github.com/nmrugg/stockfish.js) (`public/stockfish/`), também sob GPLv3 — veja `public/stockfish/Copying.txt`.
