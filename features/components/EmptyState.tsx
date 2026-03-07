import { StyleSheet, Text, View } from "react-native";

import { THEME } from "@/constants/theme";

type EmptyStateProps = {
  title: string;
  subtitle?: string;
};

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: THEME.colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  subtitle: {
    color: THEME.colors.muted,
    fontSize: 13,
  },
});
