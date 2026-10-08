import { useState } from 'react';
import { DEFAULT_POSITION, type Color } from 'chess.js';
import { usePlayVsEngine, type MoveFeedback, type PlayPhase } from '../hooks/usePlayVsEngine';
import { CLASSIFICATION_LABELS, formatScore, shouldPause } from '../lib/coach';
import { describeMove } from '../lib/moveDescription';
import { ARROW_COLORS, ELO_PRESETS } from '../lib/constants';
import { BoardToolbar } from './BoardToolbar';
import { ChessBoard, type BoardArrow } from './ChessBoard';
import { EvalBar } from './EvalBar';
import { MoveList } from './MoveList';
import { BulbIcon, PlayIcon, UndoIcon } from './icons';

const STATUS_TEXT: Record<PlayPhase, string> = {
  starting: 'Preparando a partida…',
  player: 'Sua vez.',
  checking: 'Avaliando seu lance…',
  review: 'Reveja seu lance antes de continuar.',
  opponent: 'Stockfish está pensando…',
  over: '',
};

function feedbackArrows(feedback: MoveFeedback | null): BoardArrow[] {
  if (!feedback) return [];
  const arrows: BoardArrow[] = [];
  if (feedback.refutation) arrows.push({ ...feedback.refutation, color: ARROW_COLORS.threat });
  if (feedback.best && shouldPause(feedback.classification)) arrows.push({ ...feedback.best, color: ARROW_COLORS.best });
  return arrows;
}

export function PlayView() {
  const [eloRating, setEloRating] = useState(1500);
  const [chosenColor, setChosenColor] = useState<Color>('w');
  const [showEval, setShowEval] = useState(true);
  const [orientation, setOrientation] = useState<'white' | 'black' | null>(null);
  const game = usePlayVsEngine(eloRating);
  const { feedback, hint, phase } = game;

  // No modo revisão, as setas mostram o erro (lance mais forte do adversário) e a correção.
  const arrows = phase === 'review' ? feedbackArrows(feedback) : hint ? [{ ...hint, color: ARROW_COLORS.best }] : [];
  const isBusy = phase === 'checking' || phase === 'opponent' || phase === 'starting';
  // Por padrão o tabuleiro fica do lado do jogador; o botão de virar troca isso.
  const boardOrientation = orientation ?? (game.playerColor === 'w' ? 'white' : 'black');
  const turn: Color = game.fen.split(' ')[1] === 'b' ? 'b' : 'w';

  const startNewGame = () => {
    setOrientation(null);
    void game.newGame(chosenColor);
  };

  return (
    <main className="workspace">
      <div className="board-area">
        <div className="board-frame">
          {showEval && <EvalBar evaluation={game.evaluation} orientation={boardOrientation} />}
          <div className="board">
            <ChessBoard
              fen={game.fen}
              onMove={game.makeMove}
              arrows={arrows}
              orientation={boardOrientation}
              movableColor={phase === 'player' ? game.playerColor : null}
              lastMove={game.lastMove}
            />
          </div>
        </div>
        <BoardToolbar
          turn={turn}
          status={phase === 'over' ? (game.gameOverText ?? undefined) : undefined}
          onFlip={() => setOrientation(boardOrientation === 'white' ? 'black' : 'white')}
        />
      </div>

      <aside className="sidebar">
        <section className="card">
          <header className="card__header">
            <h2 className="card__title">Nova partida</h2>
          </header>
          <div className="field-group">
            <span className="field-label">Jogar de</span>
            <div className="segmented" role="radiogroup" aria-label="Jogar de">
              {(['w', 'b'] as const).map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={chosenColor === color}
                  className={chosenColor === color ? 'active' : ''}
                  onClick={() => setChosenColor(color)}
                >
                  <span className={`turn-dot turn-dot--${color}`} /> {color === 'w' ? 'Brancas' : 'Pretas'}
                </button>
              ))}
            </div>
          </div>
          <label className="field-group">
            <span className="field-label">Nível do Stockfish</span>
            <select className="field" value={eloRating} onChange={(event) => setEloRating(Number(event.target.value))}>
              {ELO_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label className="switch">
            <input type="checkbox" checked={showEval} onChange={(event) => setShowEval(event.target.checked)} />
            <span className="switch__track" aria-hidden="true" />
            Mostrar barra de avaliação
          </label>
          <div className="button-row">
            <button type="button" className="btn btn--primary" onClick={startNewGame}>
              <PlayIcon width={15} height={15} /> Nova partida
            </button>
            <button type="button" className="btn" onClick={() => void game.showHint()} disabled={phase !== 'player'}>
              <BulbIcon width={16} height={16} /> Pedir dica
            </button>
          </div>
        </section>

        <div className={`status-card${phase === 'over' ? ' status-card--over' : ''}`} aria-live="polite">
          {isBusy && <span className="spinner" aria-hidden="true" />}
          <div>
            {phase === 'over' ? <strong>{game.gameOverText}</strong> : STATUS_TEXT[phase]}
            {hint && phase === 'player' && (
              <div className="status-card__hint">
                Dica: <strong>{hint.san}</strong> — {describeMove(hint.san)}
              </div>
            )}
          </div>
        </div>

        {feedback && <FeedbackPanel feedback={feedback} phase={phase} onUndo={game.undo} onContinue={game.continueGame} />}

        <section className="card">
          <header className="card__header">
            <h2 className="card__title">Lances</h2>
          </header>
          <MoveList moves={game.moves} startFen={DEFAULT_POSITION} currentIndex={game.moves.length} />
        </section>
      </aside>
    </main>
  );
}

type FeedbackPanelProps = {
  feedback: MoveFeedback;
  phase: PlayPhase;
  onUndo: () => void;
  onContinue: () => void;
};

function FeedbackPanel({ feedback, phase, onUndo, onContinue }: FeedbackPanelProps) {
  const { classification, playedSan, best, refutation, scoreBefore, scoreAfter } = feedback;

  return (
    <section className={`card coach coach--${classification}`}>
      <header className="coach__header">
        <span className="coach__badge">{CLASSIFICATION_LABELS[classification]}</span>
        {scoreBefore && scoreAfter && (
          <span className="coach__eval">
            {formatScore(scoreBefore)} → {formatScore(scoreAfter)}
          </span>
        )}
      </header>
      <p>
        Você jogou <strong>{playedSan}</strong>.
      </p>

      {refutation && (
        <p>
          Depois de <strong>{playedSan}</strong>, o adversário responde <strong>{refutation.san}</strong> (
          {describeMove(refutation.san).toLowerCase()}).
        </p>
      )}

      {best && (
        <p>
          Melhor era <strong>{best.san}</strong> — {describeMove(best.san).toLowerCase()}.
        </p>
      )}

      {phase === 'review' && (
        <div className="button-row">
          <button type="button" className="btn btn--primary" onClick={onUndo}>
            <UndoIcon width={16} height={16} /> Desfazer e tentar de novo
          </button>
          <button type="button" className="btn btn--ghost" onClick={onContinue}>
            Continuar mesmo assim
          </button>
        </div>
      )}
    </section>
  );
}
