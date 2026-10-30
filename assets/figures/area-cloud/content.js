// Words for the Cloud-native area scene, ES and EN. Source: the home card (index.html, p2Body):
// he runs cellular network functions with Helm, Flux and GitOps.
export const CHAPTERS = [
  { id: "1", pins: ["git", "helm"], es: { name: "Git declara el estado deseado", idea: "El repositorio Git guarda el chart de Helm y sus valores: el estado deseado del clúster." }, en: { name: "Git declares the desired state", idea: "The Git repository holds the Helm chart and its values: the cluster's desired state." } },
  { id: "2", pins: ["flux", "cp"], es: { name: "Flux reconcilia con GitOps", idea: "Flux compara Git con el clúster y el plano de control aplica la diferencia, en un ciclo continuo." }, en: { name: "Flux reconciles with GitOps", idea: "Flux compares Git with the cluster and the control plane applies the difference, in a continuous loop." } },
  { id: "3", pins: ["pods", "nodes"], es: { name: "Helm despliega funciones de red", idea: "El chart de Helm despliega funciones de red celular como pods en los nodos worker." }, en: { name: "Helm deploys network functions", idea: "The Helm chart deploys cellular network functions as pods on the worker nodes." } },
  { id: "4", pins: ["obs"], es: { name: "Observabilidad", idea: "La lupa recorre los pods: métricas y estado de cada función de red." }, en: { name: "Observability", idea: "The magnifier sweeps the pods: metrics and health of every network function." } },
];
export const WORDS = {
  git: { es: "Repositorio Git", en: "Git repository" },
  helm: { es: "Chart de Helm", en: "Helm chart" },
  flux: { es: "Flux (GitOps)", en: "Flux (GitOps)" },
  cp: { es: "Plano de control", en: "Control plane" },
  nodes: { es: "Nodos worker", en: "Worker nodes" },
  pods: { es: "Pods: núcleo 5G", en: "Pods: 5G core" },
  obs: { es: "Observabilidad", en: "Observability" },
};
export const COPY = {
  es: { slider: "Escena de Kubernetes. Use las flechas para cambiar de fase.", phases: "Fases" },
  en: { slider: "Kubernetes scene. Use the arrow keys to change phase.", phases: "Phases" },
};
