import { computed, onMounted, ref } from "vue";

import { useLogs } from "@/composables/useLogs";
import { usePluginPackage } from "@/composables/usePluginPackage";
import { useSettings } from "@/composables/useSettings";
import { useState } from "@/composables/useState";
import { toMessage } from "@/utils/watcher";

const getDownloadUrl = (
  originalUrl: string,
  serverUrl: string | undefined,
): string => {
  if (!serverUrl) return originalUrl;

  try {
    const original = new URL(originalUrl);
    const server = new URL(serverUrl);
    return originalUrl.replace(original.origin, server.origin);
  } catch {
    return originalUrl;
  }
};

export const useForm = () => {
  const { logs, addLog, initializeLogs, clearLogs } = useLogs();
  const { state, setState } = useState();
  const { getSettings, setSettings, initializeSettings } = useSettings();
  const { installPackage, removePackage, getInstalledPackage } =
    usePluginPackage();

  const serverUrl = ref("http://localhost:3000");

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
      const effectiveUrl = getDownloadUrl(downloadUrl, serverUrl.value);
      addLog("Devtools", `Installing ${packageId} from ${effectiveUrl}`);
      const installResult = await installPackage({ downloadUrl: effectiveUrl });
      if (installResult) {
        await setSettings({
          ...settings,
          packageId: installResult.packageId,
        });

        if (settings.restoreNavigation) {
          const currentPath = location.hash.substring(1);
          if (currentPath) {
            localStorage.setItem("devtools_navigation_restore", currentPath);
          }
        }

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

    const effectiveUrl = getDownloadUrl(downloadUrl, serverUrl.value);
    addLog("Devtools", `Installing new package from ${effectiveUrl}`);
    const installResult = await installPackage({ downloadUrl: effectiveUrl });
    if (installResult) {
      await setSettings({
        ...settings,
        packageId: installResult.packageId,
      });

      if (settings.restoreNavigation) {
        const currentPath = location.hash.substring(1);
        if (currentPath) {
          localStorage.setItem("devtools_navigation_restore", currentPath);
        }
      }

      window.location.reload();
    }
  };

  const onMessage = async (event: MessageEvent) => {
    const message = toMessage(event);
    if (!message) {
      addLog("WatchServer", event.data);
      return;
    }

    switch (message.kind) {
      case "connected": {
        const effectiveUrl = getDownloadUrl(message.downloadUrl, serverUrl.value);
        addLog("WatchServer", JSON.stringify({ ...message, downloadUrl: effectiveUrl }));
        await onConnected(message.packageId, message.downloadUrl);
        break;
      }
      case "rebuild": {
        const effectiveUrl = getDownloadUrl(message.downloadUrl, serverUrl.value);
        addLog("WatchServer", JSON.stringify({ ...message, downloadUrl: effectiveUrl }));
        await onRebuild(message.downloadUrl);
        break;
      }
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

  onMounted(async () => {
    await initializeSettings();
    await initializeLogs();

    const settings = getSettings();
    if (settings.serverUrl !== undefined) {
      serverUrl.value = settings.serverUrl;
      await connect(settings.serverUrl);
    }
  });

  const forceUninstall = computed({
    get: () => getSettings().forceUninstall,
    set: async (value: boolean) =>
      await setSettings({
        ...getSettings(),
        forceUninstall: value,
      }),
  });

  const restoreNavigation = computed({
    get: () => getSettings().restoreNavigation,
    set: async (value: boolean) =>
      await setSettings({
        ...getSettings(),
        restoreNavigation: value,
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

  const onClearLogs = async () => {
    await clearLogs();
  };

  return {
    serverUrl,
    forceUninstall,
    restoreNavigation,
    state,
    onSubmit,
    onDisconnect,
    onClearLogs,
    logs,
  };
};
