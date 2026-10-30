// Words for the AI-native area scene, ES and EN. Source: the home card (index.html, p3Body).
export const CHAPTERS = [
  { id: "1", pins: ["model"], es: { name: "Un modelo de IA local", idea: "El modelo corre en un servidor con GPU propio, no en la nube." }, en: { name: "A local AI model", idea: "The model runs on its own GPU server, not in the cloud." } },
  { id: "2", pins: ["prompt", "mcp"], es: { name: "Un agente despliega la red", idea: "Una instrucción en lenguaje natural; el agente usa herramientas MCP para desplegar la red celular." }, en: { name: "An agent deploys the network", idea: "A natural-language instruction; the agent uses MCP tools to deploy the cellular network." } },
  { id: "3", pins: ["mlops", "ran"], es: { name: "MLOps para la RAN", idea: "Datos, entrenamiento y despliegue de modelos hacia la red de acceso radio." }, en: { name: "MLOps for the RAN", idea: "Data, training and model deployment toward the radio access network." } },
  { id: "4", pins: ["drone", "robot", "local"], es: { name: "Physical AI: dron y robot", idea: "Un dron y un robot construidos desde cero, controlados por la IA local." }, en: { name: "Physical AI: drone and robot", idea: "A drone and a robot built from scratch, controlled by the local AI." } },
];
export const WORDS = {
  model: { es: "Modelo de IA local", en: "Local AI model" },
  prompt: { es: "Instrucción en lenguaje natural", en: "Natural-language instruction" },
  mcp: { es: "Agente con herramientas MCP", en: "Agent with MCP tools" },
  mlops: { es: "MLOps", en: "MLOps" },
  ran: { es: "Red de acceso radio", en: "Radio access network" },
  drone: { es: "Dron", en: "Drone" },
  robot: { es: "Robot", en: "Robot" },
  local: { es: "IA local, sin nube", en: "Local AI, no cloud" },
};
export const COPY = {
  es: { slider: "Escena de IA local. Use las flechas para cambiar de fase.", phases: "Fases" },
  en: { slider: "Local AI scene. Use the arrow keys to change phase.", phases: "Phases" },
};
