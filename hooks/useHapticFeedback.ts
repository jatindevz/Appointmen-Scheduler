import * as Haptics from "expo-haptics";

export function useHapticFeedback() {
  return {
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  };
}
