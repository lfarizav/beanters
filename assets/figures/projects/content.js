// Words for the community radio and TV model, ES and EN. Source: the author's CRC 2026 article
// (pages as in beanters-work/proyectos/BRIEF.md). Central control from the ministry is the author's proposal;
// radio and TV are a proposal, not an authorized use today (article p. 11).
export const CHAPTERS = [
  {
    id: "1", pins: ["ministry"],
    es: { name: "Control central", idea: "Como propuesta del autor, el ministerio (MinTIC) despliega y supervisa cada sitio desde un solo punto." },
    en: { name: "Central control", idea: "As the author's proposal, the ministry (MinTIC) deploys and oversees every site from a single point." },
  },
  {
    id: "2", pins: ["site", "hardware", "offline"],
    es: { name: "Sitio comunitario", idea: "Software libre sobre hardware de propósito general y una radio definida por software (SDR). El núcleo corre en la comunidad: internet es opcional." },
    en: { name: "Community site", idea: "Free software on general-purpose hardware and a software-defined radio (SDR). The core runs inside the community: the internet is optional." },
  },
  {
    id: "3", pins: ["homes"],
    es: { name: "Radio y TV", idea: "El transmisor difunde radio y TV comunitaria a hogares, celulares y radios, sin internet. Es una propuesta, no un uso autorizado hoy." },
    en: { name: "Radio and TV", idea: "The transmitter broadcasts community radio and TV to homes, phones and radios, with no internet. It is a proposal, not an authorized use today." },
  },
  {
    id: "4", pins: ["sena"],
    es: { name: "Formación SENA", idea: "El aula rural recibe contenidos de formación del SENA por la misma señal, sin conexión a internet." },
    en: { name: "SENA training", idea: "The rural classroom receives SENA training content over the same signal, with no internet connection." },
  },
  {
    id: "5", pins: ["ane"],
    es: { name: "Verificación", idea: "La ANE verifica en remoto el uso del espectro de cada sitio." },
    en: { name: "Verification", idea: "The ANE remotely verifies each site's use of the spectrum." },
  },
];

export const PINS = {
  ministry: { es: "MinTIC: control central (propuesta del autor)", en: "MinTIC: central control (author's proposal)" },
  ane: { es: "ANE: verifica el espectro", en: "ANE: verifies the spectrum" },
  site: { es: "Transmisor comunitario, 900 MHz", en: "Community transmitter, 900 MHz" },
  hardware: { es: "Software libre + hardware de propósito general", en: "Free software + general-purpose hardware" },
  homes: { es: "Radio y TV comunitaria (propuesta)", en: "Community radio and TV (proposal)" },
  sena: { es: "Aula SENA", en: "SENA classroom" },
  offline: { es: "Internet opcional", en: "Internet optional" },
};

const all = (es, en) => ({ es: { name: es[0], by: Array(5).fill(es[1]) }, en: { name: en[0], by: Array(5).fill(en[1]) } });
export const PARTS = {
  ministry: all(["MinTIC", "Centro de control con pared de pantallas y mesa de mapa de los sitios. Propuesta del autor."], ["MinTIC", "Control centre with a wall of screens and a map table of the sites. The author's proposal."]),
  ane: all(["ANE", "Estación de monitoreo con analizador de espectro y antena."], ["ANE", "Monitoring station with a spectrum analyser and an antenna."]),
  site: all(["Transmisor", "Poste con antenas sectoriales y una antena de difusión en la punta."], ["Transmitter", "Pole with sector antennas and a broadcast whip on top."]),
  hardware: all(["Hardware", "Gabinete con computadores de propósito general y una SDR encima."], ["Hardware", "Cabinet of general-purpose computers with an SDR on top."]),
  homes: all(["Hogares", "Casas rurales, un celular y un radio que reciben la señal."], ["Homes", "Rural homes, a phone and a radio that receive the signal."]),
  sena: all(["Aula SENA", "Aula con pantalla, pupitres y aprendices."], ["SENA classroom", "Classroom with a screen, desks and learners."]),
};

export const COPY = {
  es: { slider: "Fase del modelo. Use las flechas para cambiar.", phases: "Fases", pause: "Pausar animación", play: "Reanudar animación", poster: "Modelo isométrico de la red comunitaria: centro de control del MinTIC (propuesta del autor), estación de la ANE, transmisor, gabinete de hardware de propósito general con SDR, aula SENA y hogares rurales." },
  en: { slider: "Model phase. Use the arrow keys to change it.", phases: "Phases", pause: "Pause animation", play: "Resume animation", poster: "Isometric model of the community network: MinTIC control centre (the author's proposal), ANE station, transmitter, general-purpose hardware cabinet with an SDR, SENA classroom and rural homes." },
};
