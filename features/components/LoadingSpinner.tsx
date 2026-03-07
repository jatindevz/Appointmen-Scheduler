import { ActivityIndicator, StyleSheet, View } from "react-native";

import { THEME } from "@/constants/theme";

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={THEME.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },
});
