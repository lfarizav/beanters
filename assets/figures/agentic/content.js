// Words for the agentic workbench, ES and EN. Source: courses/index.html, program "Ingeniería agéntica"
// (ES lines 186-196, EN dictionary cm50-cm62 at lines 377-389). Module names and hours are the page's own;
// lines that start "En la mesa" / "On the bench" describe the figure, not the course.
export const CHAPTERS = [
  {
    id: "01",
    es: { name: "Fundamentos de LLM", sub: "Módulo de 8 h", idea: "La primera herramienta del estante: los fundamentos de los LLM.", lines: ["Abre un programa avanzado de 66+ horas.", "El programa va de los fundamentos de los LLM a la orquestación multiagente con el AEF.", "En la mesa, el brazo planea, actúa con esta herramienta y anota el resultado."] },
    en: { name: "LLM Fundamentals", sub: "8 h module", idea: "The first tool on the rack: LLM fundamentals.", lines: ["It opens an advanced program of 66+ hours.", "The program runs from LLM fundamentals to multi-agent orchestration with the AEF.", "On the bench, the arm plans, acts with this tool and logs the result."] },
  },
  {
    id: "02",
    es: { name: "Ingeniería de prompts", sub: "Módulo de 6 h", idea: "Segunda herramienta: la ingeniería de prompts.", lines: ["El módulo más corto del programa.", "En el programa: laboratorios prácticos con VS Code y GitHub Copilot.", "En la mesa, el brazo toma la segunda herramienta y repite el ciclo."] },
    en: { name: "Prompt Engineering", sub: "6 h module", idea: "Second tool: prompt engineering.", lines: ["The shortest module of the program.", "In the program: hands-on labs with VS Code and GitHub Copilot.", "On the bench, the arm takes the second tool and runs the loop again."] },
  },
  {
    id: "03",
    es: { name: "Patrones de agentes", sub: "Módulo de 14 h", idea: "Agentes que razonan, planifican y actúan de forma autónoma.", lines: ["Ese es el objetivo que el programa se propone.", "En la mesa, tres lámparas marcan el ciclo: planear, actuar, observar.", "Cada vuelta del ciclo deja una línea en la bitácora."] },
    en: { name: "Agent Patterns", sub: "14 h module", idea: "Agents that reason, plan and act autonomously.", lines: ["That is the goal the program sets.", "On the bench, three lamps mark the loop: plan, act, observe.", "Each turn of the loop leaves one line in the ledger."] },
  },
  {
    id: "04",
    es: { name: "Marco AEF", sub: "Módulo de 10 h", idea: "AEF: Agentic Engineering Framework, el marco del programa.", lines: ["El programa llega a la orquestación multiagente con el AEF.", "En el programa: inferencia local de modelos con Ollama o vLLM.", "En la mesa, el marco es la cuarta herramienta del estante."] },
    en: { name: "AEF Framework", sub: "10 h module", idea: "AEF: the Agentic Engineering Framework, the program's framework.", lines: ["The program reaches multi-agent orchestration with the AEF.", "In the program: local model inference with Ollama or vLLM.", "On the bench, the framework is the fourth tool on the rack."] },
  },
  {
    id: "05",
    es: { name: "Orquestación multiagente", sub: "Módulo de 20 h", idea: "Varios agentes, una sola bitácora.", lines: ["El módulo más largo del programa.", "En el programa: sistemas de agentes en producción.", "En la mesa, dos agentes más se conectan a la misma bitácora."] },
    en: { name: "Multi-Agent Orchestration", sub: "20 h module", idea: "Several agents, one ledger.", lines: ["The longest module of the program.", "In the program: production agent systems.", "On the bench, two more agents connect to the same ledger."] },
  },
];

const toolOf = (lang) => CHAPTERS.map((c) => `${c[lang].name} (${c[lang].sub.replace(/^Módulo de /, "").replace(/ module$/, "")})`);
const ES = toolOf("es"), EN = toolOf("en");
export const PARTS = {
  arm: {
    es: { name: "Brazo del agente", by: ES.map((t, i) => `Planea, toma la herramienta ${i + 1}, ${t}, actúa en la mesa de trabajo y la devuelve.`) },
    en: { name: "Agent arm", by: EN.map((t, i) => `It plans, takes tool ${i + 1}, ${t}, acts on the work pad and puts it back.`) },
  },
  rack: {
    es: { name: "Estante", by: ES.map((t) => `Cinco herramientas, una por módulo del programa. La encendida: ${t}.`) },
    en: { name: "Rack", by: EN.map((t) => `Five tools, one per module of the program. The lit one: ${t}.`) },
  },
  loop: {
    es: { name: "Ciclo", by: Array(5).fill("Tres lámparas: planear, actuar, observar. La encendida es la fase en curso.") },
    en: { name: "Loop", by: Array(5).fill("Three lamps: plan, act, observe. The lit one is the current phase.") },
  },
  ledger: {
    es: { name: "Bitácora", by: [...Array(4).fill("El sensor observa el resultado; un pulso lo lleva a la bitácora y se escribe una línea."), "Los tres agentes escriben en la misma bitácora."] },
    en: { name: "Ledger", by: [...Array(4).fill("The sensor observes the result; a pulse carries it to the ledger and one line is written."), "All three agents write to the same ledger."] },
  },
};

export const COPY = {
  es: { course: "Ingeniería agéntica", chapter: (i, n) => `Módulo ${i} de ${n}`, parts: "Partes de la mesa", tap: "Toque una parte de la mesa o un botón para ver qué hace.", sr: "Figura interactiva: use las flechas para cambiar de módulo.", slider: "Módulo del programa. Use las flechas para cambiar.", fig: "Fig 2", title: "Mesa de trabajo de un agente", hint: "Flechas o toque una parte", chapters: "Módulos", poster: "Mesa de trabajo: un brazo de pórtico toma una herramienta del estante, actúa sobre la mesa y anota el resultado en una bitácora." },
  en: { course: "Agentic Engineering", chapter: (i, n) => `Module ${i} of ${n}`, parts: "Bench parts", tap: "Tap a part of the bench or a button to see what it does.", sr: "Interactive figure: use the arrow keys to change the module.", slider: "Program module. Use the arrow keys to change it.", fig: "Fig 2", title: "An agent's workbench", hint: "Arrow keys or tap a part", chapters: "Modules", poster: "Workbench: a gantry arm takes a tool from the rack, acts on the work pad and logs the result in a ledger." },
};
