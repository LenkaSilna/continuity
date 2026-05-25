import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { showError, showSuccess } from "@/lib/toast";

export function withDelete({
  action,
  start,
  queryClient,
  invalidateKeys,
  navigate,
  errorMessage,
  successMessage,
}: {
  action: () => Promise<{ errorCode?: string }>;
  start: (fn: () => Promise<void>) => void;
  queryClient: QueryClient;
  invalidateKeys: QueryKey[];
  navigate?: () => void;
  errorMessage: string;
  successMessage: string;
}): void {
  start(async () => {
    const result = await action();
    if (result.errorCode) {
      showError(errorMessage);
      return;
    }
    for (const key of invalidateKeys) {
      queryClient.invalidateQueries({ queryKey: key });
    }
    navigate?.();
    showSuccess(successMessage);
  });
}
