import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/features/auth/auth.context";
import { LoadingSpinner } from "@/features/components/LoadingSpinner";

export default function AuthLayout() {
  const { isInitializing, session } = useAuth();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
