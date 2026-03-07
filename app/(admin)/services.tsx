import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";

import { QUERY_KEYS } from "@/constants/query-keys";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { EmptyState } from "@/features/components/EmptyState";
import { ErrorState } from "@/features/components/ErrorState";
import { Input } from "@/features/components/Input";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { useServices } from "@/features/services/hooks/useServices";
import { servicesService } from "@/features/services/services.service";
import { getErrorMessage } from "@/lib/errors";
import { type ServiceFormInput, serviceSchema } from "@/schemas/admin.schema";

export default function AdminServicesScreen() {
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const servicesQuery = useServices();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      description: "",
      durationMinutes: 30,
      price: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: servicesService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof servicesService.update>[1] }) =>
      servicesService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
      setEditingServiceId(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: servicesService.remove,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services.all });
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description ?? null,
      durationMinutes: values.durationMinutes,
      price: values.price,
    };

    if (editingServiceId) {
      await updateMutation.mutateAsync({ id: editingServiceId, payload });
      return;
    }

    await createMutation.mutateAsync(payload);
  });

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Services</Text>
        <Button onPress={() => router.replace("/(admin)/schedule")} variant="secondary">
          Back
        </Button>
      </View>

      <Card>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <Input label="Description" value={value ?? ""} onChangeText={onChange} error={errors.description?.message} />
          )}
        />
        <Controller
          control={control}
          name="durationMinutes"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Duration (minutes)"
              value={String(value)}
              onChangeText={(text) => onChange(Number(text) || 0)}
              keyboardType="numeric"
              error={errors.durationMinutes?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="price"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Price"
              value={String(value)}
              onChangeText={(text) => onChange(Number(text) || 0)}
              keyboardType="numeric"
              error={errors.price?.message}
            />
          )}
        />

        <Button onPress={() => void onSubmit()} loading={createMutation.isPending || updateMutation.isPending}>
          {editingServiceId ? "Update Service" : "Create Service"}
        </Button>
      </Card>

      {servicesQuery.isError ? <ErrorState message={getErrorMessage(servicesQuery.error)} onRetry={() => void servicesQuery.refetch()} /> : null}
      {servicesQuery.data?.length === 0 ? <EmptyState title="No services configured" /> : null}

      {servicesQuery.data?.map((service) => (
        <Card key={service.id}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text>
            {service.durationMinutes} mins • ${service.price.toFixed(2)}
          </Text>
          <Text>{service.description ?? "No description"}</Text>
          <View style={styles.actions}>
            <Button
              onPress={() => {
                setEditingServiceId(service.id);
                setValue("name", service.name);
                setValue("description", service.description ?? "");
                setValue("durationMinutes", service.durationMinutes);
                setValue("price", service.price);
              }}
              variant="secondary"
            >
              Edit
            </Button>
            <Button onPress={() => deleteMutation.mutate(service.id)} variant="danger" loading={deleteMutation.isPending}>
              Delete
            </Button>
          </View>
        </Card>
      ))}

      {createMutation.isError ? <ErrorState message={getErrorMessage(createMutation.error)} /> : null}
      {updateMutation.isError ? <ErrorState message={getErrorMessage(updateMutation.error)} /> : null}
      {deleteMutation.isError ? <ErrorState message={getErrorMessage(deleteMutation.error)} /> : null}
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
  serviceName: {
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
});
