// Stage scene for the Agentic Engineering program: left page per module, right page the live workbench.
// Contract: ../stage/stage.js. Shared runtime: ./engine.js.
import { stageScene } from "./engine.js";
import { CHAPTERS } from "./content.js";

const HERE = new URL(".", import.meta.url).href;
export default stageScene({
  title: { es: "Ingeniería agéntica", en: "Agentic Engineering" },
  chapters: CHAPTERS,
  // enrolment mail from courses/index.html (the program's "Inscribirme" button); no free preview page exists
  enroll: "mailto:lfarizav@gmail.com?subject=Formaci%C3%B3n%20en%20Ingenier%C3%ADa%20Ag%C3%A9ntica%3A%20249%20USD&body=Hola%20Luis%2C%0A%0AQuiero%20inscribirme%20en%20Ingenier%C3%ADa%20Ag%C3%A9ntica%20(USD%20249).%0A%0ANombre%3A%20%0AEmpresa%2FUniversidad%3A%20%0ACargo%3A%20%0AInicio%20preferido%3A%20%0A%0AGracias.",
  preview: null,
  css: HERE + "agentic.css",
  maxWidth: 720,
  load: () => import("./live.js").then((m) => m.default),
});
