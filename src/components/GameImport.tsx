import { useState } from 'react';
import type { LoadResult } from '../hooks/useChessGame';
import { EditIcon, UploadIcon } from './icons';

type GameImportProps = {
  onLoad: (text: string) => LoadResult;
  onOpenEditor: () => void;
};

/** Traz para o tabuleiro uma partida que já está em andamento (FEN, PGN ou montando à mão). */
export function GameImport({ onLoad, onOpenEditor }: GameImportProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<LoadResult | null>(null);

  const handleLoad = () => {
    const loaded = onLoad(text);
    setResult(loaded);
    if (loaded.ok) setText('');
  };

  return (
    <section className="card">
      <header className="card__header">
        <h2 className="card__title">Partida em andamento</h2>
      </header>
      <p className="card__hint">
        Cole o <strong>PGN</strong> (todos os lances) ou o <strong>FEN</strong> (só a posição) da partida, ou monte a
        posição peça por peça.
      </p>
      <textarea
        className="field field--textarea"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setResult(null);
        }}
        placeholder={'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6…\nou\nr1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3'}
        rows={3}
        spellCheck={false}
        aria-label="FEN ou PGN da partida"
      />
      {result && <p className={`notice ${result.ok ? 'notice--ok' : 'notice--error'}`}>{result.ok ? result.description : result.error}</p>}
      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={handleLoad} disabled={!text.trim()}>
          <UploadIcon /> Carregar
        </button>
        <button type="button" className="btn" onClick={onOpenEditor}>
          <EditIcon /> Montar posição
        </button>
      </div>
      <details className="help">
        <summary>Onde encontro o PGN ou o FEN?</summary>
        <ul>
          <li>
            <strong>Chess.com:</strong> no botão <em>Compartilhar</em> da partida, copie o PGN ou o FEN.
          </li>
          <li>
            <strong>Lichess:</strong> no menu da partida, em <em>Compartilhar e exportar</em>, ou copie o FEN que
            aparece abaixo do tabuleiro de análise.
          </li>
          <li>
            <strong>Tabuleiro físico:</strong> use <em>Montar posição</em>, ou reproduza os lances dos dois lados aqui
            no tabuleiro.
          </li>
        </ul>
      </details>
    </section>
  );
}
