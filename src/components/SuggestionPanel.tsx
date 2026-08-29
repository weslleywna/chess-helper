type SuggestionPanelProps = {
  san: string | null;
  description: string;
  isThinking: boolean;
};

export function SuggestionPanel({ san, description, isThinking }: SuggestionPanelProps) {
  if (isThinking) {
    return (
      <div className="suggestion-panel suggestion-panel--thinking">
        <span className="spinner" aria-hidden="true" />
        Stockfish está pensando…
      </div>
    );
  }

  if (!san) {
    return (
      <div className="suggestion-panel suggestion-panel--empty">
        Faça a jogada do adversário no tabuleiro e clique em "Analisar melhor jogada".
      </div>
    );
  }

  return (
    <div className="suggestion-panel">
      <div className="suggestion-panel__label">Melhor resposta</div>
      <div className="suggestion-panel__san">{san}</div>
      <div className="suggestion-panel__description">{description}</div>
    </div>
  );
}
