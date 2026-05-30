import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { z } from 'zod';
import { AuraBackground } from '../../src/components/ui/AuraBackground';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { SafeArea } from '../../src/components/ui/SafeArea';
import { Spacer } from '../../src/components/ui/Spacer';
import { Typography } from '../../src/components/ui/Typography';
import { useThemeColors } from '../../src/hooks/useThemeColors';
import { signInWithEmail } from '../../src/services/supabase/auth';
import { spacing } from '../../src/theme/spacing';

const signInSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um e-mail válido' }),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const colors = useThemeColors();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    Keyboard.dismiss();
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Ocorreu um erro ao enviar o link de acesso.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuraBackground />
      <SafeArea edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.header}>
              <Typography variant="display-lg">Sentido</Typography>
            </View>

            <View style={styles.content}>
              {isSuccess ? (
                <View style={styles.successContainer}>
                  <Typography variant="heading-lg" center>
                    Verifique seu e-mail
                  </Typography>
                  <Spacer height={spacing.md} />
                  <Typography variant="body-md" color={colors.textSecondary} center>
                    Enviamos um link de acesso mágico para você. Clique no link para entrar no Sentido de forma segura, sem precisar de senhas.
                  </Typography>
                  <Spacer height={spacing.xl} />
                  <Button
                    label="Voltar"
                    variant="ghost"
                    onPress={() => router.back()}
                  />
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <Typography variant="heading-lg" style={styles.title}>
                    Acessar ou Criar Conta
                  </Typography>
                  <Typography variant="body-md" color={colors.textSecondary} style={styles.subtitle}>
                    Enviaremos um link mágico para o seu e-mail.
                  </Typography>
                  
                  <Spacer height={spacing.lg} />

                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="E-mail"
                        placeholder="seu@email.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        error={errors.email?.message}
                      />
                    )}
                  />

                  {authError && (
                    <Typography variant="body-sm" color={colors.error} style={styles.errorText}>
                      {authError}
                    </Typography>
                  )}

                  <Spacer height={spacing.lg} />

                  <Button
                    label={isLoading ? 'Enviando...' : 'Continuar com E-mail'}
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                  />

                  <Spacer height={spacing.md} />
                  
                  <Pressable onPress={() => router.back()} style={styles.cancelButton}>
                    <Typography variant="label-md" color={colors.textTertiary}>
                      Pular por enquanto
                    </Typography>
                  </Pressable>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeArea>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  errorText: {
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
