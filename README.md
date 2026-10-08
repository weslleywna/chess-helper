# Chess Helper

Assistente de xadrez no navegador, com o Stockfish rodando localmente (WebAssembly).

## Funcionalidades

- **Analisar** — reproduza os lances no tabuleiro e peça ao Stockfish a melhor resposta (ou um lance no nível de um rating escolhido).
- **Barra de avaliação** — ao lado do tabuleiro, mostra em tempo real quem está melhor (em peões, ou `M3` para mate em 3), com a linha principal do motor e a profundidade da busca.
- **Partida em andamento** — três formas de trazer uma partida que já começou:
  1. **PGN**: cole a lista de lances (Chess.com/Lichess → Compartilhar). O tabuleiro vai para o último lance e dá para navegar pela partida inteira (botões ou setas ← → do teclado).
  2. **FEN**: cole só a posição atual.
  3. **Montar posição**: coloque as peças à mão (útil em tabuleiro físico), escolha de quem é a vez e analise.
- **Jogar** — partida contra o Stockfish no nível escolhido, com treinador que aponta erros e permite desfazer.

## Desenvolvimento

```bash
npm install
npm run dev     # servidor local
npm run lint
npm run build
```

## Licença

Este projeto é distribuído sob a [GNU General Public License v3.0](LICENSE).

O motor de análise é o [Stockfish](https://github.com/official-stockfish/Stockfish), empacotado para o navegador pelo [Stockfish.js](https://github.com/nmrugg/stockfish.js) (`public/stockfish/`), também sob GPLv3 — veja `public/stockfish/Copying.txt`.
