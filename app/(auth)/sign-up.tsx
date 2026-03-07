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
import { type SignUpInput, signUpSchema } from "@/schemas/auth.schema";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const haptics = useHapticFeedback();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values.email, values.password, values.fullName);
      await haptics.success();
      reset();
      setError("root", {
        message: "Account created. Check your email for OTP/verification link before signing in.",
      });
    } catch (error) {
      await haptics.error();
      setError("root", { message: getErrorMessage(error, "Failed to sign up") });
    }
  });

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Create account</Text>

      <Card>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <Input label="Full Name" value={value} onChangeText={onChange} error={errors.fullName?.message} />
          )}
        />

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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Confirm Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {errors.root?.message ? <Text style={styles.info}>{errors.root.message}</Text> : null}

        <Button onPress={onSubmit} loading={isSubmitting}>
          Sign Up
        </Button>
      </Card>

      <Link href="/(auth)/sign-in" style={styles.link}>
        Back to sign in
      </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    color: "#0F172A",
    fontWeight: "600",
  },
  info: {
    color: "#065F46",
  },
});
