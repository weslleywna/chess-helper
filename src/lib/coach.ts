import type { Score } from '../engine/stockfishClient';

export type Classification = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  best: 'Melhor lance',
  good: 'Bom lance',
  inaccuracy: 'Imprecisão',
  mistake: 'Erro',
  blunder: 'Capivara',
};

// Perda de chance de vitória (0–100) a partir da qual cada classificação vale,
// nos mesmos limites usados pelo Lichess.
const INACCURACY_LOSS = 5;
const MISTAKE_LOSS = 10;
const BLUNDER_LOSS = 15;

/** Inverte o ponto de vista da avaliação (de quem joga para o adversário). */
export function negateScore(score: Score): Score {
  return { type: score.type, value: -score.value };
}

/** Chance de vitória (0–100) com a fórmula do Lichess. */
export function winPercent(score: Score): number {
  if (score.type === 'mate') return score.value > 0 ? 100 : 0;
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * score.value)) - 1);
}

export function classifyMove(winLoss: number, isBestMove: boolean): Classification {
  if (isBestMove) return 'best';
  if (winLoss >= BLUNDER_LOSS) return 'blunder';
  if (winLoss >= MISTAKE_LOSS) return 'mistake';
  if (winLoss >= INACCURACY_LOSS) return 'inaccuracy';
  return 'good';
}

/** Lances que pausam a partida para o jogador poder desfazer. */
export function shouldPause(classification: Classification): boolean {
  return classification === 'mistake' || classification === 'blunder';
}

/** Formata a avaliação do ponto de vista do jogador: "+1.25", "-0.40", "M3", "-M2". */
export function formatScore(score: Score): string {
  if (score.type === 'mate') return score.value > 0 ? `M${score.value}` : `-M${Math.abs(score.value)}`;
  const pawns = score.value / 100;
  return `${pawns > 0 ? '+' : ''}${pawns.toFixed(2)}`;
}
