import { Chess } from 'chess.js';

export const NO_MOVE = '(none)';

export function uciMoveToSquares(uciMove: string): { from: string; to: string } {
  return { from: uciMove.slice(0, 2), to: uciMove.slice(2, 4) };
}

export function uciMoveToSan(fen: string, uciMove: string): string | null {
  if (!uciMove || uciMove === NO_MOVE) return null;

  const chess = new Chess(fen);
  const { from, to } = uciMoveToSquares(uciMove);
  const promotion = uciMove.length > 4 ? uciMove.slice(4) : undefined;

  const match = chess
    .moves({ verbose: true })
    .find((m) => m.from === from && m.to === to && (promotion ? m.promotion === promotion : true));

  return match ? match.san : null;
}

/** Converte uma linha principal (lances UCI) em SAN, parando no primeiro lance inválido. */
export function pvToSan(fen: string, pv: string[], maxPlies: number): string[] {
  const chess = new Chess(fen);
  const sans: string[] = [];
  for (const uciMove of pv.slice(0, maxPlies)) {
    const { from, to } = uciMoveToSquares(uciMove);
    try {
      sans.push(chess.move({ from, to, promotion: uciMove.length > 4 ? uciMove.slice(4) : undefined }).san);
    } catch {
      break;
    }
  }
  return sans;
}
