import { useSDK } from "@/plugins/sdk";
import { ref } from "vue";

export const usePluginPackage = () => {
    const sdk = useSDK();

    const pluginPackageId = ref<string | undefined>(undefined);

    const reinstallPackage = async (options: {
        downloadUrl: string,
    }) => {
        try {
            console.log("Uninstalling package");
            if (pluginPackageId.value) {
                const { uninstallPluginPackage } = await sdk.graphql.uninstallPluginPackage({
                    id: pluginPackageId.value,
                })

                if (uninstallPluginPackage.error) {
                    sdk.window.showToast(JSON.stringify(uninstallPluginPackage.error), {
                        variant: "error",
                    });
                }
            }

            const dataUri = await sdk.backend.downloadPackage(options.downloadUrl);
            const response = await fetch(dataUri);
            const blob = await response.blob();

            const { installPluginPackage } = await sdk.graphql.installPluginPackage({
                input: {
                    source: {
                        file: new File([blob], "plugin_package.zip"),

                    }
                },
            })

            if (installPluginPackage.package) {
                pluginPackageId.value = installPluginPackage.package.id;
            } 
            
            if (installPluginPackage.error) {
                sdk.window.showToast(JSON.stringify(installPluginPackage.error), {
                    variant: "error",
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                sdk.window.showToast(error.message, {
                    variant: "error",
                });
            } else {
                sdk.window.showToast("Failed to reinstall package", {
                    variant: "error",
                });
            }
        }
    }

    return {
        reinstallPackage,
    }
}