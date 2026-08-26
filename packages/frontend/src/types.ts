import { type Caido } from "@caido/sdk-frontend";
import { type Caido as Caido58 } from "@caido/sdk-frontend-58";
import { type API } from "backend";

export type FrontendSDK = Caido<API, never> | Caido58<API, never>;
