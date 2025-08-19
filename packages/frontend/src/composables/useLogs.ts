import { computed, ref } from "vue";

import { useSDK } from "@/plugins/sdk";

type Log = {
  kind: "Log";
  origin: string;
  timestamp: number;
  message: string;
};

export const useLogs = () => {
  const sdk = useSDK();

  const entries = ref<Log[]>([]);
  const logs = computed(() =>
    entries.value
      .map(
        (log) =>
          `${new Date(log.timestamp).toISOString()} | ${log.origin} | ${
            log.message
          }`,
      )
      .join("\n"),
  );

  const initializeLogs = async () => {
    const logs = await sdk.backend.getLogs();
    entries.value = logs;
  };

  const addLog = (origin: string, message: string) => {
    const log: Log = { kind: "Log", origin, timestamp: Date.now(), message };
    entries.value.push(log);
    sdk.backend.addLog(log);
  };

  const clearLogs = async () => {
    entries.value = [];
    await sdk.backend.clearLogs();
  };

  return { logs, addLog, clearLogs, initializeLogs };
};
