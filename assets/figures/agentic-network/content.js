// Words for the agentic network services model, ES and EN. Sources: beanters-work/proyectos/agentic/RESEARCH.md
// and RESEARCH.AUDIT.md (the audit wins). CAMARA APIs: Geofencing Subscriptions (area-entered / area-left),
// Location Verification (TRUE / FALSE / PARTIAL), Quality on Demand, Population Density Data. Tracking a person
// needs consent (the line holder's authorization). Running the agent and the APIs on a Sylva-aligned telco cloud
// is this project's design; Sylva itself says nothing about agents. No availability in Colombia is claimed.
export const CHAPTERS = [
  {
    id: "1", pins: ["a-request", "a-agent"],
    es: { name: "Pedido en lenguaje natural", idea: "Una persona escribe o dice: «avísame si mi mamá sale del barrio». El agente de IA convierte el pedido en llamadas a las APIs de red." },
    en: { name: "A natural-language request", idea: "A person types or says: “tell me if my mom leaves the neighborhood”. The AI agent turns the request into calls to the network APIs." },
  },
  {
    id: "2", pins: ["a-agent", "a-apis", "a-sylva"],
    es: { name: "Configura y despliega", idea: "El agente configura el servicio y lo despliega en la nube telco: clústeres Kubernetes con Cluster API y cambios en Git que Flux aplica." },
    en: { name: "Configure and deploy", idea: "The agent configures the service and deploys it on the telco cloud: Kubernetes clusters with Cluster API and Git changes that Flux applies." },
  },
  {
    id: "3", pins: ["a-geofence", "a-request"],
    es: { name: "Alerta de geocerca", idea: "Cuando el celular sale del área autorizada, la red reporta la salida y el agente avisa a la familia. Requiere el consentimiento de la persona." },
    en: { name: "Geofence alert", idea: "When the phone leaves the authorized area, the network reports the exit and the agent alerts the family. It requires the person's consent." },
  },
  {
    id: "4", pins: ["a-pay"],
    es: { name: "Pago en zona", idea: "El pago se autoriza solo si la red verifica que el celular está dentro de la zona permitida: dentro se aprueba, fuera se rechaza." },
    en: { name: "Payment in zone", idea: "The payment is authorized only if the network verifies the phone is inside the allowed zone: inside it is approved, outside it is denied." },
  },
  {
    id: "5", pins: ["a-qod", "a-density", "a-radio"],
    es: { name: "Calidad y densidad", idea: "La red reserva calidad para una videollamada y estima la densidad de personas por zona para emergencias o eventos." },
    en: { name: "Quality and density", idea: "The network reserves quality for a video call and estimates the density of people per area for emergencies or events." },
  },
];

export const PINS = {
  "a-request": { es: "Pedido en lenguaje natural", en: "Natural-language request" },
  "a-agent": { es: "Agente de IA", en: "AI agent" },
  "a-apis": { es: "APIs de red CAMARA", en: "CAMARA network APIs" },
  "a-sylva": { es: "Nube telco alineada con Sylva", en: "Sylva-aligned telco cloud" },
  "a-radio": { es: "Red 4G y 5G", en: "4G and 5G network" },
  "a-geofence": { es: "Geocerca: alerta al salir", en: "Geofence: alert on exit" },
  "a-pay": { es: "Pago: ¿el celular está en la zona?", en: "Payment: is the phone in the zone?" },
  "a-qod": { es: "Calidad bajo demanda: videollamada", en: "Quality on demand: video call" },
  "a-density": { es: "Densidad de población", en: "Population density" },
};

const all = (es, en) => ({ es: { name: es[0], by: Array(5).fill(es[1]) }, en: { name: en[0], by: Array(5).fill(en[1]) } });
export const PARTS = {
  request: all(["Pedido", "Escritorio con portátil, micrófono y el celular de la familia."], ["Request", "Desk with a laptop, a microphone and the family's phone."]),
  agent: all(["Agente de IA", "Traduce pedidos en lenguaje natural en llamadas a las APIs."], ["AI agent", "Turns natural-language requests into API calls."]),
  apis: all(["APIs CAMARA", "Geocerca, verificación de ubicación, calidad bajo demanda y densidad de población."], ["CAMARA APIs", "Geofencing, location verification, quality on demand and population density."]),
  sylva: all(["Nube telco", "Clústeres Kubernetes con Cluster API, un repositorio Git y Flux."], ["Telco cloud", "Kubernetes clusters with Cluster API, a Git repository and Flux."]),
  radio: all(["Estaciones base", "Red 4G y 5G."], ["Base stations", "4G and 5G network."]),
  geofence: all(["Geocerca", "Área autorizada y el celular de la persona."], ["Geofence", "The authorized area and the person's phone."]),
  pay: all(["Pago", "Terminal de pago y su zona permitida."], ["Payment", "Payment terminal and its allowed zone."]),
  qod: all(["Videollamada", "Celular con calidad reservada."], ["Video call", "Phone with reserved quality."]),
  density: all(["Densidad", "Cuadrícula de densidad anónima sobre un grupo de personas."], ["Density", "Anonymized density grid over a group of people."]),
};

export const COPY = {
  es: { slider: "Fase del modelo. Use las flechas para cambiar.", phases: "Fases", pause: "Pausar animación", play: "Reanudar animación" },
  en: { slider: "Model phase. Use the arrow keys to change it.", phases: "Phases", pause: "Pause animation", play: "Resume animation" },
};
