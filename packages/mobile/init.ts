import "./src/background/background";

import { Keplr } from "@proof-wallet/provider";
import { RNMessageRequesterInternal } from "./src/router";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.keplr = new Keplr("", new RNMessageRequesterInternal());
