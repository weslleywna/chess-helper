import { useState } from 'react';
import { AnalysisView } from './components/AnalysisView';
import { PlayView } from './components/PlayView';

type AppMode = 'analyze' | 'play';

const MODE_DESCRIPTIONS: Record<AppMode, string> = {
  analyze: 'Faça a jogada do adversário no tabuleiro e descubra a melhor resposta segundo o Stockfish.',
  play: 'Jogue contra o Stockfish no nível que escolher. Se errar, o treinador mostra o porquê e você pode desfazer.',
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('analyze');

  return (
    <div className="app">
      <header className="app__header">
        <h1>Chess Helper</h1>
        <div className="app__tabs" role="tablist" aria-label="Modo">
          <button
            type="button"
            role="tab"
            aria-selected={appMode === 'analyze'}
            className={appMode === 'analyze' ? 'active' : ''}
            onClick={() => setAppMode('analyze')}
          >
            Analisar posição
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={appMode === 'play'}
            className={appMode === 'play' ? 'active' : ''}
            onClick={() => setAppMode('play')}
          >
            Jogar contra o Stockfish
          </button>
        </div>
        <p>{MODE_DESCRIPTIONS[appMode]}</p>
      </header>

      {appMode === 'analyze' ? <AnalysisView /> : <PlayView />}

      <footer className="app__footer">
        Motor de análise:{' '}
        <a href="https://github.com/official-stockfish/Stockfish" target="_blank" rel="noreferrer">
          Stockfish
        </a>{' '}
        via{' '}
        <a href="https://github.com/nmrugg/stockfish.js" target="_blank" rel="noreferrer">
          Stockfish.js
        </a>
        , licenciado sob a{' '}
        <a href={`${import.meta.env.BASE_URL}stockfish/Copying.txt`} target="_blank" rel="noreferrer">
          GPLv3
        </a>
        . Este app também é software livre (GPLv3):{' '}
        <a href="https://github.com/weslleywna/chess-helper" target="_blank" rel="noreferrer">
          código-fonte
        </a>
        .
      </footer>
    </div>
  );
}
