// =============================================================================
// Profile Tab — User profile and settings
// =============================================================================

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, Pressable } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { SafeArea } from '../../src/components/ui/SafeArea';
import { Typography } from '../../src/components/ui/Typography';
import { Spacer } from '../../src/components/ui/Spacer';
import { Card } from '../../src/components/ui/Card';
import { Switch } from '../../src/components/ui/Switch';
import { SettingsItem } from '../../src/components/ui/SettingsItem';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { useUserStore } from '../../src/stores/useUserStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useUserStreak, useTotalCheckins } from '../../src/hooks/useEmotionHistory';
import { checkinsLocalDb } from '../../src/services/database/checkins';
import { notificationService } from '../../src/services/notifications';
import { spacing } from '../../src/theme/spacing';

import { AuthSection } from '../../src/components/auth/AuthSection';

export default function ProfileScreen() {
  const colors = useThemeColors();
  
  // Stores
  const setIsOnboarded = useUserStore((s) => s.setIsOnboarded);
  const profile = useUserStore((s) => s.profile);
  const session = useUserStore((s) => s.session);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const hasNotifPerms = useUserStore((s) => s.hasNotificationPermission);
  const setHasNotifPerms = useUserStore((s) => s.setHasNotificationPermission);
  
  const audioEnabled = useAppStore((s) => s.audioEnabled);
  const toggleAudio = useAppStore((s) => s.toggleAudio);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const toggleHaptics = useAppStore((s) => s.toggleHaptics);

  const language = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  // Queries
  const { data: streak } = useUserStreak();
  const { data: totalCheckins } = useTotalCheckins();

  // Local state for DateTimePickers
  const [showMorningPicker, setShowMorningPicker] = useState(false);
  const [showEveningPicker, setShowEveningPicker] = useState(false);
  const [morningDate, setMorningDate] = useState(() => {
    const d = new Date();
    if (profile?.notificationTimeMorning) {
      const [h, m] = profile.notificationTimeMorning.split(':');
      d.setHours(Number(h), Number(m));
    } else {
      d.setHours(9, 0);
    }
    return d;
  });
  const [eveningDate, setEveningDate] = useState(() => {
    const d = new Date();
    if (profile?.notificationTimeEvening) {
      const [h, m] = profile.notificationTimeEvening.split(':');
      d.setHours(Number(h), Number(m));
    } else {
      d.setHours(20, 0);
    }
    return d;
  });

  const handleResetOnboarding = async () => {
    await SecureStore.deleteItemAsync('has_completed_onboarding');
    setIsOnboarded(false);
    router.replace('/onboarding/welcome');
  };

  const handleExportData = async () => {
    try {
      const allCheckins = await checkinsLocalDb.getCheckins('local-anonymous', 10000, 0);
      const fileUri = `${FileSystem.documentDirectory}sentido_export_${new Date().getTime()}.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(allCheckins, null, 2));
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar dados do Sentido'
        });
      } else {
        Alert.alert('Erro', 'O compartilhamento não está disponível no seu dispositivo.');
      }
    } catch (error) {
      console.error('Failed to export data', error);
      Alert.alert('Erro', 'Ocorreu um erro ao exportar os dados.');
    }
  };

  const toggleNotifications = async () => {
    if (hasNotifPerms) {
      // Turn off
      setHasNotifPerms(false);
      updateProfile({ notificationTimeMorning: null, notificationTimeEvening: null });
      await notificationService.scheduleDailyReminders(null, null);
    } else {
      // Turn on
      const granted = await notificationService.requestPermissions();
      if (granted) {
        setHasNotifPerms(true);
        // Default times
        const m = '09:00';
        const e = '20:00';
        updateProfile({ notificationTimeMorning: m, notificationTimeEvening: e });
        await notificationService.scheduleDailyReminders(m, e);
      } else {
        Alert.alert(
          'Permissão Negada',
          'Não conseguimos ativar as notificações. Verifique as configurações do seu celular.'
        );
      }
    }
  };

  const onMorningChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowMorningPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMorningDate(selectedDate);
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      const timeStr = `${h}:${m}`;
      updateProfile({ notificationTimeMorning: timeStr });
      if (hasNotifPerms) {
        await notificationService.scheduleDailyReminders(timeStr, profile?.notificationTimeEvening || null);
      }
    }
  };

  const onEveningChange = async (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEveningPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEveningDate(selectedDate);
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const m = String(selectedDate.getMinutes()).padStart(2, '0');
      const timeStr = `${h}:${m}`;
      updateProfile({ notificationTimeEvening: timeStr });
      if (hasNotifPerms) {
        await notificationService.scheduleDailyReminders(profile?.notificationTimeMorning || null, timeStr);
      }
    }
  };

  return (
    <SafeArea edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header (Avatar and Name) */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.surface2 }]}>
            <Feather name="user" size={32} color={colors.textSecondary} />
          </View>
          <Typography variant="heading-lg">Você</Typography>
          <Typography variant="body-sm" color={colors.textTertiary}>
            {isAuthenticated ? 'Conta Sincronizada' : 'Conta Local'}
          </Typography>
        </View>

        <Spacer height={spacing.lg} />
        
        {/* Auth Section for Guest / Connected */}
        <AuthSection isAuthenticated={isAuthenticated} email={session?.user?.email} />

        <Spacer height={spacing.lg} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} padding={spacing.md}>
            <View style={styles.statIconContainer}>
              <Feather name="zap" size={20} color={colors.warning} />
            </View>
            <Spacer height={spacing.sm} />
            <Typography variant="display-sm">{streak || 0}</Typography>
            <Typography variant="body-sm" color={colors.textSecondary}>Dias seguidos</Typography>
          </Card>
          
          <Card style={styles.statCard} padding={spacing.md}>
            <View style={styles.statIconContainer}>
              <Feather name="check-circle" size={20} color={colors.success} />
            </View>
            <Spacer height={spacing.sm} />
            <Typography variant="display-sm">{totalCheckins || 0}</Typography>
            <Typography variant="body-sm" color={colors.textSecondary}>Check-ins</Typography>
          </Card>
        </View>

        <Spacer height={spacing.lg} />

        {/* Notificações */}
        <Typography variant="label-lg" color={colors.textTertiary} style={styles.sectionTitle}>
          NOTIFICAÇÕES
        </Typography>
        <Card padding={0}>
          <SettingsItem 
            icon="bell" 
            title="Lembretes Diários" 
            description="Receba avisos para fazer check-in"
            rightElement={<Switch value={hasNotifPerms} onValueChange={toggleNotifications} />}
          />
          {hasNotifPerms && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              <SettingsItem 
                icon="sun" 
                title="Aviso da Manhã" 
                rightElement={
                  <Pressable onPress={() => setShowMorningPicker(true)} style={[styles.timePill, { backgroundColor: colors.surface2 }]}>
                    <Typography variant="label-md">{profile?.notificationTimeMorning || '09:00'}</Typography>
                  </Pressable>
                }
              />
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
              <SettingsItem 
                icon="moon" 
                title="Aviso da Noite" 
                rightElement={
                  <Pressable onPress={() => setShowEveningPicker(true)} style={[styles.timePill, { backgroundColor: colors.surface2 }]}>
                    <Typography variant="label-md">{profile?.notificationTimeEvening || '20:00'}</Typography>
                  </Pressable>
                }
              />
            </>
          )}
        </Card>

        <Spacer height={spacing.lg} />

        {/* Preferências */}
        <Typography variant="label-lg" color={colors.textTertiary} style={styles.sectionTitle}>
          PREFERÊNCIAS
        </Typography>
        <Card padding={0}>
          <SettingsItem 
            icon="volume-2" 
            title="Áudio e Voz" 
            description="Tocar guias narrados nas emoções"
            rightElement={<Switch value={audioEnabled} onValueChange={toggleAudio} />}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <SettingsItem 
            icon="smartphone" 
            title="Vibração e Haptics" 
            description="Feedback tátil ao tocar na roda"
            rightElement={<Switch value={hapticsEnabled} onValueChange={toggleHaptics} />}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <SettingsItem 
            icon="globe" 
            title="Idioma / Language" 
            description="Língua do dicionário e interface"
            rightElement={
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable onPress={() => setLanguage('pt-BR')} style={[styles.timePill, { backgroundColor: language === 'pt-BR' ? colors.activeEmotionColor : colors.surface2 }]}>
                  <Typography variant="label-md" color={language === 'pt-BR' ? '#FFFFFF' : colors.textSecondary}>PT</Typography>
                </Pressable>
                <Pressable onPress={() => setLanguage('en-US')} style={[styles.timePill, { backgroundColor: language === 'en-US' ? colors.activeEmotionColor : colors.surface2 }]}>
                  <Typography variant="label-md" color={language === 'en-US' ? '#FFFFFF' : colors.textSecondary}>EN</Typography>
                </Pressable>
              </View>
            }
          />
        </Card>

        <Spacer height={spacing.lg} />

        {/* Dados e Debug */}
        <Typography variant="label-lg" color={colors.textTertiary} style={styles.sectionTitle}>
          DADOS E SISTEMA
        </Typography>
        <Card padding={0}>
          <SettingsItem 
            icon="download-cloud" 
            title="Exportar Dados" 
            description="Baixar histórico em JSON"
            onPress={handleExportData}
          />
          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
          <SettingsItem 
            icon="rotate-ccw" 
            title="Resetar Onboarding" 
            description="Para testes de desenvolvimento"
            onPress={handleResetOnboarding}
            destructive
          />
        </Card>

        <Spacer height={spacing['3xl']} />
      </ScrollView>

      {/* DateTime Pickers (Android needs these to be rendered outside if state is true) */}
      {showMorningPicker && (
        <DateTimePicker
          value={morningDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onMorningChange}
        />
      )}
      {showEveningPicker && (
        <DateTimePicker
          value={eveningDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onEveningChange}
        />
      )}
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  timePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  }
});
