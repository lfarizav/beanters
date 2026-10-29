/* Living scene: "Lo que pasa es que administrar Kubernetes", chapter 1 only (the free sample).
   Source (read only): books/cka-comico/chapters/ch01-los-cimientos-de-la-finca.yaml.
   Every object is one of the chapter's trades, mapped as the chapter maps it. */
export default {
  chapter: {
    es: "Los cimientos de la casa: quién hace qué en el clúster",
    en: "The foundations of the house: who does what in the cluster"
  },
  intro: {
    es: "Lo que pasa es que un clúster de Kubernetes se organiza con el mismo reparto de oficios que una obra seria.",
    en: "A Kubernetes cluster is organized with the same division of trades as a serious building site."
  },
  objects: [
    {
      /* intro: "el kube-apiserver, la única ventanilla por donde entra cualquier instrucción" */
      key: "ventanilla",
      name: { es: "La ventanilla única", en: "The single window" },
      concept: { es: "kube-apiserver", en: "kube-apiserver" },
      lines: {
        es: ["Una sola ventanilla recibe todo pedido, lo revisa y solo después lo deja pasar.", "Nadie le habla al cuaderno de obra: todos le hablan a la ventanilla."],
        en: ["A single window receives every request, checks it, and only then lets it through.", "Nobody talks to the site ledger directly: everyone talks to the window."]
      },
      solids: [
        { t: "box", x: 50, z: 66, w: 22, d: 16, h: 18 },
        { t: "box", x: 50, z: 66, w: 26, d: 20, h: 2, y0: 18 },
        { t: "box", x: 50, z: 76, w: 16, d: 4, h: 1.4, y0: 7 }
      ],
      decor: [{ d: "grid", x0: 43, x1: 57, y0: 8.4, y1: 16, z: 74, cols: 1, rows: 1, m: 0.05 }]
    },
    {
      /* intro: "etcd, el cuaderno de obra donde queda anotado el estado de todo" */
      key: "cuaderno",
      name: { es: "El cuaderno de obra", en: "The site ledger" },
      concept: { es: "etcd", en: "etcd" },
      lines: {
        es: ["Guarda el estado deseado y el estado conocido del clúster, ni una línea más.", "Si dos capataces preguntan a la vez, los dos reciben la misma respuesta."],
        en: ["It keeps the desired state and the known state of the cluster, not one line more.", "If two overseers ask at the same moment, both get the same answer."]
      },
      solids: [{ t: "box", x: 20, z: 34, w: 20, d: 24, h: 4 }],
      decor: [
        { d: "lines", x0: 13, x1: 27, z0: 25, z1: 43, h: 4, n: 5 },
        { d: "poly", pts: [[11.5, 4, 22], [11.5, 4, 46]] }
      ]
    },
    {
      /* intro: "el kube-scheduler, el maestro de obra, que decide en qué frente (en qué nodo)
         se hace cada trabajo nuevo" */
      key: "maestro",
      name: { es: "El maestro de obra", en: "The foreman" },
      concept: { es: "kube-scheduler", en: "kube-scheduler" },
      lines: {
        es: ["Decide en qué frente, en qué nodo, se hace cada trabajo nuevo.", "No construye nada: anota su decisión en el cuaderno a través de la ventanilla."],
        en: ["He decides in which area of the site, which node, each new job gets done.", "He builds nothing: he records his decision in the ledger through the window."]
      },
      solids: [
        { t: "cyl", x: 80, z: 32, r: 12, h: 1.2, n: 24 },
        { t: "dome", x: 80, z: 32, r: 8.5, y0: 1.2 }
      ],
      decor: [{ d: "poly", pts: [[80, 9.7, 32], [80, 9.2, 28], [80, 7.5, 25]] }]
    },
    {
      /* intro: "el kube-controller-manager, que reúne a los capataces que vigilan sin pausa
         que la obra siga pareciéndose al plano" */
      key: "capataces",
      name: { es: "Los capataces", en: "The overseers" },
      concept: { es: "kube-controller-manager", en: "kube-controller-manager" },
      lines: {
        es: ["Recorren el terreno sin pausa, revisando que la obra siga pareciéndose al plano.", "Si algo se aparta del plano, avisan por la ventanilla."],
        en: ["They walk the site without pause, checking that it still looks like the plan.", "When something drifts from the plan, they report it through the window."]
      },
      solids: [
        { t: "box", x: 18, z: 102, w: 18, d: 24, h: 1.4 },
        { t: "box", x: 18, z: 91.5, w: 7, d: 3, h: 2.6, y0: 1.4 }
      ],
      decor: [
        { d: "poly", pts: [[12, 1.4, 97], [13.5, 1.4, 99], [16, 1.4, 95]] },
        { d: "poly", pts: [[12, 1.4, 104], [13.5, 1.4, 106], [16, 1.4, 102]] },
        { d: "poly", pts: [[12, 1.4, 111], [13.5, 1.4, 113], [16, 1.4, 109]] },
        { d: "poly", pts: [[18, 1.4, 97], [24, 1.4, 97]] },
        { d: "poly", pts: [[18, 1.4, 104], [24, 1.4, 104]] },
        { d: "poly", pts: [[18, 1.4, 111], [22, 1.4, 111]] }
      ]
    },
    {
      /* intro: "vive el kubelet, el obrero de planta que recibe las órdenes y se encarga de que
         se cumplan" */
      key: "obrero",
      name: { es: "El obrero de planta", en: "The resident worker" },
      concept: { es: "kubelet", en: "kubelet" },
      lines: {
        es: ["Vigila la ventanilla preguntando qué Pods le tocaron a su nodo.", "Cuando encuentra trabajo nuevo, le pasa la orden al contratista."],
        en: ["It watches the window, asking which Pods were assigned to its node.", "When it finds new work, it hands the order to the contractor."]
      },
      solids: [
        { t: "cyl", x: 54, z: 112, r: 6, r2: 4.2, h: 12, n: 18 },
        { t: "ball", x: 54, z: 112, r: 3.8, y0: 12 },
        { t: "cyl", x: 54, z: 112, r: 5.2, h: 0.8, y0: 18.2, n: 16 }
      ]
    },
    {
      /* intro: "el contratista, el container runtime, que es quien pone cada ladrillo" */
      key: "contratista",
      name: { es: "El contratista", en: "The contractor" },
      concept: { es: "container runtime", en: "container runtime" },
      lines: {
        es: ["Pone cada ladrillo: descarga la imagen, levanta el contenedor y lo arranca.", "Trabaja con un contrato estándar, el CRI, y por eso se puede cambiar de contratista."],
        en: ["It lays every brick: it pulls the image, raises the container, and starts it.", "It works under a standard contract, the CRI, so the contractor can be swapped."]
      },
      solids: [
        { t: "box", x: 76, z: 106, w: 8, d: 5, h: 4 }, { t: "box", x: 84.4, z: 106, w: 8, d: 5, h: 4 }, { t: "box", x: 92.8, z: 106, w: 8, d: 5, h: 4 },
        { t: "box", x: 80.2, z: 106, w: 8, d: 5, h: 4, y0: 4.2 }, { t: "box", x: 88.6, z: 106, w: 8, d: 5, h: 4, y0: 4.2 },
        { t: "box", x: 84.4, z: 106, w: 8, d: 5, h: 4, y0: 8.4 }
      ]
    }
  ],
  /* la-ventanilla-unica: the scheduler "le comunica su decisión al kube-apiserver, que la deja
     anotada"; only the window writes in etcd; the kubelet "vigila al kube-apiserver"; and it
     "le pasa la orden a un contratista de confianza, el container runtime". */
  arcs: [[2, 0], [3, 0], [0, 1], [0, 4], [4, 5]]
};
