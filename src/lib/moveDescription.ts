const PIECE_NAMES: Record<string, string> = {
  N: 'Cavalo',
  B: 'Bispo',
  R: 'Torre',
  Q: 'Dama',
  K: 'Rei',
};

export function describeMove(san: string | null): string {
  if (!san) return '';

  if (san === 'O-O') return 'Roque pequeno (lado do rei)';
  if (san === 'O-O-O') return 'Roque grande (lado da dama)';

  const isCheckmate = san.endsWith('#');
  const isCheck = !isCheckmate && san.endsWith('+');
  const clean = san.replace(/[+#]/g, '');

  const promotionMatch = clean.match(/=([NBRQ])$/);
  const promotion = promotionMatch ? PIECE_NAMES[promotionMatch[1]] : null;
  const withoutPromotion = clean.replace(/=[NBRQ]$/, '');

  const pieceLetter = /^[NBRQK]/.test(withoutPromotion) ? withoutPromotion[0] : null;
  const pieceName = pieceLetter ? PIECE_NAMES[pieceLetter] : 'Peão';

  const isCapture = withoutPromotion.includes('x');
  const destination = withoutPromotion.slice(-2);

  let text = isCapture ? `${pieceName} captura em ${destination}` : `${pieceName} para ${destination}`;

  if (promotion) text += `, promovendo a ${promotion}`;
  if (isCheckmate) text += ' — xeque-mate';
  else if (isCheck) text += ', dando xeque';

  return text;
}
