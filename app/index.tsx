import { Redirect } from "expo-router";

import { ROLES, useAuth } from "@/features/auth/auth.context";
import { LoadingSpinner } from "@/features/components/LoadingSpinner";

export default function IndexScreen() {
  const { isInitializing, session, role } = useAuth();

  if (isInitializing) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!role) {
    return <LoadingSpinner />;
  }

  return <Redirect href={role === ROLES.ADMIN ? "/(admin)/schedule" : "/(client)/services"} />;
}
