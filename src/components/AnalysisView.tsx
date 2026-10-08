import { useState } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { useStockfish } from '../hooks/useStockfish';
import { describeMove } from '../lib/moveDescription';
import { ARROW_COLORS } from '../lib/constants';
import { ChessBoard } from './ChessBoard';
import { EngineControls, type AnalysisMode } from './EngineControls';
import { SuggestionPanel } from './SuggestionPanel';

export function AnalysisView() {
  const { fen, makeMove, reset, isGameOver } = useChessGame();
  const { analyze, isThinking, suggestion, clearSuggestion } = useStockfish();
  const [movetimeMs, setMovetimeMs] = useState(2000);
  const [mode, setMode] = useState<AnalysisMode>('best');
  const [eloRating, setEloRating] = useState(1800);

  const handleMove = (from: string, to: string, promotion?: string) => {
    const moved = makeMove(from, to, promotion);
    if (moved) clearSuggestion();
    return moved;
  };

  const handleReset = () => {
    reset();
    clearSuggestion();
  };

  const handleModeChange = (nextMode: AnalysisMode) => {
    setMode(nextMode);
    clearSuggestion();
  };

  const handleAnalyze = () => {
    void analyze(fen, movetimeMs, mode === 'rated' ? eloRating : null);
  };

  const suggestionLabel = mode === 'best' ? 'Melhor resposta' : `Resposta nível ~${eloRating}`;
  const arrows = suggestion ? [{ from: suggestion.from, to: suggestion.to, color: ARROW_COLORS.best }] : [];

  return (
    <main className="app__layout">
      <div className="app__board">
        <ChessBoard fen={fen} onMove={handleMove} arrows={arrows} />
      </div>

      <div className="app__side">
        <EngineControls
          mode={mode}
          onModeChange={handleModeChange}
          eloRating={eloRating}
          onEloRatingChange={setEloRating}
          movetimeMs={movetimeMs}
          onMovetimeChange={setMovetimeMs}
          onAnalyze={handleAnalyze}
          onReset={handleReset}
          isThinking={isThinking}
          disabled={isGameOver}
        />
        <SuggestionPanel
          san={suggestion?.san ?? null}
          description={describeMove(suggestion?.san ?? null)}
          isThinking={isThinking}
          label={suggestionLabel}
        />
      </div>
    </main>
  );
}
