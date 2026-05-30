// =============================================================================
// DYADS — Plutchik Emotion Dyads
// Composite emotions formed by combining adjacent or alternating sectors
// =============================================================================

import type { EmotionDyad } from '../types/emotion.types';

/** Primary dyads (adjacent sectors) + secondary dyads (alternating sectors) */
export const DYADS: EmotionDyad[] = [
  // ── Primary Dyads (adjacent sectors) ──────────────────────────────────────
  {
    id: 'love',
    name: 'Amor',
    sectors: ['joy', 'trust'],
    description: 'Amor é a combinação de alegria e confiança — a emoção de vínculo profundo. Sentir-se seguro e feliz com alguém. É o cimento dos relacionamentos duradouros.',
    color: '#F87171',
  },
  {
    id: 'submission',
    name: 'Submissão',
    sectors: ['trust', 'fear'],
    description: 'Submissão é a combinação de confiança e medo — render-se a uma autoridade percebida como legítima. Pode ser saudável (respeito) ou disfuncional (obediência cega).',
    color: '#A78BFA',
  },
  {
    id: 'awe',
    name: 'Assombro Reverente',
    sectors: ['fear', 'surprise'],
    description: 'Assombro reverente é a combinação de medo e surpresa — a reverência diante do grandioso e incompreensível. Sentido diante da natureza, do cosmos, do sagrado.',
    color: '#60A5FA',
  },
  {
    id: 'disapproval',
    name: 'Desaprovação',
    sectors: ['surprise', 'sadness'],
    description: 'Desaprovação é a combinação de surpresa e tristeza — o choque decepcionado diante de algo que viola expectativas morais ou pessoais.',
    color: '#818CF8',
  },
  {
    id: 'remorse',
    name: 'Remorso',
    sectors: ['sadness', 'disgust'],
    description: 'Remorso é a combinação de tristeza e desgosto — a dor moral de ter feito algo repugnante. É mais intenso que a culpa e envolve repulsa pela própria ação.',
    color: '#C084FC',
  },
  {
    id: 'contempt',
    name: 'Desprezo',
    sectors: ['disgust', 'anger'],
    description: 'Desprezo é a combinação de desgosto e raiva — rejeição com hostilidade. É considerar o outro indigno e sentir raiva por isso. Uma das emoções mais destrutivas em relacionamentos.',
    color: '#F97316',
  },
  {
    id: 'aggressiveness',
    name: 'Agressividade',
    sectors: ['anger', 'anticipation'],
    description: 'Agressividade é a combinação de raiva e antecipação — a raiva mobilizada e direcionada. É a preparação ativa para confronto, com energia e foco.',
    color: '#FB923C',
  },
  {
    id: 'optimism',
    name: 'Otimismo',
    sectors: ['anticipation', 'joy'],
    description: 'Otimismo é a combinação de antecipação e alegria — a expectativa confiante de que o futuro trará coisas boas. Alimenta a resiliência e a motivação.',
    color: '#FACC15',
  },
  // ── Secondary Dyads (alternating sectors) ─────────────────────────────────
  {
    id: 'guilt',
    name: 'Culpa',
    sectors: ['joy', 'fear'],
    description: 'Culpa como díade é a combinação de alegria e medo — o prazer tingido de medo por tê-lo. Sentir que não se merece algo bom, ou que o prazer terá consequências.',
    color: '#4ADE80',
  },
  {
    id: 'curiosity',
    name: 'Curiosidade',
    sectors: ['trust', 'surprise'],
    description: 'Curiosidade como díade é a combinação de confiança e surpresa — a abertura segura ao desconhecido. Confiar que o novo será interessante, não ameaçador.',
    color: '#38BDF8',
  },
];

/** Quick-access map by dyad ID */
export const DYADS_BY_ID: ReadonlyMap<string, EmotionDyad> = new Map(
  DYADS.map((d) => [d.id, d])
);
