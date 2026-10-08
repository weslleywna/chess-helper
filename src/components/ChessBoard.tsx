import type { CSSProperties } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type {
  Arrow,
  ChessboardOptions,
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  PositionDataType,
  SquareHandlerArgs,
} from 'react-chessboard';

export type BoardArrow = { from: string; to: string; color: string };

type ChessBoardProps = {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  arrows?: BoardArrow[];
  orientation?: 'white' | 'black';
  /** Só deixa arrastar as peças dessa cor; `null` bloqueia todas. Omitido, libera as duas. */
  movableColor?: 'w' | 'b' | null;
  /** Destaca as casas de origem e destino do último lance. */
  lastMove?: { from: string; to: string } | null;
};

const BOARD_COLORS = {
  light: '#ebecd0',
  dark: '#739552',
};

const LAST_MOVE_STYLE: CSSProperties = { boxShadow: 'inset 0 0 0 100vmax rgba(255, 214, 51, 0.42)' };
const CHECK_STYLE: CSSProperties = {
  backgroundImage: 'radial-gradient(circle, rgba(255, 40, 40, 0.95) 0%, rgba(230, 20, 20, 0.6) 35%, rgba(200, 0, 0, 0) 72%)',
};

/** Aparência compartilhada pelo tabuleiro de jogo e pelo editor de posição. */
const BOARD_THEME: ChessboardOptions = {
  boardStyle: { borderRadius: 6, overflow: 'hidden' },
  lightSquareStyle: { backgroundColor: BOARD_COLORS.light },
  darkSquareStyle: { backgroundColor: BOARD_COLORS.dark },
  lightSquareNotationStyle: { color: BOARD_COLORS.dark, fontWeight: 600 },
  darkSquareNotationStyle: { color: BOARD_COLORS.light, fontWeight: 600 },
  dropSquareStyle: { boxShadow: 'inset 0 0 0 4px rgba(255, 255, 255, 0.65)' },
  animationDurationInMs: 180,
};

function checkedKingSquare(fen: string): string | null {
  try {
    const chess = new Chess(fen);
    if (!chess.inCheck()) return null;
    return chess.findPiece({ type: 'k', color: chess.turn() })[0] ?? null;
  } catch {
    return null;
  }
}

export function ChessBoard({ fen, onMove, arrows = [], orientation = 'white', movableColor, lastMove }: ChessBoardProps) {
  const boardArrows: Arrow[] = arrows.map(({ from, to, color }) => ({ startSquare: from, endSquare: to, color }));

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = LAST_MOVE_STYLE;
    squareStyles[lastMove.to] = LAST_MOVE_STYLE;
  }
  const checkSquare = checkedKingSquare(fen);
  if (checkSquare) squareStyles[checkSquare] = { ...squareStyles[checkSquare], ...CHECK_STYLE };

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;
    return onMove(sourceSquare, targetSquare, 'q');
  };

  const canDragPiece = ({ piece }: PieceHandlerArgs) =>
    movableColor === undefined || piece.pieceType[0] === movableColor;

  return (
    <Chessboard
      options={{
        ...BOARD_THEME,
        id: 'chess-helper-board',
        position: fen,
        onPieceDrop: handlePieceDrop,
        canDragPiece,
        arrows: boardArrows,
        boardOrientation: orientation,
        squareStyles,
      }}
    />
  );
}

type EditorBoardProps = {
  position: PositionDataType;
  orientation: 'white' | 'black';
  onSquareClick: (square: string) => void;
  onPieceMove: (from: string, to: string | null) => void;
};

/** Tabuleiro livre do editor: clicar coloca a peça escolhida, arrastar move sem checar regras. */
export function EditorBoard({ position, orientation, onSquareClick, onPieceMove }: EditorBoardProps) {
  return (
    <Chessboard
      options={{
        ...BOARD_THEME,
        id: 'chess-helper-editor',
        position,
        boardOrientation: orientation,
        allowDragOffBoard: true,
        showAnimations: false,
        onSquareClick: ({ square }: SquareHandlerArgs) => onSquareClick(square),
        onPieceDrop: ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
          onPieceMove(sourceSquare, targetSquare);
          return true;
        },
      }}
    />
  );
}
