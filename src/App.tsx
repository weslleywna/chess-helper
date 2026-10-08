import { useState } from 'react';
import { AnalysisView } from './components/AnalysisView';
import { PlayView } from './components/PlayView';
import { KnightLogo } from './components/icons';

type AppMode = 'analyze' | 'play';

const MODE_LABELS: Record<AppMode, string> = {
  analyze: 'Analisar',
  play: 'Jogar',
};

const MODE_DESCRIPTIONS: Record<AppMode, string> = {
  analyze:
    'Reproduza os lances ou carregue uma partida em andamento (PGN/FEN). A barra mostra quem está melhor e o Stockfish sugere o próximo lance.',
  play: 'Jogue contra o Stockfish no nível que escolher. Se errar, o treinador mostra o porquê e você pode desfazer.',
};

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('analyze');

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand__logo">
            <KnightLogo />
          </span>
          <div>
            <h1 className="brand__name">Chess Helper</h1>
            <p className="brand__tagline">Seu assistente de xadrez com Stockfish</p>
          </div>
        </div>
        <nav className="tabs" role="tablist" aria-label="Modo">
          {(Object.keys(MODE_LABELS) as AppMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              role="tab"
              aria-selected={appMode === mode}
              className={`tabs__tab${appMode === mode ? ' tabs__tab--active' : ''}`}
              onClick={() => setAppMode(mode)}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </nav>
      </header>

      <p className="mode-intro">{MODE_DESCRIPTIONS[appMode]}</p>

      {appMode === 'analyze' ? <AnalysisView /> : <PlayView />}

      <footer className="footer">
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
