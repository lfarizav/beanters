// Stage scene for the CKA / CKAD / CKS prep: left page per certification, right page the live vault.
// Contract: ../stage/stage.js. Shared runtime: ../agentic/engine.js.
import { stageScene } from "../agentic/engine.js";
import { CHAPTERS } from "./content.js";

const HERE = new URL(".", import.meta.url).href;
export default stageScene({
  title: { es: "Preparación CKA / CKAD / CKS", en: "CKA / CKAD / CKS Certification Prep" },
  chapters: CHAPTERS,
  // enrolment mail from courses/index.html (the program's "Inscribirme" button); no free preview page exists
  enroll: "mailto:lfarizav@gmail.com?subject=Preparaci%C3%B3n%20para%20la%20certificaci%C3%B3n%20CKA%3A%20149%20USD&body=Hola%20Luis%2C%0A%0AQuiero%20inscribirme%20(USD%20149).%0A%0ANombre%3A%20%0ACertificaci%C3%B3n%20objetivo%3A%20%0AFecha%20objetivo%20del%20examen%3A%20%0A%0AGracias.",
  preview: null,
  css: HERE + "certprep.css",
  maxWidth: 720,
  load: () => import("./live.js").then((m) => m.default),
});
