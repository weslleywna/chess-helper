import { defaultPieces } from 'react-chessboard';
import { ERASER, type PositionEditorState } from '../hooks/usePositionEditor';
import { EraseIcon } from './icons';

const PIECE_NAMES: Record<string, string> = { K: 'Rei', Q: 'Dama', R: 'Torre', B: 'Bispo', N: 'Cavalo', P: 'Peão' };
const FEMININE = new Set(['Q', 'R']);
const PIECE_ORDER = ['K', 'Q', 'R', 'B', 'N', 'P'];

type PositionEditorProps = {
  editor: PositionEditorState;
  onApply: (fen: string) => void;
};

/** Painel lateral do editor: paleta de peças, vez de jogar e ações. */
export function PositionEditor({ editor, onApply }: PositionEditorProps) {
  const handleApply = () => {
    const fen = editor.finish();
    if (fen) onApply(fen);
  };

  return (
    <section className="card card--accent">
      <header className="card__header">
        <h2 className="card__title">Montar posição</h2>
      </header>
      <p className="card__hint">
        Escolha uma peça e clique nas casas. Arraste para mover; arraste para fora do tabuleiro para remover.
      </p>

      <div className="palette" role="radiogroup" aria-label="Peça a colocar">
        {(['w', 'b'] as const).map((color) =>
          PIECE_ORDER.map((type) => {
            const pieceType = `${color}${type}`;
            const renderPiece = defaultPieces[pieceType];
            return (
              <button
                key={pieceType}
                type="button"
                role="radio"
                aria-checked={editor.tool === pieceType}
                aria-label={`${PIECE_NAMES[type]} ${color === 'w' ? 'branc' : 'pret'}${FEMININE.has(type) ? 'a' : 'o'}`}
                className={`palette__piece${editor.tool === pieceType ? ' palette__piece--active' : ''}`}
                onClick={() => editor.setTool(pieceType)}
              >
                {renderPiece()}
              </button>
            );
          }),
        )}
        <button
          type="button"
          role="radio"
          aria-checked={editor.tool === ERASER}
          aria-label="Borracha"
          className={`palette__piece palette__piece--eraser${editor.tool === ERASER ? ' palette__piece--active' : ''}`}
          onClick={() => editor.setTool(ERASER)}
        >
          <EraseIcon width={20} height={20} />
        </button>
      </div>

      <div className="field-group">
        <span className="field-label">Vez de jogar</span>
        <div className="segmented" role="radiogroup" aria-label="Vez de jogar">
          {(['w', 'b'] as const).map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={editor.turn === color}
              className={editor.turn === color ? 'active' : ''}
              onClick={() => editor.setTurn(color)}
            >
              <span className={`turn-dot turn-dot--${color}`} /> {color === 'w' ? 'Brancas' : 'Pretas'}
            </button>
          ))}
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="btn btn--small" onClick={editor.setStartingPosition}>
          Posição inicial
        </button>
        <button type="button" className="btn btn--small" onClick={editor.clear}>
          Limpar tabuleiro
        </button>
      </div>

      {editor.error && <p className="notice notice--error">{editor.error}</p>}

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={handleApply}>
          Analisar esta posição
        </button>
        <button type="button" className="btn btn--ghost" onClick={editor.close}>
          Cancelar
        </button>
      </div>
    </section>
  );
}
