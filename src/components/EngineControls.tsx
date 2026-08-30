import { MAX_ELO, MIN_ELO } from '../engine/stockfishClient';

export type AnalysisMode = 'best' | 'rated';

const MOVETIME_LEVELS = [
  { label: 'Rápido — 0.5s', value: 500 },
  { label: 'Padrão — 2s', value: 2000 },
  { label: 'Forte — 5s', value: 5000 },
  { label: 'Máximo — 10s', value: 10000 },
];

const ELO_PRESETS = [
  { label: '1320 — Iniciante', value: 1320 },
  { label: '1500 — Casual', value: 1500 },
  { label: '1800 — Intermediário', value: 1800 },
  { label: '2000 — Intermediário forte', value: 2000 },
  { label: '2200 — Candidato a Mestre', value: 2200 },
  { label: '2500 — Mestre', value: 2500 },
  { label: '2800 — Mestre Internacional', value: 2800 },
  { label: `${MAX_ELO} — Grande Mestre`, value: MAX_ELO },
];

type EngineControlsProps = {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  eloRating: number;
  onEloRatingChange: (elo: number) => void;
  movetimeMs: number;
  onMovetimeChange: (ms: number) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isThinking: boolean;
  disabled?: boolean;
};

export function EngineControls({
  mode,
  onModeChange,
  eloRating,
  onEloRatingChange,
  movetimeMs,
  onMovetimeChange,
  onAnalyze,
  onReset,
  isThinking,
  disabled,
}: EngineControlsProps) {
  return (
    <div className="engine-controls">
      <div className="engine-controls__mode" role="tablist" aria-label="Modo de análise">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'best'}
          className={mode === 'best' ? 'active' : ''}
          onClick={() => onModeChange('best')}
          disabled={isThinking}
        >
          Melhor jogada possível
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'rated'}
          className={mode === 'rated' ? 'active' : ''}
          onClick={() => onModeChange('rated')}
          disabled={isThinking}
        >
          Nível por rating
        </button>
      </div>

      {mode === 'rated' && (
        <label className="engine-controls__level">
          Rating aproximado ({MIN_ELO}–{MAX_ELO})
          <select
            value={eloRating}
            onChange={(event) => onEloRatingChange(Number(event.target.value))}
            disabled={isThinking}
          >
            {ELO_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="engine-controls__level">
        Nível de análise
        <select
          value={movetimeMs}
          onChange={(event) => onMovetimeChange(Number(event.target.value))}
          disabled={isThinking}
        >
          {MOVETIME_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </label>

      <div className="engine-controls__buttons">
        <button onClick={onAnalyze} disabled={isThinking || disabled}>
          {isThinking ? 'Analisando…' : mode === 'best' ? 'Analisar melhor jogada' : `Analisar (nível ${eloRating})`}
        </button>
        <button className="secondary" onClick={onReset} disabled={isThinking}>
          Reiniciar tabuleiro
        </button>
      </div>
    </div>
  );
}
