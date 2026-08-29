import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { EngineControls } from './components/EngineControls';
import { SuggestionPanel } from './components/SuggestionPanel';
import { useChessGame } from './hooks/useChessGame';
import { useStockfish } from './hooks/useStockfish';
import { describeMove } from './lib/moveDescription';

export default function App() {
  const { fen, makeMove, reset, isGameOver } = useChessGame();
  const { analyze, isThinking, suggestion, clearSuggestion } = useStockfish();
  const [movetimeMs, setMovetimeMs] = useState(2000);

  const handleMove = (from: string, to: string, promotion?: string) => {
    const moved = makeMove(from, to, promotion);
    if (moved) clearSuggestion();
    return moved;
  };

  const handleReset = () => {
    reset();
    clearSuggestion();
  };

  const handleAnalyze = () => {
    void analyze(fen, movetimeMs);
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Chess Helper</h1>
        <p>Faça a jogada do adversário no tabuleiro e descubra a melhor resposta segundo o Stockfish.</p>
      </header>

      <main className="app__layout">
        <div className="app__board">
          <ChessBoard fen={fen} onMove={handleMove} suggestionArrow={suggestion} />
        </div>

        <div className="app__side">
          <EngineControls
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
          />
        </div>
      </main>
    </div>
  );
}
