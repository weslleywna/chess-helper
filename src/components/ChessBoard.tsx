import { Chessboard } from 'react-chessboard';
import type { Arrow, PieceDropHandlerArgs, PieceHandlerArgs } from 'react-chessboard';

export type BoardArrow = { from: string; to: string; color: string };

type ChessBoardProps = {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  arrows?: BoardArrow[];
  orientation?: 'white' | 'black';
  /** Só deixa arrastar as peças dessa cor; `null` bloqueia todas. Omitido, libera as duas. */
  movableColor?: 'w' | 'b' | null;
};

export function ChessBoard({ fen, onMove, arrows = [], orientation = 'white', movableColor }: ChessBoardProps) {
  const boardArrows: Arrow[] = arrows.map(({ from, to, color }) => ({ startSquare: from, endSquare: to, color }));

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;
    return onMove(sourceSquare, targetSquare, 'q');
  };

  const canDragPiece = ({ piece }: PieceHandlerArgs) =>
    movableColor === undefined || piece.pieceType[0] === movableColor;

  return (
    <Chessboard
      options={{
        id: 'chess-helper-board',
        position: fen,
        onPieceDrop: handlePieceDrop,
        canDragPiece,
        arrows: boardArrows,
        boardOrientation: orientation,
      }}
    />
  );
}
