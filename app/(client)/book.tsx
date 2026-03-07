import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/features/auth/auth.context";
import { useBookAppointment, useTimeSlots } from "@/features/bookings/hooks/useAppointments";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { Input } from "@/features/components/Input";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { useServices } from "@/features/services/hooks/useServices";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { getTodayIsoDate } from "@/lib/date";
import { getErrorMessage } from "@/lib/errors";
import { type BookAppointmentInput, bookAppointmentSchema } from "@/schemas/booking.schema";

export default function BookScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { user } = useAuth();
  const haptics = useHapticFeedback();

  const servicesQuery = useServices();
  const service = useMemo(
    () => servicesQuery.data?.find((item) => item.id === serviceId) ?? null,
    [serviceId, servicesQuery.data],
  );

  const slotsQuery = useTimeSlots({ date: selectedDate, service });
  const bookMutation = useBookAppointment(user?.id ?? null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    setError,
  } = useForm<BookAppointmentInput>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      serviceId: serviceId ?? "",
      appointmentDate: selectedDate,
      startTime: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await bookMutation.mutateAsync(values);
      await haptics.success();
      router.replace("/(client)/appointments");
    } catch (error) {
      await haptics.error();
      setError("root", { message: getErrorMessage(error, "Booking failed. Please retry.") });
    }
  });

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Book Appointment</Text>

      <Button onPress={() => router.replace("/(client)/services")} variant="secondary">
        Back to services
      </Button>

      <Card>
        <Controller
          control={control}
          name="appointmentDate"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Date (YYYY-MM-DD)"
              value={value}
              onChangeText={(dateValue) => {
                onChange(dateValue);
                setSelectedDate(dateValue);
              }}
              error={errors.appointmentDate?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="serviceId"
          render={({ field: { value } }) => <Input label="Service" value={service?.name ?? value} onChangeText={() => {}} />}
        />

        {slotsQuery.isError ? <ErrorState message={getErrorMessage(slotsQuery.error)} onRetry={() => void slotsQuery.refetch()} /> : null}

        {slotsQuery.data?.length === 0 ? (
          <EmptyState title="No slots available" subtitle="Try another date" />
        ) : (
          <View style={styles.slotGrid}>
            {slotsQuery.data?.map((slot) => (
              <Button
                key={slot.startTime}
                variant={selectedTime === slot.startTime ? "secondary" : "primary"}
                onPress={() => {
                  setSelectedTime(slot.startTime);
                  setValue("startTime", slot.startTime, { shouldValidate: true });
                }}
              >
                {slot.label}
              </Button>
            ))}
          </View>
        )}

        {errors.startTime?.message ? <Text style={styles.error}>{errors.startTime.message}</Text> : null}
        {errors.root?.message ? <Text style={styles.error}>{errors.root.message}</Text> : null}

        <Button onPress={onSubmit} loading={bookMutation.isPending} disabled={!selectedTime}>
          Confirm Booking
        </Button>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  slotGrid: {
    gap: 8,
  },
  error: {
    color: "#B91C1C",
  },
});
