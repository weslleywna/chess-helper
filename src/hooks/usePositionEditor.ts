import { useState } from 'react';
import { DEFAULT_POSITION, type Color } from 'chess.js';
import type { PositionDataType } from 'react-chessboard';
import { fenToPlacement, placementToFen, type Placement } from '../lib/positionEditor';

/** Peça a colocar ("wQ", "bN"…) ou a borracha. */
export type EditorTool = string;
export const ERASER: EditorTool = 'erase';

export function usePositionEditor() {
  // `null` = editor fechado.
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [tool, setTool] = useState<EditorTool>('wP');
  const [turn, setTurn] = useState<Color>('w');
  const [error, setError] = useState<string | null>(null);

  const update = (change: (next: Placement) => void) => {
    setError(null);
    setPlacement((current) => {
      const next = { ...current };
      change(next);
      return next;
    });
  };

  const open = (fen: string) => {
    setPlacement(fenToPlacement(fen));
    setTurn(fen.split(' ')[1] === 'b' ? 'b' : 'w');
    setError(null);
  };

  const close = () => setPlacement(null);

  /** Coloca a peça escolhida; clicar de novo com a mesma peça (ou com a borracha) remove. */
  const clickSquare = (square: string) =>
    update((next) => {
      if (tool === ERASER || next[square] === tool) delete next[square];
      else next[square] = tool;
    });

  /** Arrastar move a peça livremente; soltar fora do tabuleiro remove. */
  const movePiece = (from: string, to: string | null) =>
    update((next) => {
      const piece = next[from];
      delete next[from];
      if (to && piece) next[to] = piece;
    });

  const setStartingPosition = () => {
    setError(null);
    setPlacement(fenToPlacement(DEFAULT_POSITION));
    setTurn('w');
  };

  const clear = () => {
    setError(null);
    setPlacement({});
  };

  /** FEN da posição montada, ou `null` (com o motivo em `error`) se ela não for válida. */
  const finish = (): string | null => {
    if (!placement) return null;
    const result = placementToFen(placement, turn);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    return result.fen;
  };

  const position: PositionDataType = Object.fromEntries(
    Object.entries(placement ?? {}).map(([square, pieceType]) => [square, { pieceType }]),
  );

  return {
    isOpen: placement !== null,
    position,
    tool,
    setTool,
    turn,
    setTurn: (color: Color) => {
      setError(null);
      setTurn(color);
    },
    error,
    open,
    close,
    clickSquare,
    movePiece,
    setStartingPosition,
    clear,
    finish,
  };
}

export type PositionEditorState = ReturnType<typeof usePositionEditor>;
