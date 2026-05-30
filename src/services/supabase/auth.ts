import * as Linking from 'expo-linking';
import { supabase } from './client';

/**
 * Initiates the Magic Link authentication flow.
 * Sends an email to the user with a login link.
 */
export async function signInWithEmail(email: string): Promise<void> {
  // Use expo-linking to generate the correct redirect URL based on app.json scheme
  // By default, this resolves to `sentido://auth` in production, 
  // but in Expo Go it resolves to `exp://<ip>:8081/--/auth`
  const redirectUrl = Linking.createURL('auth');
  console.log('🔗 [Auth] Solicitação de Magic Link. O redirectUrl gerado é:', redirectUrl);
  console.log('⚠️ [Auth] Certifique-se de que ESTA exata URL (ou com wildcard exp://*) está permitida no painel do Supabase (Authentication -> URL Configuration).');
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Signs the user out of their current session and clears local Supabase session state.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}
