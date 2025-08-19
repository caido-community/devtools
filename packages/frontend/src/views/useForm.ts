import { onMounted, ref } from "vue";

import { useLogs } from "@/composables/useLogs";
import { usePluginPackage } from "@/composables/usePluginPackage";
import { useSettings } from "@/composables/useSettings";
import { useState } from "@/composables/useState";
import { toMessage } from "@/utils/watcher";

export const useForm = () => {
  const { logs, addLog } = useLogs();
  const { state, setState } = useState();
  const { getSettings, setSettings, initializeSettings } = useSettings();
  const { installPackage, removePackage, getInstalledPackage } =
    usePluginPackage();

  const onConnected = async (packageId: string, downloadUrl: string) => {
    const settings = getSettings();
    const installedPackage = await getInstalledPackage(packageId);
    if (installedPackage) {
      addLog("Devtools", `Package ${packageId} is already installed`);
      await setSettings({
        ...settings,
        packageId: installedPackage.id,
      });
      return;
    } else {
      addLog("Devtools", `Installing ${packageId}`);
      const installResult = await installPackage({ downloadUrl });
      if (installResult) {
        await setSettings({
          ...settings,
          packageId: installResult.packageId,
        });
        window.location.reload();
      }
    }
  };

  const onRebuild = async (downloadUrl: string) => {
    const settings = getSettings();
    if (settings.packageId !== undefined && settings.forceUninstall) {
      addLog("Devtools", `Uninstalling ${settings.packageId}`);
      await removePackage({ packageId: settings.packageId });
      await setSettings({
        ...settings,
        packageId: undefined,
      });
    }

    addLog("Devtools", `Installing new package`);
    const installResult = await installPackage({ downloadUrl });
    if (installResult) {
      await setSettings({
        ...settings,
        packageId: installResult.packageId,
      });
      window.location.reload();
    }
  };

  const onMessage = async (event: MessageEvent) => {
    addLog("WatchServer", event.data);
    const message = toMessage(event);
    if (!message) return;

    switch (message.kind) {
      case "connected":
        await onConnected(message.packageId, message.downloadUrl);
        break;
      case "rebuild":
        await onRebuild(message.downloadUrl);
        break;
      case "error":
        addLog("WatchServer", message.error);
        break;
    }
  };

  const connect = async (url: string) => {
    const settings = getSettings();
    await setSettings({
      ...settings,
      serverUrl: url,
    });

    addLog("Devtools", `Connecting to ${url}`);
    setState({ kind: "Connecting", url });

    const ws = new WebSocket(url);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("open", () => {
      addLog("Devtools", `Connected to ${url}`);
      setState({ kind: "Connected", ws });
    });

    ws.addEventListener("error", (event) => {
      addLog("Devtools", `Error: ${JSON.stringify(event)}`);
    });

    ws.addEventListener("close", () => {
      addLog("Devtools", `Disconnected from ${url}`);
      setState({ kind: "Idle" });
    });
  };

  const serverUrl = ref("");
  onMounted(async () => {
    await initializeSettings();

    const settings = getSettings();
    if (settings.serverUrl !== undefined) {
      serverUrl.value = settings.serverUrl;
      await connect(settings.serverUrl);
    }
  });

  const forceUninstall = ref({
    get: () => getSettings().forceUninstall,
    set: async (value: boolean) =>
      await setSettings({
        ...getSettings(),
        forceUninstall: value,
      }),
  });

  const onSubmit = async () => {
    await connect(serverUrl.value);
  };

  const onDisconnect = () => {
    if (state.value.kind === "Connected") {
      state.value.ws.close();
    }
  };

  return {
    serverUrl,
    forceUninstall,
    state,
    onSubmit,
    onDisconnect,
    logs,
  };
};
