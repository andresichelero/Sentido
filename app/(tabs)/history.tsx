// =============================================================================
// History Tab — Check-in history with visualizations
// Spec section 11.4 — 5 content sections
// =============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Spacer } from '../../src/components/ui/Spacer';
import { Skeleton } from '../../src/components/ui/Skeleton';
import { HeatmapCalendar } from '../../src/components/history/HeatmapCalendar';
import { EmotionPieChart } from '../../src/components/history/EmotionPieChart';
import { ValenceArousalPlot } from '../../src/components/history/ValenceArousalPlot';
import { TimelineCard } from '../../src/components/history/TimelineCard';
import {
  useCheckinHistory,
  useWeeklySummary,
  useEmotionFrequency,
  useValenceArousalData,
  useHeatmapData,
} from '../../src/hooks/useEmotionHistory';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { spacing } from '../../src/theme/spacing';
import { getEmotionById } from '../../src/utils/emotion-math';
import { checkinsLocalDb } from '../../src/services/database/checkins';
import { useQueryClient } from '@tanstack/react-query';

function SectionTitle({ title }: { title: string }) {
  const colors = useThemeColors();
  return (
    <Typography
      variant="label-lg"
      color={colors.textTertiary}
      style={styles.sectionTitle}
    >
      {title}
    </Typography>
  );
}

export default function HistoryScreen() {
  const colors = useThemeColors();
  const [pieRange, setPieRange] = useState<7 | 30>(7);

  // Data hooks
  const { data: summary, isLoading: summaryLoading } = useWeeklySummary();
  const { data: heatmapData, isLoading: heatmapLoading } = useHeatmapData(90);
  const { data: frequencyData, isLoading: frequencyLoading } = useEmotionFrequency(pieRange);
  const { data: scatterData, isLoading: scatterLoading } = useValenceArousalData(7);
  const { data: recentCheckins, isLoading: historyLoading } = useCheckinHistory(100);

  const isLoading = summaryLoading || heatmapLoading || frequencyLoading || scatterLoading || historyLoading;

  // Build pie chart slices
  const pieSlices = useMemo(
    () =>
      (frequencyData ?? []).map((f) => ({
        emotionId: f.emotionId,
        label: f.emotion?.name ?? f.emotionId,
        count: f.count,
        color: f.emotion?.color ?? '#818CF8',
      })),
    [frequencyData]
  );

  const queryClient = useQueryClient();

  const handleDeleteCheckin = useCallback((id: string) => {
    Alert.alert(
      'Deletar Registro',
      'Tem certeza que deseja deletar este registro de emoção? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await checkinsLocalDb.deleteCheckin(id);
              queryClient.invalidateQueries({ queryKey: ['checkins'] });
            } catch (e) {
              console.error('Error deleting checkin:', e);
            }
          },
        },
      ]
    );
  }, [queryClient]);

  const valenceLabel = useMemo(() => {
    if (!summary) return '—';
    const v = summary.averageValence;
    if (v > 2) return 'Positiva ↑';
    if (v > 0) return 'Levemente +';
    if (v > -2) return 'Levemente −';
    return 'Negativa ↓';
  }, [summary]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <Typography variant="display-md">Histórico</Typography>
      <Spacer height={spacing.xs} />
      <Typography variant="body-md" color={colors.textSecondary}>
        Seus registros emocionais
      </Typography>

      <Spacer height={spacing.lg} />

      {/* 1. Weekly Summary */}
      <SectionTitle title="ESTA SEMANA" />
      {isLoading ? (
        <View style={styles.metricsRow}>
          <Skeleton height={80} style={{ flex: 1 }} />
          <Skeleton height={80} style={{ flex: 1 }} />
          <Skeleton height={80} style={{ flex: 1 }} />
        </View>
      ) : (
        <View style={styles.metricsRow}>
          <Card padding={spacing.sm} style={styles.metricCard}>
            <Feather name="check-circle" size={18} color={colors.activeEmotionColor} />
            <Typography variant="heading-md">
              {summary?.totalCheckins ?? 0}
            </Typography>
            <Typography variant="label-sm" color={colors.textTertiary}>
              check-ins
            </Typography>
          </Card>

          <Card padding={spacing.sm} style={styles.metricCard}>
            <View
              style={[
                styles.emotionDot,
                {
                  backgroundColor:
                    summary?.dominantEmotion?.color ?? colors.surface3,
                },
              ]}
            />
            <Typography variant="heading-sm" numberOfLines={1}>
              {summary?.dominantEmotion?.name ?? '—'}
            </Typography>
            <Typography variant="label-sm" color={colors.textTertiary}>
              dominante
            </Typography>
          </Card>

          <Card padding={spacing.sm} style={styles.metricCard}>
            <Feather name="activity" size={18} color={colors.activeEmotionColor} />
            <Typography variant="heading-sm">{valenceLabel}</Typography>
            <Typography variant="label-sm" color={colors.textTertiary}>
              valência
            </Typography>
          </Card>
        </View>
      )}

      <Spacer height={spacing.xl} />

      {/* 2. Heatmap Calendar */}
      <SectionTitle title="ÚLTIMOS 90 DIAS" />
      {isLoading ? (
        <Skeleton height={140} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HeatmapCalendar data={heatmapData ?? []} days={90} />
        </ScrollView>
      )}

      <Spacer height={spacing.xl} />

      {/* 3. Emotion Pie Chart */}
      <View style={styles.sectionHeader}>
        <SectionTitle title="DISTRIBUIÇÃO" />
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setPieRange(7)}
            style={[
              styles.togglePill,
              { backgroundColor: pieRange === 7 ? colors.activeEmotionColor : colors.surface2 },
            ]}
          >
            <Typography variant="label-sm" color={pieRange === 7 ? '#FFFFFF' : colors.textSecondary}>
              Semana
            </Typography>
          </Pressable>
          <Pressable
            onPress={() => setPieRange(30)}
            style={[
              styles.togglePill,
              { backgroundColor: pieRange === 30 ? colors.activeEmotionColor : colors.surface2 },
            ]}
          >
            <Typography variant="label-sm" color={pieRange === 30 ? '#FFFFFF' : colors.textSecondary}>
              Mês
            </Typography>
          </Pressable>
        </View>
      </View>
      {isLoading ? (
        <Skeleton height={200} />
      ) : (
        <EmotionPieChart slices={pieSlices} totalCheckins={(frequencyData ?? []).reduce((acc, f) => acc + f.count, 0)} />
      )}

      <Spacer height={spacing.xl} />

      {/* 4. Scatter Plot */}
      <SectionTitle title="MAPA VALÊNCIA × ATIVAÇÃO" />
      {isLoading ? (
        <Skeleton height={250} />
      ) : (
        <ValenceArousalPlot points={scatterData ?? []} />
      )}

      <Spacer height={spacing.xl} />

      {/* 5. Recent List Header */}
      <SectionTitle title="RECENTES" />
      {!isLoading && (recentCheckins ?? []).length === 0 && (
        <Card>
          <View style={styles.emptyRecent}>
            <Feather name="inbox" size={32} color={colors.textTertiary} />
            <Spacer height={spacing.sm} />
            <Typography variant="body-sm" color={colors.textTertiary} center>
              Nenhum check-in registrado ainda.{'\n'}Use a roda para começar!
            </Typography>
          </View>
        </Card>
      )}
    </View>
  );

  return (
    <SafeArea edges={['top']}>
      <View style={styles.container}>
        <FlashList
          data={isLoading ? [] : (recentCheckins ?? [])}
          renderItem={({ item }) => (
            <View style={styles.timelineItem}>
              <TimelineCard checkin={item} onDelete={handleDeleteCheckin} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={isLoading ? (
            <View style={styles.timelineItem}>
              <Skeleton height={100} style={{ marginBottom: spacing.sm }} />
              <Skeleton height={100} style={{ marginBottom: spacing.sm }} />
            </View>
          ) : null}
        />
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 40,
  },
  headerContent: {
    paddingBottom: spacing.sm,
  },
  timelineItem: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    letterSpacing: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  emotionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  togglePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  emptyRecent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
