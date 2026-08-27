type ApiErrorPayload = {
  response?: {
    data?: {
      error?: unknown;
    };
  };
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) return fallback;

  const message = (error as ApiErrorPayload).response?.data?.error;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}
