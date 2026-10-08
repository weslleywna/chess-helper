import { Chess, validateFen, type Color } from 'chess.js';

/** Casa → peça no formato do react-chessboard ("wK", "bP"…). */
export type Placement = Record<string, string>;

const FILES = 'abcdefgh';

export function fenToPlacement(fen: string): Placement {
  const placement: Placement = {};
  fen
    .split(' ')[0]
    .split('/')
    .forEach((row, rowIndex) => {
      let file = 0;
      for (const char of row) {
        if (/\d/.test(char)) {
          file += Number(char);
          continue;
        }
        const color = char === char.toUpperCase() ? 'w' : 'b';
        placement[`${FILES[file]}${8 - rowIndex}`] = `${color}${char.toUpperCase()}`;
        file++;
      }
    });
  return placement;
}

function placementToBoardFen(placement: Placement): string {
  const rows: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    let row = '';
    let empty = 0;
    for (const file of FILES) {
      const piece = placement[`${file}${rank}`];
      if (!piece) {
        empty++;
        continue;
      }
      if (empty) row += empty;
      empty = 0;
      row += piece[0] === 'w' ? piece[1] : piece[1].toLowerCase();
    }
    rows.push(row + (empty || ''));
  }
  return rows.join('/');
}

/** Libera o roque quando rei e torre estão nas casas de origem. */
function inferCastling(placement: Placement): string {
  const rights = [
    placement.e1 === 'wK' && placement.h1 === 'wR' ? 'K' : '',
    placement.e1 === 'wK' && placement.a1 === 'wR' ? 'Q' : '',
    placement.e8 === 'bK' && placement.h8 === 'bR' ? 'k' : '',
    placement.e8 === 'bK' && placement.a8 === 'bR' ? 'q' : '',
  ].join('');
  return rights || '-';
}

export type PlacementResult = { ok: true; fen: string } | { ok: false; error: string };

/** Monta o FEN da posição editada e confere se ela pode ser analisada. */
export function placementToFen(placement: Placement, turn: Color): PlacementResult {
  const pieces = Object.values(placement);
  const count = (piece: string) => pieces.filter((p) => p === piece).length;
  if (count('wK') !== 1 || count('bK') !== 1) return { ok: false, error: 'Cada lado precisa de exatamente um rei.' };

  const pawnOnBackRank = Object.entries(placement).some(([square, piece]) => piece[1] === 'P' && /[18]$/.test(square));
  if (pawnOnBackRank) return { ok: false, error: 'Peões não podem ficar na primeira nem na última fileira.' };

  const fen = `${placementToBoardFen(placement)} ${turn} ${inferCastling(placement)} - 0 1`;
  const validation = validateFen(fen);
  if (!validation.ok) return { ok: false, error: `Posição inválida: ${validation.error}` };

  // O lado que não tem a vez não pode estar em xeque: o rei dele poderia ser capturado.
  const chess = new Chess(fen);
  const waiting: Color = turn === 'w' ? 'b' : 'w';
  const [waitingKing] = chess.findPiece({ type: 'k', color: waiting });
  if (chess.isAttacked(waitingKing, turn)) {
    return { ok: false, error: `O rei ${waiting === 'w' ? 'branco' : 'preto'} está em xeque, mas a vez é do adversário.` };
  }
  return { ok: true, fen };
}
