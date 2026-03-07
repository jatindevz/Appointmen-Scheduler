import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { THEME } from "@/constants/theme";

type ButtonProps = PropsWithChildren<{
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}>;

export function Button({ children, onPress, disabled, loading, variant = "primary" }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[styles.button, styles[variant], isDisabled ? styles.disabled : undefined]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.text}>{children}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: THEME.radius.md,
    alignItems: "center",
  },
  primary: {
    backgroundColor: THEME.colors.primary,
  },
  secondary: {
    backgroundColor: "#334155",
  },
  danger: {
    backgroundColor: THEME.colors.danger,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
