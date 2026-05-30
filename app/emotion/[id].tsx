// =============================================================================
// Emotion Detail Screen — Encyclopedic view of an emotion with internal tabs
// =============================================================================

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { Tag } from '../../src/components/ui/Tag';
import { Card } from '../../src/components/ui/Card';
import { EmotionBadge } from '../../src/components/emotion/EmotionBadge';
import { RegulationAccordion } from '../../src/components/emotion/RegulationAccordion';
import { BodyMapCanvas } from '../../src/components/body-map/BodyMapCanvas';
import { audioPlayerService } from '../../src/services/audio/player';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { getEmotionById, getEmotionsBySector, getDyadsBySector } from '../../src/utils/emotion-math';
import { TECHNIQUES_BY_ID } from '../../src/data/regulation';
import { spacing, radii } from '../../src/theme/spacing';
import type { EmotionNode } from '../../src/types/emotion.types';

type TabId = 'about' | 'body' | 'regulation' | 'connections';

const TABS: { id: TabId; label: string }[] = [
  { id: 'about', label: 'Sobre' },
  { id: 'body', label: 'No Corpo' },
  { id: 'regulation', label: 'Regulação' },
  { id: 'connections', label: 'Conexões' },
];

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

export default function EmotionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const language = useSettingsStore((s) => s.language);
  const [activeTab, setActiveTab] = useState<TabId>('about');

  const emotion = useMemo(() => (id ? getEmotionById(id) : null), [id]);

  if (!emotion) {
    return (
      <SafeArea>
        <View style={styles.errorContainer}>
          <Typography variant="body-md" color={colors.textSecondary}>
            Emoção não encontrada.
          </Typography>
          <Spacer height={spacing.md} />
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Typography variant="label-md" color={colors.activeEmotionColor}>
              Voltar
            </Typography>
          </Pressable>
        </View>
      </SafeArea>
    );
  }

  React.useEffect(() => {
    return () => {
      // Unload audio when leaving screen
      audioPlayerService.unload();
    };
  }, []);

  // Related data
  const related = useMemo(() => {
    const sectorEmotions = getEmotionsBySector(emotion.sector);
    return sectorEmotions.filter((e) => e.id !== emotion.id);
  }, [emotion]);

  const dyads = useMemo(() => getDyadsBySector(emotion.sector), [emotion]);

  const techniques = useMemo(() => {
    return emotion.regulationTechniqueIds
      .map((tId) => TECHNIQUES_BY_ID.get(tId))
      .filter((t): t is NonNullable<typeof t> => t !== undefined);
  }, [emotion]);

  // Tab Content Renderers
  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      {emotion.audioGuideId && (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionLabel label="GUIA DE ÁUDIO" />
          <View style={[styles.audioPlaceholder, { borderColor: emotion.color + '40' }]}>
            <Feather name="headphones" size={18} color={emotion.color} />
            <Typography variant="body-sm" color={colors.textSecondary} style={{ flex: 1 }}>
              Guia narrado em breve
            </Typography>
          </View>
        </View>
      )}

      <SectionLabel label="FUNÇÃO EVOLUTIVA" />
      <Typography variant="body-md" color={colors.textSecondary} style={styles.evolutionary}>
        {emotion.evolutionaryFunction}
      </Typography>

      <Spacer height={spacing.xl} />
      
      <SectionLabel label="O QUE DESENCADEIA" />
      <View style={styles.tagRow}>
        {emotion.triggers.map((trigger, i) => (
          <Tag key={i} label={trigger} activeColor={emotion.color} />
        ))}
      </View>

      <Spacer height={spacing.xl} />

      <SectionLabel label="NOTA PSICANALÍTICA" />
      <Card borderColor={emotion.color + '40'} padding={spacing.md}>
        <View style={styles.noteHeader}>
          <Feather name="book-open" size={16} color={emotion.color} />
          <Typography variant="label-md" color={emotion.color}>
            Perspectiva clínica
          </Typography>
        </View>
        <Spacer height={spacing.sm} />
        <Typography variant="body-sm" color={colors.textPrimary} style={styles.lineHeightFix}>
          {emotion.psychoanalyticNote}
        </Typography>
      </Card>
    </View>
  );

  const renderBodyTab = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="ONDE VOCÊ SENTE" />
      <View style={styles.bodyMapWrapper}>
        <BodyMapCanvas
          mode="output"
          activeRegions={emotion.bodyRegions}
          deactivatedRegions={emotion.bodyRegionsDeactivated}
          accentColor={emotion.color}
          height={320}
        />
      </View>
      
      <Spacer height={spacing.lg} />
      
      {emotion.somaticSignals.length > 0 && (
        <>
          <SectionLabel label="SINAIS SOMÁTICOS" />
          <View style={styles.somaticList}>
            {emotion.somaticSignals.map((signal, i) => (
              <View key={i} style={styles.somaticRow}>
                <View style={[styles.somaticDot, { backgroundColor: emotion.color }]} />
                <Typography variant="body-sm" color={colors.textSecondary}>
                  {signal}
                </Typography>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderRegulationTab = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="TÉCNICAS SUGERIDAS" />
      {techniques.length > 0 ? (
        techniques.map((technique) => (
          <RegulationAccordion
            key={technique.id}
            technique={technique}
            accentColor={emotion.color}
          />
        ))
      ) : (
        <Typography variant="body-sm" color={colors.textTertiary}>
          Nenhuma técnica específica mapeada.
        </Typography>
      )}
    </View>
  );

  const renderConnectionsTab = () => (
    <View style={styles.tabContent}>
      <SectionLabel label="MESMA FAMÍLIA (SETOR)" />
      <View style={styles.badgeRow}>
        {related.map((e) => (
          <EmotionBadge
            key={e.id}
            emotionId={e.id}
            onPress={() => router.push(`/emotion/${e.id}`)}
          />
        ))}
      </View>

      <Spacer height={spacing.xl} />

      {dyads.length > 0 && (
        <>
          <SectionLabel label="EMOÇÕES COMPOSTAS (DÍADES)" />
          <View style={styles.badgeRow}>
            {dyads.map((d) => (
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Background */}
      <View style={[styles.headerBg, { backgroundColor: emotion.color + '15' }]} />
      
      <SafeArea>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header Content */}
          <View style={styles.headerContent}>
            <Pressable onPress={() => router.back()} style={styles.navBack}>
              <Feather name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            
            <Spacer height={spacing.md} />
            
            <View style={[styles.intensityBadge, { backgroundColor: emotion.color + '25' }]}>
              <View style={[styles.intensityDot, { backgroundColor: emotion.color }]} />
              <Typography variant="label-sm" color={emotion.color}>
                {emotion.intensityLevel === 3 ? 'INTENSA' : emotion.intensityLevel === 2 ? 'MÉDIA' : 'SUAVE'}
              </Typography>
            </View>

            <Spacer height={spacing.sm} />
            
            <Typography variant="display-lg">{language === 'en-US' ? emotion.nameEn : emotion.name}</Typography>
          </View>

          {/* Tab Bar */}
          <View style={[styles.tabBar, { borderBottomColor: colors.borderDefault }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              {TABS.map((tab) => (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={[
                    styles.tabItem,
                    activeTab === tab.id && { borderBottomColor: emotion.color },
                  ]}
                >
                  <Typography
                    variant="label-md"
                    color={activeTab === tab.id ? colors.textPrimary : colors.textTertiary}
                  >
                    {tab.label}
                  </Typography>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Dynamic Content */}
          <View style={styles.contentArea}>
            {activeTab === 'about' && renderAboutTab()}
            {activeTab === 'body' && renderBodyTab()}
            {activeTab === 'regulation' && renderRegulationTab()}
            {activeTab === 'connections' && renderConnectionsTab()}
          </View>

          <Spacer height={spacing['2xl']} />
        </ScrollView>
      </SafeArea>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  scrollView: {
    flex: 1,
  },
  headerContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  navBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 6,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabBar: {
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tabScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  tabItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  contentArea: {
    paddingHorizontal: spacing.md,
  },
  tabContent: {
    paddingTop: spacing.sm,
  },
  evolutionary: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lineHeightFix: {
    lineHeight: 20,
  },
  bodyMapWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  somaticList: {
    gap: spacing.xs,
  },
  somaticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  somaticDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dyadChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  dyadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: spacing.sm,
  },
  audioPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
});
