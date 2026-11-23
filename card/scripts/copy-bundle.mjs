// Copies the built card into the integration, which serves it to the frontend.
import { copyFileSync, mkdirSync } from "node:fs";

const target = new URL("../../custom_components/active_rings/frontend/", import.meta.url);
mkdirSync(target, { recursive: true });
copyFileSync(new URL("../dist/active-rings-card.js", import.meta.url), new URL("active-rings-card.js", target));
console.log("copied to custom_components/active_rings/frontend/");
