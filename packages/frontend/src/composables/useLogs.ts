import { computed, ref } from "vue";

type Log = {
    kind: "Log";
    timestamp: Date;
    message: string;
};

export const useLogs = () => {

    const entries = ref<Log[]>([]);
    const logs = computed(() => entries.value.map((log) => `${log.timestamp.toISOString()} - ${log.message}`).join("\n"));
    const addLog = (message: string) => {
        entries.value.push({ kind: "Log", timestamp: new Date(), message });
    };

    return { logs, addLog };
}