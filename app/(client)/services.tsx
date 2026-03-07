import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/auth.context";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { SkeletonCard } from "@/features/components/SkeletonCard";
import { useServices } from "@/features/services/hooks/useServices";
import { getErrorMessage } from "@/lib/errors";

export default function ServicesScreen() {
  const { signOut } = useAuth();
  const servicesQuery = useServices();

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Button onPress={() => void signOut()} variant="secondary">
          Logout
        </Button>
      </View>

      <Button onPress={() => router.push("/(client)/appointments")}>My Appointments</Button>

      {servicesQuery.isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : null}

      {servicesQuery.isError ? (
        <ErrorState message={getErrorMessage(servicesQuery.error)} onRetry={() => void servicesQuery.refetch()} />
      ) : null}

      {servicesQuery.data?.length === 0 ? (
        <EmptyState title="No services available" subtitle="Admin can add services from dashboard" />
      ) : null}

      {servicesQuery.data?.map((service) => (
        <Card key={service.id}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceMeta}>{service.description ?? "No description"}</Text>
          <Text style={styles.serviceMeta}>
            {service.durationMinutes} mins • ${service.price.toFixed(2)}
          </Text>
          <Button onPress={() => router.push(`/(client)/book?serviceId=${service.id}`)}>Book</Button>
        </Card>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
  },
  serviceMeta: {
    color: "#6B7280",
  },
});
