// =============================================================================
// EmotionSheet — Bottom sheet showing full detail of a selected emotion
// Spec section 10.3 — 11 content sections
// Uses the generic Sheet component (Reanimated + Gesture Handler, no Gorhom)
// =============================================================================

import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Sheet } from '../ui/Sheet';
import { Typography } from '../ui/Typography';
import { Spacer } from '../ui/Spacer';
import { Divider } from '../ui/Divider';
import { Card } from '../ui/Card';
import { Tag } from '../ui/Tag';
import { Button } from '../ui/Button';
import { EmotionBadge } from './EmotionBadge';
import { RegulationAccordion } from './RegulationAccordion';
import { BodyMapCanvas } from '../body-map/BodyMapCanvas';
import { audioPlayerService } from '../../services/audio/player';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useHaptics } from '../../hooks/useHaptics';
import { useWheelStore } from '../../stores/useWheelStore';
import { useEmotionStore } from '../../stores/useEmotionStore';
import { getEmotionById, getEmotionsBySector, getDyadsBySector } from '../../utils/emotion-math';
import { TECHNIQUES_BY_ID } from '../../data/regulation';
import { spacing } from '../../theme/spacing';
import type { EmotionNode } from '../../types/emotion.types';

interface EmotionSheetProps {
  /** Whether the sheet is visible */
  isOpen: boolean;
  /** Callback when the sheet is dismissed */
  onClose: () => void;
  /** Currently selected emotion ID */
  emotionId: string | null;
}

// ─── Section Components ──────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  const colors = useThemeColors();
  return (
    <Typography
      variant="label-lg"
      color={colors.textTertiary}
      style={styles.sectionLabel}
    >
      {label}
    </Typography>
  );
}

// ─── Intensity badge ─────────────────────────────────────────────────────────

function IntensityBadge({
  level,
  color,
}: {
  level: 1 | 2 | 3;
  color: string;
}) {
  const labels = { 1: 'SUAVE', 2: 'MÉDIA', 3: 'INTENSA' } as const;
  return (
    <View style={[styles.intensityBadge, { backgroundColor: color + '25' }]}>
      <View style={[styles.intensityDot, { backgroundColor: color }]} />
      <Typography variant="label-md" color={color}>
        {labels[level]}
      </Typography>
    </View>
  );
}

// ─── Triggers section ────────────────────────────────────────────────────────

function TriggersSection({
  triggers,
  accentColor,
}: {
  triggers: string[];
  accentColor: string;
}) {
  return (
    <View>
      <SectionLabel label="O QUE DESENCADEIA" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {triggers.map((trigger, index) => (
          <Tag key={index} label={trigger} activeColor={accentColor} />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Psychoanalytic note ─────────────────────────────────────────────────────

function PsychoNote({
  note,
  accentColor,
}: {
  note: string;
  accentColor: string;
}) {
  return (
    <View>
      <SectionLabel label="NOTA PSICANALÍTICA" />
      <Card borderColor={accentColor + '40'}>
        <View style={styles.noteHeader}>
          <Feather name="book-open" size={14} color={accentColor} />
          <Typography variant="label-md" color={accentColor}>
            Perspectiva clínica
          </Typography>
        </View>
        <Spacer height={spacing.xs} />
        <Typography variant="body-sm" color={undefined}>
          {note}
        </Typography>
      </Card>
    </View>
  );
}

// ─── Related emotions ────────────────────────────────────────────────────────

function RelatedEmotionsSection({
  emotion,
  onSelectEmotion,
}: {
  emotion: EmotionNode;
  onSelectEmotion: (id: string) => void;
}) {
  const colors = useThemeColors();

  // Get sibling emotions from same sector (exclude self)
  const related = useMemo(() => {
    const sectorEmotions = getEmotionsBySector(emotion.sector);
    return sectorEmotions
      .filter((e) => e.id !== emotion.id)
      .slice(0, 8);
  }, [emotion.id, emotion.sector]);

  // Get related dyads
  const dyads = useMemo(
    () => getDyadsBySector(emotion.sector),
    [emotion.sector]
  );

  if (related.length === 0 && dyads.length === 0) return null;

  return (
    <View>
      <SectionLabel label="EMOÇÕES RELACIONADAS" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {related.map((e) => (
          <EmotionBadge
            key={e.id}
            emotionId={e.id}
            onPress={onSelectEmotion}
          />
        ))}
      </ScrollView>
      {dyads.length > 0 && (
        <>
          <Spacer height={spacing.sm} />
          <View style={styles.dyadRow}>
            {dyads.slice(0, 3).map((d) => (
              <View key={d.id} style={[styles.dyadChip, { borderColor: d.color + '40' }]}>
                <View style={[styles.dyadDot, { backgroundColor: d.color }]} />
                <Typography variant="label-sm" color={colors.textSecondary}>
                  {d.name}
                </Typography>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Regulation section ──────────────────────────────────────────────────────

function RegulationSection({
  techniqueIds,
  accentColor,
}: {
  techniqueIds: string[];
  accentColor: string;
}) {
  const techniques = useMemo(
    () =>
      techniqueIds
        .map((id) => TECHNIQUES_BY_ID.get(id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined),
    [techniqueIds]
  );

  if (techniques.length === 0) return null;

  return (
    <View>
      <SectionLabel label="COMO REGULAR" />
      {techniques.map((technique) => (
        <RegulationAccordion
          key={technique.id}
          technique={technique}
          accentColor={accentColor}
        />
      ))}
    </View>
  );
}

// ─── Main EmotionSheet ───────────────────────────────────────────────────────

export function EmotionSheet({
  isOpen,
  onClose,
  emotionId,
}: EmotionSheetProps) {
  const colors = useThemeColors();
  const { mediumImpact, successNotification } = useHaptics();
  const selectEmotion = useWheelStore((s) => s.selectEmotion);
  const addEmotion = useEmotionStore((s) => s.addEmotion);
  const setEntryMode = useEmotionStore((s) => s.setEntryMode);
  const draft = useEmotionStore((s) => s.draft);

  const emotion = useMemo(
    () => (emotionId ? getEmotionById(emotionId) : undefined),
    [emotionId]
  );

  React.useEffect(() => {
    if (!isOpen) {
      audioPlayerService.unload();
    }
  }, [isOpen]);

  if (!emotion) return null;

  const isAlreadyAdded = draft?.emotions.some(
    (e) => e.emotionId === emotion.id
  );

  const handleRegister = () => {
    if (isAlreadyAdded) return;
    mediumImpact();
    addEmotion({
      emotionId: emotion.id,
      intensity: 0,
      layer: emotion.layer,
    });
    setEntryMode('intensity');
    onClose();
  };

  const handleSelectRelated = (id: string) => {
    selectEmotion(id);
  };

  return (
    <Sheet isOpen={isOpen} onClose={onClose} snapTo="preview">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* 1. Intensity badge + sector color */}
        <IntensityBadge level={emotion.intensityLevel} color={emotion.color} />

        <Spacer height={spacing.sm} />

        {/* 2. Emotion name */}
        <Typography variant="display-lg">{emotion.name}</Typography>

        {/* 3. Tagline: evolutionary function */}
        <Spacer height={spacing.xs} />
        <Typography
          variant="body-md"
          color={colors.textSecondary}
          style={styles.tagline}
        >
          {emotion.evolutionaryFunction}
        </Typography>

        {/* 4. Divider */}
        <Divider spacing={spacing.md} />

        {/* 5. Onde você sente — Mini body map */}
        <SectionLabel label="ONDE VOCÊ SENTE" />
        <BodyMapCanvas
          mode="output"
          activeRegions={emotion.bodyRegions}
          deactivatedRegions={emotion.bodyRegionsDeactivated}
          accentColor={emotion.color}
          height={120}
        />
        {emotion.somaticSignals.length > 0 && (
          <View style={styles.somaticList}>
            {emotion.somaticSignals.slice(0, 4).map((signal, i) => (
              <View key={i} style={styles.somaticRow}>
                <View
                  style={[
                    styles.somaticDot,
                    { backgroundColor: emotion.color },
                  ]}
                />
                <Typography variant="body-sm" color={colors.textSecondary}>
                  {signal}
                </Typography>
              </View>
            ))}
          </View>
        )}

        <Spacer height={spacing.lg} />

        {/* 6. O que desencadeia — triggers */}
        <TriggersSection
          triggers={emotion.triggers}
          accentColor={emotion.color}
        />

        <Spacer height={spacing.lg} />

        {/* 7. Nota psicanalítica */}
        <PsychoNote
          note={emotion.psychoanalyticNote}
          accentColor={emotion.color}
        />

        <Spacer height={spacing.lg} />

        {/* 8. Emoções relacionadas */}
        <RelatedEmotionsSection
          emotion={emotion}
          onSelectEmotion={handleSelectRelated}
        />

        <Spacer height={spacing.lg} />

        {/* 9. Como regular — accordion */}
        <RegulationSection
          techniqueIds={emotion.regulationTechniqueIds}
          accentColor={emotion.color}
        />

        <Spacer height={spacing.lg} />

        {/* 10. Audio guide */}
        {emotion.audioGuideId && (
          <View>
            <SectionLabel label="GUIA DE ÁUDIO" />
            <View style={[styles.audioPlaceholder, { borderColor: emotion.color + '40' }]}>
              <Feather name="headphones" size={18} color={emotion.color} />
              <Typography variant="body-sm" color={colors.textSecondary} style={{ flex: 1 }}>
                Guia narrado em breve
              </Typography>
            </View>
          </View>
        )}

        <Spacer height={spacing.lg} />

        {/* 11. CTA — Registrar essa emoção */}
        <Button
          label={isAlreadyAdded ? '✓ Emoção registrada' : 'Registrar essa emoção'}
          variant={isAlreadyAdded ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          disabled={isAlreadyAdded}
          onPress={handleRegister}
          style={{
            backgroundColor: isAlreadyAdded
              ? colors.surface3
              : emotion.color,
          }}
        />

        <Spacer height={spacing['2xl']} />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tagline: {
    fontStyle: 'italic',
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: 9999,
    gap: 6,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  horizontalScroll: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  somaticList: {
    marginTop: spacing.sm,
    gap: 4,
  },
  somaticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  somaticDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dyadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dyadChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  dyadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  audioPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
