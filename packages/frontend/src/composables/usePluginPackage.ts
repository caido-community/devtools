import { type Caido as Caido58 } from "@caido/sdk-frontend-58";
import { type API } from "backend";

import { useSDK } from "@/plugins/sdk";
import { type FrontendSDK } from "@/types";

const supportsBatchPluginInstallation = (
  sdk: FrontendSDK,
): sdk is Caido58<API, never> => {
  const [major = 0, minor = 0] = sdk.runtime.version
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  return major > 0 || minor >= 58;
};

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
    const file = new File([blob], "plugin_package.zip");

    if (supportsBatchPluginInstallation(sdk)) {
      const { installPluginPackages } = await sdk.graphql.installPluginPackages(
        {
          input: {
            sources: [{ file }],
            force: true,
          },
        },
      );

      const installedPackage = installPluginPackages.packages[0];
      if (installedPackage) {
        return {
          packageId: installedPackage.id,
        };
      }

      if (installPluginPackages.errors.length > 0) {
        sdk.window.showToast(JSON.stringify(installPluginPackages.errors), {
          variant: "error",
        });
      }

      return;
    }

    const { installPluginPackage } = await sdk.graphql.installPluginPackage({
      input: {
        source: {
          file,
        },
        force: true,
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
