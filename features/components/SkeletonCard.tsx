import { StyleSheet, View } from "react-native";

import { THEME } from "@/constants/theme";

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={[styles.bar, { width: "60%" }]} />
      <View style={[styles.bar, { width: "40%" }]} />
      <View style={[styles.bar, { width: "80%" }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: THEME.spacing.md,
    gap: 10,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
});
