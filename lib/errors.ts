type MaybeError = {
  message?: string;
};

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "message" in error) {
    return (error as MaybeError).message ?? fallback;
  }

  return fallback;
}
