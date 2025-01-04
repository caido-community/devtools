import { useLogs } from "@/composables/useLogs";
import { usePluginPackage } from "@/composables/usePluginPackage";
import { useSDK } from "@/plugins/sdk";
import { toMessage } from "@/utils/watcher";
import { onMounted, ref } from "vue";

type State =
    | { kind: "Idle" }
    | { kind: "Connecting"; url: string }
    | { kind: "Connected"; ws: WebSocket };

export const useForm = () => {

    const { logs, addLog } = useLogs();
    const { reinstallPackage } = usePluginPackage();

    const state = ref<State>({ kind: "Idle" });
    const setState = (newState: State) => {
        switch (newState.kind) {
            case "Idle":
                break;
            case "Connecting":
                addLog(`Connecting to ${newState.url}`);
                break;
            case "Connected":
                addLog(`Connected to ${newState.ws.url}`);
                break;
        }
        state.value = newState;
    };

    const connect = async (url: string) => {
        setState({ kind: "Connecting", url });
        const ws = new WebSocket(url);
        ws.addEventListener("message", (event) => {
            addLog(event.data);

            const message = toMessage(event);
            if (message) {
                switch (message.kind) {
                    case "connected":
                        reinstallPackage(message);
                        break;
                    case "rebuild":
                        reinstallPackage(message);
                        break;
                    case "error":
                        addLog(message.error);
                        break;
                }
            }
        });

        ws.addEventListener("open", () => {
            setState({ kind: "Connected", ws });
            sdk.backend.setServerUrl(url);
        });

        ws.addEventListener("error", (event) => {
            addLog(`Error: ${JSON.stringify(event)}`);
        });

        ws.addEventListener("close", () => {
            setState({ kind: "Idle" });
        });
    };

    const sdk = useSDK();
    const serverUrl = ref("");
    onMounted(async () => {
        const url = await sdk.backend.getServerUrl();
        if (url) {
            serverUrl.value = url;
            await connect(url);
        }
    });

    const onSubmit = async () => {
        await connect(serverUrl.value);
    };

    const onDisconnect = () => {
        if (state.value.kind === "Connected") {
            state.value.ws.close();
            setState({ kind: "Idle" });
        }
    };

    return {
        serverUrl,
        state,
        onSubmit,
        onDisconnect,
        logs,
    };
};
