/* Living scene: "Lo que pasa es que asegurar Kubernetes", chapter 1 only (the free sample).
   Source (read only): books/cks-comico/chapters/ch01-el-reglamento-de-quien-entra-a-cada-torre.yaml.
   Every object is one the chapter's residential complex uses, mapped as the chapter maps it. */
export default {
  chapter: {
    es: "El reglamento de quién entra a cada torre",
    en: "The Rule Book for Who Gets Into Which Tower"
  },
  intro: {
    es: "Lo que pasa es que un clúster recién creado se comporta como un conjunto sin reglamento: el celador deja pasar a todo el mundo.",
    en: "A freshly created cluster behaves like a complex with no rules: the guard lets everyone in."
  },
  objects: [
    {
      /* el-reglamento-de-quien-entra: "Vive dentro de un namespace, igual que el reglamento de una
         torre solo aplica a esa torre" (torres.yaml crea los namespaces torre-3 y torre-7) */
      key: "torre",
      name: { es: "La torre 3", en: "Tower 3" },
      concept: { es: "Un namespace", en: "A namespace" },
      lines: {
        es: ["Cada torre es un namespace, y su reglamento solo aplica a esa torre.", "En la torre 3 vive el residente: un servidor web con su Service."],
        en: ["Each tower is a namespace, and its rules only apply to that tower.", "Tower 3 is home to the resident: a web server with its Service."]
      },
      solids: [{ t: "box", x: 50, z: 34, w: 20, d: 14, h: 32 }],
      decor: [{ d: "grid", x0: 42, x1: 58, y0: 3, y1: 30, z: 41, cols: 3, rows: 5, m: 0.24 }]
    },
    {
      /* el-reglamento-de-quien-entra: "la @fig:ch01-dos-reglamentos, las dos políticas entre torres:
         la barrera para todos" (la primera NetworkPolicy, "default deny", "cierra todo") */
      key: "barrera",
      name: { es: "La barrera para todos", en: "The barrier for everyone" },
      concept: { es: "NetworkPolicy default deny", en: "Default deny NetworkPolicy" },
      lines: {
        es: ["La primera política cierra todo: podSelector vacío, Ingress y Egress, sin reglas.", "Ya no entra nadie, ni siquiera la visita autorizada."],
        en: ["The first policy closes everything: empty podSelector, Ingress and Egress, no rules.", "Nobody gets in any more, not even the authorized visitor."]
      },
      solids: [
        { t: "cyl", x: 64, z: 104, r: 2.2, h: 9, n: 12 },
        { t: "box", x: 80, z: 104, w: 30, d: 1.6, h: 1.8, y0: 7 }
      ],
      decor: [
        { d: "poly", pts: [[70, 7, 104.8], [72, 8.8, 104.8]] },
        { d: "poly", pts: [[78, 7, 104.8], [80, 8.8, 104.8]] },
        { d: "poly", pts: [[86, 7, 104.8], [88, 8.8, 104.8]] }
      ]
    },
    {
      /* el-reglamento-de-quien-entra: "y el carril para lo autorizado" (la segunda política abre
         "la entrada solo para las visitas autorizadas, por namespace y por etiqueta") */
      key: "carril",
      name: { es: "El carril para lo autorizado", en: "The lane for what is authorized" },
      concept: { es: "NetworkPolicy que permite", en: "Allow NetworkPolicy" },
      lines: {
        es: ["Encima de la base cerrada, una segunda política abre lo justo.", "Entra solo la visita autorizada, por namespace y por etiqueta, y sale el DNS por el puerto 53."],
        en: ["On top of the closed base, a second policy opens just enough.", "Only the authorized visitor gets in, by namespace and label, and DNS goes out on port 53."]
      },
      solids: [{ t: "box", x: 50, z: 72, w: 14, d: 30, h: 0.8 }],
      decor: [
        { d: "poly", pts: [[46, 0.8, 80], [50, 0.8, 74], [54, 0.8, 80]] },
        { d: "poly", pts: [[46, 0.8, 70], [50, 0.8, 64], [54, 0.8, 70]] }
      ]
    },
    {
      /* la-condicion-que-decide: "que el clúster tenga quién lo haga cumplir [...] las políticas de
         red las implementa el plugin de red [...] el download timed out del desconocido demuestra
         que en ese clúster sí hay un celador" */
      key: "porteria",
      name: { es: "La portería y su celador", en: "The gate and its guard" },
      concept: { es: "El plugin de red (CNI)", en: "The network plugin (CNI)" },
      lines: {
        es: ["Kubernetes guarda la NetworkPolicy, pero no la aplica: la aplica el plugin de red.", "Sin celador, el reglamento queda pegado en la cartelera. Se comprueba con una prueba."],
        en: ["Kubernetes stores the NetworkPolicy but does not apply it: the network plugin does.", "Without a guard, the rules stay pinned to the board. You check it with a test."]
      },
      solids: [
        { t: "box", x: 24, z: 102, w: 18, d: 14, h: 15 },
        { t: "box", x: 24, z: 102, w: 22, d: 18, h: 2, y0: 15 }
      ],
      decor: [{ d: "grid", x0: 17, x1: 31, y0: 6, y1: 13, z: 109, cols: 2, rows: 1, m: 0.08 }]
    },
    {
      /* el-reglamento-de-quien-entra: "en la torre 7 hay dos visitantes: visita-autorizada, con la
         etiqueta rol: visita-autorizada, y desconocido, sin etiqueta" */
      key: "visita",
      name: { es: "La visita autorizada", en: "The authorized visitor" },
      concept: { es: "Un Pod con etiqueta", en: "A labelled Pod" },
      lines: {
        es: ["Un Pod de la torre 7 con la etiqueta rol: visita-autorizada.", "Pasa por la portería y entra por el carril; el desconocido, sin etiqueta, se queda afuera."],
        en: ["A Pod in tower 7 with the label rol: visita-autorizada.", "It goes through the gate and in by the lane; the stranger, with no label, stays out."]
      },
      solids: [
        { t: "cyl", x: 50, z: 124, r: 5, r2: 3.6, h: 10, n: 16 },
        { t: "ball", x: 50, z: 124, r: 3.3, y0: 10 },
        { t: "box", x: 50, z: 128.6, w: 4.4, d: 0.8, h: 3, y0: 4.5 }
      ]
    },
    {
      /* la-revision-antes-del-turno: "Una herramienta que lo aplica es kube-bench [...] Un inspector
         automático que solo cuenta papeles pegados en la puerta no reemplaza al celador" */
      key: "inspector",
      name: { es: "El inspector", en: "The inspector" },
      concept: { es: "kube-bench", en: "kube-bench" },
      lines: {
        es: ["Revisa el clúster contra el CIS Benchmark, como una ronda antes de cada turno.", "Cuenta papeles pegados en la puerta: la última palabra la tiene su propia prueba."],
        en: ["It audits the cluster against the CIS Benchmark, like a round before every shift.", "It counts papers taped to the door: the last word belongs to your own test."]
      },
      solids: [
        { t: "box", x: 84, z: 40, w: 16, d: 22, h: 1.4 },
        { t: "box", x: 84, z: 30.5, w: 6, d: 3, h: 2.4, y0: 1.4 }
      ],
      decor: [
        { d: "poly", pts: [[79, 1.4, 36], [80.5, 1.4, 38], [83, 1.4, 34]] },
        { d: "poly", pts: [[79, 1.4, 43], [80.5, 1.4, 45], [83, 1.4, 41]] },
        { d: "poly", pts: [[85, 1.4, 36], [90, 1.4, 36]] },
        { d: "poly", pts: [[85, 1.4, 43], [89, 1.4, 43]] }
      ]
    }
  ],
  /* summary: the visitor goes through the gate, the allow policy opens the lane to tower 3,
     the barrier closes it for everyone else, and the inspector reviews each tower. */
  arcs: [[4, 3], [3, 2], [2, 0], [3, 1], [5, 0]]
};
