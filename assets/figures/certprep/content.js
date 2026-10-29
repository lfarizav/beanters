// Words for the certification-prep vault, ES and EN. Source: courses/index.html, program
// "Preparación para las certificaciones CKA / CKAD / CKS" (ES lines 214-224, EN dictionary cm76-cm86 at lines 403-413).
// The page lists no exam domains; each drawer shows what the page says the prep includes.
// Lines that start "En la escena" / "In the model" describe the figure, not the course.
const IN_ES = "Incluye simulacros cronometrados, escenarios con clústeres en vivo y las trampas más comunes del examen.";
const IN_EN = "Includes timed mock exams, live cluster scenarios and common exam traps.";
export const CHAPTERS = [
  {
    id: "CKA",
    es: { name: "CKA", sub: "Administración de clústeres", idea: "La primera llave abre el cajón de la administración de clústeres.", lines: ["Preparación centrada en el examen, unas 30 horas por ruta.", IN_ES, "Dictado por un Kubestronaut certificado que aprobó las tres."] },
    en: { name: "CKA", sub: "Cluster Administration", idea: "The first key opens the cluster-administration drawer.", lines: ["Exam-focused preparation, about 30 hours per track.", IN_EN, "Taught by a certified Kubestronaut who has passed all three."] },
  },
  {
    id: "CKAD",
    es: { name: "CKAD", sub: "Desarrollo de aplicaciones", idea: "La segunda llave abre el cajón del desarrollo de aplicaciones.", lines: ["Una de las certificaciones de Kubernetes de la CNCF que cubre el programa.", "Escenarios reales de examen, como lo anuncia el programa.", "149 USD por certificación; también hay un paquete de las 3."] },
    en: { name: "CKAD", sub: "Application Development", idea: "The second key opens the application-development drawer.", lines: ["One of the CNCF Kubernetes certifications the program covers.", "Real exam scenarios, as the program states.", "149 USD per certification; a bundle of all 3 is also offered."] },
  },
  {
    id: "CKS",
    es: { name: "CKS", sub: "Especialista en seguridad", idea: "La tercera llave abre el cajón del especialista en seguridad.", lines: ["La tercera certificación de la preparación.", "Cada ruta: unas 30 horas.", "En la escena, el dial de arriba marca los simulacros cronometrados."] },
    en: { name: "CKS", sub: "Security Specialist", idea: "The third key opens the security-specialist drawer.", lines: ["The third certification of the prep.", "Each track: about 30 hours.", "In the model, the dial on top marks the timed mock exams."] },
  },
];
export const PARTS = {
  key: {
    es: { name: "Llave", by: CHAPTERS.map((c) => `Llave de ${c.id}: ${c.es.sub.toLowerCase()}. Al girarla se abre su cajón.`) },
    en: { name: "Key", by: CHAPTERS.map((c) => `The ${c.id} key: ${c.en.sub.toLowerCase()}. Turning it opens its drawer.`) },
  },
  drawer: {
    es: { name: "Cajón", by: Array(3).fill("Tres tarjetas: reloj, clúster y trampa. Son los simulacros cronometrados, los escenarios con clústeres en vivo y las trampas comunes.") },
    en: { name: "Drawer", by: Array(3).fill("Three cards: clock, cluster and trap. They stand for the timed mocks, the live cluster scenarios and the common traps.") },
  },
  timer: {
    es: { name: "Temporizador", by: Array(3).fill("El dial corre durante cada simulacro cronometrado de la preparación.") },
    en: { name: "Timer", by: Array(3).fill("The dial runs during each timed mock exam of the prep.") },
  },
};
export const COPY = {
  es: { course: "Preparación CKA / CKAD / CKS", chapter: (i, n) => `Ruta ${i} de ${n}`, parts: "Partes de la bóveda", tap: "Toque una parte de la bóveda o un botón para ver qué hace.", sr: "Figura interactiva: use las flechas para cambiar de certificación.", slider: "Certificación. Use las flechas para cambiar.", fig: "Fig 4", title: "La bóveda de tres llaves", hint: "Flechas o toque una parte", chapters: "Certificaciones", poster: "Bóveda de tres llaves: la llave de CKA está girada y su cajón abierto muestra tres tarjetas; un dial marca los simulacros cronometrados." },
  en: { course: "CKA / CKAD / CKS Prep", chapter: (i, n) => `Track ${i} of ${n}`, parts: "Vault parts", tap: "Tap a part of the vault or a button to see what it does.", sr: "Interactive figure: use the arrow keys to change the certification.", slider: "Certification. Use the arrow keys to change it.", fig: "Fig 4", title: "The three-key vault", hint: "Arrow keys or tap a part", chapters: "Certifications", poster: "Three-key vault: the CKA key is turned and its open drawer shows three cards; a dial marks the timed mock exams." },
};
