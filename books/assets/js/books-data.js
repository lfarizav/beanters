/* Series data: the single source the catalog, shelf and hero read from.
   window.BOOKS holds the published titles; every value comes from the verified
   books.json (2026-10-29).
   To publish a new chapter-1 sample, add its path under `sample`; the button
   appears by itself. Leave `labs` null when a book has no public labs repo. */
window.BOOKS = [
  {
    id: "kcna",
    anchor: "kubernetes",
    step: 1,
    topic: { es: "Fundamentos · KCNA y KCSA", en: "Basics · KCNA and KCSA" },
    hue: "#a3472a", hueLight: "#e08a62",
    title: {
      es: "Lo que pasa es que Kubernetes",
      en: "Here’s What’s Actually Going On with Kubernetes"
    },
    short: { es: "Kubernetes", en: "Kubernetes" },
    subtitle: {
      es: "Guía completa de Kubernetes en lenguaje sencillo",
      en: "The complete Kubernetes guide in plain language"
    },
    cover: {
      es: "kcna-kcsa-cloud-native-and-security-associate-es",
      en: "kcna-kcsa-cloud-native-and-security-associate-en"
    },
    amazon: {
      es: { kindle: "https://www.amazon.com/dp/B0HJKPLLMN", paperback: "https://www.amazon.com/dp/B0HJMS76SY", hardcover: "https://www.amazon.com/dp/B0HJMRM1Z6" },
      en: { kindle: "https://www.amazon.com/dp/B0HJFKYX8Z", paperback: "https://www.amazon.com/dp/B0HJHZG3XJ", hardcover: "https://www.amazon.com/dp/B0HJJFVR2N" }
    },
    sample: {
      es: "samples/lo-que-pasa-es-que-kubernetes-es-sample.pdf",
      en: "samples/lo-que-pasa-es-que-kubernetes-en-sample.pdf"
    },
    labs: null
  },
  {
    id: "cka",
    anchor: "administrar",
    step: 2,
    topic: { es: "Administrar · CKA", en: "Administer · CKA" },
    hue: "#2f6a9a", hueLight: "#7fb2de",
    title: {
      es: "Lo que pasa es que administrar Kubernetes",
      en: "Here’s What’s Actually Going On with Kubernetes Administration"
    },
    short: { es: "Administrar Kubernetes", en: "Kubernetes Administration" },
    subtitle: {
      es: "Guía completa de administración de Kubernetes en lenguaje sencillo",
      en: "The complete Kubernetes administration guide in plain language"
    },
    cover: { es: "cka-comico-es", en: "cka-comico-en" },
    amazon: {
      es: { kindle: "https://www.amazon.com/dp/B0HLXX1RQJ", paperback: "https://www.amazon.com/dp/B0HLXVJTJL", hardcover: "https://www.amazon.com/dp/B0HLXY9D88" },
      en: { kindle: "https://www.amazon.com/dp/B0HLXXJBKW", paperback: "https://www.amazon.com/dp/B0HLXKVPBT", hardcover: "https://www.amazon.com/dp/B0HLXXBNSV" }
    },
    sample: {
      es: "samples/lo-que-pasa-es-que-administrar-kubernetes-es-sample.pdf",
      en: "samples/lo-que-pasa-es-que-administrar-kubernetes-en-sample.pdf"
    },
    labs: "https://github.com/lfarizav/lo-que-pasa-es-que-administrar-kubernetes"
  },
  {
    id: "ckad",
    anchor: "desarrollar",
    step: 3,
    topic: { es: "Desarrollar · CKAD", en: "Develop · CKAD" },
    hue: "#8c6420", hueLight: "#d9a650",
    title: {
      es: "Lo que pasa es que desarrollar en Kubernetes",
      en: "Here’s What’s Actually Going On with Kubernetes Application Development"
    },
    short: { es: "Desarrollar en Kubernetes", en: "Kubernetes App Development" },
    subtitle: {
      es: "Guía completa de desarrollo de aplicaciones en Kubernetes en lenguaje sencillo",
      en: "The complete Kubernetes application development guide in plain language"
    },
    cover: { es: "ckad-comico-es", en: "ckad-comico-en" },
    amazon: {
      es: { kindle: "https://www.amazon.com/dp/B0HMS8J1X2", paperback: "https://www.amazon.com/dp/B0HMSD351N", hardcover: "https://www.amazon.com/dp/B0HMS2F92Q" },
      en: { kindle: "https://www.amazon.com/dp/B0GX2X91VP", paperback: "https://www.amazon.com/dp/B0HMS7BQQQ", hardcover: "https://www.amazon.com/dp/B0HMW9J5WQ" }
    },
    sample: {
      es: "samples/lo-que-pasa-es-que-desarrollar-en-kubernetes-es-sample.pdf",
      en: "samples/lo-que-pasa-es-que-desarrollar-en-kubernetes-en-sample.pdf"
    },
    labs: null
  },
  {
    id: "cks",
    anchor: "asegurar",
    step: 4,
    topic: { es: "Asegurar · CKS", en: "Secure · CKS" },
    hue: "#5b7535", hueLight: "#9cbc6c",
    title: {
      es: "Lo que pasa es que asegurar Kubernetes",
      en: "Here’s What’s Actually Going On with Kubernetes Security"
    },
    short: { es: "Asegurar Kubernetes", en: "Kubernetes Security" },
    subtitle: {
      es: "Guía completa de seguridad en Kubernetes en lenguaje sencillo",
      en: "The complete Kubernetes security guide in plain language"
    },
    cover: { es: "cks-comico-es", en: "cks-comico-en" },
    amazon: {
      es: { kindle: "https://www.amazon.com/dp/B0HNR8PQ1L", paperback: "https://www.amazon.com/dp/B0HNJ2MCXS", hardcover: "https://www.amazon.com/dp/B0HNJ2MRT5" },
      en: { kindle: "https://www.amazon.com/dp/B0HNR47KKX", paperback: "https://www.amazon.com/dp/B0HNJ3TVKJ", hardcover: "https://www.amazon.com/dp/B0HNJ8PJ3K" }
    },
    sample: {
      es: "samples/lo-que-pasa-es-que-asegurar-kubernetes-es-sample.pdf",
      en: "samples/lo-que-pasa-es-que-asegurar-kubernetes-en-sample.pdf"
    },
    labs: "https://github.com/lfarizav/lo-que-pasa-es-que-asegurar-kubernetes"
  }
];

/* Books not yet on Amazon. The shelf shows them as ghost covers with a vote button;
   they have no Amazon links and no samples, and they stay out of window.BOOKS so the
   hero, the reader, the list and the reading order never see them.
   Keep the ids equal to GHOST_IDS in worker/index.mjs. When a book is published,
   move it to window.BOOKS. Each cover has its own edition image (400 x 514). */
window.GHOSTS = [
  {
    id: "aef-comico",
    title: { es: "Lo que pasa es que la ingeniería agéntica", en: "Here’s What’s Actually Going On with Agentic Engineering" },
    subtitle: { es: "Guía completa de la ingeniería agéntica en lenguaje sencillo", en: "The complete agentic engineering guide in plain language" },
    cover: { es: "aef-comico-es", en: "aef-comico-en" }
  },
  {
    id: "afcn-comico",
    title: { es: "Lo que pasa es que la IA en la nube nativa", en: "Here’s What’s Actually Going On with AI in Cloud Native" },
    subtitle: { es: "Guía completa de la IA en la nube nativa en lenguaje sencillo", en: "The complete AI in Cloud Native guide in plain language" },
    cover: { es: "afcn-comico-es", en: "afcn-comico-en" }
  },
  {
    id: "aft-comico",
    title: { es: "Lo que pasa es que la IA en telco", en: "Here’s What’s Actually Going On with AI in Telco" },
    subtitle: { es: "Guía completa de la IA en telco en lenguaje sencillo", en: "The complete AI in Telco guide in plain language" },
    cover: { es: "aft-comico-es", en: "aft-comico-en" }
  },
  {
    id: "aiko-comico",
    title: { es: "Lo que pasa es que la IA que opera Kubernetes", en: "Here’s What’s Actually Going On with the AI That Operates Kubernetes" },
    subtitle: { es: "Guía completa de la IA que opera Kubernetes en lenguaje sencillo", en: "The complete AI That Operates Kubernetes guide in plain language" },
    cover: { es: "aiko-comico-es", en: "aiko-comico-en" }
  },
  {
    id: "atr-comico",
    title: { es: "Lo que pasa es que los Agentes Telco", en: "Here’s What’s Actually Going On with Telco Agents" },
    subtitle: { es: "Guía completa de Agentes Telco en lenguaje sencillo", en: "The complete Telco Agents guide in plain language" },
    cover: { es: "atr-comico-es", en: "atr-comico-en" }
  },
  {
    id: "canonical-telco-comico",
    title: { es: "Lo que pasa es que la nube privada de telco", en: "Here’s What’s Actually Going On with Telco Private Clouds" },
    subtitle: { es: "Guía completa de la nube privada de telco en lenguaje sencillo", en: "The complete Telco Private Cloud guide in plain language" },
    cover: { es: "canonical-telco-comico-es", en: "canonical-telco-comico-en" }
  },
  {
    id: "capa-comico",
    title: { es: "Lo que pasa es que Argo", en: "Here’s What’s Actually Going On with Argo" },
    subtitle: { es: "Guía completa de Argo en lenguaje sencillo", en: "The complete Argo guide in plain language" },
    cover: { es: "capa-comico-es", en: "capa-comico-en" }
  },
  {
    id: "cba-comico",
    title: { es: "Lo que pasa es que Backstage", en: "Here’s What’s Actually Going On with Backstage" },
    subtitle: { es: "Guía completa de Backstage en lenguaje sencillo", en: "The complete Backstage guide in plain language" },
    cover: { es: "cba-comico-es", en: "cba-comico-en" }
  },
  {
    id: "cca-comico",
    title: { es: "Lo que pasa es que Cilium", en: "Here’s What’s Actually Going On with Cilium" },
    subtitle: { es: "Guía completa de Cilium en lenguaje sencillo", en: "The complete Cilium guide in plain language" },
    cover: { es: "cca-comico-es", en: "cca-comico-en" }
  },
  {
    id: "cgoa-comico",
    title: { es: "Lo que pasa es que GitOps", en: "Here’s What’s Actually Going On with GitOps" },
    subtitle: { es: "Guía completa de GitOps en lenguaje sencillo", en: "The complete GitOps guide in plain language" },
    cover: { es: "cgoa-comico-es", en: "cgoa-comico-en" }
  },
  {
    id: "iac-comico",
    title: { es: "Lo que pasa es que la infraestructura como código", en: "Here’s What’s Actually Going On with Infrastructure as Code" },
    subtitle: { es: "Guía completa de la infraestructura como código en lenguaje sencillo", en: "The complete Infrastructure as Code guide in plain language" },
    cover: { es: "iac-comico-es", en: "iac-comico-en" }
  },
  {
    id: "ica-comico",
    title: { es: "Lo que pasa es que Istio", en: "Here’s What’s Actually Going On with Istio" },
    subtitle: { es: "Guía completa de Istio en lenguaje sencillo", en: "The complete Istio guide in plain language" },
    cover: { es: "ica-comico-es", en: "ica-comico-en" }
  },
  {
    id: "kca-comico",
    title: { es: "Lo que pasa es que Kyverno", en: "Here’s What’s Actually Going On with Kyverno" },
    subtitle: { es: "Guía completa de Kyverno en lenguaje sencillo", en: "The complete Kyverno guide in plain language" },
    cover: { es: "kca-comico-es", en: "kca-comico-en" }
  },
  {
    id: "lfcs-comico",
    title: { es: "Lo que pasa es que Linux", en: "Here’s What’s Actually Going On with Linux" },
    subtitle: { es: "Guía completa de Linux en lenguaje sencillo", en: "The complete Linux guide in plain language" },
    cover: { es: "lfcs-comico-es", en: "lfcs-comico-en" }
  },
  {
    id: "otca-comico",
    title: { es: "Lo que pasa es que OpenTelemetry", en: "Here’s What’s Actually Going On with OpenTelemetry" },
    subtitle: { es: "Guía completa de OpenTelemetry en lenguaje sencillo", en: "The complete OpenTelemetry guide in plain language" },
    cover: { es: "otca-comico-es", en: "otca-comico-en" }
  },
  {
    id: "pca-comico",
    title: { es: "Lo que pasa es que Prometheus", en: "Here’s What’s Actually Going On with Prometheus" },
    subtitle: { es: "Guía completa de Prometheus en lenguaje sencillo", en: "The complete Prometheus guide in plain language" },
    cover: { es: "pca-comico-es", en: "pca-comico-en" }
  },
  {
    id: "specialty-coffee-seed-to-cup",
    title: { es: "Café de especialidad: de la semilla a la taza", en: "Specialty Coffee: From Seed to Cup" },
    subtitle: { es: "Historia, planta, procesos, tueste y catación del café de especialidad", en: "History, plant, processing, roasting and cupping of specialty coffee" },
    cover: { es: "specialty-coffee-seed-to-cup-es", en: "specialty-coffee-seed-to-cup-en" }
  }
];

window.COVER_PATH = "assets/covers/";
