// =============================================================================
// EMOTION TYPES — Sentido App
// Based on Plutchik's Wheel of Emotions model
// =============================================================================

/** The three concentric layers of the emotion wheel */
export type EmotionLayer = 'primary' | 'secondary' | 'tertiary';

/** The 8 primary emotion sectors of Plutchik's wheel */
export type PlutchikSector =
  | 'joy'
  | 'trust'
  | 'fear'
  | 'surprise'
  | 'sadness'
  | 'disgust'
  | 'anger'
  | 'anticipation';

/** 28 body regions based on Nummenmaa et al. 2014 body mapping studies */
export type BodyRegionId =
  | 'head'
  | 'face-upper'
  | 'face-lower'
  | 'neck-throat'
  | 'chest-upper'
  | 'chest-lower'
  | 'left-shoulder'
  | 'right-shoulder'
  | 'left-upper-arm'
  | 'right-upper-arm'
  | 'left-forearm'
  | 'right-forearm'
  | 'left-hand'
  | 'right-hand'
  | 'stomach'
  | 'abdomen'
  | 'lower-back'
  | 'upper-back'
  | 'hips'
  | 'genitals'
  | 'left-thigh'
  | 'right-thigh'
  | 'left-knee'
  | 'right-knee'
  | 'left-lower-leg'
  | 'right-lower-leg'
  | 'left-foot'
  | 'right-foot';

/** Body view side for silhouette display */
export type BodySide = 'front' | 'back';

/**
 * A single emotion node in the Plutchik emotion tree.
 * Every field must be populated — no empty strings or empty arrays without real content.
 */
export interface EmotionNode {
  /** Slug ID. Convention: primary='sector', secondary='sector-name', tertiary='sector-secondary-name' */
  id: string;
  /** Display name in Brazilian Portuguese */
  name: string;
  /** Display name in English (for reference) */
  nameEn: string;
  /** Which of the 8 primary sectors this emotion belongs to */
  sector: PlutchikSector;
  /** Layer in the wheel: primary (8 core), secondary (branching), tertiary (granular) */
  layer: EmotionLayer;
  /** Parent emotion ID, null for primary emotions */
  parentId: string | null;
  /** Intensity within the sector: 1 = mildest (outer ring), 2 = medium, 3 = most intense (inner ring) */
  intensityLevel: 1 | 2 | 3;
  /** Hex color for this emotion */
  color: string;
  /** 3-5 sentence description of the emotion */
  description: string;
  /** Adaptive evolutionary function of this emotion */
  evolutionaryFunction: string;
  /** Textual list of where this emotion is physically felt in the body */
  somaticSignals: string[];
  /** Body regions with high activation (Nummenmaa mapping) */
  bodyRegions: BodyRegionId[];
  /** Body regions with low activation / deactivation */
  bodyRegionsDeactivated: BodyRegionId[];
  /** Common triggers for this emotion */
  triggers: string[];
  /** Brief psychoanalytic perspective */
  psychoanalyticNote: string;
  /** IDs of regulation techniques suitable for this emotion */
  regulationTechniqueIds: string[];
  /** IDs of related dyads */
  relatedDyadIds: string[];
  /** Valence score: -1.0 (negative) to +1.0 (positive) */
  valence: number;
  /** Arousal score: 0.0 (calm) to 1.0 (activated) */
  arousal: number;
  /** Audio guide asset ID, null if not available */
  audioGuideId: string | null;
}

/**
 * A dyad — the blend of two adjacent or alternating Plutchik sectors
 * producing a composite emotion.
 */
export interface EmotionDyad {
  /** Unique identifier */
  id: string;
  /** Display name in Brazilian Portuguese */
  name: string;
  /** The two sectors that combine to form this dyad */
  sectors: [PlutchikSector, PlutchikSector];
  /** Description of the dyad */
  description: string;
  /** Blended color (hex) of the two sector colors */
  color: string;
}

/**
 * A regulation technique to help manage/process an emotion.
 */
export interface RegulationTechnique {
  /** Unique identifier */
  id: string;
  /** Display name in Brazilian Portuguese */
  name: string;
  /** Estimated duration in seconds */
  duration: number;
  /** Category of the technique */
  category: 'breathing' | 'grounding' | 'movement' | 'cognitive' | 'somatic' | 'social';
  /** Step-by-step instructions */
  steps: string[];
  /** Emotion IDs this technique is recommended for */
  emotionIds: string[];
  /** Whether this technique includes a timer component */
  hasTimer: boolean;
}
