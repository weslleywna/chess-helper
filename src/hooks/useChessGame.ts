import { useState } from 'react';
import { Chess, DEFAULT_POSITION, validateFen, type Move } from 'chess.js';

type GameState = {
  startFen: string;
  moves: Move[];
  /** Quantos lances de `moves` estão aplicados no tabuleiro (permite voltar e avançar). */
  index: number;
};

const INITIAL_STATE: GameState = { startFen: DEFAULT_POSITION, moves: [], index: 0 };

export type LoadResult = { ok: true; description: string } | { ok: false; error: string };

/** Partida de análise: histórico de lances, navegação e importação de FEN/PGN. */
export function useChessGame() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const { startFen, moves, index } = state;
  const fen = index === 0 ? startFen : moves[index - 1].after;

  const makeMove = (from: string, to: string, promotion?: string) => {
    let move: Move;
    try {
      move = new Chess(fen).move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    // Repetir o lance seguinte do histórico só avança; um lance diferente abre uma nova variante.
    const next = moves[index];
    const nextMoves = next?.san === move.san ? moves : [...moves.slice(0, index), move];
    setState({ startFen, moves: nextMoves, index: index + 1 });
    return true;
  };

  const goTo = (target: number) => {
    setState((current) => ({ ...current, index: Math.max(0, Math.min(current.moves.length, target)) }));
  };

  const reset = () => setState(INITIAL_STATE);

  /** Carrega uma posição (FEN) ou uma partida (PGN) e vai para o último lance. */
  const load = (text: string): LoadResult => {
    const input = text.trim();
    if (!input) return { ok: false, error: 'Cole um FEN ou um PGN para carregar.' };

    if (validateFen(input).ok) {
      setState({ startFen: input, moves: [], index: 0 });
      return { ok: true, description: 'Posição carregada.' };
    }

    const chess = new Chess();
    try {
      chess.loadPgn(input);
    } catch {
      const fenError = input.split('/').length === 8 ? validateFen(input).error : null;
      return { ok: false, error: fenError ? `FEN inválido: ${fenError}` : 'Não reconheci o texto como FEN nem como PGN.' };
    }
    const history = chess.history({ verbose: true });
    setState({ startFen: history[0]?.before ?? chess.fen(), moves: history, index: history.length });
    return { ok: true, description: `Partida carregada com ${history.length} meios-lances.` };
  };

  const chess = new Chess(fen);

  return {
    fen,
    startFen,
    moves,
    index,
    lastMove: index > 0 ? moves[index - 1] : null,
    turn: chess.turn(),
    isGameOver: chess.isGameOver(),
    makeMove,
    goTo,
    reset,
    load,
  };
}
