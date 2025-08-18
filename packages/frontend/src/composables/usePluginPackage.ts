import { useSDK } from "@/plugins/sdk";

export const usePluginPackage = () => {
  const sdk = useSDK();

  const getInstalledPackage = async (packageId: string) => {
    const { pluginPackages } = await sdk.graphql.pluginPackages();
    return pluginPackages.find(
      (pluginPackage) => pluginPackage.manifestId === packageId,
    );
  };

  const installPackage = async (options: { downloadUrl: string }) => {
    const dataUri = await sdk.backend.downloadPackage(options.downloadUrl);
    const response = await fetch(dataUri);
    const blob = await response.blob();

    const { installPluginPackage } = await sdk.graphql.installPluginPackage({
      input: {
        source: {
          file: new File([blob], "plugin_package.zip"),
        },
      },
    });

    if (installPluginPackage.package) {
      return {
        packageId: installPluginPackage.package.id,
      };
    }

    if (installPluginPackage.error) {
      sdk.window.showToast(JSON.stringify(installPluginPackage.error), {
        variant: "error",
      });
    }
  };

  const removePackage = async (options: { packageId: string }) => {
    try {
      const { uninstallPluginPackage } =
        await sdk.graphql.uninstallPluginPackage({
          id: options.packageId,
        });

      if (uninstallPluginPackage.error) {
        sdk.window.showToast(JSON.stringify(uninstallPluginPackage.error), {
          variant: "error",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        sdk.window.showToast(error.message, {
          variant: "error",
        });
      } else {
        sdk.window.showToast("Failed to uninstall package", {
          variant: "error",
        });
      }
    }
  };

  return {
    installPackage,
    removePackage,
    getInstalledPackage,
  };
};
