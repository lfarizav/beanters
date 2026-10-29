// Words for the risk-management scene, ES and EN. Every course fact comes from the program's block in
// courses/index.html: level and hours (cm101, cm114), title (cm102), tagline (cm103), description (cm104)
// and the six modules with their hours (cm105 to cm110); EN from the same keys in the page's I18N table.
// Sentences that start "En la maqueta" / "In the model" describe the figure, not the course.

export const COURSE = {
  es: { title: "Gestión del riesgo para telco e IA cloud native", level: "Intermedio → Avanzado · 40+ horas" },
  en: { title: "Risk Management for Telco & Cloud-Native AI", level: "Intermediate → Advanced · 40+ hours" },
};

export const CHAPTERS = [
  {
    id: "M1",
    es: { name: "Marcos de riesgo (ISO 27005 / NIST RMF)", hours: "8 h", idea: "Marcos de riesgo ISO 27005, NIST RMF y de seguridad 3GPP.", lines: ["El programa enseña a evaluar, cuantificar y mitigar el riesgo en infraestructura de telecomunicaciones impulsada por IA.", "Es uno de sus tres módulos de 8 horas.", "En la maqueta, cada marco o norma que nombra el programa es un indicador de aguja."] },
    en: { name: "Risk Frameworks (ISO 27005 / NIST RMF)", hours: "8 h", idea: "ISO 27005, NIST RMF, and 3GPP security risk frameworks.", lines: ["The program teaches how to assess, quantify, and mitigate risk in AI-driven telecom infrastructure.", "It is one of its three 8-hour modules.", "In the model, each framework or regulation the program names is a dial gauge."] },
  },
  {
    id: "M2",
    es: { name: "Riesgo operacional de la IA", hours: "8 h", idea: "Deriva del modelo, alucinaciones en la automatización y sesgos.", lines: ["Son los tres riesgos operacionales de la IA que nombra la descripción del programa.", "8 horas del programa.", "En la maqueta, cada uno es una ficha sobre el mapa de calor."] },
    en: { name: "AI Operational Risk", hours: "8 h", idea: "Model drift, hallucination in automation, and bias.", lines: ["These are the three AI operational risks the program description names.", "8 hours of the program.", "In the model, each one is a token on the heat map."] },
  },
  {
    id: "M3",
    es: { name: "Resiliencia y disponibilidad de la red", hours: "8 h", idea: "Resiliencia y disponibilidad en infraestructura de telecomunicaciones impulsada por IA.", lines: ["Uno de los tres módulos de 8 horas del programa.", "La seguridad 3GPP es uno de los marcos que nombra el programa.", "En la maqueta, la ficha de disponibilidad baja hacia la zona verde al aplicar controles."] },
    en: { name: "Network Resilience & Availability", hours: "8 h", idea: "Resilience and availability in AI-driven telecom infrastructure.", lines: ["One of the program's three 8-hour modules.", "3GPP security is one of the frameworks the program names.", "In the model, the availability token drops toward the green zone as controls apply."] },
  },
  {
    id: "M4",
    es: { name: "Cumplimiento regulatorio (Ley de IA de la UE / GDPR)", hours: "6 h", idea: "Ley de IA de la UE y GDPR para datos de telco.", lines: ["Así lo plantea la descripción del programa.", "6 horas del programa.", "En la maqueta, ambas normas son indicadores y los datos de telco son una ficha."] },
    en: { name: "Regulatory Compliance (EU AI Act / GDPR)", hours: "6 h", idea: "EU AI Act and GDPR for telco data.", lines: ["That is how the program description frames it.", "6 hours of the program.", "In the model, both regulations are gauges and telco data is a token."] },
  },
  {
    id: "M5",
    es: { name: "Respuesta a incidentes en redes con IA", hours: "6 h", idea: "Respuesta a incidentes por fallas de red causadas por la IA.", lines: ["La descripción del programa nombra ese caso de forma explícita.", "6 horas del programa.", "En la maqueta, el cajón del registro guarda una ficha por riesgo, también la de esa falla."] },
    en: { name: "Incident Response for AI Networks", hours: "6 h", idea: "Incident response for AI-driven network failures.", lines: ["The program description names that case explicitly.", "6 hours of the program.", "In the model, the register drawer keeps a card per risk, that failure's too."] },
  },
  {
    id: "M6",
    es: { name: "Continuidad del negocio en cloud native", hours: "4 h", idea: "Continuidad del negocio en despliegues cloud native.", lines: ["Cierra el programa con 4 de sus 40+ horas.", "Nivel intermedio a avanzado.", "En la maqueta, la palanca de control lleva las fichas hacia la zona verde; el riesgo residual no desaparece."] },
    en: { name: "Business Continuity for Cloud-Native", hours: "4 h", idea: "Business continuity for cloud-native deployments.", lines: ["It closes the program with 4 of its 40+ hours.", "Intermediate to advanced level.", "In the model, the control lever moves the tokens toward the green zone; residual risk does not vanish."] },
  },
];

// Token names: the risks as the program description words them (cm104), plus the module topics (cm107, cm110).
export const TOKEN_NAMES = {
  es: { drift: "Deriva del modelo", hallucination: "Alucinaciones en la automatización", bias: "Sesgos", failure: "Falla de red causada por la IA", availability: "Disponibilidad de la red", data: "Datos de telco (GDPR)", continuity: "Continuidad del negocio" },
  en: { drift: "Model drift", hallucination: "Hallucination in automation", bias: "Bias", failure: "AI-driven network failure", availability: "Network availability", data: "Telco data (GDPR)", continuity: "Business continuity" },
};

export const PARTS = {
  board: { es: { name: "Mapa de calor", text: "Mapa de calor: probabilidad por impacto en una cuadrícula de 5 por 5. La esquina izquierda es la zona verde; la derecha, la más alta." }, en: { name: "Heat map", text: "Heat map: likelihood by impact on a 5 by 5 grid. The left corner is the green zone; the right corner is the highest." } },
  tokens: { es: { name: "Fichas", text: "Fichas: cada una es un riesgo que nombra el programa. Sus posiciones son ilustrativas." }, en: { name: "Tokens", text: "Tokens: each one is a risk the program names. Their positions are illustrative." } },
  gauges: { es: { name: "Indicadores", text: "Indicadores: ISO 27005, NIST RMF, 3GPP, Ley de IA de la UE y GDPR, los marcos y normas que nombra el programa. Cada aguja promedia sus fichas; las lecturas son ilustrativas." }, en: { name: "Gauges", text: "Gauges: ISO 27005, NIST RMF, 3GPP, EU AI Act and GDPR, the frameworks and regulations the program names. Each needle averages its tokens; readings are illustrative." } },
  lever: { es: { name: "Palanca", text: "Palanca de control: al aplicar controles, las fichas se desplazan hacia la zona verde. Toque la palanca o arrástrela." }, en: { name: "Lever", text: "Control lever: as controls apply, the tokens slide toward the green zone. Tap the lever or drag it." } },
  drawer: { es: { name: "Registro", text: "Registro de riesgos: el cajón guarda una ficha por riesgo, como un fichero." }, en: { name: "Register", text: "Risk register: the drawer keeps one card per risk, like a card index." } },
};

export const UI = {
  es: { fig: "Fig 3", title: "Registro de riesgos", hint: "Toque una parte o la palanca", slider: "Módulo del programa. Use las flechas para cambiar; Espacio mueve la palanca.", chapters: "Módulos", parts: "Partes de la maqueta", lit: "Fichas de este módulo", chapter: (i, n) => `Módulo ${i} de ${n}`, sr: "Figura interactiva: use las flechas para cambiar de módulo y Espacio para mover la palanca.", readout: (p, hi, g) => `controles ${p} % · ${hi} en zona alta · ${g} en verde`, alt: "Maqueta de un registro de riesgos: un mapa de calor de 5 por 5 con fichas, cinco indicadores de marcos y una palanca que lleva las fichas hacia la zona verde." },
  en: { fig: "Fig 3", title: "Risk register", hint: "Tap a part or the lever", slider: "Program module. Use the arrow keys to change it; Space moves the lever.", chapters: "Modules", parts: "Model parts", lit: "Tokens in this module", chapter: (i, n) => `Module ${i} of ${n}`, sr: "Interactive figure: use the arrow keys to change the module and Space to move the lever.", readout: (p, hi, g) => `controls ${p}% · ${hi} high · ${g} green`, alt: "Model of a risk register: a 5 by 5 heat map with tokens, five framework gauges and a lever that moves the tokens toward the green zone." },
};

export const ENROLL = {
  es: "mailto:lfarizav@gmail.com?subject=Gesti%C3%B3n%20del%20riesgo%20para%20telco%20e%20IA%20cloud%20native%3A%20229%20USD&body=Hola%20Luis%2C%0A%0AQuiero%20inscribirme%20(USD%20229).%0A%0ANombre%3A%20%0AEmpresa%2FUniversidad%3A%20%0ACargo%3A%20%0AInicio%20preferido%3A%20%0A%0AGracias.",
  en: "mailto:lfarizav@gmail.com?subject=Risk%20Management%20Telco%20%26%20Cloud-Native%20AI%3A%20229%20USD&body=Hi%20Luis%2C%0A%0AI%27d%20like%20to%20enroll%20(USD%20229).%0A%0AName%3A%20%0ACompany%2FUniversity%3A%20%0ARole%3A%20%0APreferred%20start%3A%20%0A%0AThanks.",
};
