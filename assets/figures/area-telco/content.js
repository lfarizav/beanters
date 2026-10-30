// Words for the Telco area scene, ES and EN. Source: the home card (index.html, p1Body) and the bio
// (OpenAirInterface is open-source software for 4G and 5G networks).
export const CHAPTERS = [
  { id: "1", pins: ["core"], es: { name: "Núcleo en software abierto", idea: "El núcleo de red corre como software abierto, como OpenAirInterface, y la fibra llega a cada radio." }, en: { name: "Open-source core", idea: "The core network runs as open-source software, such as OpenAirInterface, and fibre reaches every radio." } },
  { id: "2", pins: ["enb", "gnb", "phones"], es: { name: "Radio 4G y 5G", idea: "Las estaciones base eNB (4G) y gNB (5G) atienden a cada celular." }, en: { name: "4G and 5G radio", idea: "The eNB (4G) and gNB (5G) base stations serve each phone." } },
  { id: "3", pins: ["bcast"], es: { name: "5G Broadcast", idea: "Una torre de difusión llega a todos los celulares a la vez, con una sola señal." }, en: { name: "5G Broadcast", idea: "A broadcast tower reaches every phone at once, with a single signal." } },
];
export const WORDS = {
  core: { es: "Núcleo: OpenAirInterface", en: "Core: OpenAirInterface" },
  enb: { es: "eNB (4G)", en: "eNB (4G)" },
  gnb: { es: "gNB (5G)", en: "gNB (5G)" },
  phones: { es: "Celulares", en: "Phones" },
  bcast: { es: "Torre de 5G Broadcast", en: "5G Broadcast tower" },
};
export const COPY = {
  es: { slider: "Escena de red 4G y 5G. Use las flechas para cambiar de fase.", phases: "Fases" },
  en: { slider: "4G and 5G network scene. Use the arrow keys to change phase.", phases: "Phases" },
};
