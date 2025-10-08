import { Classic } from "@caido/primevue";
import PrimeVue from "primevue/config";
import { createApp } from "vue";

import { SDKPlugin } from "./plugins/sdk";
import "./styles/index.css";
import type { FrontendSDK } from "./types";
import App from "./views/App.vue";

// This is the entry point for the frontend plugin
export const init = async (sdk: FrontendSDK) => {
  const app = createApp(App);

  // Load the PrimeVue component library
  app.use(PrimeVue, {
    unstyled: true,
    pt: Classic,
  });

  // Provide the FrontendSDK
  app.use(SDKPlugin, sdk);

  // Create the root element for the app
  const root = document.createElement("div");
  Object.assign(root.style, {
    height: "100%",
    width: "100%",
  });

  // Mount the app to the root element
  app.mount(root);

  // Add the page to the navigation
  // Make sure to use a unique name for the page
  sdk.navigation.addPage("/devtools", {
    body: root,
  });

  // Add a sidebar item
  sdk.sidebar.registerItem("Devtools", "/devtools");

  // Restore the last visited path
  const settings = await sdk.backend.getSettings();
  if (settings.restoreNavigation) {
    const savedPath = localStorage.getItem("devtools_navigation_restore");
    if (savedPath !== null) {
      localStorage.removeItem("devtools_navigation_restore");
      // We need to wait for all the plugins to be initialized
      // Ideally we should have a SDK event for this but I don't think it's worth the effort
      setTimeout(() => {
        sdk.navigation.goTo(savedPath);
      }, 200);
    }
  }
};
