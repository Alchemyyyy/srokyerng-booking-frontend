import { onMounted, onUnmounted } from "vue";

/**
 * Refetches `refetchFn` whenever a matching real-time event arrives.
 * Channel-agnostic — pass either socketService's onNotification/offNotification
 * (personal, per-user) or onAdminActivity/offAdminActivity (admin broadcast) pair.
 */
export const useRealtimeRefresh = ({ subscribe, unsubscribe, types, refetchFn, debounceMs = 300 }) => {
  let timer = null;

  const debouncedRefetch = () => {
    clearTimeout(timer);
    timer = setTimeout(refetchFn, debounceMs);
  };

  const handler = (payload) => {
    if (types.includes(payload?.type)) {
      debouncedRefetch();
    }
  };

  onMounted(() => {
    subscribe(handler);
  });

  onUnmounted(() => {
    clearTimeout(timer);
    unsubscribe(handler);
  });
};
