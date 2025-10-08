import { ref } from "vue";

import { useSDK } from "@/plugins/sdk";

type Settings = {
  serverUrl: string | undefined;
  packageId: string | undefined;
  forceUninstall: boolean;
  restoreNavigation: boolean;
};

export const useSettings = () => {
  const sdk = useSDK();

  const settings = ref<Settings>({
    serverUrl: undefined,
    packageId: undefined,
    forceUninstall: false,
    restoreNavigation: true,
  });

  const initializeSettings = async () => {
    const newSettings = await sdk.backend.getSettings();
    settings.value = newSettings;
  };

  const setSettings = async (newSettings: Settings) => {
    settings.value = newSettings;
    await sdk.backend.setSettings(newSettings);
  };

  const getSettings = () => {
    return settings.value;
  };

  return {
    initializeSettings,
    setSettings,
    getSettings,
  };
};
