// Words for the community cellular network model, ES and EN. Source: the author's CRC 2026 article
// (pages as in beanters-work/proyectos/BRIEF.md). The idea: extend what one cellular network in the 900 MHz band
// can do by running many services on it. Radio and TV as IPTV, SMS and voice need no internet (p. 8) and are a
// regulatory recommendation, not an authorized use today (p. 11); local video conferences are the author's
// addition. Central control from the ministry is the author's proposal; the ANE verifies spectrum (p. 10, p. 12).
export const CHAPTERS = [
  {
    id: "1", pins: ["ministry"],
    es: { name: "Control central", idea: "Como propuesta del autor, el ministerio (MinTIC) despliega y supervisa cada red desde un solo punto." },
    en: { name: "Central control", idea: "As the author's proposal, the ministry (MinTIC) deploys and oversees every network from a single point." },
  },
  {
    id: "2", pins: ["site", "services", "hardware"],
    es: { name: "Red celular", idea: "Una estación base en 900 MHz alimentada por una SDR y un núcleo celular de software libre en hardware de propósito general. Sobre esa red se apilan los servicios." },
    en: { name: "Cellular network", idea: "A 900 MHz base station fed by an SDR and an open-source cellular core on general-purpose hardware. The services stack on that one network." },
  },
  {
    id: "3", pins: ["phones", "homes"],
    es: { name: "Radio y TV por IPTV", idea: "La radio y la TV viajan por la red celular en 900 MHz como IPTV por multicast local, hacia celulares, hogares y el aula SENA, sin internet." },
    en: { name: "Radio and TV over IPTV", idea: "Radio and TV travel over the 900 MHz cellular network as IPTV by local multicast, to phones, homes and the SENA classroom, with no internet." },
  },
  {
    id: "4", pins: ["phones", "sena"],
    es: { name: "Llamadas y videoconferencias", idea: "Dos celulares hablan en una llamada local y el aula SENA hace una videoconferencia con un hogar, sin salir de la comunidad." },
    en: { name: "Calls and video conferences", idea: "Two phones talk in a local call and the SENA classroom holds a video conference with a home, without leaving the community." },
  },
  {
    id: "5", pins: ["offline"],
    es: { name: "Con internet", idea: "Si hay un enlace a internet, la misma red en 900 MHz da también acceso completo a internet; sin él, todo lo anterior sigue funcionando." },
    en: { name: "With internet", idea: "When there is an internet link, the same 900 MHz network also gives full internet access; without it, everything else keeps working." },
  },
  {
    id: "6", pins: ["ane"],
    es: { name: "Verificación", idea: "La ANE verifica en remoto el uso del espectro de cada red." },
    en: { name: "Verification", idea: "The ANE remotely verifies each network's use of the spectrum." },
  },
];

export const PINS = {
  ministry: { es: "MinTIC: control central (propuesta del autor)", en: "MinTIC: central control (author's proposal)" },
  ane: { es: "ANE: verifica el espectro", en: "ANE: verifies the spectrum" },
  site: { es: "Estación base celular, 900 MHz", en: "Cellular base station, 900 MHz" },
  services: { es: "Servicios sobre una sola red: IPTV, voz, video, SENA y web", en: "Services on one network: IPTV, voice, video, SENA and web" },
  hardware: { es: "Núcleo libre + SDR en hardware de propósito general", en: "Open-source core + SDR on general-purpose hardware" },
  phones: { es: "Celulares: IPTV, llamadas y video", en: "Phones: IPTV, calls and video" },
  homes: { es: "Hogares: radio y TV por IPTV", en: "Homes: radio and TV over IPTV" },
  sena: { es: "Aula SENA: videoconferencia y cursos", en: "SENA classroom: video conference and courses" },
  offline: { es: "Enlace a internet (opcional)", en: "Internet link (optional)" },
};

const all = (es, en) => ({ es: { name: es[0], by: Array(6).fill(es[1]) }, en: { name: en[0], by: Array(6).fill(en[1]) } });
export const PARTS = {
  ministry: all(["MinTIC", "Centro de control con pared de pantallas y mesa de mapa de las redes. Propuesta del autor."], ["MinTIC", "Control centre with a wall of screens and a map table of the networks. The author's proposal."]),
  ane: all(["ANE", "Estación de monitoreo con analizador de espectro y antena."], ["ANE", "Monitoring station with a spectrum analyser and an antenna."]),
  site: all(["Estación base", "Poste con antenas sectoriales celulares en 900 MHz."], ["Base station", "Pole with 900 MHz cellular sector antennas."]),
  hardware: all(["Núcleo y servicios", "Computadores de propósito general con una SDR y los bloques de servicio: IPTV, VoLTE, video, SENA y web."], ["Core and services", "General-purpose computers with an SDR and the service blocks: IPTV, VoLTE, video, SENA and web."]),
  phones: all(["Celulares", "Reciben IPTV, hacen llamadas locales y videoconferencias."], ["Phones", "They receive IPTV and make local calls and video conferences."]),
  homes: all(["Hogares", "Casas rurales que reciben radio y TV por IPTV."], ["Homes", "Rural homes that receive radio and TV over IPTV."]),
  sena: all(["Aula SENA", "Aula con pantalla, pupitres y aprendices."], ["SENA classroom", "Classroom with a screen, desks and learners."]),
};

export const COPY = {
  es: { slider: "Fase del modelo. Use las flechas para cambiar.", phases: "Fases", pause: "Pausar animación", play: "Reanudar animación", poster: "Modelo isométrico de la red celular comunitaria en 900 MHz: estación base, núcleo de software libre con SDR y bloques de servicio, celulares, hogares, aula SENA, centro de control del MinTIC (propuesta del autor) y estación de la ANE." },
  en: { slider: "Model phase. Use the arrow keys to change it.", phases: "Phases", pause: "Pause animation", play: "Resume animation", poster: "Isometric model of the 900 MHz community cellular network: base station, open-source core with an SDR and service blocks, phones, homes, SENA classroom, MinTIC control centre (the author's proposal) and ANE station." },
};
