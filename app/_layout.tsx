import { Stack } from "expo-router";

import { AuthContext } from "@/features/auth/auth.context";
import { AppProviders } from "@/lib/providers";

export default function RootLayout() {
  return (
    <AuthContext>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </AuthContext>
  );
}
