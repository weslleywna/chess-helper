type SuggestionPanelProps = {
  san: string | null;
  description: string;
  isThinking: boolean;
  label: string;
  emptyText: string;
};

export function SuggestionPanel({ san, description, isThinking, label, emptyText }: SuggestionPanelProps) {
  if (isThinking) {
    return (
      <div className="suggestion suggestion--muted" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        Stockfish está pensando…
      </div>
    );
  }

  if (!san) {
    return <div className="suggestion suggestion--muted">{emptyText}</div>;
  }

  return (
    <div className="suggestion" aria-live="polite">
      <div className="suggestion__label">{label}</div>
      <div className="suggestion__san">{san}</div>
      <div className="suggestion__description">{description}</div>
    </div>
  );
}
