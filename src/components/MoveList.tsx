import { useEffect, useRef } from 'react';
import type { Move } from 'chess.js';

type MoveListProps = {
  moves: Pick<Move, 'san' | 'color'>[];
  startFen: string;
  /** Quantos lances estão aplicados no tabuleiro; o lance `currentIndex - 1` fica destacado. */
  currentIndex: number;
  /** Clicar num lance leva o tabuleiro até ele. Omitido, a lista é só leitura. */
  onSelect?: (index: number) => void;
  emptyText?: string;
};

type Row = { number: number; white: number | null; black: number | null };

function buildRows(moves: MoveListProps['moves'], startFen: string): Row[] {
  const fullmove = startFen.split(' ')[5];
  const rows: Row[] = [];
  let number = Number(fullmove) || 1;
  moves.forEach((move, i) => {
    // A partida pode começar num lance das pretas (FEN carregado), deixando o primeiro branco vazio.
    if (move.color === 'w' || rows.length === 0) {
      rows.push({ number, white: null, black: null });
      number++;
    }
    rows[rows.length - 1][move.color === 'w' ? 'white' : 'black'] = i;
  });
  return rows;
}

export function MoveList({ moves, startFen, currentIndex, onSelect, emptyText = 'Nenhum lance ainda.' }: MoveListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const rows = buildRows(moves, startFen);

  // Mantém o lance atual visível rolando só a lista, nunca a página.
  useEffect(() => {
    const list = listRef.current;
    const current = list?.querySelector<HTMLElement>('.move-list__move--current');
    if (!list || !current) return;
    if (current.offsetTop < list.scrollTop) list.scrollTop = current.offsetTop;
    else if (current.offsetTop + current.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = current.offsetTop + current.offsetHeight - list.clientHeight;
    }
  }, [currentIndex, moves.length]);

  if (moves.length === 0) return <p className="move-list__empty">{emptyText}</p>;

  const renderMove = (i: number | null) => {
    if (i === null) return <span className="move-list__move move-list__move--placeholder">…</span>;
    const className = `move-list__move${i === currentIndex - 1 ? ' move-list__move--current' : ''}`;
    if (!onSelect) return <span className={className}>{moves[i].san}</span>;
    return (
      <button type="button" className={className} onClick={() => onSelect(i + 1)}>
        {moves[i].san}
      </button>
    );
  };

  return (
    <ol className="move-list" ref={listRef}>
      {rows.map((row) => (
        <li key={row.number} className="move-list__row">
          <span className="move-list__number">{row.number}.</span>
          {renderMove(row.white)}
          {row.black === null ? <span /> : renderMove(row.black)}
        </li>
      ))}
    </ol>
  );
}
