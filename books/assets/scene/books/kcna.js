/* Living scene: "Lo que pasa es que Kubernetes", chapter 1 only (the free sample).
   Source (read only): books/kcna-kcsa-cloud-native-and-security-associate/chapters/
   ch01-contenedores-de-donde-vienen.yaml. Every object below is one the chapter itself
   uses, mapped to the concept the chapter maps it to; the quote sits next to it. */
export default {
  chapter: {
    es: "Contenedores: de donde vienen y que problema resuelven",
    en: "Containers: Where They Came From and What They Solve"
  },
  intro: {
    es: "Lo que pasa es que el problema nunca fue el programa. El problema era la cocina.",
    en: "Here is what is actually going on. The problem was never the program. The problem was the kitchen."
  },
  objects: [
    {
      /* intro: "Usted escribe un programa, lo prueba en su computador, funciona perfecto. [...]
         Y usted estaba entregando la receta sin entregar la cocina." */
      key: "receta",
      name: { es: "La receta", en: "The recipe" },
      concept: { es: "El programa", en: "The program" },
      lines: {
        es: ["Usted escribe un programa, lo prueba en su computador y funciona perfecto.", "Lo manda al servidor y se cae: entregó la receta sin entregar la cocina."],
        en: ["You write a program, test it on your computer, and it runs perfectly.", "You ship it to the server and it falls over: you handed over the recipe without the kitchen."]
      },
      solids: [{ t: "box", x: 20, z: 32, w: 22, d: 28, h: 1.6 }],
      decor: [{ d: "lines", x0: 12, x1: 28, z0: 21, z1: 43, h: 1.6, n: 6 }]
    },
    {
      /* intro: "La versión de la librería, la variable de entorno [...] la versión del sistema
         operativo. Todo eso es la cocina." */
      key: "cocina",
      name: { es: "Su cocina", en: "Your kitchen" },
      concept: { es: "El entorno", en: "The environment" },
      lines: {
        es: ["La versión de la librería, la variable de entorno, el archivo de su disco, la versión del sistema operativo.", "Todo eso es la cocina."],
        en: ["The library version, the environment variable, the file on your disk, the operating system version.", "All of that is the kitchen."]
      },
      solids: [
        { t: "box", x: 68, z: 32, w: 30, d: 20, h: 16 },
        { t: "cyl", x: 75, z: 27, r: 5.2, h: 8, y0: 16 }
      ],
      decor: [
        { d: "ring", x: 60, z: 27, r: 3.4, h: 16, n: 12 },
        { d: "ring", x: 60, z: 37, r: 3.4, h: 16, n: 12 },
        { d: "ring", x: 75, z: 37, r: 3.4, h: 16, n: 12 },
        { d: "grid", x0: 56, x1: 80, y0: 1.5, y1: 11.5, z: 42, cols: 1, rows: 1, m: 0.06 },
        { d: "poly", pts: [[60, 9, 42], [76, 9, 42]] }
      ]
    },
    {
      /* el-problema-real: "Una máquina virtual empaca un sistema operativo completo, con su propio
         kernel [...] Es como si, para llevarle el sancocho a su tía, usted se llevara la casa." */
      key: "casa",
      name: { es: "La casa entera", en: "The whole house" },
      concept: { es: "La máquina virtual", en: "The virtual machine" },
      lines: {
        es: ["La máquina virtual manda la cocina entera, con su propio kernel.", "Funcionó, pero pesa: es como llevarse la casa para llevarle el sancocho a su tía."],
        en: ["A virtual machine ships the whole kitchen, its own kernel included.", "It worked, but it is heavy: as if, to bring your aunt the stew, you brought the house."]
      },
      solids: [
        { t: "box", x: 78, z: 82, w: 22, d: 18, h: 14 },
        { t: "roof", x: 78, z: 82, w: 25, d: 20, h: 10, y0: 14 }
      ],
      decor: [
        { d: "grid", x0: 72, x1: 79, y0: 0, y1: 9, z: 91, cols: 1, rows: 1, m: 0.04 },
        { d: "grid", x0: 81, x1: 87, y0: 5, y1: 11, z: 91, cols: 2, rows: 1, m: 0.1 }
      ]
    },
    {
      /* intro: "Un contenedor es, exactamente, la solución a ese problema: empacar la cocina
         junto con la receta." */
      key: "caja",
      name: { es: "La cocina empacada", en: "The packed kitchen" },
      concept: { es: "El contenedor", en: "The container" },
      lines: {
        es: ["Un contenedor empaca la cocina junto con la receta.", "Comparte el kernel del anfitrión: namespaces para lo que ve, cgroups para lo que gasta."],
        en: ["A container packs the kitchen together with the recipe.", "It shares the host's kernel: namespaces for what it sees, cgroups for what it spends."]
      },
      solids: [
        { t: "box", x: 30, z: 82, w: 26, d: 20, h: 12 },
        { t: "box", x: 30, z: 82, w: 28, d: 22, h: 2.6, y0: 12 },
        { t: "box", x: 26, z: 80, w: 10, d: 12, h: 1, y0: 14.6 },
        { t: "cyl", x: 38, z: 79, r: 3, h: 4, y0: 14.6, n: 14 }
      ],
      decor: [
        { d: "lines", x0: 22.5, x1: 29.5, z0: 75, z1: 85, h: 15.6, n: 3 },
        { d: "poly", pts: [[24, 0, 92], [24, 12, 92]] },
        { d: "poly", pts: [[36, 0, 92], [36, 12, 92]] }
      ]
    },
    {
      /* intro: "la estufa es de otra marca, la olla es más pequeña [...] Mismo cocinero. Misma
         receta. Y le queda horrible." / "Lo manda al servidor de la empresa y se cae."
         summary: "misma receta, mismo resultado, en la casa de su tía, en el servidor de la empresa" */
      key: "tia",
      name: { es: "La cocina de su tía", en: "Your aunt's kitchen" },
      concept: { es: "El servidor de la empresa", en: "The company server" },
      lines: {
        es: ["Otra estufa, una olla más pequeña: mismo cocinero, misma receta, y le queda horrible.", "Con la cocina empacada sale igual en la casa de su tía y en el servidor de la empresa."],
        en: ["Different stove, smaller pot: same cook, same recipe, and it comes out terrible.", "With the kitchen packed, it comes out the same at your aunt's and on the company server."]
      },
      solids: [
        { t: "box", x: 56, z: 119, w: 24, d: 16, h: 12 },
        { t: "cyl", x: 50, z: 115, r: 3.6, h: 5, y0: 12, n: 14 }
      ],
      decor: [
        { d: "ring", x: 62, z: 115, r: 3, h: 12, n: 12 },
        { d: "grid", x0: 47, x1: 65, y0: 1.5, y1: 9, z: 127, cols: 1, rows: 1, m: 0.06 }
      ]
    }
  ],
  /* Flows the chapter describes: recipe and kitchen get packed together; the packed kitchen
     travels to the aunt's (the server); the VM ships the whole house there instead. */
  arcs: [[0, 3], [1, 3], [3, 4], [2, 4]]
};
