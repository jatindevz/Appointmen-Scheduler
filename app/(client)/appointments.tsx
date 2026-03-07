import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/auth.context";
import { useAppointments, useCancelAppointment } from "@/features/bookings/hooks/useAppointments";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { SkeletonCard } from "@/features/components/SkeletonCard";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { getErrorMessage } from "@/lib/errors";

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const haptics = useHapticFeedback();

  const appointmentsQuery = useAppointments(user?.id ?? null);
  const cancelMutation = useCancelAppointment(user?.id ?? null);

  const onCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      await haptics.light();
    } catch {
      await haptics.error();
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Appointments</Text>
        <Button onPress={() => router.replace("/(client)/services")} variant="secondary">
          Back
        </Button>
      </View>

      {appointmentsQuery.isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : null}

      {appointmentsQuery.isError ? (
        <ErrorState message={getErrorMessage(appointmentsQuery.error)} onRetry={() => void appointmentsQuery.refetch()} />
      ) : null}

      {appointmentsQuery.data?.length === 0 ? (
        <EmptyState title="No appointments" subtitle="Book your first appointment" />
      ) : null}

      {appointmentsQuery.data?.map((appointment) => (
        <Card key={appointment.id}>
          <Text style={styles.serviceName}>{appointment.service?.name ?? "Service"}</Text>
          <Text>
            {appointment.appointmentDate} • {appointment.startTime.slice(0, 5)}-{appointment.endTime.slice(0, 5)}
          </Text>
          <Text>Status: {appointment.status}</Text>
          {appointment.status === "confirmed" ? (
            <Button onPress={() => void onCancel(appointment.id)} variant="danger" loading={cancelMutation.isPending}>
              Cancel
            </Button>
          ) : null}
        </Card>
      ))}

      {cancelMutation.isError ? <ErrorState message={getErrorMessage(cancelMutation.error)} /> : null}
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
    fontSize: 22,
    fontWeight: "700",
  },
  serviceName: {
    fontWeight: "700",
  },
});
