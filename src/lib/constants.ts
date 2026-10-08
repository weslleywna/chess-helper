import { MAX_ELO } from '../engine/stockfishClient';

export const ELO_PRESETS = [
  { label: '1320 — Iniciante', value: 1320 },
  { label: '1500 — Casual', value: 1500 },
  { label: '1800 — Intermediário', value: 1800 },
  { label: '2000 — Intermediário forte', value: 2000 },
  { label: '2200 — Candidato a Mestre', value: 2200 },
  { label: '2500 — Mestre', value: 2500 },
  { label: '2800 — Mestre Internacional', value: 2800 },
  { label: `${MAX_ELO} — Grande Mestre`, value: MAX_ELO },
];

export const ARROW_COLORS = {
  best: '#2f9e44',
  threat: '#e03131',
};
