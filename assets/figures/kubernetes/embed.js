// In-page embed of the Kubernetes model: <div data-kubernetes-embed></div> + <script type="module" src=".../embed.js">.
// Live at 640px and wider, poster.svg below. Shared runtime and card: ../agentic/engine.js (reuses ../cellular/embed.css).
import { autoMount } from "../agentic/engine.js";

const HERE = new URL(".", import.meta.url).href;
autoMount("[data-kubernetes-embed]", { css: HERE + "kubernetes.css", poster: HERE + "poster.svg", size: [600, 480], aspect: "600/480", chapter: 1, load: () => import("./live.js").then((m) => m.default) });
