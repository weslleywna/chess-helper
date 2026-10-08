import { useEffect, useState } from 'react';
import { useChessGame } from '../hooks/useChessGame';
import { useEvaluation } from '../hooks/useEvaluation';
import { usePositionEditor } from '../hooks/usePositionEditor';
import { useStockfish } from '../hooks/useStockfish';
import { describeMove } from '../lib/moveDescription';
import { ARROW_COLORS } from '../lib/constants';
import { BoardToolbar } from './BoardToolbar';
import { ChessBoard, EditorBoard } from './ChessBoard';
import { EngineControls, type AnalysisMode } from './EngineControls';
import { EvalBar } from './EvalBar';
import { EvaluationCard } from './EvaluationCard';
import { GameImport } from './GameImport';
import { MoveList } from './MoveList';
import { PositionEditor } from './PositionEditor';
import { SuggestionPanel } from './SuggestionPanel';
import { CopyIcon } from './icons';

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

export function AnalysisView() {
  const game = useChessGame();
  const { fen, turn } = game;
  const editor = usePositionEditor();
  const { evaluation, bar } = useEvaluation(fen, !editor.isOpen);
  const { analyze, isThinking, suggestion } = useStockfish();
  const [analyzedFen, setAnalyzedFen] = useState<string | null>(null);
  const [movetimeMs, setMovetimeMs] = useState(2000);
  const [mode, setMode] = useState<AnalysisMode>('best');
  const [eloRating, setEloRating] = useState(1800);
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [copied, setCopied] = useState(false);

  // A sugestão só vale para a posição em que foi pedida.
  const currentSuggestion = analyzedFen === fen ? suggestion : null;

  const handleAnalyze = () => {
    setAnalyzedFen(fen);
    void analyze(fen, movetimeMs, mode === 'rated' ? eloRating : null);
  };

  const handleModeChange = (nextMode: AnalysisMode) => {
    setMode(nextMode);
    setAnalyzedFen(null);
  };

  const handleApplyEditor = (editedFen: string) => {
    game.load(editedFen);
    editor.close();
  };

  const handleCopyFen = async () => {
    try {
      await navigator.clipboard.writeText(fen);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Sem permissão para a área de transferência: não há o que fazer.
    }
  };

  // Setas do teclado navegam pelos lances.
  const { goTo, index, moves } = game;
  useEffect(() => {
    if (editor.isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      const targets: Record<string, number> = { ArrowLeft: index - 1, ArrowRight: index + 1, Home: 0, End: moves.length };
      if (!(event.key in targets)) return;
      event.preventDefault();
      goTo(targets[event.key]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editor.isOpen, goTo, index, moves.length]);

  const sideToMove = turn === 'w' ? 'brancas' : 'pretas';
  const suggestionLabel = mode === 'best' ? `Melhor lance para as ${sideToMove}` : `Lance nível ~${eloRating} para as ${sideToMove}`;
  const arrows = currentSuggestion
    ? [{ from: currentSuggestion.from, to: currentSuggestion.to, color: ARROW_COLORS.best }]
    : [];

  return (
    <main className="workspace">
      <div className="board-area">
        <div className="board-frame">
          <EvalBar evaluation={editor.isOpen ? null : bar} orientation={orientation} />
          <div className="board">
            {editor.isOpen ? (
              <EditorBoard
                position={editor.position}
                orientation={orientation}
                onSquareClick={editor.clickSquare}
                onPieceMove={editor.movePiece}
              />
            ) : (
              <ChessBoard fen={fen} onMove={game.makeMove} arrows={arrows} orientation={orientation} lastMove={game.lastMove} />
            )}
          </div>
        </div>
        <BoardToolbar
          turn={editor.isOpen ? editor.turn : turn}
          index={game.index}
          total={game.moves.length}
          onNavigate={editor.isOpen ? undefined : game.goTo}
          onFlip={() => setOrientation((current) => (current === 'white' ? 'black' : 'white'))}
          onReset={
            editor.isOpen
              ? undefined
              : () => {
                  game.reset();
                  setAnalyzedFen(null);
                }
          }
        />
      </div>

      <aside className="sidebar">
        {editor.isOpen ? (
          <PositionEditor editor={editor} onApply={handleApplyEditor} />
        ) : (
          <>
            <EvaluationCard evaluation={evaluation} />

            <section className="card">
              <header className="card__header">
                <h2 className="card__title">Sugestão do Stockfish</h2>
              </header>
              <EngineControls
                mode={mode}
                onModeChange={handleModeChange}
                eloRating={eloRating}
                onEloRatingChange={setEloRating}
                movetimeMs={movetimeMs}
                onMovetimeChange={setMovetimeMs}
                onAnalyze={handleAnalyze}
                isThinking={isThinking}
                disabled={game.isGameOver}
              />
              <SuggestionPanel
                san={currentSuggestion?.san ?? null}
                description={describeMove(currentSuggestion?.san ?? null)}
                isThinking={isThinking}
                label={suggestionLabel}
                emptyText={
                  game.isGameOver
                    ? 'A partida terminou nesta posição.'
                    : `Vez das ${sideToMove}. Faça os lances no tabuleiro ou carregue uma partida, e peça a análise.`
                }
              />
            </section>

            <section className="card">
              <header className="card__header">
                <h2 className="card__title">Lances</h2>
                <button type="button" className="btn btn--ghost btn--small" onClick={() => void handleCopyFen()}>
                  <CopyIcon width={15} height={15} /> {copied ? 'Copiado!' : 'Copiar FEN'}
                </button>
              </header>
              <MoveList
                moves={game.moves}
                startFen={game.startFen}
                currentIndex={game.index}
                onSelect={game.goTo}
                emptyText="Mova as peças dos dois lados para registrar a partida."
              />
            </section>

            <GameImport
              onLoad={(text) => {
                const result = game.load(text);
                if (result.ok) setAnalyzedFen(null);
                return result;
              }}
              onOpenEditor={() => editor.open(fen)}
            />
          </>
        )}
      </aside>
    </main>
  );
}
