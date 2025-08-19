import { Buffer } from "buffer";

import { fetch } from "caido:http";
import type { DefineAPI, SDK } from "caido:plugin";

type Settings = {
  serverUrl: string | undefined;
  packageId: string | undefined;
  forceUninstall: boolean;
};

const settings: Settings = {
  serverUrl: undefined,
  packageId: undefined,
  forceUninstall: false,
};

const setSettings = (sdk: SDK, newSettings: Settings) => {
  Object.assign(settings, newSettings);
};

const getSettings = (sdk: SDK): Settings => {
  return settings;
};

const downloadPackage = async (sdk: SDK, url: string) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:application/zip;base64,${base64}`;
};

export type API = DefineAPI<{
  setSettings: typeof setSettings;
  getSettings: typeof getSettings;
  downloadPackage: typeof downloadPackage;
}>;

export function init(sdk: SDK<API>) {
  sdk.api.register("setSettings", setSettings);
  sdk.api.register("getSettings", getSettings);
  sdk.api.register("downloadPackage", downloadPackage);
}
