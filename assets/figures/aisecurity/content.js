// Words for the AI-security scene, ES and EN. Every course fact comes from the program's block in
// courses/index.html: level and hours (cm87, cm100), title (cm88), tagline (cm89), description (cm90)
// and the six modules with their hours (cm91 to cm96); EN from the same keys in the page's I18N table.
// Sentences that start "En la maqueta" / "In the model" describe the figure, not the course.

export const COURSE = {
  es: { title: "IA y seguridad para telco cloud native", level: "Avanzado · 48+ horas" },
  en: { title: "AI & Security for Cloud-Native Telco", level: "Advanced · 48+ hours" },
};

export const CHAPTERS = [
  {
    id: "M1", part: "racks",
    es: { name: "IA en las operaciones de telco", hours: "8 h", idea: "Automatización con IA en entornos 4G/5G de producción.", lines: ["El programa es para ingenieros que operan esa automatización.", "Abre el programa con 8 de sus 48+ horas.", "En la maqueta, las cargas de IA corren en racks dentro de una jaula aislada."] },
    en: { name: "AI in Telco Operations", hours: "8 h", idea: "AI-driven automation in production 4G/5G environments.", lines: ["The program is for engineers who operate that automation.", "It opens the program with 8 of its 48+ hours.", "In the model, AI workloads run in racks inside a sandbox cage."] },
  },
  {
    id: "M2", part: "belt",
    es: { name: "Pipelines de IA seguros", hours: "10 h", idea: "Despliegue de cargas de trabajo con IA sobre 5G y pilas cloud native, de forma segura.", lines: ["La descripción del programa incluye el servicio seguro de modelos para la optimización de la RAN.", "Con 10 horas, comparte con confianza cero el lugar del módulo más largo.", "En la maqueta, el pipeline es la cinta que lleva cada paquete del router a los racks."] },
    en: { name: "Secure AI Pipelines", hours: "10 h", idea: "Deploy AI-powered workloads on 5G and cloud-native stacks, securely.", lines: ["The program description includes secure model serving for RAN optimization.", "At 10 hours, it ties with zero-trust as the longest module.", "In the model, the pipeline is the belt that carries each packet from the router to the racks."] },
  },
  {
    id: "M3", part: "gate",
    es: { name: "Confianza cero en Kubernetes", hours: "10 h", idea: "Confianza cero: en la maqueta, ningún paquete pasa sin inspección.", lines: ["El programa cubre la confianza cero en Kubernetes.", "Es uno de los dos módulos de 10 horas.", "En la maqueta, la compuerta escanea cada paquete, también los que salen del propio sitio."] },
    en: { name: "Zero-Trust on Kubernetes", hours: "10 h", idea: "Zero-trust: in the model, no packet passes uninspected.", lines: ["The program covers zero-trust on Kubernetes.", "It is one of the two 10-hour modules.", "In the model, the gate scans every packet, including those that leave the site itself."] },
  },
  {
    id: "M4", part: "bin",
    es: { name: "Modelado de amenazas para IA", hours: "8 h", idea: "Modelado de amenazas para pipelines de IA y conciencia sobre el ML adversarial.", lines: ["Ambos temas aparecen en la descripción del programa.", "8 horas del programa.", "En la maqueta, un paquete hostil queda marcado en la compuerta y termina en cuarentena."] },
    en: { name: "Threat Modeling for AI", hours: "8 h", idea: "Threat modeling for AI pipelines and adversarial ML awareness.", lines: ["Both topics appear in the program description.", "8 hours of the program.", "In the model, a hostile packet is flagged at the gate and ends up in quarantine."] },
  },
  {
    id: "M5", part: "router",
    es: { name: "Seguridad 3GPP e IA", hours: "6 h", idea: "Cumplimiento de 3GPP TS 33.501 en un sitio con IA.", lines: ["El programa nombra 3GPP TS 33.501 como referencia de cumplimiento.", "El contexto son entornos 4G/5G de producción.", "En la maqueta, el router de señal es el sitio del núcleo 5G."] },
    en: { name: "3GPP Security & AI", hours: "6 h", idea: "Compliance with 3GPP TS 33.501 on a site that runs AI.", lines: ["The program names 3GPP TS 33.501 as a compliance reference.", "The setting is production 4G/5G environments.", "In the model, the signal router is the 5G core site."] },
  },
  {
    id: "M6", part: "lamp",
    es: { name: "NIST AI RMF y cumplimiento", hours: "6 h", idea: "Cumplimiento del NIST AI RMF.", lines: ["El programa cierra con el NIST AI RMF y el cumplimiento.", "En total, 48+ horas de nivel avanzado en seis módulos.", "En la maqueta, la luz de riesgo sigue en verde mientras la cuarentena hace su trabajo."] },
    en: { name: "NIST AI RMF & Compliance", hours: "6 h", idea: "Compliance with the NIST AI RMF.", lines: ["The program closes with the NIST AI RMF and compliance.", "In all, 48+ hours at advanced level over six modules.", "In the model, the risk light stays green while quarantine does its job."] },
  },
];

export const PARTS = {
  router: { es: { name: "Router", text: "Router de señal: el sitio del núcleo 5G de la maqueta. Cada paquete sale por su puerto lateral." }, en: { name: "Router", text: "Signal router: the model's 5G core site. Every packet leaves through its side port." } },
  belt: { es: { name: "Pipeline", text: "Cinta: el pipeline. Lleva cada paquete del router a los racks y siempre lo hace pasar por la compuerta." }, en: { name: "Pipeline", text: "Belt: the pipeline. It carries each packet from the router to the racks, always through the gate." } },
  gate: { es: { name: "Compuerta", text: "Compuerta de inspección: el escáner bajo el arco revisa cada paquete que pasa." }, en: { name: "Gate", text: "Inspection gate: the scanner under the arch checks every packet that passes." } },
  bin: { es: { name: "Cuarentena", text: "Cuarentena: el empujador saca de la cinta el paquete marcado; baja por la rampa y queda en la caja." }, en: { name: "Quarantine", text: "Quarantine: the pusher takes the flagged packet off the belt; it slides down the chute into the bin." } },
  racks: { es: { name: "Racks de IA", text: "Racks de IA en una jaula cerrada con candado: solo les llega lo que pasó la compuerta." }, en: { name: "AI racks", text: "AI racks in a padlocked cage: only what passed the gate reaches them." } },
  lamp: { es: { name: "Luz de riesgo", text: "Luz de riesgo: sigue en verde mientras cada amenaza termine en cuarentena." }, en: { name: "Risk light", text: "Risk light: it stays green while every threat ends up in quarantine." } },
};

export const UI = {
  es: { fig: "Fig 2", title: "Sitio 5G seguro", hint: "Toque una parte o use las flechas", slider: "Módulo del programa. Use las flechas para cambiar.", chapters: "Módulos", parts: "Partes de la maqueta", chapter: (i, n) => `Módulo ${i} de ${n}`, sr: "Figura interactiva: use las flechas para cambiar de módulo.", readout: (n, q) => `${n} inspeccionados · ${q} en cuarentena · riesgo verde`, alt: "Maqueta de un sitio 5G: un router envía paquetes por una cinta, una compuerta los inspecciona, uno hostil cae en cuarentena y la luz de riesgo sigue verde." },
  en: { fig: "Fig 2", title: "Secure 5G site", hint: "Tap a part or use the arrow keys", slider: "Program module. Use the arrow keys to change it.", chapters: "Modules", parts: "Model parts", chapter: (i, n) => `Module ${i} of ${n}`, sr: "Interactive figure: use the arrow keys to change the module.", readout: (n, q) => `${n} inspected · ${q} quarantined · risk green`, alt: "Model of a 5G site: a router sends packets down a belt, a gate inspects them, a hostile one lands in quarantine and the risk light stays green." },
};

export const ENROLL = {
  es: "mailto:lfarizav@gmail.com?subject=IA%20y%20seguridad%20para%20telco%20cloud%20native%3A%20279%20USD&body=Hola%20Luis%2C%0A%0AQuiero%20inscribirme%20(USD%20279).%0A%0ANombre%3A%20%0AEmpresa%2FUniversidad%3A%20%0ACargo%3A%20%0AInicio%20preferido%3A%20%0A%0AGracias.",
  en: "mailto:lfarizav@gmail.com?subject=AI%20%26%20Security%20for%20Cloud-Native%20Telco%3A%20279%20USD&body=Hi%20Luis%2C%0A%0AI%27d%20like%20to%20enroll%20(USD%20279).%0A%0AName%3A%20%0ACompany%2FUniversity%3A%20%0ARole%3A%20%0APreferred%20start%3A%20%0A%0AThanks.",
};
