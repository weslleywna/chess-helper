import type { BarEvaluation } from '../lib/evaluation';

type EvalBarProps = {
  evaluation: BarEvaluation | null;
  orientation: 'white' | 'black';
};

/** Barra vertical de vantagem ao lado do tabuleiro, com as brancas sempre do lado delas. */
export function EvalBar({ evaluation, orientation }: EvalBarProps) {
  const whitePercent = evaluation?.whitePercent ?? 50;
  const leader = evaluation?.leader ?? null;
  // O rótulo fica na ponta de quem está na frente (ou embaixo, quando está igual).
  const labelColor = leader ?? (orientation === 'white' ? 'w' : 'b');
  const labelAtBottom = (labelColor === 'w') === (orientation === 'white');

  const description = !evaluation
    ? 'Avaliação indisponível'
    : leader === null
      ? `Posição igual (${evaluation.label})`
      : `Vantagem das ${leader === 'w' ? 'brancas' : 'pretas'}: ${evaluation.label}`;

  return (
    <div
      className={`eval-bar${orientation === 'black' ? ' eval-bar--flipped' : ''}`}
      role="meter"
      aria-label="Barra de avaliação"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(whitePercent)}
      aria-valuetext={description}
      title={description}
    >
      <div className="eval-bar__white" style={{ height: `${whitePercent}%` }} />
      <div className="eval-bar__midline" />
      {evaluation && (
        <span
          className={`eval-bar__label eval-bar__label--${labelColor === 'w' ? 'on-white' : 'on-black'} ${
            labelAtBottom ? 'eval-bar__label--bottom' : 'eval-bar__label--top'
          }`}
        >
          {evaluation.label}
        </span>
      )}
    </div>
  );
}
