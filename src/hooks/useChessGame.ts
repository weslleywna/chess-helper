import { useCallback, useRef, useState } from 'react';
import { Chess } from 'chess.js';

export function useChessGame() {
  const chessRef = useRef(new Chess());
  const [fen, setFen] = useState(chessRef.current.fen());

  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    try {
      const move = chessRef.current.move({ from, to, promotion: promotion ?? 'q' });
      if (move) {
        setFen(chessRef.current.fen());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    chessRef.current.reset();
    setFen(chessRef.current.fen());
  }, []);

  return {
    fen,
    makeMove,
    reset,
    turn: chessRef.current.turn(),
    isGameOver: chessRef.current.isGameOver(),
  };
}
