import type { PositionEvaluation } from '../hooks/useEvaluation';
import { pvToSan } from '../engine/uciToSan';
import { formatWhiteScore } from '../lib/evaluation';

const LINE_PLIES = 8;

/** "12. Nf3 d5 13. c4" — ou "12… d5 13. c4" quando a linha começa com as pretas. */
function formatLine(fen: string, sans: string[]): string {
  const [, turn, , , , fullmove] = fen.split(' ');
  let number = Number(fullmove) || 1;
  let color = turn;
  const parts: string[] = [];
  sans.forEach((san, i) => {
    if (color === 'w') parts.push(`${number}. ${san}`);
    else parts.push(i === 0 ? `${number}… ${san}` : san);
    if (color === 'b') number++;
    color = color === 'w' ? 'b' : 'w';
  });
  return parts.join(' ');
}

function describeAdvantage(evaluation: PositionEvaluation): string {
  const { whiteScore, bar } = evaluation;
  if (!whiteScore) return bar.label === '½-½' ? 'Partida empatada.' : `Xeque-mate — ${bar.leader === 'w' ? 'brancas' : 'pretas'} venceram.`;
  if (whiteScore.type === 'mate') return `Mate forçado para as ${whiteScore.value > 0 ? 'brancas' : 'pretas'}.`;
  const pawns = Math.abs(whiteScore.value) / 100;
  const side = whiteScore.value > 0 ? 'brancas' : 'pretas';
  if (pawns < 0.3) return 'Posição equilibrada.';
  if (pawns < 1) return `Leve vantagem das ${side}.`;
  if (pawns < 2.5) return `Vantagem clara das ${side}.`;
  return `Vantagem decisiva das ${side}.`;
}

type EvaluationCardProps = {
  evaluation: PositionEvaluation | null;
};

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const line = evaluation ? formatLine(evaluation.fen, pvToSan(evaluation.fen, evaluation.pv, LINE_PLIES)) : '';
  const leader = evaluation?.bar.leader;

  return (
    <section className="card eval-card" aria-live="polite">
      <div className="eval-card__main">
        <span className={`eval-card__score eval-card__score--${leader ?? 'even'}`}>
          {evaluation ? (evaluation.whiteScore ? formatWhiteScore(evaluation.whiteScore) : evaluation.bar.label) : '…'}
        </span>
        <div className="eval-card__text">
          <strong>{evaluation ? describeAdvantage(evaluation) : 'Avaliando a posição…'}</strong>
          <span className="eval-card__meta">
            {evaluation?.whiteScore ? `Stockfish · profundidade ${evaluation.depth}` : 'Stockfish'}
          </span>
        </div>
      </div>
      {line && (
        <p className="eval-card__line">
          <span className="eval-card__line-label">Linha principal</span> {line}
        </p>
      )}
    </section>
  );
}
