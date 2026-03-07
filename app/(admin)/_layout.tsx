import { Redirect, Stack } from "expo-router";

import { ROLES, useAuth } from "@/features/auth/auth.context";
import { LoadingSpinner } from "@/features/components/LoadingSpinner";

export default function AdminLayout() {
  const { isInitializing, session, role } = useAuth();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (role !== ROLES.ADMIN) {
    return <Redirect href="/(client)/services" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
