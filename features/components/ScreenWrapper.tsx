import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { THEME } from "@/constants/theme";

type ScreenWrapperProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function ScreenWrapper({ children, scroll = true }: ScreenWrapperProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.md,
    gap: THEME.spacing.md,
    flexGrow: 1,
  },
});
