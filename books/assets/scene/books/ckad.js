/* Living scene: "Lo que pasa es que desarrollar en Kubernetes", chapter 1 only (the free sample).
   Source (read only): books/ckad-comico/chapters/ch01-la-receta-que-se-lleva-a-cualquier-cocina.yaml.
   Every object is one the chapter's restaurant uses, mapped as the chapter maps it. */
export default {
  chapter: {
    es: "La receta que se lleva a cualquier cocina",
    en: "The Recipe You Can Take to Any Kitchen"
  },
  intro: {
    es: "La receta que solo funciona en una cocina porque nadie la escribió completa es justo el problema que resuelve una imagen de contenedor.",
    en: "A recipe that only works in one kitchen because nobody wrote it down completely is exactly the problem a container image solves."
  },
  objects: [
    {
      /* la-receta-escrita: "esa receta se escribe con un Dockerfile (en la @fig:ch01-receta-escrita,
         el cuaderno donde el cocinero joven anota cada paso)" */
      key: "cuaderno",
      name: { es: "El cuaderno de la receta", en: "The recipe booklet" },
      concept: { es: "Dockerfile", en: "Dockerfile" },
      lines: {
        es: ["Una lista de instrucciones, en orden, que construye la imagen desde una imagen base.", "FROM, RUN, COPY: cada línea agrega algo concreto a la receta."],
        en: ["A list of instructions, in order, that builds the image from a base image.", "FROM, RUN, COPY: each line adds something concrete to the recipe."]
      },
      solids: [
        { t: "box", x: 13.5, z: 32, w: 13, d: 22, h: 1.4, rz: 7 },
        { t: "box", x: 27.5, z: 32, w: 13, d: 22, h: 1.4, rz: -7 }
      ],
      decor: [
        { d: "lines", x0: 9, x1: 18, z0: 24, z1: 40, h: 2.4, n: 5 },
        { d: "lines", x0: 23, x1: 32, z0: 24, z1: 40, h: 2.4, n: 5 }
      ]
    },
    {
      /* cocinar-la-receta-una-vez: "se construye en capas [...] se reutiliza el sofrito de ayer
         tal cual quedó guardado, como la bandeja que el cocinero toma de la repisa" */
      key: "repisa",
      name: { es: "El sofrito en la repisa", en: "The sofrito on the shelf" },
      concept: { es: "Las capas en caché", en: "Cached layers" },
      lines: {
        es: ["La imagen se construye en capas, y cada capa queda guardada por separado.", "Si nadie tocó esa parte de la receta, se reutiliza el sofrito de ayer."],
        en: ["The image is built in layers, and each layer is stored separately.", "If nobody touched that part of the recipe, yesterday's sofrito gets reused."]
      },
      solids: [
        { t: "box", x: 58, z: 32, w: 2, d: 10, h: 22 },
        { t: "box", x: 84, z: 32, w: 2, d: 10, h: 22 },
        { t: "box", x: 71, z: 32, w: 28, d: 10, h: 1.2, y0: 8 },
        { t: "box", x: 71, z: 32, w: 28, d: 10, h: 1.2, y0: 17 },
        { t: "box", x: 65, z: 32, w: 9, d: 7, h: 2.4, y0: 9.2 },
        { t: "box", x: 77, z: 32, w: 9, d: 7, h: 2.4, y0: 9.2 },
        { t: "box", x: 71, z: 32, w: 9, d: 7, h: 2.4, y0: 18.2 }
      ]
    },
    {
      /* intro: "ese problema [...] es justo el problema que resuelve una imagen de contenedor [...]
         Es la receta escrita hasta el último gramo" */
      key: "receta",
      name: { es: "La receta escrita", en: "The written recipe" },
      concept: { es: "La imagen de contenedor", en: "The container image" },
      lines: {
        es: ["La receta escrita hasta el último gramo: la aplicación y todas sus dependencias.", "Cualquier cocina que la reciba produce el mismo plato, sin llamar a preguntar."],
        en: ["The recipe written down to the last gram: the application and all its dependencies.", "Any kitchen that receives it produces the same dish, with no need to call and ask."]
      },
      solids: [
        { t: "box", x: 34, z: 80, w: 24, d: 9, h: 2 },
        { t: "box", x: 34, z: 79, w: 20, d: 1.6, h: 22, y0: 2 }
      ],
      decor: [{ d: "flines", x0: 27, x1: 41, y0: 5, y1: 21, z: 79.8, n: 6 }]
    },
    {
      /* el-nombre-en-la-fachada: "un nombre corto siempre termina resolviéndose contra algún
         registro, aunque sea implícito: el archivo de recetas de la @fig:ch01-archivo-de-recetas" */
      key: "archivo",
      name: { es: "El archivo de recetas", en: "The recipe archive" },
      concept: { es: "El registro", en: "The registry" },
      lines: {
        es: ["Donde queda guardada la receta, con su nombre.", "Si no se nombra ningún registro, Kubernetes asume el registro público de Docker."],
        en: ["Where the recipe is stored, under its name.", "If you name no registry, Kubernetes assumes the Docker public registry."]
      },
      solids: [{ t: "box", x: 78, z: 80, w: 18, d: 14, h: 26 }],
      decor: [
        { d: "grid", x0: 70, x1: 86, y0: 1, y1: 25, z: 87, cols: 1, rows: 3, m: 0.08 },
        { d: "poly", pts: [[76, 21, 87], [80, 21, 87]] },
        { d: "poly", pts: [[76, 13, 87], [80, 13, 87]] },
        { d: "poly", pts: [[76, 5, 87], [80, 5, 87]] }
      ]
    },
    {
      /* el-nombre-en-la-fachada: "Un tag, entonces, es como el letrero «Restaurante La Buena Sazón»
         en la fachada" (los tags "se pueden mover para apuntar a imágenes distintas") */
      key: "letrero",
      name: { es: "El letrero de la fachada", en: "The storefront sign" },
      concept: { es: "El tag", en: "The tag" },
      lines: {
        es: ["Sigue siendo el mismo letrero aunque la receta detrás cambie.", "Un tag se puede mover para apuntar a otra imagen, y nadie le avisa al cliente."],
        en: ["It stays the same sign even when the recipe behind it changes.", "A tag can be moved to point at another image, and nobody tells the customer."]
      },
      solids: [
        { t: "cyl", x: 15, z: 118, r: 1.1, h: 22, n: 10 },
        { t: "cyl", x: 39, z: 118, r: 1.1, h: 22, n: 10 },
        { t: "box", x: 27, z: 118, w: 26, d: 1, h: 1, y0: 21 },
        { t: "box", x: 27, z: 118, w: 20, d: 1.4, h: 9, y0: 9 }
      ],
      decor: [
        { d: "poly", pts: [[20, 18, 118], [20, 21, 118]] },
        { d: "poly", pts: [[34, 18, 118], [34, 21, 118]] },
        { d: "flines", x0: 20, x1: 34, y0: 11, y1: 16, z: 118.8, n: 2 }
      ]
    },
    {
      /* el-nombre-en-la-fachada: "Un digest [...] es el número de escritura notariada de ese local
         exacto, en ese estado exacto" (los digests "son inmutables") */
      key: "escritura",
      name: { es: "La escritura notariada", en: "The notarized deed" },
      concept: { es: "El digest", en: "The digest" },
      lines: {
        es: ["Sale del contenido mismo de la imagen: un hash, inmutable.", "No hay forma de que apunte a otra cosa después."],
        en: ["It comes from the image's own content: a hash, immutable.", "There is no way for it to point at anything else afterward."]
      },
      solids: [
        { t: "box", x: 74, z: 120, w: 26, d: 8, h: 2 },
        { t: "box", x: 74, z: 119, w: 22, d: 1.6, h: 15, y0: 2 }
      ],
      decor: [
        { d: "fring", x: 65.5, y: 15, z: 119.9, r: 0.9, n: 8 },
        { d: "fring", x: 82.5, y: 15, z: 119.9, r: 0.9, n: 8 },
        { d: "fring", x: 65.5, y: 4.5, z: 119.9, r: 0.9, n: 8 },
        { d: "fring", x: 82.5, y: 4.5, z: 119.9, r: 0.9, n: 8 },
        { d: "fring", x: 78, y: 8, z: 119.9, r: 3, n: 14 },
        { d: "flines", x0: 67, x1: 75, y0: 8, y1: 14.5, z: 119.9, n: 3 }
      ]
    }
  ],
  /* intro: the chapter "sigue esa receta desde que se escribe": Dockerfile, then the layers,
     then the image, stored in the registry; the tag can move, the digest stays fixed. */
  arcs: [[0, 1], [1, 2], [2, 3], [4, 2], [5, 2]]
};
