// Words for the 5G core and RAN scale model, ES and EN.
// Every definition, interface and procedure step below comes from 3GPP specifications fetched on 2026-10-30
// from https://www.3gpp.org/ftp/Specs/archive/ (the 3GPP archive):
//   [501] TS 23.501 V20.3.0 (2026-09), System architecture for the 5G System.
//   [502] TS 23.502 V20.3.0 (2026-09), Procedures for the 5G System.
//   [300] TS 38.300 V19.4.0 (2026-09), NR and NG-RAN overall description.
//   [401] TS 38.401 V19.3.0 (2026-06), NG-RAN architecture description.
// Each entry names its source clause in a comment. Simplified for a course, never extended beyond the text.

export const SRC = {
  "501": "3GPP TS 23.501 V20.3.0",
  "502": "3GPP TS 23.502 V20.3.0",
  "300": "3GPP TS 38.300 V19.4.0",
  "401": "3GPP TS 38.401 V19.3.0",
};

// Network functions and nodes. `plane`: cp (control), up (user), ran, ue, dn.
export const NF = {
  // [501] 6.2.1: termination of N2 and of NAS (N1) with ciphering and integrity; registration, connection,
  // reachability and mobility management; transport for SM messages between UE and SMF; access authentication.
  amf: { name: "AMF", plane: "cp", ref: "501 · 6.2.1",
    es: { full: "Función de gestión de acceso y movilidad", text: "Lleva el registro, la conexión y la movilidad de cada teléfono. Termina el N2 que llega de la RAN y la señalización NAS (N1), con su cifrado e integridad, y transporta los mensajes de sesión entre el UE y la SMF." },
    en: { full: "Access and Mobility Management Function", text: "Handles registration, connection and mobility for every phone. It terminates N2 from the RAN and NAS signalling (N1), with its ciphering and integrity, and carries session messages between the UE and the SMF." } },
  // [501] 6.2.2: session establishment, modify and release incl. tunnel between UPF and AN node; UE IP address
  // allocation; selection and control of the UP function; termination of interfaces towards policy control.
  smf: { name: "SMF", plane: "cp", ref: "501 · 6.2.2",
    es: { full: "Función de gestión de sesiones", text: "Crea, modifica y libera las sesiones PDU, incluido el túnel entre la UPF y el gNB. Asigna la dirección IP del UE y elige y controla la UPF por N4." },
    en: { full: "Session Management Function", text: "Establishes, modifies and releases PDU sessions, including the tunnel between the UPF and the gNB. It allocates the UE's IP address and selects and controls the UPF over N4." } },
  // [501] 6.2.3: anchor point for mobility; external PDU session point of interconnect to the DN; packet routing
  // and forwarding; user plane part of policy rule enforcement; QoS handling; "end marker" to the source NG-RAN node.
  upf: { name: "UPF", plane: "up", ref: "501 · 6.2.3",
    es: { full: "Función de plano de usuario", text: "Enruta y reenvía los paquetes del usuario. Es el punto de interconexión con la red de datos y el ancla de la movilidad, y aplica la parte de plano de usuario de las políticas y del QoS." },
    en: { full: "User Plane Function", text: "Routes and forwards the user's packets. It is the point of interconnect to the data network and the anchor for mobility, and it enforces the user-plane part of policy and QoS." } },
  // [501] 6.2.8: supports authentication for 3GPP access. [502] 4.2.2.2.2 step 9a: the AUSF executes authentication
  // of the UE and gets the authentication data from UDM.
  ausf: { name: "AUSF", plane: "cp", ref: "501 · 6.2.8",
    es: { full: "Función de servidor de autenticación", text: "Autentica al teléfono para el acceso 3GPP. Cuando la AMF se lo pide, ejecuta la autenticación y obtiene los datos de autenticación de la UDM." },
    en: { full: "Authentication Server Function", text: "Authenticates the phone for 3GPP access. When the AMF asks, it runs the authentication and gets the authentication data from the UDM." } },
  // [501] 6.2.7: generation of 3GPP AKA authentication credentials; user identification handling (SUPI); SUCI
  // de-concealment; subscription management; storing the serving AMF and SMF for the UE.
  udm: { name: "UDM", plane: "cp", ref: "501 · 6.2.7",
    es: { full: "Gestión unificada de datos", text: "Genera las credenciales de autenticación 3GPP AKA y maneja la identidad del suscriptor (SUPI) y su suscripción. También guarda qué AMF y qué SMF sirven a cada teléfono." },
    en: { full: "Unified Data Management", text: "Generates the 3GPP AKA authentication credentials and handles the subscriber's identity (SUPI) and subscription. It also stores which AMF and which SMF serve each phone." } },
  // [501] 6.2.4: unified policy framework; provides policy rules to control plane functions to enforce them;
  // accesses subscription information relevant for policy decisions in the UDR.
  pcf: { name: "PCF", plane: "cp", ref: "501 · 6.2.4",
    es: { full: "Función de control de políticas", text: "Es el marco unificado de políticas: entrega reglas a las funciones del plano de control para que las apliquen, apoyada en la suscripción guardada en el UDR." },
    en: { full: "Policy Control Function", text: "The unified policy framework: it hands policy rules to the control-plane functions to enforce, based on subscription data in the UDR." } },
  // [501] 6.2.6.1: service discovery function; maintains the NF profile of available NF instances and their services.
  nrf: { name: "NRF", plane: "cp", ref: "501 · 6.2.6",
    es: { full: "Función de repositorio de red", text: "Es el directorio del núcleo: guarda el perfil de cada NF disponible y de sus servicios, y responde las solicitudes de descubrimiento." },
    en: { full: "Network Repository Function", text: "The core's directory: it keeps the profile of every available NF and its services, and answers discovery requests." } },
  // [501] 6.2.14: selecting the set of network slice instances serving the UE; determining the Allowed NSSAI;
  // determining the AMF Set to be used to serve the UE.
  nssf: { name: "NSSF", plane: "cp", ref: "501 · 6.2.14",
    es: { full: "Función de selección de slices de red", text: "Elige las instancias de slice de red que sirven al teléfono, determina el NSSAI permitido y el conjunto de AMF que debe atenderlo." },
    en: { full: "Network Slice Selection Function", text: "Selects the network slice instances that serve the phone, determines the Allowed NSSAI and the AMF Set that should serve it." } },
  // [501] 4.2.2: Data Network (DN), e.g. operator services, Internet access or 3rd party services.
  // [501] 3.1: PDU Session, association between the UE and a Data Network that provides a PDU connectivity service.
  dn: { name: "DN", plane: "dn", ref: "501 · 4.2.2, 3.1",
    es: { full: "Red de datos", text: "Servicios del operador, acceso a Internet o servicios de terceros. Una sesión PDU es la asociación entre el teléfono y una red de datos." },
    en: { full: "Data Network", text: "Operator services, Internet access or third-party services. A PDU session is the association between the phone and a data network." } },
  // [300] 4.1: a gNB provides NR user plane and control plane protocol terminations towards the UE; gNBs are
  // interconnected by Xn and connected by NG to the AMF (NG-C) and UPF (NG-U). [300] 4.2: radio resource management,
  // scheduling, routing of user plane data towards UPF and of control plane information towards AMF.
  // [401] 6.1.1: a gNB may consist of a gNB-CU and one or more gNB-DUs, connected via F1.
  gnb: { name: "gNB", plane: "ran", ref: "300 · 4.1, 4.2; 401 · 6.1.1",
    es: { full: "Estación base 5G (NG-RAN)", text: "Termina los protocolos de NR, de usuario y de control, hacia el teléfono, y reparte los recursos de radio. Envía el control a la AMF y los datos a la UPF. Puede dividirse en un gNB-CU y varios gNB-DU unidos por F1." },
    en: { full: "5G base station (NG-RAN)", text: "Terminates the NR user-plane and control-plane protocols towards the phone and shares out the radio resources. It routes control to the AMF and data to the UPF. It can be split into a gNB-CU and gNB-DUs joined by F1." } },
  // [501] 4.2.7: N1 is the reference point between the UE and the AMF. [401] 5.2: Uu is the radio interface.
  ue: { name: "UE", plane: "ue", ref: "501 · 4.2.7; 401 · 5.2",
    es: { full: "Equipo de usuario: el teléfono", text: "Habla con el gNB por la radio (Uu) y con la AMF por NAS (N1). Uno de los teléfonos recorre la vía y cambia de estación base." },
    en: { full: "User Equipment: the phone", text: "Talks to the gNB over the radio (Uu) and to the AMF over NAS (N1). One of the phones drives down the road and changes base station." } },
};

// Interfaces (reference points). `plane`: cp, up, n1 (logical) or sbi.
export const IF = {
  // [401] 5.2, 5.3: protocols on the Uu and NG interfaces (user and control plane).
  // [300] 4.4.2: RRC is terminated in the gNB on the network side.
  uu: { name: "Uu", plane: "radio", ref: "401 · 5.2, 5.3; 300 · 4.4.2",
    es: { full: "Interfaz de radio UE–gNB", text: "La radio entre el teléfono y el gNB. Lleva el plano de control (RRC) y los datos del usuario." },
    en: { full: "UE–gNB radio interface", text: "The radio link between the phone and the gNB. It carries the control plane (RRC) and the user's data." } },
  // [501] 4.2.7: N1 between the UE and the AMF. [502] 4.2.2.2.2 steps 1 and 3: the Registration Request travels in
  // an AN message to the (R)AN, then in an N2 message to the AMF.
  n1: { name: "N1", plane: "n1", ref: "501 · 4.2.7; 502 · 4.2.2.2.2",
    es: { full: "UE–AMF (NAS)", text: "Punto de referencia lógico entre el teléfono y la AMF para la señalización NAS. No tiene cable propio: viaja dentro de Uu y de N2." },
    en: { full: "UE–AMF (NAS)", text: "Logical reference point between the phone and the AMF for NAS signalling. It has no wire of its own: it rides inside Uu and N2." } },
  // [501] 4.2.7: N2 between the (R)AN and the AMF. [300] 4.1: NG-C.
  n2: { name: "N2", plane: "cp", ref: "501 · 4.2.7; 300 · 4.1",
    es: { full: "gNB–AMF (NG-C)", text: "Plano de control entre la RAN y la AMF. Por aquí pasan el registro, las sesiones y el cambio de ruta en un handover." },
    en: { full: "gNB–AMF (NG-C)", text: "Control plane between the RAN and the AMF. Registration, sessions and the handover path switch go this way." } },
  // [501] 4.2.7: N3 between the (R)AN and the UPF. [300] 4.1: NG-U. [501] 5.8.2.10: per PDU Session tunnelling on N3.
  n3: { name: "N3", plane: "up", ref: "501 · 4.2.7, 5.8.2.10; 300 · 4.1",
    es: { full: "gNB–UPF (NG-U)", text: "Plano de usuario entre la RAN y la UPF, con un túnel por sesión PDU." },
    en: { full: "gNB–UPF (NG-U)", text: "User plane between the RAN and the UPF, with one tunnel per PDU session." } },
  // [501] 4.2.7: N4 between the SMF and the UPF. [502] 4.3.2.2.1 step 10a: packet detection, enforcement and reporting rules.
  n4: { name: "N4", plane: "cp", ref: "501 · 4.2.7; 502 · 4.3.2.2.1",
    es: { full: "SMF–UPF", text: "La SMF controla la UPF: le instala las reglas de detección, aplicación y reporte de paquetes de cada sesión." },
    en: { full: "SMF–UPF", text: "The SMF controls the UPF: it installs each session's packet detection, enforcement and reporting rules." } },
  // [501] 4.2.7: N6 between the UPF and a Data Network.
  n6: { name: "N6", plane: "up", ref: "501 · 4.2.7",
    es: { full: "UPF–red de datos", text: "La salida del plano de usuario hacia la red de datos, por ejemplo Internet." },
    en: { full: "UPF–data network", text: "Where the user plane leaves for the data network, for example the Internet." } },
  // [300] 4.1, 4.3.2: Xn between NG-RAN nodes; Xn-C UE mobility management incl. context transfer; Xn-U data forwarding.
  xn: { name: "Xn", plane: "cp", ref: "300 · 4.1, 4.3.2",
    es: { full: "gNB–gNB", text: "Une las estaciones base entre sí. Xn-C lleva la movilidad (transferencia de contexto) y Xn-U reenvía datos durante el handover." },
    en: { full: "gNB–gNB", text: "Joins base stations to each other. Xn-C carries mobility (context transfer) and Xn-U forwards data during handover." } },
  // [501] 4.2.6: each NF exhibits a service-based interface (Namf, Nsmf, Nausf, Nudm, Npcf, Nnrf, Nnssf, ...).
  sbi: { name: "SBI", plane: "sbi", ref: "501 · 4.2.6",
    es: { full: "Interfaces basadas en servicios", text: "Cada función del plano de control expone sus servicios (Namf, Nsmf, Nausf, Nudm, Npcf, Nnrf, Nnssf) y las demás los consumen. La UPF se une a la SMF por N4." },
    en: { full: "Service-based interfaces", text: "Each control-plane function exposes its services (Namf, Nsmf, Nausf, Nudm, Npcf, Nnrf, Nnssf) and the others consume them. The UPF is joined to the SMF by N4." } },
};

// A hop is [interface, from, to]. Node names: ue, g0, g1, g2 (gNB1..3), s (source gNB), t (target gNB) and the NFs.
// `rt` sends a reply back along the same path. `n1` marks NAS (logical N1) riding inside Uu and N2.
export const CHAPTERS = [
  {
    id: "overview", chip: { es: "Mapa", en: "Map" }, ref: "501 · 4.2.3, 4.2.7; 300 · 4.1",
    es: { title: "RAN y núcleo", sub: "NG-RAN + 5GC", idea: "La RAN lleva la radio hasta el teléfono; el núcleo decide quién entra, qué sesión tiene y por dónde salen sus datos." },
    en: { title: "RAN and core", sub: "NG-RAN + 5GC", idea: "The RAN brings the radio to the phone; the core decides who gets in, which session they have and where their data leaves." },
    steps: [
      // [300] 4.1: gNBs interconnected by Xn; [401] 5.2: Uu.
      { lit: ["gnb", "ue", "xn", "uu"], es: "NG-RAN: tres gNB unidos por Xn; los teléfonos llegan por Uu.", en: "NG-RAN: three gNBs joined by Xn; phones reach them over Uu." },
      // [300] 4.1: NG-C to the AMF and NG-U to the UPF; [501] 4.2.7.
      { lit: ["n2", "n3", "amf", "upf", "gnb"], es: "NG: N2 (control) va a la AMF y N3 (usuario) a la UPF.", en: "NG: N2 (control) goes to the AMF and N3 (user) to the UPF." },
      // [501] 4.2.6.
      { lit: ["sbi", "amf", "smf", "ausf", "udm", "pcf", "nrf", "nssf"], es: "Núcleo, plano de control: siete funciones sobre la SBI.", en: "Core control plane: seven functions on the SBI." },
      // [501] 4.2.7: N4, N6.
      { lit: ["upf", "n4", "n6", "dn", "smf"], es: "Núcleo, plano de usuario: la UPF, guiada por N4, sale a la red de datos por N6.", en: "Core user plane: the UPF, steered over N4, reaches the data network over N6." },
    ],
  },
  {
    id: "registration", chip: { es: "Registro", en: "Registration" }, ref: "502 · 4.2.2.2.2",
    es: { title: "Registro", sub: "UE → AMF · AUSF · UDM", idea: "Antes de usar la red, el teléfono se registra en la AMF y demuestra quién es." },
    en: { title: "Registration", sub: "UE → AMF · AUSF · UDM", idea: "Before using the network, the phone registers with the AMF and proves who it is." },
    steps: [
      // [502] 4.2.2.2.2 steps 1-3 (step 2: the (R)AN selects an AMF).
      { hops: [["uu", "ue", "g0"], ["n2", "g0", "amf"]], n1: true, es: "Registration Request: UE → gNB → AMF; el gNB elige la AMF.", en: "Registration Request: UE → gNB → AMF; the gNB selects the AMF.", ref: "1–3" },
      // [502] steps 8, 9a.
      { hops: [["sbi", "amf", "ausf"]], es: "La AMF pide la autenticación a la AUSF.", en: "The AMF asks the AUSF to authenticate.", ref: "8, 9a" },
      // [502] step 9a: the AUSF gets the authentication data from UDM.
      { hops: [["sbi", "ausf", "udm"]], rt: true, es: "La AUSF obtiene los datos de autenticación de la UDM.", en: "The AUSF gets the authentication data from the UDM.", ref: "9a" },
      // [502] steps 9a, 9b (authentication and NAS security per TS 33.501).
      { hops: [["n2", "amf", "g0"], ["uu", "g0", "ue"]], n1: true, rt: true, es: "Autenticación y seguridad NAS con el teléfono.", en: "Authentication and NAS security with the phone.", ref: "9a, 9b" },
      // [502] steps 14a-c: Nudm_UECM_Registration and Nudm_SDM_Get.
      { hops: [["sbi", "amf", "udm"]], rt: true, es: "AMF → UDM: se registra como AMF del UE y trae la suscripción.", en: "AMF → UDM: registers as the UE's AMF and fetches the subscription.", ref: "14a–c" },
      // [502] step 21: Registration Accept (5G-GUTI, Allowed NSSAI, ...).
      { hops: [["n2", "amf", "g0"], ["uu", "g0", "ue"]], n1: true, es: "Registration Accept: 5G-GUTI y NSSAI permitido.", en: "Registration Accept: 5G-GUTI and Allowed NSSAI.", ref: "21" },
      // [502] step 22.
      { hops: [["uu", "ue", "g0"], ["n2", "g0", "amf"]], n1: true, es: "Registration Complete.", en: "Registration Complete.", ref: "22" },
    ],
  },
  {
    id: "pdu", chip: { es: "Sesión PDU", en: "PDU session" }, ref: "502 · 4.3.2.2.1",
    es: { title: "Sesión PDU", sub: "PDU Session Establishment", idea: "La SMF arma la sesión: elige una UPF por N4 y une el túnel N3 del gNB con la salida N6." },
    en: { title: "PDU session", sub: "PDU Session Establishment", idea: "The SMF builds the session: it selects a UPF over N4 and joins the gNB's N3 tunnel to the N6 exit." },
    steps: [
      // [502] 4.3.2.2.1 step 1.
      { hops: [["uu", "ue", "g0"], ["n2", "g0", "amf"]], n1: true, es: "PDU Session Establishment Request (NAS).", en: "PDU Session Establishment Request (NAS).", ref: "1" },
      // [502] step 3; SMF selection per [501] 6.3.2.
      { hops: [["sbi", "amf", "smf"]], es: "La AMF elige una SMF: Nsmf_PDUSession_CreateSMContext.", en: "The AMF selects an SMF: Nsmf_PDUSession_CreateSMContext.", ref: "3" },
      // [502] step 4: Nudm_SDM_Get for Session Management Subscription data.
      { hops: [["sbi", "smf", "udm"]], rt: true, es: "SMF → UDM: suscripción de la sesión (Nudm_SDM_Get).", en: "SMF → UDM: session subscription (Nudm_SDM_Get).", ref: "4" },
      // [502] steps 7a, 7b.
      { hops: [["sbi", "smf", "pcf"]], rt: true, es: "SMF → PCF: asociación de política SM.", en: "SMF → PCF: SM Policy Association.", ref: "7a, 7b" },
      // [502] steps 8, 10a, 10b.
      { hops: [["n4", "smf", "upf"]], rt: true, es: "La SMF elige la UPF: N4 Session Establishment.", en: "The SMF selects the UPF: N4 Session Establishment.", ref: "8, 10a, 10b" },
      // [502] step 11.
      { hops: [["sbi", "smf", "amf"]], es: "SMF → AMF: Namf_Communication_N1N2MessageTransfer.", en: "SMF → AMF: Namf_Communication_N1N2MessageTransfer.", ref: "11" },
      // [502] steps 12, 13.
      { hops: [["n2", "amf", "g0"], ["uu", "g0", "ue"]], n1: true, es: "N2 PDU Session Request; el gNB prepara la radio y entrega el Accept.", en: "N2 PDU Session Request; the gNB sets up the radio and delivers the Accept.", ref: "12, 13" },
      // [502] steps 14, 15: N2 PDU Session Response with AN Tunnel Info; Nsmf_PDUSession_UpdateSMContext.
      { hops: [["n2", "g0", "amf"], ["sbi", "amf", "smf"]], es: "gNB → AMF → SMF: el extremo del túnel en el gNB.", en: "gNB → AMF → SMF: the tunnel endpoint at the gNB.", ref: "14, 15" },
      // [502] step 16a: N4 Session Modification with AN Tunnel Info.
      { hops: [["n4", "smf", "upf"]], rt: true, es: "SMF → UPF: N4 Session Modification con el túnel del gNB.", en: "SMF → UPF: N4 Session Modification with the gNB tunnel.", ref: "16a, 16b" },
      // [501] 4.2.7 N3, N6; [501] 5.8.2.10 per-session tunnel.
      { up: true, lit: ["n3", "n6", "upf", "dn"], es: "Datos: red de datos ⇄ UPF ⇄ túnel N3 ⇄ gNB ⇄ teléfono.", en: "Data: data network ⇄ UPF ⇄ N3 tunnel ⇄ gNB ⇄ phone.", ref: "N3, N6" },
    ],
  },
  {
    id: "handover", chip: { es: "Handover", en: "Handover" }, ref: "300 · 9.2.3.2.1; 502 · 4.9.1.2.2",
    es: { title: "Handover por Xn", sub: "gNB1 → gNB2 → gNB3", idea: "El gNB origen prepara al destino por Xn; luego el destino pide a la AMF mover el túnel N3 hacia él." },
    en: { title: "Xn handover", sub: "gNB1 → gNB2 → gNB3", idea: "The source gNB prepares the target over Xn; then the target asks the AMF to move the N3 tunnel to it." },
    note: { es: "El handover por Xn solo ocurre dentro de la misma AMF.", en: "Xn handover only happens within the same AMF." }, // [502] 4.9.1.2.1
    steps: [
      // [300] 9.2.3.2.1 steps 1-2.
      { hops: [["uu", "ue", "s"]], es: "Measurement Report: el teléfono mide y reporta.", en: "Measurement Report: the phone measures and reports.", ref: "300: 1, 2" },
      // [300] step 3.
      { hops: [["xn", "s", "t"]], es: "Handover Request por Xn al gNB destino.", en: "Handover Request over Xn to the target gNB.", ref: "300: 3" },
      // [300] steps 4-5.
      { hops: [["xn", "t", "s"]], es: "Handover Request Acknowledge: el destino acepta.", en: "Handover Request Acknowledge: the target accepts.", ref: "300: 4, 5" },
      // [300] step 6: RRCReconfiguration triggers the Uu handover.
      { hops: [["uu", "s", "ue"]], es: "Comando de handover (RRCReconfiguration).", en: "Handover command (RRCReconfiguration).", ref: "300: 6" },
      // [300] step 8.
      { hops: [["uu", "ue", "t"]], switch: "radio", es: "RRCReconfigurationComplete al gNB destino.", en: "RRCReconfigurationComplete to the target gNB.", ref: "300: 8" },
      // [300] step 9; [502] 4.9.1.2.2 step 1b.
      { hops: [["n2", "t", "amf"]], es: "N2 Path Switch Request a la AMF.", en: "N2 Path Switch Request to the AMF.", ref: "502: 1b" },
      // [502] step 2.
      { hops: [["sbi", "amf", "smf"]], es: "AMF → SMF: Nsmf_PDUSession_UpdateSMContext.", en: "AMF → SMF: Nsmf_PDUSession_UpdateSMContext.", ref: "502: 2" },
      // [502] steps 3-4: N4 Session Modification Request (AN Tunnel Info) and Response.
      { hops: [["n4", "smf", "upf"]], rt: true, es: "SMF → UPF: N4 Session Modification con el nuevo túnel.", en: "SMF → UPF: N4 Session Modification with the new tunnel.", ref: "502: 3, 4" },
      // [502] step 5; [300] step 10: end marker on the old path, then downlink to the target.
      { hops: [["n3", "upf", "s"]], switch: "tunnel", es: "End marker al gNB origen; el túnel N3 pasa al destino.", en: "End marker to the source gNB; the N3 tunnel moves to the target.", ref: "502: 5" },
      // [502] steps 6-7.
      { hops: [["sbi", "smf", "amf"], ["n2", "amf", "t"]], es: "Path Switch Request Acknowledge al gNB destino.", en: "Path Switch Request Acknowledge to the target gNB.", ref: "502: 6, 7" },
      // [300] step 12; [502] step 8.
      { hops: [["xn", "t", "s"]], es: "UE Context Release: el origen libera sus recursos.", en: "UE Context Release: the source frees its resources.", ref: "300: 12" },
    ],
  },
  {
    id: "policy", chip: { es: "Política", en: "Policy" }, ref: "502 · 4.17; 501 · 6.2.4, 6.2.14, 5.15.2.1",
    es: { title: "Política y slices", sub: "PCF · NSSF · NRF", idea: "La NRF dice quién ofrece cada servicio, la NSSF elige el slice y la PCF fija las reglas." },
    en: { title: "Policy and slices", sub: "PCF · NSSF · NRF", idea: "The NRF says who offers each service, the NSSF picks the slice and the PCF sets the rules." },
    // [501] 5.15.2.1: an S-NSSAI identifies a network slice: SST plus an optional SD.
    note: { es: "Un S-NSSAI identifica un slice: SST (tipo) y, opcional, SD (diferenciador).", en: "An S-NSSAI identifies a slice: SST (type) and an optional SD (differentiator)." },
    steps: [
      // [502] 4.17.1.
      { hops: [["sbi", "smf", "nrf"]], rt: true, es: "NFRegister: cada NF publica su perfil en la NRF.", en: "NFRegister: each NF publishes its profile in the NRF.", ref: "4.17.1" },
      // [502] 4.17.4 steps 1-3; [501] 6.3.4: the AMF uses the NRF to discover the AUSF.
      { hops: [["sbi", "amf", "nrf"]], rt: true, es: "NFDiscovery: la AMF pregunta a la NRF por una AUSF.", en: "NFDiscovery: the AMF asks the NRF for an AUSF.", ref: "4.17.4" },
      // [502] 4.2.2.2.3 step 4a (conditional); [501] 6.2.14.
      { hops: [["sbi", "amf", "nssf"]], rt: true, es: "Si hace falta, la NSSF elige el slice (Nnssf_NSSelection_Get).", en: "When needed, the NSSF picks the slice (Nnssf_NSSelection_Get).", ref: "4.2.2.2.3: 4a" },
      // [502] 4.2.2.2.2 step 16.
      { hops: [["sbi", "amf", "pcf"]], rt: true, es: "AMF ⇄ PCF: asociación de política AM.", en: "AMF ⇄ PCF: AM Policy Association.", ref: "4.2.2.2.2: 16" },
      // [502] 4.3.2.2.1 step 7b.
      { hops: [["sbi", "smf", "pcf"]], rt: true, es: "SMF ⇄ PCF: asociación de política SM y reglas PCC.", en: "SMF ⇄ PCF: SM Policy Association and PCC rules.", ref: "4.3.2.2.1: 7b" },
      // [502] 4.3.2.2.1 step 10a; [501] 6.2.3 user plane part of policy enforcement.
      { hops: [["n4", "smf", "upf"]], es: "SMF → UPF: reglas de detección, aplicación y reporte.", en: "SMF → UPF: detection, enforcement and reporting rules.", ref: "4.3.2.2.1: 10a" },
    ],
  },
  {
    id: "functions", chip: { es: "Funciones", en: "Functions" }, ref: "501 · 6.2; 300 · 4.1",
    es: { title: "Cada función", sub: "Toque una pieza", idea: "Toque una función o una interfaz, en el modelo o en los botones, para ver qué hace." },
    en: { title: "Every function", sub: "Tap a part", idea: "Tap a function or an interface, on the model or on the buttons, to see what it does." },
    tour: ["ue", "gnb", "uu", "xn", "n2", "n3", "amf", "ausf", "udm", "smf", "n4", "upf", "n6", "dn", "pcf", "nssf", "nrf", "sbi", "n1"],
    steps: [],
  },
];

export const UI = {
  es: {
    course: "Núcleo 5G y RAN", chapter: (i, n) => `Capítulo ${i} de ${n}`, steps: "Pasos", source: "Fuente",
    fig: "Fig 2", figTitle: "Sistema 5G a escala", hint: "Toque una función o interfaz", tap: "Toque una función o una interfaz para ver qué hace.",
    nfs: "Funciones", ifs: "Interfaces", step: "Paso", serving: "sirve",
    legend: { cp: "Plano de control", up: "Plano de usuario", n1: "N1 lógico (NAS)", radio: "Radio (Uu)" },
    sr: "Figura interactiva del sistema 5G. Flechas: paso anterior o siguiente. Tab: funciones e interfaces.",
    label: "Modelo a escala de un sistema 5G: tres estaciones base junto a una vía con teléfonos, y el núcleo 5G con sus funciones sobre una barra de servicios.",
  },
  en: {
    course: "5G core and RAN", chapter: (i, n) => `Chapter ${i} of ${n}`, steps: "Steps", source: "Source",
    fig: "Fig 2", figTitle: "5G system, scale model", hint: "Tap a function or interface", tap: "Tap a function or an interface to see what it does.",
    nfs: "Functions", ifs: "Interfaces", step: "Step", serving: "serves",
    legend: { cp: "Control plane", up: "User plane", n1: "Logical N1 (NAS)", radio: "Radio (Uu)" },
    sr: "Interactive 5G system figure. Arrow keys: previous or next step. Tab: functions and interfaces.",
    label: "Scale model of a 5G system: three base stations beside a road with phones, and the 5G core with its functions on a service bus.",
  },
};

export const srcLine = (ref) => ref.split("; ").map((r) => { const [n, c] = r.split(" · "); return `${SRC[n] || n}, ${c}`; }).join("; ");
