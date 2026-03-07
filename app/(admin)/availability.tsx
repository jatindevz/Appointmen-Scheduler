import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import {
    useAdminAvailability,
    useCreateAvailability,
    useRemoveAvailability,
} from "@/features/admin/hooks/useAdminSchedule";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { Input } from "@/features/components/Input";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { getErrorMessage } from "@/lib/errors";
import { type AvailabilityFormInput, availabilitySchema } from "@/schemas/admin.schema";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminAvailabilityScreen() {
  const availabilityQuery = useAdminAvailability();
  const createMutation = useCreateAvailability();
  const removeMutation = useRemoveAvailability();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AvailabilityFormInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      weekday: 1,
      startTime: "09:00:00",
      endTime: "17:00:00",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values);
    reset();
  });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Availability</Text>
        <Button onPress={() => router.replace("/(admin)/schedule")} variant="secondary">
          Back
        </Button>
      </View>

      <Card>
        <Controller
          control={control}
          name="weekday"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Weekday (0 Sun - 6 Sat)"
              value={String(value)}
              onChangeText={(text) => onChange(Number(text) || 0)}
              keyboardType="numeric"
              error={errors.weekday?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="startTime"
          render={({ field: { value, onChange } }) => (
            <Input label="Start Time (HH:MM:SS)" value={value} onChangeText={onChange} error={errors.startTime?.message} />
          )}
        />
        <Controller
          control={control}
          name="endTime"
          render={({ field: { value, onChange } }) => (
            <Input label="End Time (HH:MM:SS)" value={value} onChangeText={onChange} error={errors.endTime?.message} />
          )}
        />

        <Button onPress={() => void onSubmit()} loading={createMutation.isPending}>
          Add Availability
        </Button>
      </Card>

      {availabilityQuery.isError ? (
        <ErrorState message={getErrorMessage(availabilityQuery.error)} onRetry={() => void availabilityQuery.refetch()} />
      ) : null}

      {availabilityQuery.data?.length === 0 ? <EmptyState title="No availability configured" /> : null}

      {availabilityQuery.data?.map((window) => (
        <Card key={window.id}>
          <Text>
            {WEEKDAYS[window.weekday]} • {window.startTime.slice(0, 5)} - {window.endTime.slice(0, 5)}
          </Text>
          <Button onPress={() => removeMutation.mutate(window.id)} variant="danger" loading={removeMutation.isPending}>
            Delete
          </Button>
        </Card>
      ))}

      {createMutation.isError ? <ErrorState message={getErrorMessage(createMutation.error)} /> : null}
      {removeMutation.isError ? <ErrorState message={getErrorMessage(removeMutation.error)} /> : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});
