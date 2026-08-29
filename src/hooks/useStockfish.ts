import { useCallback, useEffect, useRef, useState } from 'react';
import { StockfishClient } from '../engine/stockfishClient';
import { NO_MOVE, uciMoveToSan, uciMoveToSquares } from '../engine/uciToSan';

export type Suggestion = {
  san: string;
  from: string;
  to: string;
};

export function useStockfish() {
  const clientRef = useRef<StockfishClient | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    const client = new StockfishClient();
    clientRef.current = client;
    return () => {
      client.terminate();
      clientRef.current = null;
    };
  }, []);

  const analyze = useCallback(async (fen: string, movetimeMs: number) => {
    const client = clientRef.current;
    if (!client) return;

    setIsThinking(true);
    setSuggestion(null);

    const { bestMove } = await client.analyze(fen, movetimeMs);
    setIsThinking(false);

    if (!bestMove || bestMove === NO_MOVE) {
      setSuggestion(null);
      return;
    }

    const san = uciMoveToSan(fen, bestMove);
    const { from, to } = uciMoveToSquares(bestMove);
    setSuggestion(san ? { san, from, to } : null);
  }, []);

  const clearSuggestion = useCallback(() => setSuggestion(null), []);

  return { analyze, isThinking, suggestion, clearSuggestion };
}
