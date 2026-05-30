import { Platform } from 'react-native';

let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  // Silent catch: expo-notifications is not available in Expo Go starting SDK 53
}

export const notificationService = {
  /** Request notification permissions from the OS */
  async requestPermissions() {
    if (Platform.OS === 'web' || !Notifications) return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#818CF8',
      });
    }
    
    return finalStatus === 'granted';
  },

  /** Schedule daily reminders based on user preferences */
  async scheduleDailyReminders(morningTime: string | null, eveningTime: string | null) {
    if (Platform.OS === 'web' || !Notifications) return;
    
    // First clear all existing to prevent duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Schedule morning
    if (morningTime) {
      const [hours, minutes] = morningTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bom dia!",
          body: "Como você está começando o seu dia? ☀️",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }

    // Schedule evening
    if (eveningTime) {
      const [hours, minutes] = eveningTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Boa noite!",
          body: "Que tal refletir sobre as emoções do seu dia? 🌙",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
        },
      });
    }
  }
};
