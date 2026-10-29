// Words for the Kubernetes model, ES and EN. Source: courses/index.html, program "Kubernetes cloud native"
// (ES lines 200-210, EN dictionary cm63-cm75 at lines 390-402). Module names and hours are the page's own;
// lines that start "En la escena" / "In the model" describe the figure, not the course.
export const CHAPTERS = [
  {
    id: "01",
    es: { name: "Contenedores y fundamentos de K8s", sub: "Módulo de 12 h", idea: "El plano de control reparte las cajas entre los nodos.", lines: ["Abre un programa de 50+ horas, de intermedio a avanzado.", "Aprendizaje por roles para desarrolladores, ingenieros de plataforma y SRE.", "El programa cubre la arquitectura de Kubernetes."] },
    en: { name: "Containers + K8s Basics", sub: "12 h module", idea: "The control plane hands the crates out to the nodes.", lines: ["It opens a 50+ hour program, intermediate to advanced.", "Role-based learning for developers, platform engineers and SREs.", "The program covers Kubernetes architecture."] },
  },
  {
    id: "02",
    es: { name: "Cargas de trabajo y producción", sub: "Módulo de 22 h", idea: "Escalar agrega cajas; si un nodo cae, sus cajas pasan a los otros.", lines: ["El módulo más largo del programa.", "Nivel producción, como lo anuncia el programa.", "En la escena, un Deployment pasa de 3 a 6 pods y un nodo falla."] },
    en: { name: "Workloads + Production", sub: "22 h module", idea: "Scaling adds crates; when a node fails, its crates move to the others.", lines: ["The longest module of the program.", "Production grade, as the program states.", "In the model, a Deployment goes from 3 to 6 pods and a node fails."] },
  },
  {
    id: "03",
    es: { name: "Charts de Helm", sub: "Módulo de 8 h", idea: "Un chart llega como un paquete: su grupo de cajas cae de una vez.", lines: ["El módulo más corto del programa.", "El programa cubre los charts de Helm.", "En la escena, las cajas con banda son las de la entrega del chart."] },
    en: { name: "Helm Charts", sub: "8 h module", idea: "A chart arrives as one package: its group of crates lands at once.", lines: ["The shortest module of the program.", "The program covers Helm charts.", "In the model, the banded crates are the chart's release."] },
  },
  {
    id: "04",
    es: { name: "GitOps y Flux", sub: "Módulo de 10 h", idea: "La bitácora Git manda; Flux lleva cada cambio al clúster.", lines: ["GitOps con FluxCD, como lo nombra el programa.", "En la escena, cada línea nueva de la bitácora viaja por la línea de Flux.", "Al llegar, el clúster se ajusta a lo escrito."] },
    en: { name: "GitOps + Flux", sub: "10 h module", idea: "The Git ledger leads; Flux carries each change to the cluster.", lines: ["GitOps with FluxCD, as the program names it.", "In the model, each new ledger line travels down the Flux line.", "When it arrives, the cluster matches what was written."] },
  },
  {
    id: "05",
    es: { name: "Observabilidad", sub: "Módulo de 14 h", idea: "Cada nodo envía su pulso al medidor.", lines: ["El programa cubre toda la pila de observabilidad.", "Aplicación directa a telco cloud native y a redes privadas 5G/LTE.", "En la escena, el medidor lee lo que pasa en las tres bandejas."] },
    en: { name: "Observability", sub: "14 h module", idea: "Each node sends its pulse to the gauge.", lines: ["The program covers the full observability stack.", "Direct application to cloud-native telco and 5G/LTE private networks.", "In the model, the gauge reads what happens on the three trays."] },
  },
];

export const PARTS = {
  plane: {
    es: { name: "Plano de control", by: ["Decide en qué bandeja cae cada caja; su baliza se enciende con cada entrega.", "Ve caer un nodo y vuelve a ubicar sus cajas en los otros dos.", "Recibe el paquete del chart y reparte su grupo de cajas.", "Recibe de Flux el cambio escrito en Git y lo aplica.", "Sigue repartiendo mientras el medidor lee los nodos."] },
    en: { name: "Control plane", by: ["It decides which tray each crate lands on; its beacon flashes with each delivery.", "It sees a node fail and places its crates on the other two.", "It takes the chart's package and hands out its group of crates.", "It takes from Flux the change written in Git and applies it.", "It keeps placing crates while the gauge reads the nodes."] },
  },
  nodes: {
    es: { name: "Nodos", by: Array(5).fill("Tres bandejas, tres nodos. La lámpara del frente dice si el nodo está en servicio.").map((t, i) => (i === 1 ? "Tres nodos. El tercero se apaga: sus cajas viajan en arco a los otros dos." : t)) },
    en: { name: "Nodes", by: Array(5).fill("Three trays, three nodes. The front lamp tells whether the node is in service.").map((t, i) => (i === 1 ? "Three nodes. The third one goes dark: its crates arc over to the other two." : t)) },
  },
  pods: {
    es: { name: "Pods", by: ["Cada caja es un pod.", "Escalar el Deployment agrega cajas: de 3 a 6.", "Las cajas con banda llegan juntas, como una entrega del chart.", "Dos cajas nuevas: el número que pide la bitácora.", "Seis cajas en servicio; el medidor sigue su pulso."] },
    en: { name: "Pods", by: ["Each crate is a pod.", "Scaling the Deployment adds crates: from 3 to 6.", "The banded crates arrive together, as one chart release.", "Two new crates: the count the ledger asks for.", "Six crates in service; the gauge follows their pulse."] },
  },
  git: {
    es: { name: "Git y Flux", by: Array(5).fill("La bitácora es el repositorio Git; el dial de Flux lleva cada cambio al plano de control.") },
    en: { name: "Git and Flux", by: Array(5).fill("The ledger is the Git repository; the Flux dial carries each change to the control plane.") },
  },
};

export const COPY = {
  es: { course: "Kubernetes cloud native", chapter: (i, n) => `Módulo ${i} de ${n}`, parts: "Partes del modelo", tap: "Toque una parte del modelo o un botón para ver qué hace.", sr: "Figura interactiva: use las flechas para cambiar de módulo.", slider: "Módulo del programa. Use las flechas para cambiar.", fig: "Fig 3", title: "Un clúster a escala", hint: "Flechas o toque una parte", chapters: "Módulos", poster: "Clúster a escala: un plano de control, tres bandejas de nodos con cajas como pods, una bitácora Git unida por Flux y un medidor." },
  en: { course: "Cloud-Native Kubernetes", chapter: (i, n) => `Module ${i} of ${n}`, parts: "Model parts", tap: "Tap a part of the model or a button to see what it does.", sr: "Interactive figure: use the arrow keys to change the module.", slider: "Program module. Use the arrow keys to change it.", fig: "Fig 3", title: "A scale-model cluster", hint: "Arrow keys or tap a part", chapters: "Modules", poster: "Scale-model cluster: a control plane, three node trays with crates as pods, a Git ledger joined by Flux, and a gauge." },
};
