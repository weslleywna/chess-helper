import { MAX_ELO, MIN_ELO } from '../engine/stockfishClient';
import { ELO_PRESETS } from '../lib/constants';
import { SearchIcon } from './icons';

export type AnalysisMode = 'best' | 'rated';

const MOVETIME_LEVELS = [
  { label: 'Rápido — 0.5s', value: 500 },
  { label: 'Padrão — 2s', value: 2000 },
  { label: 'Forte — 5s', value: 5000 },
  { label: 'Máximo — 10s', value: 10000 },
];

type EngineControlsProps = {
  mode: AnalysisMode;
  onModeChange: (mode: AnalysisMode) => void;
  eloRating: number;
  onEloRatingChange: (elo: number) => void;
  movetimeMs: number;
  onMovetimeChange: (ms: number) => void;
  onAnalyze: () => void;
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
  isThinking,
  disabled,
}: EngineControlsProps) {
  return (
    <div className="engine-controls">
      <div className="segmented" role="tablist" aria-label="Modo de análise">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'best'}
          className={mode === 'best' ? 'active' : ''}
          onClick={() => onModeChange('best')}
          disabled={isThinking}
        >
          Melhor jogada
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

      <div className="field-grid">
        {mode === 'rated' && (
          <label className="field-group">
            <span className="field-label">
              Rating aproximado ({MIN_ELO}–{MAX_ELO})
            </span>
            <select
              className="field"
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

        <label className="field-group">
          <span className="field-label">Tempo de análise</span>
          <select
            className="field"
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
      </div>

      <button type="button" className="btn btn--primary btn--block" onClick={onAnalyze} disabled={isThinking || disabled}>
        <SearchIcon />
        {isThinking ? 'Analisando…' : mode === 'best' ? 'Analisar melhor jogada' : `Analisar (nível ${eloRating})`}
      </button>
    </div>
  );
}
