// Stage scene for the Cloud-Native Kubernetes program: left page per module, right page the live model.
// Contract: ../stage/stage.js. Shared runtime: ../agentic/engine.js.
import { stageScene } from "../agentic/engine.js";
import { CHAPTERS } from "./content.js";

const HERE = new URL(".", import.meta.url).href;
export default stageScene({
  title: { es: "Kubernetes cloud native", en: "Cloud-Native Kubernetes" },
  chapters: CHAPTERS,
  // enrolment mail from courses/index.html (the program's "Inscribirme" button); no free preview page exists
  enroll: "mailto:lfarizav@gmail.com?subject=Formaci%C3%B3n%20en%20Kubernetes%20Cloud%20Native%3A%20199%20USD&body=Hola%20Luis%2C%0A%0AQuiero%20inscribirme%20(USD%20199).%0A%0ANombre%3A%20%0AEmpresa%2FUniversidad%3A%20%0ACargo%3A%20%0A%0AGracias.",
  preview: null,
  css: HERE + "kubernetes.css",
  maxWidth: 720,
  load: () => import("./live.js").then((m) => m.default),
});
