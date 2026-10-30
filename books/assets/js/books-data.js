/* Series data: the single source the catalog, shelf and hero read from.
   Every value comes from the verified books.json (2026-10-29).
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

window.COVER_PATH = "assets/covers/";
