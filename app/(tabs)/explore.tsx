// =============================================================================
// Explore Tab — Browse and search the emotion dictionary
// =============================================================================

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { ExploreFilter } from '../../src/components/explore/ExploreFilter';
import { EmotionCard } from '../../src/components/explore/EmotionCard';
import { EmotionWheel } from '../../src/components/emotion/wheel/EmotionWheel';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useWheelStore } from '../../src/stores/useWheelStore';
import { EMOTIONS } from '../../src/data/emotions';
import { spacing, radii } from '../../src/theme/spacing';

export default function ExploreScreen() {
  const colors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeSector = useWheelStore((s) => s.activeSector);
  const setActiveSector = useWheelStore((s) => s.setActiveSector);

  // Filter emotions based on search and selected sector
  const filteredEmotions = useMemo(() => {
    const filtered = EMOTIONS.filter((emotion) => {
      const matchesSearch =
        searchQuery === '' ||
        emotion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emotion.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSector =
        activeSector === null || emotion.sector === activeSector;

      return matchesSearch && matchesSector;
    });

    // Sort alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [searchQuery, activeSector]);

  const handleEmotionPress = (emotionId: string) => {
    router.push(`/emotion/${emotionId}`);
  };

  return (
    <SafeArea edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="display-md">Explorar</Typography>
          <Spacer height={4} />
          <Typography variant="body-sm" color={colors.textSecondary}>
            Dicionário de sentimentos
          </Typography>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.surface2, borderColor: colors.borderDefault },
            ]}
          >
            <Feather name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Buscar emoção..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Feather
                name="x-circle"
                size={18}
                color={colors.textTertiary}
                onPress={() => setSearchQuery('')}
              />
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <ExploreFilter
            activeSector={activeSector}
            onSelectSector={setActiveSector}
          />
        </View>

        {/* Compact Wheel & Grid */}
        <View style={styles.listContainer}>
          <FlashList
            data={filteredEmotions}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.wheelHeader}>
                <EmotionWheel size={180} mode="compact" />
                <Spacer height={spacing.md} />
                <Typography variant="label-lg" color={colors.textTertiary}>
                  {filteredEmotions.length} EMOÇÕES
                </Typography>
              </View>
            }
            renderItem={({ item }) => (
              <View style={{ flex: 1, padding: spacing.sm / 2 }}>
                <EmotionCard
                  emotion={item}
                  onPress={() => handleEmotionPress(item.id)}
                />
              </View>
            )}
          />
        </View>
      </View>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    // Add font family if needed
  },
  filterSection: {
    paddingBottom: spacing.sm,
  },
  listContainer: {
    flex: 1,
  },
  wheelHeader: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  gridContent: {
    paddingHorizontal: spacing.sm, // reduced since items have padding
    paddingBottom: 40,
  },
});
