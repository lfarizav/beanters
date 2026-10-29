// In-page embed of the agentic workbench: <div data-agentic-embed></div> + <script type="module" src=".../embed.js">.
// Live at 640px and wider, poster.svg below. Shared runtime and card: ./engine.js (reuses ../cellular/embed.css).
import { autoMount } from "./engine.js";

const HERE = new URL(".", import.meta.url).href;
autoMount("[data-agentic-embed]", { css: HERE + "agentic.css", poster: HERE + "poster.svg", size: [600, 520], aspect: "600/520", chapter: 2, load: () => import("./live.js").then((m) => m.default) });
