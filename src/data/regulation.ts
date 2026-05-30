// =============================================================================
// REGULATION TECHNIQUES — Emotion Regulation Strategies
// Minimum 10 techniques as specified in the plan
// =============================================================================

import type { RegulationTechnique } from '../types/emotion.types';

export const REGULATION_TECHNIQUES: RegulationTechnique[] = [
  {
    id: 'breathing-478',
    name: 'Respiração 4-7-8',
    duration: 120,
    category: 'breathing',
    steps: [
      'Sente-se confortavelmente e feche os olhos.',
      'Inspire pelo nariz contando até 4.',
      'Segure a respiração contando até 7.',
      'Expire lentamente pela boca contando até 8.',
      'Repita o ciclo 4 vezes.',
      'Observe como seu corpo se sente ao final.',
    ],
    emotionIds: ['anger', 'anger-rage', 'fear', 'fear-anxiety', 'anger-frustration', 'fear-vulnerability'],
    hasTimer: true,
  },
  {
    id: 'grounding-54321',
    name: 'Ancoragem 5-4-3-2-1',
    duration: 180,
    category: 'grounding',
    steps: [
      'Nomeie 5 coisas que você pode VER ao seu redor.',
      'Nomeie 4 coisas que você pode TOCAR.',
      'Nomeie 3 coisas que você pode OUVIR.',
      'Nomeie 2 coisas que você pode CHEIRAR.',
      'Nomeie 1 coisa que você pode SABOREAR.',
      'Respire fundo e observe como se sente agora.',
    ],
    emotionIds: ['fear-terror', 'fear-anxiety', 'sadness-despair', 'surprise-disbelief'],
    hasTimer: false,
  },
  {
    id: 'cold-water',
    name: 'Água Fria no Rosto',
    duration: 60,
    category: 'somatic',
    steps: [
      'Vá até uma pia ou tenha água gelada disponível.',
      'Incline-se e jogue água fria no rosto, especialmente testa e bochechas.',
      'Segure um cubo de gelo nas mãos por 30 segundos (alternativa).',
      'Isso ativa o reflexo de mergulho, reduzindo frequência cardíaca.',
      'Repita se necessário.',
    ],
    emotionIds: ['anger-rage', 'anger', 'disgust-loathing', 'fear-terror'],
    hasTimer: true,
  },
  {
    id: 'box-breathing',
    name: 'Respiração Quadrada',
    duration: 120,
    category: 'breathing',
    steps: [
      'Inspire contando até 4.',
      'Segure contando até 4.',
      'Expire contando até 4.',
      'Segure (pulmões vazios) contando até 4.',
      'Repita por 4 a 8 ciclos.',
      'Mantenha o ritmo constante e suave.',
    ],
    emotionIds: ['fear-anxiety', 'fear', 'fear-apprehension', 'anger-annoyance', 'fear-worry', 'anticipation-vigilance'],
    hasTimer: true,
  },
  {
    id: 'progressive-relaxation',
    name: 'Relaxamento Muscular Progressivo',
    duration: 300,
    category: 'somatic',
    steps: [
      'Deite-se ou sente-se confortavelmente.',
      'Comece pelos pés: contraia os músculos por 5 segundos, depois solte.',
      'Suba para as panturrilhas: contraia 5 segundos, solte.',
      'Continue subindo: coxas, abdômen, peito, braços, mãos, ombros, rosto.',
      'Em cada grupo muscular, note a diferença entre tensão e relaxamento.',
      'Ao terminar, faça 3 respirações profundas.',
    ],
    emotionIds: ['fear', 'fear-anxiety', 'anger', 'anticipation-vigilance', 'sadness-grief'],
    hasTimer: true,
  },
  {
    id: 'physical-movement',
    name: 'Movimento Físico Breve',
    duration: 180,
    category: 'movement',
    steps: [
      'Levante-se do lugar onde está.',
      'Faça 20 polichinelos ou agachamentos.',
      'Ou: caminhe rapidamente por 3 minutos.',
      'Ou: dance uma música inteira.',
      'O objetivo é mover energia acumulada no corpo.',
      'Ao parar, respire fundo 3 vezes e note como se sente.',
    ],
    emotionIds: ['sadness', 'sadness-melancholy', 'disgust-boredom', 'anger-frustration', 'anger'],
    hasTimer: true,
  },
  {
    id: 'self-compassion',
    name: 'Autocompaixão',
    duration: 180,
    category: 'cognitive',
    steps: [
      'Coloque a mão no peito e sinta o calor.',
      'Diga internamente: "Isso é um momento de sofrimento."',
      'Depois: "Sofrimento faz parte da experiência humana."',
      'Depois: "Que eu possa ser gentil comigo neste momento."',
      'Respire profundamente enquanto mantém a mão no peito.',
      'Permita-se sentir o que está sentindo sem julgamento.',
    ],
    emotionIds: ['sadness-shame', 'sadness-guilt', 'disgust-self-disgust', 'sadness-despair', 'fear-insecurity', 'fear-vulnerability', 'trust-submission', 'sadness-loneliness', 'sadness-disappointment', 'anger-contempt', 'disgust-cynicism', 'anticipation-envy', 'disgust-rejection'],
    hasTimer: false,
  },
  {
    id: 'journaling-prompt',
    name: 'Escrita Expressiva',
    duration: 300,
    category: 'cognitive',
    steps: [
      'Pegue papel e caneta (ou abra um documento).',
      'Escreva livremente sobre o que está sentindo, sem filtro.',
      'Não se preocupe com gramática ou coerência.',
      'Escreva por pelo menos 5 minutos sem parar.',
      'Ao terminar, releia o que escreveu.',
      'Pergunte-se: "O que isso me diz sobre o que preciso?"',
    ],
    emotionIds: ['anger-frustration', 'sadness', 'sadness-guilt', 'sadness-shame', 'anger-hostility', 'anger-contempt', 'fear-worry', 'fear-insecurity', 'surprise-confusion', 'disgust-self-disgust', 'disgust-cynicism', 'sadness-disappointment', 'sadness-melancholy', 'anticipation-envy', 'disgust-rejection'],
    hasTimer: true,
  },
  {
    id: 'sensory-grounding',
    name: 'Âncora Sensorial',
    duration: 120,
    category: 'grounding',
    steps: [
      'Escolha um objeto que esteja ao seu alcance.',
      'Segure-o nas mãos e observe sua textura com atenção.',
      'Note a temperatura, o peso, a forma.',
      'Traga toda a sua atenção para as sensações táteis.',
      'Se pensamentos vierem, gentilmente volte ao objeto.',
      'Continue por 2 minutos.',
    ],
    emotionIds: ['fear-terror', 'surprise', 'surprise-amazement', 'surprise-confusion', 'surprise-disbelief', 'anger-annoyance', 'disgust-boredom', 'disgust-aversion', 'disgust-loathing', 'surprise-distraction'],
    hasTimer: true,
  },
  {
    id: 'urge-surfing',
    name: 'Surf do Impulso',
    duration: 180,
    category: 'cognitive',
    steps: [
      'Quando sentir um impulso forte (gritar, bater, fugir), pare.',
      'Observe o impulso como uma onda: ele cresce, atinge o pico e diminui.',
      'Note onde no corpo você sente o impulso.',
      'Respire com a sensação, sem agir sobre ela.',
      'Lembre-se: impulsos duram em média 15-20 minutos se não alimentados.',
      'Observe a onda descer. Você é mais forte que o impulso.',
    ],
    emotionIds: ['anger-rage', 'anger', 'anger-hostility', 'anger-irritation'],
    hasTimer: true,
  },
];

/** Quick-access map by technique ID */
export const TECHNIQUES_BY_ID: ReadonlyMap<string, RegulationTechnique> = new Map(
  REGULATION_TECHNIQUES.map((t) => [t.id, t])
);
