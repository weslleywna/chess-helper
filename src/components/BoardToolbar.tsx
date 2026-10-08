import type { Color } from 'chess.js';
import { FirstIcon, FlipIcon, LastIcon, NextIcon, PrevIcon, ResetIcon } from './icons';

type BoardToolbarProps = {
  turn: Color;
  /** Rótulo no lugar de "Vez das brancas/pretas", ex.: estado da partida. */
  status?: string;
  index?: number;
  total?: number;
  /** Navegação pelos lances; omitida, os botões não aparecem. */
  onNavigate?: (index: number) => void;
  onFlip: () => void;
  onReset?: () => void;
};

export function BoardToolbar({ turn, status, index = 0, total = 0, onNavigate, onFlip, onReset }: BoardToolbarProps) {
  return (
    <div className="board-toolbar">
      <span className="turn-indicator">
        <span className={`turn-dot turn-dot--${turn}`} aria-hidden="true" />
        {status ?? `Vez das ${turn === 'w' ? 'brancas' : 'pretas'}`}
      </span>

      {onNavigate && (
        <div className="board-toolbar__nav" role="group" aria-label="Navegar pelos lances">
          <button type="button" className="icon-btn" onClick={() => onNavigate(0)} disabled={index === 0} title="Início (Home)">
            <FirstIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNavigate(index - 1)}
            disabled={index === 0}
            title="Lance anterior (←)"
          >
            <PrevIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNavigate(index + 1)}
            disabled={index === total}
            title="Próximo lance (→)"
          >
            <NextIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNavigate(total)}
            disabled={index === total}
            title="Último lance (End)"
          >
            <LastIcon />
          </button>
        </div>
      )}

      <div className="board-toolbar__actions">
        <button type="button" className="icon-btn" onClick={onFlip} title="Virar tabuleiro" aria-label="Virar tabuleiro">
          <FlipIcon />
        </button>
        {onReset && (
          <button type="button" className="icon-btn" onClick={onReset} title="Reiniciar tabuleiro" aria-label="Reiniciar tabuleiro">
            <ResetIcon />
          </button>
        )}
      </div>
    </div>
  );
}
