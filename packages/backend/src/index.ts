import type { DefineAPI, SDK } from "caido:plugin";
import { fetch } from "caido:http";
import { Buffer } from "buffer";

let serverUrl: string | null = null;

const setServerUrl = (sdk: SDK, url: string) => {
  serverUrl = url;
  sdk.console.log(`Connected to: ${url}`);
};

const getServerUrl = (sdk: SDK) => {
  return serverUrl;
};

const downloadPackage = async (sdk: SDK, url: string) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:application/zip;base64,${base64}`;
};

export type API = DefineAPI<{
  setServerUrl: typeof setServerUrl;
  getServerUrl: typeof getServerUrl;
  downloadPackage: typeof downloadPackage;
}>;

export function init(sdk: SDK<API>) {
  sdk.api.register("setServerUrl", setServerUrl);
  sdk.api.register("getServerUrl", getServerUrl);
  sdk.api.register("downloadPackage", downloadPackage);
}
