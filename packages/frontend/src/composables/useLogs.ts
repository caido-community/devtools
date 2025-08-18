import { computed, ref } from "vue";

type Log = {
  kind: "Log";
  origin: string;
  timestamp: Date;
  message: string;
};

export const useLogs = () => {
  const entries = ref<Log[]>([]);
  const logs = computed(() =>
    entries.value
      .map(
        (log) =>
          `${log.timestamp.toISOString()} | ${log.origin} | ${log.message}`,
      )
      .join("\n"),
  );
  const addLog = (origin: string, message: string) => {
    entries.value.push({ kind: "Log", origin, timestamp: new Date(), message });
  };

  return { logs, addLog };
};
