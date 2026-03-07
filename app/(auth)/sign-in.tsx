import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";

import { useAuth } from "@/features/auth/auth.context";
import { Button } from "@/features/components/Button";
import { Card } from "@/features/components/Card";
import { Input } from "@/features/components/Input";
import { ScreenWrapper } from "@/features/components/ScreenWrapper";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { getErrorMessage } from "@/lib/errors";
import { type SignInInput, signInSchema } from "@/schemas/auth.schema";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const haptics = useHapticFeedback();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email, values.password);
      await haptics.success();
    } catch (error) {
      await haptics.error();
      setError("root", { message: getErrorMessage(error, "Failed to sign in") });
    }
  });

  return (
    <ScreenWrapper>
      <Text style={styles.title}>The Specialist</Text>
      <Text style={styles.subtitle}>Appointment Scheduler</Text>

      <Card>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Email"
              value={value}
              onChangeText={onChange}
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />

        {errors.root?.message ? <Text style={styles.error}>{errors.root.message}</Text> : null}

        <Button onPress={onSubmit} loading={isSubmitting}>
          Sign In
        </Button>
      </Card>

      <Link href="/(auth)/sign-up" style={styles.link}>
        Create an account
      </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6B7280",
    marginBottom: 8,
  },
  link: {
    textAlign: "center",
    color: "#0F172A",
    fontWeight: "600",
  },
  error: {
    color: "#B91C1C",
  },
});
