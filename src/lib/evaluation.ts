import type { Chess, Color } from 'chess.js';
import type { Score } from '../engine/stockfishClient';
import { negateScore, winPercent } from './coach';

/** O que a barra de avaliação precisa mostrar, sempre do ponto de vista das brancas. */
export type BarEvaluation = {
  /** Fatia da barra que pertence às brancas (0–100). */
  whitePercent: number;
  /** Texto curto: "1.3", "M4", "1-0"… */
  label: string;
  /** Quem está na frente; `null` quando está igual. */
  leader: Color | null;
};

/** O motor avalia do ponto de vista de quem tem a vez; a barra usa o das brancas. */
export function toWhiteScore(score: Score, turn: Color): Score {
  return turn === 'w' ? score : negateScore(score);
}

export function barFromWhiteScore(whiteScore: Score): BarEvaluation {
  if (whiteScore.type === 'mate') {
    const leader = whiteScore.value > 0 ? 'w' : 'b';
    return { whitePercent: leader === 'w' ? 100 : 0, label: `M${Math.abs(whiteScore.value)}`, leader };
  }
  const pawns = whiteScore.value / 100;
  return {
    // Nunca enche a barra toda sem mate, para a vantagem do outro lado continuar visível.
    whitePercent: Math.min(97, Math.max(3, winPercent(whiteScore))),
    label: Math.abs(pawns).toFixed(1),
    leader: Math.abs(pawns) < 0.05 ? null : pawns > 0 ? 'w' : 'b',
  };
}

/** Resultado fixo para posições em que a partida já acabou; `null` se ela continua. */
export function barForGameOver(chess: Chess): BarEvaluation | null {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === 'w' ? 'b' : 'w';
    return { whitePercent: winner === 'w' ? 100 : 0, label: winner === 'w' ? '1-0' : '0-1', leader: winner };
  }
  if (chess.isGameOver()) return { whitePercent: 50, label: '½-½', leader: null };
  return null;
}

/** Avaliação com sinal, para textos: "+1.25", "−0.40", "#3", "#−2". */
export function formatWhiteScore(whiteScore: Score): string {
  if (whiteScore.type === 'mate') return whiteScore.value > 0 ? `#${whiteScore.value}` : `#−${Math.abs(whiteScore.value)}`;
  const pawns = whiteScore.value / 100;
  if (Math.abs(pawns) < 0.005) return '0.00';
  return `${pawns > 0 ? '+' : '−'}${Math.abs(pawns).toFixed(2)}`;
}
