import { Chessboard } from 'react-chessboard';
import type { Arrow, PieceDropHandlerArgs } from 'react-chessboard';

type ChessBoardProps = {
  fen: string;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  suggestionArrow?: { from: string; to: string } | null;
};

export function ChessBoard({ fen, onMove, suggestionArrow }: ChessBoardProps) {
  const arrows: Arrow[] = suggestionArrow
    ? [{ startSquare: suggestionArrow.from, endSquare: suggestionArrow.to, color: '#2f9e44' }]
    : [];

  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;
    return onMove(sourceSquare, targetSquare, 'q');
  };

  return (
    <Chessboard
      options={{
        id: 'chess-helper-board',
        position: fen,
        onPieceDrop: handlePieceDrop,
        arrows,
        boardOrientation: 'white',
      }}
    />
  );
}
