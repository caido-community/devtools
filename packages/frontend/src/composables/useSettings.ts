import { useSDK } from "@/plugins/sdk";
import { ref } from "vue";

type Settings = {
    serverUrl: string | undefined;
    packageId: string | undefined;
}

export const useSettings = () => {
    const sdk = useSDK();

    const settings = ref<Settings>({
        serverUrl: undefined,
        packageId: undefined,
    });

    const initializeSettings = async () => {
        const newSettings = await sdk.backend.getSettings();
        settings.value = newSettings;
    }

    const setSettings = async (newSettings: Settings) => { 
        settings.value = newSettings;
        await sdk.backend.setSettings(newSettings);
    }

    const getSettings = () => {
        return settings.value;
    }

    return {
        initializeSettings,
        setSettings,
        getSettings,
    }
}