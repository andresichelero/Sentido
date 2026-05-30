// =============================================================================
// BODY MAP — Region-to-Emotion Mapping
// Based on Nummenmaa et al. 2014 bodily sensation maps
// =============================================================================

import type { BodyRegionId } from '../types/emotion.types';

/**
 * Maps each body region to emotion IDs, ordered by relevance (most relevant first).
 * Based on Nummenmaa et al. 2014 "Bodily maps of emotions" research.
 */
export const BODY_REGION_EMOTION_MAP: Record<BodyRegionId, string[]> = {
  'head': ['anger', 'anger-rage', 'joy', 'surprise', 'fear-anxiety', 'anticipation-vigilance'],
  'face-upper': ['surprise', 'joy', 'anger', 'fear', 'sadness-shame', 'trust-admiration'],
  'face-lower': ['disgust', 'anger-contempt', 'joy', 'surprise', 'sadness-shame'],
  'neck-throat': ['sadness', 'sadness-grief', 'fear', 'disgust', 'fear-vulnerability', 'trust-submission'],
  'chest-upper': ['anger', 'fear', 'joy', 'sadness', 'fear-anxiety', 'joy-ecstasy', 'anticipation', 'trust'],
  'chest-lower': ['sadness', 'sadness-melancholy', 'trust-acceptance', 'disgust', 'sadness-loneliness'],
  'left-shoulder': ['anger', 'anger-hostility', 'fear-worry', 'trust-confidence', 'anticipation-vigilance'],
  'right-shoulder': ['anger', 'anger-hostility', 'fear-worry', 'trust-confidence', 'anticipation-vigilance'],
  'left-upper-arm': ['anger', 'anger-rage', 'joy-ecstasy', 'anticipation', 'anticipation-excitement'],
  'right-upper-arm': ['anger', 'anger-rage', 'joy-ecstasy', 'anticipation', 'anticipation-excitement'],
  'left-forearm': ['anger', 'anger-rage', 'anticipation'],
  'right-forearm': ['anger', 'anger-rage', 'anticipation'],
  'left-hand': ['anger', 'anger-rage', 'anger-irritation', 'joy'],
  'right-hand': ['anger', 'anger-rage', 'anger-irritation', 'joy'],
  'stomach': ['fear', 'fear-anxiety', 'disgust', 'disgust-loathing', 'anticipation', 'sadness-guilt', 'anticipation-envy'],
  'abdomen': ['fear-anxiety', 'disgust', 'sadness-loneliness', 'trust-submission'],
  'lower-back': ['fear', 'sadness', 'anger-frustration'],
  'upper-back': ['sadness', 'fear', 'anger-hostility'],
  'hips': ['fear', 'sadness', 'disgust'],
  'genitals': ['joy-ecstasy', 'fear-vulnerability', 'sadness-shame', 'disgust'],
  'left-thigh': ['fear', 'fear-terror', 'anger'],
  'right-thigh': ['fear', 'fear-terror', 'anger'],
  'left-knee': ['fear', 'fear-terror'],
  'right-knee': ['fear', 'fear-terror'],
  'left-lower-leg': ['fear', 'fear-anxiety'],
  'right-lower-leg': ['fear', 'fear-anxiety'],
  'left-foot': ['fear', 'joy'],
  'right-foot': ['fear', 'joy'],
};

/** All 28 body region IDs */
export const ALL_BODY_REGIONS: BodyRegionId[] = Object.keys(BODY_REGION_EMOTION_MAP) as BodyRegionId[];
