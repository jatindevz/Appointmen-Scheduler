import { router } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAdminSchedule, useUpdateAppointmentStatus } from "@/features/admin/hooks/useAdminSchedule";
import { useAuth } from "@/features/auth/auth.context";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { Input } from "@/features/components/Input";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { getTodayIsoDate, pad2 } from "@/lib/date";
import { getErrorMessage } from "@/lib/errors";

function getWeekRange(dateIso: string): { startDate: string; endDate: string } {
  const date = new Date(`${dateIso}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const toIso = (value: Date) => `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;

  return { startDate: toIso(monday), endDate: toIso(sunday) };
}

export default function AdminScheduleScreen() {
  const [date, setDate] = useState(getTodayIsoDate());
  const { signOut } = useAuth();

  const weekRange = useMemo(() => getWeekRange(date), [date]);
  const { daily, weekly } = useAdminSchedule(date, weekRange);
  const statusMutation = useUpdateAppointmentStatus(date, weekRange.startDate);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Schedule</Text>
        <Button onPress={() => void signOut()} variant="secondary">
          Logout
        </Button>
      </View>

      <View style={styles.navButtons}>
        <Button onPress={() => router.push("/(admin)/services")}>Manage Services</Button>
        <Button onPress={() => router.push("/(admin)/availability")}>Manage Availability</Button>
      </View>

      <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />

      <Text style={styles.sectionTitle}>Daily</Text>
      {daily.isError ? <ErrorState message={getErrorMessage(daily.error)} onRetry={() => void daily.refetch()} /> : null}
      {daily.data?.length === 0 ? <EmptyState title="No appointments for this day" /> : null}
      {daily.data?.map((appointment) => (
        <Card key={appointment.id}>
          <Text style={styles.serviceName}>{appointment.service?.name ?? "Service"}</Text>
          <Text>
            {appointment.appointmentDate} • {appointment.startTime.slice(0, 5)}-{appointment.endTime.slice(0, 5)}
          </Text>
          <Text>Status: {appointment.status}</Text>
          <View style={styles.actionRow}>
            <Button
              onPress={() => statusMutation.mutate({ id: appointment.id, status: "confirmed" })}
              variant="secondary"
              loading={statusMutation.isPending}
            >
              Confirm
            </Button>
            <Button
              onPress={() => statusMutation.mutate({ id: appointment.id, status: "cancelled" })}
              variant="danger"
              loading={statusMutation.isPending}
            >
              Cancel
            </Button>
          </View>
        </Card>
      ))}

      <Text style={styles.sectionTitle}>Weekly ({weekRange.startDate} to {weekRange.endDate})</Text>
      {weekly.isError ? <ErrorState message={getErrorMessage(weekly.error)} onRetry={() => void weekly.refetch()} /> : null}
      {weekly.data?.length === 0 ? <EmptyState title="No appointments in this week" /> : null}
      {weekly.data?.map((appointment) => (
        <Card key={`weekly-${appointment.id}`}>
          <Text style={styles.serviceName}>{appointment.service?.name ?? "Service"}</Text>
          <Text>
            {appointment.appointmentDate} • {appointment.startTime.slice(0, 5)}-{appointment.endTime.slice(0, 5)} • {appointment.status}
          </Text>
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
  },
  navButtons: {
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  serviceName: {
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
});
