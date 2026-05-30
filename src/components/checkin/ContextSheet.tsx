// =============================================================================
// ContextSheet — Bottom sheet to gather context and notes before finishing check-in
// =============================================================================

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, SlideOutDown, FadeOut } from 'react-native-reanimated';
import { Typography } from '../ui/Typography';
import { Spacer } from '../ui/Spacer';
import { Button } from '../ui/Button';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useEmotionStore } from '../../stores/useEmotionStore';
import { spacing, radii } from '../../theme/spacing';
import type { CheckinContext } from '../../types/checkin.types';
import { useSettingsStore } from '../../stores/useSettingsStore';

interface ContextSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

const CONTEXT_OPTIONS: { id: CheckinContext; labelPt: string; labelEn: string; icon: any }[] = [
  { id: 'work', labelPt: 'Trabalho', labelEn: 'Work', icon: 'briefcase' },
  { id: 'relationship', labelPt: 'Relacionamentos', labelEn: 'Relationships', icon: 'heart' },
  { id: 'health', labelPt: 'Saúde', labelEn: 'Health', icon: 'activity' },
  { id: 'leisure', labelPt: 'Lazer', labelEn: 'Leisure', icon: 'coffee' },
  { id: 'unknown', labelPt: 'Não sei', labelEn: 'Unknown', icon: 'help-circle' },
];

export function ContextSheet({ isOpen, onClose, onFinish }: ContextSheetProps) {
  const colors = useThemeColors();
  const language = useSettingsStore((s) => s.language);
  const draft = useEmotionStore((s) => s.draft);
  const setContext = useEmotionStore((s) => s.setContext);
  const setNote = useEmotionStore((s) => s.setNote);

  const [localNote, setLocalNote] = useState(draft?.note || '');

  if (!isOpen) return null;

  const handleContextSelect = (contextId: CheckinContext) => {
    setContext(contextId === draft?.context ? null : contextId);
  };

  const handleConfirm = () => {
    if (localNote.trim().length > 0) {
      setNote(localNote.trim());
    } else {
      setNote(null);
    }
    onFinish();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(200)}
          exiting={SlideOutDown.duration(200)}
          style={[
            styles.sheet,
            { backgroundColor: colors.surface1, paddingBottom: spacing.xl },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.borderDefault }]} />
          </View>
          
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Typography variant="heading-md" center>
              {language === 'en-US' ? 'Context & Notes' : 'Contexto e Notas'}
            </Typography>
            <Spacer height={spacing.xs} />
            <Typography variant="body-sm" color={colors.textSecondary} center>
              {language === 'en-US' ? 'What triggered these emotions? (Optional)' : 'O que despertou essas emoções? (Opcional)'}
            </Typography>
            
            <Spacer height={spacing.xl} />
            
            <Typography variant="label-lg" color={colors.textTertiary} style={styles.sectionTitle}>
              {language === 'en-US' ? 'CONTEXT' : 'CONTEXTO'}
            </Typography>
            
            <View style={styles.contextGrid}>
              {CONTEXT_OPTIONS.map((opt) => {
                const isSelected = draft?.context === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => handleContextSelect(opt.id)}
                    style={[
                      styles.contextPill,
                      {
                        backgroundColor: isSelected ? colors.activeEmotionColor : colors.surface2,
                        borderColor: isSelected ? colors.activeEmotionColor : colors.borderDefault,
                      }
                    ]}
                  >
                    <Feather 
                      name={opt.icon} 
                      size={16} 
                      color={isSelected ? '#FFFFFF' : colors.textSecondary} 
                    />
                    <Spacer width={spacing.xs} />
                    <Typography 
                      variant="label-md" 
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    >
                      {language === 'en-US' ? opt.labelEn : opt.labelPt}
                    </Typography>
                  </Pressable>
                );
              })}
            </View>

            <Spacer height={spacing.xl} />
            
            <Typography variant="label-lg" color={colors.textTertiary} style={styles.sectionTitle}>
              {language === 'en-US' ? 'NOTES' : 'NOTAS'}
            </Typography>
            
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: colors.surface2, 
                  color: colors.textPrimary,
                  borderColor: colors.borderDefault 
                }
              ]}
              placeholder={language === 'en-US' ? 'Write a brief note...' : 'Escreva uma breve nota...'}
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={localNote}
              onChangeText={setLocalNote}
            />

            <Spacer height={spacing.xl} />

            <Button
              label={language === 'en-US' ? 'Save Check-in' : 'Salvar Check-in'}
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleConfirm}
            />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '90%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  contextGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    minHeight: 120,
    fontSize: 16,
  }
});
