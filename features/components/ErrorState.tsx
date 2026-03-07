import { StyleSheet, Text, View } from "react-native";

import { THEME } from "@/constants/theme";

import { Button } from "./Button";

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button onPress={onRetry}>Retry</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontWeight: "700",
    color: THEME.colors.danger,
  },
  message: {
    color: THEME.colors.text,
    textAlign: "center",
  },
});
