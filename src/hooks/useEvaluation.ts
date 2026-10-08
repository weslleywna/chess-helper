import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { StockfishClient, type Score } from '../engine/stockfishClient';
import { barForGameOver, barFromWhiteScore, toWhiteScore, type BarEvaluation } from '../lib/evaluation';

// Tempo de cada avaliação automática; a barra vai se atualizando a cada profundidade.
const EVAL_MOVETIME_MS = 4000;
// Espera um pouco antes de avaliar, para não disparar buscas ao navegar rápido pelos lances.
const DEBOUNCE_MS = 150;

export type PositionEvaluation = {
  fen: string;
  bar: BarEvaluation;
  /** Avaliação do ponto de vista das brancas; `null` quando a partida acabou. */
  whiteScore: Score | null;
  depth: number;
  /** Linha principal do motor, em UCI. */
  pv: string[];
};

/** Avalia continuamente a posição `fen` em força máxima, num motor próprio. */
export function useEvaluation(fen: string, enabled = true) {
  const clientRef = useRef<StockfishClient | null>(null);
  const [evaluation, setEvaluation] = useState<PositionEvaluation | null>(null);

  useEffect(() => {
    const client = new StockfishClient();
    clientRef.current = client;
    return () => {
      client.terminate();
      clientRef.current = null;
    };
  }, []);

  // Partida encerrada não precisa de motor: o resultado sai direto da posição.
  const finalBar = gameOverBar(fen);

  useEffect(() => {
    if (!enabled || finalBar) return;
    const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';
    const timer = setTimeout(() => {
      void clientRef.current?.analyze(fen, EVAL_MOVETIME_MS, null, ({ depth, score, pv }) => {
        const whiteScore = toWhiteScore(score, turn);
        setEvaluation({ fen, bar: barFromWhiteScore(whiteScore), whiteScore, depth, pv });
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [fen, enabled, finalBar]);

  if (finalBar) {
    return { evaluation: { fen, bar: finalBar, whiteScore: null, depth: 0, pv: [] }, bar: finalBar };
  }
  return {
    // Resultados de posições anteriores chegam atrasados; só vale o da posição atual.
    evaluation: evaluation?.fen === fen ? evaluation : null,
    // A barra mantém o último valor enquanto a nova posição é avaliada, para animar sem saltos.
    bar: evaluation?.bar ?? null,
  };
}

function gameOverBar(fen: string): BarEvaluation | null {
  try {
    return barForGameOver(new Chess(fen));
  } catch {
    return null;
  }
}
