import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Typography } from '../ui/Typography';
import { Card } from '../ui/Card';
import { Spacer } from '../ui/Spacer';
import { useThemeColors } from '../../hooks/useThemeColors';
import { signInWithEmail, signOut } from '../../services/supabase/auth';
import { spacing } from '../../theme/spacing';

interface AuthSectionProps {
  isAuthenticated: boolean;
  email?: string;
}

export function AuthSection({ isAuthenticated, email }: AuthSectionProps) {
  const colors = useThemeColors();
  const [inputEmail, setInputEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendLink = async () => {
    if (!inputEmail || !inputEmail.includes('@')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Email inválido', 'Por favor, insira um endereço de email válido.');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signInWithEmail(inputEmail.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSuccess(true);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao enviar o link mágico.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair? Seus check-ins locais não sincronizados poderão ser perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('SignOut error', error);
            }
          }
        }
      ]
    );
  };

  if (isAuthenticated) {
    return (
      <Card padding={spacing.md} style={styles.card} borderColor={colors.borderSubtle}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
            <Feather name="cloud" size={20} color={colors.success} />
          </View>
          <View style={styles.textContainer}>
            <Typography variant="heading-sm">Backup em Nuvem Ativo</Typography>
            <Typography variant="body-sm" color={colors.textSecondary}>{email || 'Sincronizando seus dados'}</Typography>
          </View>
        </View>
        <Spacer height={spacing.md} />
        <Pressable 
          style={({ pressed }) => [styles.outlineButton, { borderColor: colors.borderSubtle, opacity: pressed ? 0.7 : 1 }]}
          onPress={handleSignOut}
        >
          <Typography variant="body-sm" color={colors.textSecondary}>Sair da conta</Typography>
        </Pressable>
      </Card>
    );
  }

  return (
    <Card padding={spacing.md} style={styles.card} borderColor={colors.activeEmotionColor + '40'}>
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface2 }]}>
          <Feather name="cloud-off" size={20} color={colors.textTertiary} />
        </View>
        <View style={styles.textContainer}>
          <Typography variant="heading-sm">Backup em Nuvem</Typography>
          <Typography variant="body-sm" color={colors.textSecondary}>Crie uma conta grátis para sincronizar</Typography>
        </View>
      </View>

      <Spacer height={spacing.md} />

      {!isSuccess ? (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <View style={[styles.inputContainer, { backgroundColor: colors.surface2, borderColor: colors.borderSubtle }]}>
            <Feather name="mail" size={18} color={colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Seu endereço de e-mail"
              placeholderTextColor={colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={inputEmail}
              onChangeText={setInputEmail}
              editable={!isLoading}
            />
          </View>
          
          <Spacer height={spacing.sm} />
          
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton, 
              { backgroundColor: colors.activeEmotionColor, opacity: (pressed || isLoading) ? 0.7 : 1 }
            ]}
            onPress={handleSendLink}
            disabled={isLoading}
          >
            <Typography variant="body-md" color="#FFFFFF" style={{ fontFamily: 'DMSans_700Bold' }}>
              {isLoading ? 'Enviando...' : 'Receber Link Mágico'}
            </Typography>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={SlideInUp.springify()} exiting={SlideOutDown} style={styles.successContainer}>
          <Feather name="check-circle" size={24} color={colors.success} />
          <Spacer height={spacing.xs} />
          <Typography variant="heading-sm" color={colors.success}>Enviado com sucesso!</Typography>
          <Typography variant="body-sm" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            Verifique sua caixa de entrada no celular e clique no link para conectar.
          </Typography>
        </Animated.View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    height: '100%',
  },
  primaryButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  }
});
