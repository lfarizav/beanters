// In-page embed of the certification vault: <div data-certprep-embed></div> + <script type="module" src=".../embed.js">.
// Live at 640px and wider, poster.svg below. Shared runtime and card: ../agentic/engine.js (reuses ../cellular/embed.css).
import { autoMount } from "../agentic/engine.js";

const HERE = new URL(".", import.meta.url).href;
autoMount("[data-certprep-embed]", { css: HERE + "certprep.css", poster: HERE + "poster.svg", size: [600, 520], aspect: "600/520", load: () => import("./live.js").then((m) => m.default) });
