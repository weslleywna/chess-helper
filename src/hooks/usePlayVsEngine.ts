import { useEffect, useRef, useState } from 'react';
import { Chess, DEFAULT_POSITION, type Color, type Move } from 'chess.js';
import { StockfishClient, type AnalysisResult, type Score } from '../engine/stockfishClient';
import { NO_MOVE, uciMoveToSan, uciMoveToSquares } from '../engine/uciToSan';
import { classifyMove, negateScore, shouldPause, winPercent, type Classification } from '../lib/coach';
import { barForGameOver, barFromWhiteScore, toWhiteScore, type BarEvaluation } from '../lib/evaluation';
import type { Suggestion } from './useStockfish';

// Tempo que o treinador (força máxima) gasta avaliando cada posição.
const COACH_MOVETIME_MS = 1000;
// Tempo que o adversário (força limitada pelo rating) gasta em cada lance.
const OPPONENT_MOVETIME_MS = 800;

export type PlayPhase = 'starting' | 'player' | 'checking' | 'review' | 'opponent' | 'over';

export type MoveFeedback = {
  classification: Classification;
  playedSan: string;
  best: Suggestion | null;
  /** Melhor resposta do adversário ao lance jogado — mostra o que o lance permitiu. */
  refutation: Suggestion | null;
  scoreBefore: Score | null;
  scoreAfter: Score | null;
};

function toSuggestion(fen: string, uciMove: string | undefined): Suggestion | null {
  if (!uciMove || uciMove === NO_MOVE) return null;
  const san = uciMoveToSan(fen, uciMove);
  return san ? { san, ...uciMoveToSquares(uciMove) } : null;
}

function describeGameOver(chess: Chess): string {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? 'Xeque-mate — as pretas venceram.' : 'Xeque-mate — as brancas venceram.';
  if (chess.isStalemate()) return 'Empate por afogamento.';
  if (chess.isThreefoldRepetition()) return 'Empate por repetição.';
  if (chess.isInsufficientMaterial()) return 'Empate por material insuficiente.';
  return 'Empate.';
}

export function usePlayVsEngine(eloRating: number) {
  const chessRef = useRef(new Chess());
  const opponentRef = useRef<StockfishClient | null>(null);
  const coachRef = useRef<StockfishClient | null>(null);
  // Incrementado a cada nova partida/desfazer para descartar resultados de buscas antigas.
  const generationRef = useRef(0);
  const preAnalysisRef = useRef<{ fen: string; promise: Promise<AnalysisResult> } | null>(null);
  const phaseRef = useRef<PlayPhase>('starting');
  const eloRef = useRef(eloRating);

  const [fen, setFen] = useState(DEFAULT_POSITION);
  const [moves, setMoves] = useState<Move[]>([]);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [phase, setPhaseState] = useState<PlayPhase>('starting');
  const [feedback, setFeedback] = useState<MoveFeedback | null>(null);
  const [hint, setHint] = useState<Suggestion | null>(null);
  const [gameOverText, setGameOverText] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<BarEvaluation | null>(null);

  /** Copia o tabuleiro do ref para o estado, que é o que a tela renderiza. */
  const syncBoard = () => {
    setFen(chessRef.current.fen());
    setMoves(chessRef.current.history({ verbose: true }));
  };

  const setPhase = (next: PlayPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };

  const isStale = (generation: number) => generation !== generationRef.current;

  const analyzeWithCoach = (position: string) => {
    if (preAnalysisRef.current?.fen !== position) {
      preAnalysisRef.current = { fen: position, promise: coachRef.current!.analyze(position, COACH_MOVETIME_MS) };
    }
    return preAnalysisRef.current.promise;
  };

  const endIfGameOver = () => {
    const chess = chessRef.current;
    if (!chess.isGameOver()) return false;
    setGameOverText(describeGameOver(chess));
    setEvaluation(barForGameOver(chess));
    setPhase('over');
    return true;
  };

  const startPlayerTurn = () => {
    if (endIfGameOver()) return;
    setPhase('player');
    // Avalia a posição enquanto o jogador pensa, para o retorno sair rápido.
    const position = chessRef.current.fen();
    const turn = chessRef.current.turn();
    const generation = generationRef.current;
    void analyzeWithCoach(position).then(({ score }) => {
      if (score && !isStale(generation) && chessRef.current.fen() === position) {
        setEvaluation(barFromWhiteScore(toWhiteScore(score, turn)));
      }
    });
  };

  const playOpponentMove = async (generation: number) => {
    if (endIfGameOver()) return;
    setPhase('opponent');
    const chess = chessRef.current;
    const { bestMove } = await opponentRef.current!.analyze(chess.fen(), OPPONENT_MOVETIME_MS, eloRef.current);
    if (isStale(generation)) return;

    const { from, to } = uciMoveToSquares(bestMove);
    chess.move({ from, to, promotion: bestMove.length > 4 ? bestMove.slice(4) : undefined });
    syncBoard();
    startPlayerTurn();
  };

  const reviewPlayerMove = async (fenBefore: string, move: Move, generation: number) => {
    setPhase('checking');
    const chess = chessRef.current;
    const before = await analyzeWithCoach(fenBefore);
    if (isStale(generation)) return;

    let scoreAfter: Score | null;
    let winAfter: number;
    let refutation: Suggestion | null = null;
    if (chess.isCheckmate()) {
      scoreAfter = { type: 'mate', value: 1 };
      winAfter = 100;
    } else if (chess.isGameOver()) {
      scoreAfter = { type: 'cp', value: 0 };
      winAfter = 50;
    } else {
      const after = await coachRef.current!.analyze(move.after, COACH_MOVETIME_MS);
      if (isStale(generation)) return;
      // A avaliação vem do ponto de vista do adversário, que agora tem a vez.
      scoreAfter = after.score ? negateScore(after.score) : null;
      winAfter = scoreAfter ? winPercent(scoreAfter) : 50;
      refutation = toSuggestion(move.after, after.bestMove);
    }

    if (scoreAfter) setEvaluation(barForGameOver(chess) ?? barFromWhiteScore(toWhiteScore(scoreAfter, move.color)));

    const winBefore = before.score ? winPercent(before.score) : 50;
    const playedUci = move.from + move.to + (move.promotion ?? '');
    const classification = classifyMove(winBefore - winAfter, playedUci === before.bestMove);

    setFeedback({
      classification,
      playedSan: move.san,
      best: classification === 'best' ? null : toSuggestion(fenBefore, before.bestMove),
      refutation: shouldPause(classification) ? refutation : null,
      scoreBefore: before.score,
      scoreAfter,
    });

    if (shouldPause(classification)) {
      setPhase('review');
      return;
    }
    void playOpponentMove(generation);
  };

  const newGame = async (color: Color) => {
    const generation = ++generationRef.current;
    chessRef.current.reset();
    preAnalysisRef.current = null;
    syncBoard();
    setPlayerColor(color);
    setFeedback(null);
    setHint(null);
    setGameOverText(null);
    setEvaluation(null);
    setPhase('starting');

    await Promise.all([opponentRef.current!.newGame(), coachRef.current!.newGame()]);
    if (isStale(generation)) return;
    if (color === 'w') startPlayerTurn();
    else void playOpponentMove(generation);
  };

  const makeMove = (from: string, to: string, promotion?: string) => {
    if (phaseRef.current !== 'player') return false;
    const chess = chessRef.current;
    const fenBefore = chess.fen();
    let move: Move;
    try {
      move = chess.move({ from, to, promotion: promotion ?? 'q' });
    } catch {
      return false;
    }
    syncBoard();
    setHint(null);
    setFeedback(null);
    void reviewPlayerMove(fenBefore, move, generationRef.current);
    return true;
  };

  /** Volta o lance com erro para o jogador tentar de novo. */
  const undo = () => {
    if (phaseRef.current !== 'review') return;
    generationRef.current++;
    chessRef.current.undo();
    syncBoard();
    setFeedback(null);
    startPlayerTurn();
  };

  /** Mantém o lance com erro e deixa o adversário responder. */
  const continueGame = () => {
    if (phaseRef.current !== 'review') return;
    void playOpponentMove(generationRef.current);
  };

  const showHint = async () => {
    if (phaseRef.current !== 'player') return;
    const position = chessRef.current.fen();
    const { bestMove } = await analyzeWithCoach(position);
    if (phaseRef.current === 'player' && chessRef.current.fen() === position) {
      setHint(toSuggestion(position, bestMove));
    }
  };

  useEffect(() => {
    eloRef.current = eloRating;
  }, [eloRating]);

  useEffect(() => {
    const opponent = new StockfishClient();
    const coach = new StockfishClient();
    opponentRef.current = opponent;
    coachRef.current = coach;
    void newGame('w');
    // Buscas pendentes nunca resolvem depois que o worker é encerrado.
    return () => {
      opponent.terminate();
      coach.terminate();
    };
    // newGame só usa refs e setters estáveis, então basta rodar uma vez por montagem.
  }, []);

  return {
    fen,
    moves,
    lastMove: moves.at(-1) ?? null,
    evaluation,
    playerColor,
    phase,
    feedback,
    hint,
    gameOverText,
    newGame,
    makeMove,
    undo,
    continueGame,
    showHint,
  };
}
