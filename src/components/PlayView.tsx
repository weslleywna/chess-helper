import { useState } from 'react';
import type { Color } from 'chess.js';
import { usePlayVsEngine, type MoveFeedback, type PlayPhase } from '../hooks/usePlayVsEngine';
import { CLASSIFICATION_LABELS, formatScore, shouldPause } from '../lib/coach';
import { describeMove } from '../lib/moveDescription';
import { ARROW_COLORS, ELO_PRESETS } from '../lib/constants';
import { ChessBoard, type BoardArrow } from './ChessBoard';

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
  const game = usePlayVsEngine(eloRating);
  const { feedback, hint, phase } = game;

  // No modo revisão, as setas mostram o erro (lance mais forte do adversário) e a correção.
  const arrows = phase === 'review' ? feedbackArrows(feedback) : hint ? [{ ...hint, color: ARROW_COLORS.best }] : [];
  const isBusy = phase === 'checking' || phase === 'opponent' || phase === 'starting';

  return (
    <main className="app__layout">
      <div className="app__board">
        <ChessBoard
          fen={game.fen}
          onMove={game.makeMove}
          arrows={arrows}
          orientation={game.playerColor === 'w' ? 'white' : 'black'}
          movableColor={phase === 'player' ? game.playerColor : null}
        />
      </div>

      <div className="app__side">
        <div className="engine-controls">
          <label className="engine-controls__level">
            Jogar de
            <select value={chosenColor} onChange={(event) => setChosenColor(event.target.value as Color)}>
              <option value="w">Brancas</option>
              <option value="b">Pretas</option>
            </select>
          </label>
          <label className="engine-controls__level">
            Nível do Stockfish
            <select value={eloRating} onChange={(event) => setEloRating(Number(event.target.value))}>
              {ELO_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <div className="engine-controls__buttons">
            <button onClick={() => void game.newGame(chosenColor)}>Nova partida</button>
            <button className="secondary" onClick={() => void game.showHint()} disabled={phase !== 'player'}>
              Pedir dica
            </button>
          </div>
        </div>

        <div className={`suggestion-panel${isBusy ? ' suggestion-panel--thinking' : ''}`} aria-live="polite">
          {isBusy && <span className="spinner" aria-hidden="true" />}
          {phase === 'over' ? <strong>{game.gameOverText}</strong> : STATUS_TEXT[phase]}
          {hint && phase === 'player' && (
            <div className="suggestion-panel__description">
              Dica: <strong>{hint.san}</strong> — {describeMove(hint.san)}
            </div>
          )}
        </div>

        {feedback && <FeedbackPanel feedback={feedback} phase={phase} onUndo={game.undo} onContinue={game.continueGame} />}
      </div>
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
    <div className={`coach-panel coach-panel--${classification}`}>
      <div className="suggestion-panel__label">{CLASSIFICATION_LABELS[classification]}</div>
      <p>
        Você jogou <strong>{playedSan}</strong>.
      </p>

      {scoreBefore && scoreAfter && (
        <div className="coach-panel__eval">
          Avaliação: {formatScore(scoreBefore)} → {formatScore(scoreAfter)}
        </div>
      )}

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
        <div className="engine-controls__buttons">
          <button onClick={onUndo}>Desfazer e tentar de novo</button>
          <button className="secondary" onClick={onContinue}>
            Continuar mesmo assim
          </button>
        </div>
      )}
    </div>
  );
}
