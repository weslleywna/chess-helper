const LEVELS = [
  { label: 'Rápido — 0.5s', value: 500 },
  { label: 'Padrão — 2s', value: 2000 },
  { label: 'Forte — 5s', value: 5000 },
  { label: 'Máximo — 10s', value: 10000 },
];

type EngineControlsProps = {
  movetimeMs: number;
  onMovetimeChange: (ms: number) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isThinking: boolean;
  disabled?: boolean;
};

export function EngineControls({
  movetimeMs,
  onMovetimeChange,
  onAnalyze,
  onReset,
  isThinking,
  disabled,
}: EngineControlsProps) {
  return (
    <div className="engine-controls">
      <label className="engine-controls__level">
        Nível de análise
        <select
          value={movetimeMs}
          onChange={(event) => onMovetimeChange(Number(event.target.value))}
          disabled={isThinking}
        >
          {LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </label>

      <div className="engine-controls__buttons">
        <button onClick={onAnalyze} disabled={isThinking || disabled}>
          {isThinking ? 'Analisando…' : 'Analisar melhor jogada'}
        </button>
        <button className="secondary" onClick={onReset} disabled={isThinking}>
          Reiniciar tabuleiro
        </button>
      </div>
    </div>
  );
}
