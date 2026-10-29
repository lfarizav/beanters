// Words for the cell-site figure, ES and EN. Standard names only (3GPP: GSM, UMTS/WCDMA, LTE, NR;
// ITU-R: IMT-2030, Recommendation ITU-R M.2160, https://www.itu.int/rec/R-REC-M.2160). No numeric specs.
export const GENS = [
  {
    id: "2G", tech: "GSM",
    es: { idea: "Voz digital con una antena sectorial pasiva.", lines: ["GSM llevó la voz celular a lo digital, con SMS.", "La antena sectorial es pasiva: solo radia.", "La radio vive en el gabinete; un coaxial grueso sube la señal."] },
    en: { idea: "Digital voice through one passive sector antenna.", lines: ["GSM made cellular voice digital, with SMS.", "The sector antenna is passive: it only radiates.", "The radio sits in the cabinet; thick coax carries the signal up."] },
  },
  {
    id: "3G", tech: "UMTS",
    es: { idea: "Datos móviles sobre WCDMA, sitio en tres sectores.", lines: ["UMTS usa WCDMA como interfaz de radio.", "El sitio se reparte en tres sectores, una antena por sector.", "La radio sigue al pie del mástil: suben más coaxiales."] },
    en: { idea: "Mobile data over WCDMA, a three-sector site.", lines: ["UMTS uses WCDMA as its radio interface.", "The site splits into three sectors, one antenna each.", "Radios stay at the foot of the mast: more coax goes up."] },
  },
  {
    id: "4G", tech: "LTE",
    es: { idea: "MIMO 2x2 y 4x4: varios flujos en paralelo.", lines: ["LTE es todo IP y usa OFDMA en el enlace descendente.", "Paneles de doble polarización con varios puertos habilitan MIMO 2x2 o 4x4.", "La radio sube al mástil (RRU) y la une al gabinete una fibra."] },
    en: { idea: "2x2 and 4x4 MIMO: several streams in parallel.", lines: ["LTE is all-IP and uses OFDMA on the downlink.", "Dual-polarised panels with several ports enable 2x2 or 4x4 MIMO.", "The radio moves up the mast (RRU), linked to the cabinet by fibre."] },
  },
  {
    id: "5G", tech: "NR",
    es: { idea: "Massive MIMO: un haz apunta a cada teléfono.", lines: ["NR usa massive MIMO: una antena activa con muchos elementos.", "Con beamforming, el arreglo dirige la energía hacia el teléfono.", "Radio y antena van en una sola caja (AAU), enlazada por fibra."] },
    en: { idea: "Massive MIMO: a beam points at each phone.", lines: ["NR uses massive MIMO: an active antenna with many elements.", "With beamforming, the array steers energy toward the phone.", "Radio and antenna share one box (AAU), linked by fibre."] },
  },
  {
    id: "6G", tech: "IMT-2030",
    es: { idea: "6G: en investigación.", lines: ["6G está en investigación; aún no hay especificaciones definitivas.", "La UIT fijó el marco IMT-2030 (Recomendación UIT-R M.2160).", "Por eso el montaje queda vacío: no dibujamos equipos inventados."] },
    en: { idea: "6G: under research.", lines: ["6G is under research; there are no final specifications yet.", "The ITU set the IMT-2030 framework (Recommendation ITU-R M.2160).", "So the mount stays empty: no invented hardware is drawn."] },
  },
];

export const PARTS = {
  antenna: {
    es: { name: "Antena", by: [
      "Antena sectorial pasiva: cubre un sector y no lleva electrónica.",
      "Tres antenas sectoriales, una por sector, aún pasivas.",
      "Panel LTE de doble polarización; su RRU va justo debajo, en el mismo tubo.",
      "AAU: radio y arreglo activo en una sola caja; las aletas de atrás disipan calor.",
      "Montaje reservado: el equipo 6G aún no está definido.",
    ] },
    en: { name: "Antenna", by: [
      "Passive sector antenna: it covers one sector and carries no electronics.",
      "Three sector antennas, one per sector, still passive.",
      "Dual-polarised LTE panel; its RRU sits just below on the same pipe.",
      "AAU: radio and active array in one box; the fins on the back shed heat.",
      "Reserved mount: 6G equipment is not defined yet.",
    ] },
  },
  baseband: {
    es: { name: "Banda base", by: [
      "Gabinete: banda base y radios. La señal de RF sale de aquí por coaxial.",
      "Gabinete: banda base y radios. La señal de RF sale de aquí por coaxial.",
      "Gabinete: la banda base procesa la señal digital y habla con la radio del mástil por fibra.",
      "Gabinete: la banda base procesa la señal digital y habla con la AAU por fibra.",
      "Gabinete: la arquitectura 6G aún está en estudio.",
    ] },
    en: { name: "Baseband", by: [
      "Cabinet: baseband and radios. RF leaves here over coax.",
      "Cabinet: baseband and radios. RF leaves here over coax.",
      "Cabinet: the baseband processes the digital signal and talks to the mast radio over fibre.",
      "Cabinet: the baseband processes the digital signal and talks to the AAU over fibre.",
      "Cabinet: the 6G architecture is still being studied.",
    ] },
  },
  phone: {
    es: { name: "Teléfono", by: Array(5).fill("Teléfono: la MS en la terminología GSM, el UE desde UMTS.") },
    en: { name: "Phone", by: Array(5).fill("Phone: the MS in GSM terms, the UE from UMTS on.") },
  },
  beam: {
    es: { name: "Haz", by: ["", "", "", "Haz: el arreglo ajusta la fase de cada elemento para apuntar la energía al teléfono.", "Haz punteado: visión, no especificación."] },
    en: { name: "Beam", by: ["", "", "", "Beam: the array sets each element's phase to point the energy at the phone.", "Dotted beam: a vision, not a specification."] },
  },
};

export const UI = {
  es: { fig: "Fig 1", title: "Mástil celular, de 2G a 6G", hint: "Arrastre, flechas o toque una etiqueta", slider: "Generación de red móvil. Use las flechas para cambiar.", gens: "Generaciones" },
  en: { fig: "Fig 1", title: "Cell site, 2G to 6G", hint: "Drag, arrow keys or tap a label", slider: "Mobile network generation. Use the arrow keys to change it.", gens: "Generations" },
};

export function langOf() {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "es" || q === "en") return q;
  } catch (e) { /* ignore */ }
  try {
    const l = localStorage.getItem("bk-lang");
    if (l === "es" || l === "en") return l;
  } catch (e) { /* ignore */ }
  const h = (document.documentElement.lang || "").slice(0, 2);
  return h === "en" ? "en" : "es";
}
