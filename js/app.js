const { useState, useEffect, useRef, useCallback, useMemo } = React;
function Icon({ name, size = 20, color = "currentColor", strokeWidth = 1.5 }) {
  const paths = {
    // Products
    satellite: "M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3zM13 13l6 6",
    broadcast: "M2 12a10 10 0 0020 0M5 12a7 7 0 0014 0M8 12a4 4 0 008 0M12 12h.01",
    globe: "M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20",
    orbit: "M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M12 2a10 10 0 0110 10M12 22a10 10 0 01-10-10",
    // Technology pillars
    layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    radio: "M4.9 4.9a10 10 0 0114.2 0M7.7 7.7a6 6 0 018.5 0M10.5 10.5a2 2 0 012.9 0M12 12h.01",
    cpu: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
    barchart: "M12 20V10M18 20V4M6 20v-4",
    // Mission
    mappin: "M12 21s-8-7.3-8-13a8 8 0 0116 0c0 5.7-8 13-8 13zM12 8a3 3 0 100 6 3 3 0 000-6z",
    lightbulb: "M9 18h6M10 22h4M12 2a7 7 0 017 7 7 7 0 01-4.24 6.38A2 2 0 0113 17h-2a2 2 0 01-1.76-1.62A7 7 0 015 9a7 7 0 017-7z",
    bookopen: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
    // Speaking events
    k8s: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    university: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10",
    refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    bot: "M12 8V4H8M8 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2h-4M8 8h8M12 4h4v4"
  };
  const d = paths[name] || paths.k8s;
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: { display: "inline-block", flexShrink: 0 }
  }, React.createElement("path", { d }));
}
function useIntersection(ref, options = { threshold: 0.1 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      options
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}
function useTheme() {
  const getInitial = () => {
    try {
      const stored = localStorage.getItem("beanters-theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {
    }
    return "dark";
  };
  const [theme, setTheme] = useState(getInitial);
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("beanters-theme", theme);
    } catch (e) {
    }
  }, [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => t === "dark" ? "light" : "dark");
  }, []);
  return [theme, setTheme, toggle];
}
function AuroraField({ blobs }) {
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0
  } }, blobs.map((b, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      className: "aurora-blob",
      style: {
        background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, transparent 65%)`,
        width: b.size,
        height: b.size,
        top: b.top,
        left: b.left,
        right: b.right,
        bottom: b.bottom,
        animation: `${b.anim || "float"} ${b.duration || "14s"} ease-in-out infinite`,
        animationDelay: b.delay || "0s"
      }
    }
  )));
}
function Sparkle({ size = 14, color = "currentColor", style = {} }) {
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style,
      "aria-hidden": "true"
    },
    /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M12 0 L13.5 9 Q14 11 16 11.5 L24 12 L16 12.5 Q14 13 13.5 15 L12 24 L10.5 15 Q10 13 8 12.5 L0 12 L8 11.5 Q10 11 10.5 9 Z",
        fill: color
      }
    )
  );
}
function SparkleCluster({ children }) {
  return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" } }, children);
}
function FloatingSparkles({ items }) {
  return /* @__PURE__ */ React.createElement(SparkleCluster, null, items.map((s, i) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: i,
      style: {
        position: "absolute",
        top: s.top,
        left: s.left,
        right: s.right,
        bottom: s.bottom,
        color: s.color,
        opacity: s.opacity || 0.85,
        animation: `twinkle ${s.duration || "3s"} ease-in-out infinite`,
        animationDelay: s.delay || "0s",
        filter: s.glow ? `drop-shadow(0 0 8px ${s.color})` : "none"
      }
    },
    /* @__PURE__ */ React.createElement(Sparkle, { size: s.size || 14, color: s.color })
  )));
}
function BeantersLogo({ size = 1.25 }) {
  return /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: `${size}rem`,
    letterSpacing: "-0.025em",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.18em"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    background: "linear-gradient(135deg, var(--teal) 0%, var(--magenta) 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent"
  } }, "bean"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, "ters"));
}
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onToggle,
      "aria-label": `Switch to ${isDark ? "light" : "dark"} theme`,
      style: {
        position: "relative",
        width: "58px",
        height: "30px",
        borderRadius: "100px",
        background: isDark ? "linear-gradient(135deg, oklch(0.30 0.05 270), oklch(0.18 0.04 250))" : "linear-gradient(135deg, oklch(0.85 0.10 80), oklch(0.92 0.07 60))",
        border: "1px solid var(--border-strong)",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        transition: "background 0.4s ease",
        overflow: "hidden"
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      inset: 0,
      opacity: isDark ? 0.9 : 0,
      transition: "opacity 0.3s",
      pointerEvents: "none"
    } }, /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: "7px", left: "10px", color: "oklch(0.9 0.05 80)" } }, /* @__PURE__ */ React.createElement(Sparkle, { size: 6, color: "oklch(0.95 0.1 80)" })), /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: "14px", left: "22px", width: "2px", height: "2px", background: "white", borderRadius: "50%" } }), /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: "18px", left: "14px", width: "1.5px", height: "1.5px", background: "white", borderRadius: "50%" } })),
    /* @__PURE__ */ React.createElement("span", { style: {
      position: "absolute",
      top: "3px",
      left: isDark ? "3px" : "calc(100% - 27px)",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: isDark ? "radial-gradient(circle at 35% 30%, oklch(0.95 0.05 80) 0%, oklch(0.78 0.10 60) 70%)" : "radial-gradient(circle at 35% 30%, oklch(1 0 0) 0%, oklch(0.95 0.08 80) 80%)",
      boxShadow: isDark ? "0 0 8px oklch(0.85 0.10 60 / 0.5), inset -3px -3px 0 oklch(0.55 0.08 60)" : "0 0 12px oklch(0.85 0.16 80 / 0.6)",
      transition: "left 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s, box-shadow 0.3s"
    } })
  );
}
function PlaceholderLogo({ kind, name }) {
  const shapes = {
    university: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "16", r: "10", stroke: "currentColor", strokeWidth: "2", fill: "none" }), /* @__PURE__ */ React.createElement("path", { d: "M9 14 L14 11 L19 14 L14 17 Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("text", { x: "32", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "14", fontWeight: "600", fill: "currentColor", letterSpacing: "-0.02em" }, name)),
    telco: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("rect", { x: "6", y: "9", width: "14", height: "14", rx: "3", fill: "currentColor" }), /* @__PURE__ */ React.createElement("text", { x: "28", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "14", fontWeight: "700", fill: "currentColor", letterSpacing: "-0.02em" }, name)),
    gov: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M14 5 L24 11 L24 23 L4 23 L4 11 Z", stroke: "currentColor", strokeWidth: "2", fill: "none" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "14", x2: "8", y2: "20", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "14", y1: "14", x2: "14", y2: "20", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "20", y1: "14", x2: "20", y2: "20", stroke: "currentColor", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("text", { x: "32", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "11", fontWeight: "600", fill: "currentColor", letterSpacing: "0.02em" }, name)),
    research: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "16", r: "8", stroke: "currentColor", strokeWidth: "2", fill: "none" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "14", cy: "16", rx: "11", ry: "4", stroke: "currentColor", strokeWidth: "1.5", fill: "none" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "21", fontFamily: "'JetBrains Mono',monospace", fontSize: "11", fontWeight: "700", fill: "currentColor", letterSpacing: "0.04em" }, name)),
    industrial: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M4 23 L4 10 L11 14 L11 10 L18 14 L18 10 L25 14 L25 23 Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("text", { x: "32", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "14", fontWeight: "700", fill: "currentColor", letterSpacing: "-0.02em" }, name)),
    ngo: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M14 6 C18 6 22 9 22 14 C22 19 14 26 14 26 C14 26 6 19 6 14 C6 9 10 6 14 6 Z", stroke: "currentColor", strokeWidth: "2", fill: "none" }), /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "14", r: "2.5", fill: "currentColor" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "13", fontWeight: "600", fill: "currentColor", fontStyle: "italic" }, name)),
    satellite: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "16", r: "3.5", fill: "currentColor" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "14", cy: "16", rx: "10", ry: "3", stroke: "currentColor", strokeWidth: "1.5", fill: "none", transform: "rotate(-25 14 16)" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "14", cy: "16", rx: "10", ry: "3", stroke: "currentColor", strokeWidth: "1.5", fill: "none", transform: "rotate(25 14 16)" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "13", fontWeight: "700", fill: "currentColor", letterSpacing: "0.02em" }, name)),
    cloud: /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 120 32", width: "100%", height: "100%", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M8 20 C5 20 4 17 6 15 C5 12 8 9 11 11 C13 8 18 8 19 13 C24 12 24 18 21 20 Z", stroke: "currentColor", strokeWidth: "2", fill: "none" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: "21", fontFamily: "'Space Grotesk',sans-serif", fontSize: "14", fontWeight: "600", fill: "currentColor", letterSpacing: "-0.02em" }, name))
  };
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      style: {
        width: "100%",
        height: "36px",
        color: "var(--text-mid)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.75,
        transition: "opacity 0.3s, color 0.3s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.opacity = 1;
        e.currentTarget.style.color = "var(--text)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.opacity = 0.75;
        e.currentTarget.style.color = "var(--text-mid)";
      }
    },
    shapes[kind] || shapes.telco
  );
}
Object.assign(window, {
  useIntersection,
  useTheme,
  AuroraField,
  Sparkle,
  FloatingSparkles,
  BeantersLogo,
  ThemeToggle,
  PlaceholderLogo
});
function Nav({ theme, onThemeToggle }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { id: "products", label: "Products" },
    { id: "solutions", label: "Solutions" },
    { id: "tech", label: "Technology" },
    { id: "mission", label: "Mission" },
    { id: "speaking", label: "Speaking" },
    { href: "/courses/", label: "Courses & Training" },
    { id: "about", label: "About" }
  ];
  return /* @__PURE__ */ React.createElement("nav", { style: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: "0.85rem 1.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: scrolled ? "color-mix(in oklab, var(--bg) 80%, transparent)" : "transparent",
    backdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
    WebkitBackdropFilter: scrolled ? "blur(18px) saturate(140%)" : "none",
    borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
    transition: "all 0.35s ease"
  } }, /* @__PURE__ */ React.createElement("a", { href: "#hero", style: { textDecoration: "none", display: "flex", alignItems: "center" } }, /* @__PURE__ */ React.createElement(BeantersLogo, { size: 1.4 })), /* @__PURE__ */ React.createElement("div", { className: "desktop-only", style: { display: "flex", gap: "2.5rem", alignItems: "center" } }, links.map((l) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: l.label,
      href: l.href || `#${l.id}`,
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "0.92rem",
        fontWeight: 500,
        color: l.href ? "var(--teal)" : "var(--text-mid)",
        textDecoration: "none",
        transition: "color 0.2s",
        letterSpacing: "-0.005em"
      },
      onMouseEnter: (e) => e.target.style.color = "var(--text)",
      onMouseLeave: (e) => e.target.style.color = l.href ? "var(--teal)" : "var(--text-mid)"
    },
    l.label
  ))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.75rem", alignItems: "center" } }, /* @__PURE__ */ React.createElement(ThemeToggle, { theme, onToggle: onThemeToggle }), /* @__PURE__ */ React.createElement("a", { href: "#contact", className: "btn btn-primary", style: {
    fontSize: "0.88rem",
    padding: "0.6rem 1.25rem"
  } }, "Book demo", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.1em", lineHeight: 1 } }, "\u2192"))));
}
const CLI_LINES = [
  { type: "comment", text: "# Deploy a 5G SA private network with NB-IoT" },
  { type: "cmd", text: "ngntelco network deploy \\" },
  { type: "arg", text: "  --standard 5g-sa \\" },
  { type: "arg", text: "  --add-on nb-iot,lte-m \\" },
  { type: "arg", text: "  --orchestrator helm \\" },
  { type: "arg", text: "  --gnb-count 3" },
  { type: "blank", text: "" },
  { type: "ai", text: "\u25C6 AI: validating 3GPP R17 conformance..." },
  { type: "out", text: "\u2714 Rendering Helm chart manifests" },
  { type: "out", text: "\u2714 Deploying OAI-gNB \xD7 3 to cluster" },
  { type: "out", text: "\u2714 Attaching Open5GS core (AMF/SMF/UPF)" },
  { type: "out", text: "\u2714 Configuring NB-IoT & LTE-M bearers" },
  { type: "out", text: "\u2714 Observability: Grafana + Prometheus" },
  { type: "blank", text: "" },
  { type: "success", text: "\u25C9 Network ONLINE \u2014 3 gNBs active \u2502 0ms target" }
];
function CLIWindow({ animate: animate2 = true }) {
  const [shown, setShown] = useState(animate2 ? 0 : CLI_LINES.length);
  useEffect(() => {
    if (!animate2) {
      setShown(CLI_LINES.length);
      return;
    }
    setShown(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setShown(i);
      if (i >= CLI_LINES.length) clearInterval(iv);
    }, 220);
    return () => clearInterval(iv);
  }, [animate2]);
  const colorFor = {
    comment: "var(--text-dim)",
    cmd: "var(--teal)",
    arg: "var(--aqua)",
    out: "var(--text-mid)",
    ai: "var(--magenta)",
    blank: "transparent",
    success: "var(--gold)"
  };
  return /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--cli-bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card), 0 0 0 1px color-mix(in oklab, var(--teal) 22%, transparent), 0 30px 100px -40px color-mix(in oklab, var(--magenta) 60%, transparent)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    lineHeight: 1.75,
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 14px",
    background: "var(--cli-titlebar)",
    borderBottom: "1px solid var(--border)"
  } }, ["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: c
  } })), /* @__PURE__ */ React.createElement("span", { style: {
    marginLeft: "auto",
    color: "oklch(0.65 0.02 270)",
    fontSize: "0.66rem",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.04em"
  } }, "ngntelco v2.4.1 \xB7 beanters-ops")), /* @__PURE__ */ React.createElement("div", { style: { padding: "1.1rem 1.4rem", minHeight: "320px", color: "oklch(0.9 0 0)" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "oklch(0.55 0.02 270)", marginBottom: "0.55rem", fontSize: "0.68rem" } }, "\u276F ~ beanters-ops"), CLI_LINES.slice(0, shown).map((l, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { color: colorFor[l.type], whiteSpace: "pre" } }, l.type === "cmd" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "oklch(0.55 0.02 270)" } }, "$ "), l.text) : l.text || "\xA0")), shown < CLI_LINES.length && /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-block",
    width: "8px",
    height: "14px",
    background: "var(--teal)",
    animation: "blink 0.9s steps(1) infinite",
    verticalAlign: "middle",
    marginTop: "2px"
  } })));
}
function Hero() {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 350);
    return () => clearTimeout(t);
  }, []);
  return /* @__PURE__ */ React.createElement("section", { id: "hero", style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    padding: "8rem 2rem 5rem",
    position: "relative",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "color-mix(in oklab, var(--surface) 80%, transparent)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid var(--border-strong)",
    borderRadius: "100px",
    padding: "0.35rem 1rem",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.1em",
    color: "var(--text-mid)",
    marginBottom: "2rem",
    textTransform: "uppercase"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    display: "inline-block",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--teal)",
    flexShrink: 0
  } }), "AI-native orchestration \xB7 3GPP \xB7 open-source"), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: "4rem",
    alignItems: "center"
  }, className: "hero-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "clamp(3rem, 6vw, 5.5rem)",
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
    marginBottom: "1.5rem"
  } }, /* @__PURE__ */ React.createElement("span", { className: "gradient-text" }, "Brilliantly simple."), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text)" } }, "Built for "), /* @__PURE__ */ React.createElement("span", { style: {
    fontFamily: "var(--font-serif)",
    fontWeight: 400,
    fontStyle: "italic",
    letterSpacing: "-0.02em",
    color: "var(--text)"
  } }, "telco.")), /* @__PURE__ */ React.createElement("p", { style: {
    fontFamily: "var(--font-body)",
    fontSize: "clamp(1.05rem, 1.4vw, 1.2rem)",
    color: "var(--text-mid)",
    lineHeight: 1.55,
    marginBottom: "2.25rem",
    maxWidth: "540px"
  } }, "The AI-native orchestration platform for cellular networks.", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, " ngntelco"), " deploys 4G, 5G SA, NB-IoT, LTE-M, NTN, and 5G Broadcast on commodity hardware \u2014 with a single command."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "3rem" } }, /* @__PURE__ */ React.createElement("a", { href: "#contact", className: "btn btn-primary" }, "Book a demo", /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.1em" } }, "\u2192")), /* @__PURE__ */ React.createElement("a", { href: "#products", className: "btn btn-ghost" }, "Explore products")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "2.5rem", flexWrap: "wrap" } }, [
    { n: "8+", label: "Network standards" },
    { n: "4", label: "Orchestrators" },
    { n: "1-touch", label: "Deployment" }
  ].map((s) => /* @__PURE__ */ React.createElement("div", { key: s.n }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "1.6rem",
    letterSpacing: "-0.025em",
    background: "linear-gradient(135deg, var(--teal), var(--magenta))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent"
  } }, s.n), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--font-body)",
    fontSize: "0.78rem",
    color: "var(--text-dim)",
    marginTop: "0.2rem"
  } }, s.label))))), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement(CLIWindow, { animate: started })))), /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 860px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `));
}
function NetworksRibbon() {
  const nets = ["4G LTE", "5G SA", "5G NSA", "5G Broadcast", "NB-IoT", "LTE-M", "NTN", "MBS", "FWA", "TVWS", "OAI", "srsRAN", "Open5GS", "Magma"];
  return /* @__PURE__ */ React.createElement("div", { style: {
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-2)",
    padding: "1.1rem 0",
    overflow: "hidden",
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "120px",
    background: "linear-gradient(to right, var(--bg-2), transparent)",
    zIndex: 1,
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "120px",
    background: "linear-gradient(to left, var(--bg-2), transparent)",
    zIndex: 1,
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    gap: "3rem",
    alignItems: "center",
    animation: "slide 30s linear infinite",
    whiteSpace: "nowrap",
    width: "max-content"
  } }, [...nets, ...nets].map((n, i) => /* @__PURE__ */ React.createElement("span", { key: i, style: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    letterSpacing: "0.1em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "0.85rem"
  } }, /* @__PURE__ */ React.createElement("span", { style: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    background: "var(--teal)",
    display: "inline-block"
  } }), n))));
}
Object.assign(window, {
  Nav,
  Hero,
  CLIWindow,
  NetworksRibbon
});
function LogoWall() {
  const segments = [
    { icon: "university", label: "Universities & R&D Labs", desc: "Testbeds + research environments" },
    { icon: "layers", label: "Enterprise & Industry 4.0", desc: "Private 5G for factories & logistics" },
    { icon: "globe", label: "Governments & NGOs", desc: "Sovereign rural broadband" },
    { icon: "radio", label: "MVNOs & Telco Operators", desc: "GitOps-native network modernisation" }
  ];
  return /* @__PURE__ */ React.createElement("section", { style: { padding: "5rem 2rem 4rem", borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("p", { style: {
    textAlign: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "0.72rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "var(--text-mid)",
    marginBottom: "2.5rem"
  } }, "Currently in pilots across Colombia, Africa and Southeast Asia \u2014 case studies coming"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem" }, className: "logowall-grid" }, segments.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.label, style: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    padding: "1.5rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "color-mix(in oklab, var(--teal) 12%, transparent)",
    border: "1px solid color-mix(in oklab, var(--teal) 25%, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  } }, React.createElement(Icon, { name: s.icon, size: 18, color: "var(--teal)" })), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.85rem", color: "var(--text)" } }, s.label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-mid)", letterSpacing: "0.03em" } }, s.desc)))), /* @__PURE__ */ React.createElement("style", null, `@media(max-width:860px){.logowall-grid{grid-template-columns:repeat(2,1fr) !important}}`)));
}
const PRODUCTS = [
  {
    featured: true,
    icon: "\u26A1",
    name: "ngntelco CLI",
    tagline: "$ ngntelco network deploy --standard 5g-sa",
    desc: "Our flagship orchestration engine. One command deploys, upgrades, and monitors any 3GPP cellular network \u2014 across Docker Compose, Helm, Kustomize, or FluxCD pipelines. Zero vendor lock-in. Runs on x86, mini-PCs, or cloud VMs.",
    tags: ["Docker", "Helm", "Kustomize", "FluxCD", "Kubernetes", "Open5GS", "OAI", "srsRAN", "Magma"],
    accent: "teal"
  },
  {
    icon: "satellite",
    name: "5G SA & 4G LTE Private",
    tagline: "Industrial-grade private cellular",
    desc: "Standalone 5G or 4G LTE for enterprise campuses, factories, mines, and universities. Full core (AMF/SMF/UPF) + RAN. VoLTE, VoNR, SMS, Data, IPTV.",
    tags: ["5G SA", "4G LTE", "Open5GS", "OAI gNB", "USRP"],
    accent: "aqua"
  },
  {
    icon: "broadcast",
    name: "5G Terrestrial Broadcast",
    tagline: "Point-to-multipoint for media & alerts",
    desc: "Deliver TV, emergency alerts, and OTA firmware to millions of devices using 3GPP FeMBMS/5G MBS specs \u2014 no return channel required.",
    tags: ["5G MBS", "FeMBMS", "LTE Broadcast", "MBSFN"],
    accent: "magenta"
  },
  {
    icon: "globe",
    name: "NB-IoT & LTE-M",
    tagline: "Massive IoT at scale",
    desc: "Low-power wide-area networks for smart agriculture, asset tracking, and environmental monitoring. Deployable in parallel with existing 4G/5G.",
    tags: ["NB-IoT", "LTE-M", "Cat-M1", "PSM", "eDRX"],
    accent: "gold"
  },
  {
    icon: "orbit",
    name: "NTN \u2014 Satellite Networks",
    tagline: "5G via LEO satellite & UAV backhaul",
    desc: "3GPP R17 Non-Terrestrial Networks for rural broadband, disaster response, maritime, and remote operations across the World.",
    tags: ["NTN", "3GPP R17", "LEO", "UAV"],
    accent: "violet"
  }
];
function ProductCard({ product }) {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.1 });
  const [hover, setHover] = useState(false);
  const accentVar = `var(--${product.accent})`;
  if (product.featured) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref,
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false),
        style: {
          gridColumn: "span 2",
          background: "var(--surface)",
          border: `1px solid ${hover ? accentVar : "var(--border-strong)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "2.5rem",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(28px)",
          boxShadow: hover ? `0 30px 80px -30px color-mix(in oklab, ${accentVar} 55%, transparent)` : "var(--shadow-card)"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        top: "-100px",
        right: "-100px",
        width: "300px",
        height: "300px",
        background: `radial-gradient(circle, ${accentVar} 0%, transparent 65%)`,
        opacity: hover ? 0.25 : 0.15,
        pointerEvents: "none",
        filter: "blur(40px)",
        transition: "opacity 0.4s"
      } }),
      /* @__PURE__ */ React.createElement("div", { style: { position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }, className: "featured-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.3rem 0.85rem",
        borderRadius: "100px",
        background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
        border: `1px solid color-mix(in oklab, ${accentVar} 30%, transparent)`,
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.12em",
        color: accentVar,
        textTransform: "uppercase",
        marginBottom: "1.25rem"
      } }, /* @__PURE__ */ React.createElement(Sparkle, { size: 10, color: accentVar }), "Core product"), /* @__PURE__ */ React.createElement("h3", { style: {
        fontFamily: "var(--font-head)",
        fontWeight: 700,
        fontSize: "clamp(1.7rem, 2.5vw, 2.2rem)",
        letterSpacing: "-0.02em",
        lineHeight: 1.1,
        marginBottom: "0.6rem"
      } }, product.name), /* @__PURE__ */ React.createElement("code", { style: {
        display: "block",
        fontFamily: "var(--font-mono)",
        fontSize: "0.85rem",
        color: accentVar,
        background: "var(--bg)",
        padding: "0.6rem 0.85rem",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        marginBottom: "1.25rem",
        overflowX: "auto"
      } }, product.tagline), /* @__PURE__ */ React.createElement("p", { style: {
        color: "var(--text-mid)",
        fontSize: "0.98rem",
        lineHeight: 1.7,
        marginBottom: "1.5rem"
      } }, product.desc), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem" } }, product.tags.map((t) => /* @__PURE__ */ React.createElement("span", { key: t, style: {
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "0.25rem 0.65rem",
        color: "var(--text-mid)"
      } }, t)))), /* @__PURE__ */ React.createElement("div", { style: {
        position: "relative",
        aspectRatio: "4/3",
        background: "linear-gradient(135deg, var(--bg) 0%, var(--surface) 100%)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden"
      } }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 360 240", width: "100%", height: "100%", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "nodeGlow", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: accentVar, stopOpacity: "0.9" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: accentVar, stopOpacity: "0" }))), /* @__PURE__ */ React.createElement("g", { stroke: accentVar, strokeWidth: "1.2", opacity: "0.5", fill: "none" }, /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "80", y2: "60", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "290", y2: "60", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "80", y2: "180", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "290", y2: "180", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "180", y2: "30", strokeDasharray: "3 4" }), /* @__PURE__ */ React.createElement("line", { x1: "180", y1: "120", x2: "180", y2: "210", strokeDasharray: "3 4" })), [
        { cx: 80, cy: 60, label: "gNB" },
        { cx: 290, cy: 60, label: "gNB" },
        { cx: 80, cy: 180, label: "gNB" },
        { cx: 290, cy: 180, label: "IoT" },
        { cx: 180, cy: 30, label: "NTN" },
        { cx: 180, cy: 210, label: "UPF" }
      ].map((n, i) => /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("circle", { cx: n.cx, cy: n.cy, r: "20", fill: "url(#nodeGlow)", opacity: "0.6" }), /* @__PURE__ */ React.createElement("circle", { cx: n.cx, cy: n.cy, r: "12", fill: "var(--bg)", stroke: accentVar, strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("text", { x: n.cx, y: n.cy + 3, textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "8", fill: accentVar, fontWeight: "700" }, n.label))), /* @__PURE__ */ React.createElement("circle", { cx: "180", cy: "120", r: "34", fill: "url(#nodeGlow)", opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "180", cy: "120", r: "22", fill: "var(--surface)", stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("text", { x: "180", y: "118", textAnchor: "middle", fontFamily: "Space Grotesk", fontSize: "9", fontWeight: "700", fill: "var(--text)" }, "AI"), /* @__PURE__ */ React.createElement("text", { x: "180", y: "130", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "7", fill: "var(--text-mid)" }, "core"), /* @__PURE__ */ React.createElement("g", { fill: accentVar }, /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "200", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "330", cy: "100", r: "1.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "60", cy: "120", r: "1" }), /* @__PURE__ */ React.createElement("circle", { cx: "320", cy: "200", r: "1" }))), /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        bottom: "0.85rem",
        left: "1rem",
        right: "1rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
        color: "var(--text-dim)",
        textTransform: "uppercase",
        display: "flex",
        justifyContent: "space-between"
      } }, /* @__PURE__ */ React.createElement("span", null, "network \xB7 live"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--gold)" } }, "\u25CF ONLINE")))),
      /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .featured-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          }
        `)
    );
  }
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        background: "var(--surface)",
        border: `1px solid ${hover ? accentVar : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "1.75rem",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        boxShadow: hover ? `0 20px 50px -20px color-mix(in oklab, ${accentVar} 50%, transparent)` : "none",
        position: "relative",
        overflow: "hidden"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-60px",
      right: "-60px",
      width: "180px",
      height: "180px",
      background: `radial-gradient(circle, ${accentVar} 0%, transparent 70%)`,
      opacity: hover ? 0.18 : 0.06,
      pointerEvents: "none",
      filter: "blur(30px)",
      transition: "opacity 0.4s"
    } }),
    /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "46px",
      height: "46px",
      borderRadius: "var(--radius-sm)",
      background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 25%, transparent)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.35rem",
      marginBottom: "1.25rem"
    } }, React.createElement(Icon, { name: product.icon, size: 22, color: "currentColor" })), /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: "1.15rem",
      letterSpacing: "-0.015em",
      marginBottom: "0.4rem"
    } }, product.name), /* @__PURE__ */ React.createElement("p", { style: {
      fontFamily: "var(--font-mono)",
      color: accentVar,
      fontSize: "0.78rem",
      marginBottom: "0.85rem"
    } }, product.tagline), /* @__PURE__ */ React.createElement("p", { style: {
      color: "var(--text-mid)",
      fontSize: "0.9rem",
      lineHeight: 1.65,
      marginBottom: "1.1rem"
    } }, product.desc), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem" } }, product.tags.map((t) => /* @__PURE__ */ React.createElement("span", { key: t, style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.68rem",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "5px",
      padding: "0.2rem 0.55rem",
      color: "var(--text-dim)"
    } }, t))))
  );
}
function Products() {
  return /* @__PURE__ */ React.createElement("section", { id: "products", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "4rem", maxWidth: "720px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "01"), "Products"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "One CLI. ", /* @__PURE__ */ React.createElement("span", { className: "serif" }, "every"), " 3GPP standard."), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.1rem",
    lineHeight: 1.65,
    maxWidth: "620px"
  } }, "A single workflow for every cellular network type \u2014 from private 5G to satellite-backed NTN. AI-assisted validation. GitOps-native. Open-source all the way down.")), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem"
  }, className: "products-grid" }, PRODUCTS.map((p, i) => /* @__PURE__ */ React.createElement(ProductCard, { key: i, product: p }))), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .products-grid { grid-template-columns: 1fr !important; }
            .products-grid > div[style*="span 2"] { grid-column: span 1 !important; }
          }
        `)));
}
const SOLUTIONS = [
  {
    eyebrow: "For universities & R&D labs",
    title: "Classroom to cutting-edge research, in hours.",
    desc: "Beanters lets academic institutions build their own 4G/5G testbeds in hours, not months. Run experiments on private networks, teach cloud-native telco operations, contribute to open-source 3GPP research.",
    points: [
      "Private 5G testbed for student labs",
      "5G Broadcast for campus content delivery",
      "NB-IoT & sensor deployments",
      "OAI / srsRAN emulation environments"
    ],
    accent: "aqua",
    visual: "lab"
  },
  {
    eyebrow: "For enterprise & industry 4.0",
    title: "Deterministic networks for operational technology.",
    desc: "Deploy private 5G for factory floors, mining operations, port logistics, and agribusiness. Fully isolated from public networks, with QoS slicing for robotics, cameras, and IoT sensors.",
    points: [
      "Smart factory wireless connectivity",
      "AGV & robotic-arm deterministic control",
      "HD video inspection over 5G",
      "Port & logistics tracking over private 4G"
    ],
    accent: "gold",
    visual: "factory"
  },
  {
    eyebrow: "For governments & NGOs",
    title: "Sovereign infrastructure for the World.",
    desc: "Deploy open-source, sovereign cellular networks for rural broadband, emergency response, and broadcast \u2014 without dependency on foreign proprietary vendors. Spectrum sovereignty by design.",
    points: [
      "Rural broadband via 5G NTN backhaul",
      "Emergency alert broadcasting (5G MBS)",
      "Smart agriculture (NB-IoT)",
      "Digital public services over private 4G"
    ],
    accent: "magenta",
    visual: "globe"
  },
  {
    eyebrow: "For MVNOs & telecom operators",
    title: "Modernize your stack. GitOps your network.",
    desc: "Build or modernize telco infrastructure with cloud-native, GitOps-driven automation. ngntelco bridges legacy operations and Kubernetes-native orchestration \u2014 zero-touch provisioning of any network slice.",
    points: [
      "Zero-touch 5G SA core deployment",
      "GitOps-driven network lifecycle",
      "Network slicing for multi-tenant",
      "Observability: Prometheus + Grafana"
    ],
    accent: "violet",
    visual: "gitops"
  }
];
function SolutionVisual({ kind, accent }) {
  const accentVar = `var(--${accent})`;
  const visuals = {
    lab: (
      // beaker with network nodes
      /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 320 260", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: `grad-lab`, x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: accentVar, stopOpacity: "0.05" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: accentVar, stopOpacity: "0.3" }))), /* @__PURE__ */ React.createElement("path", { d: "M110 50 L110 130 L80 220 Q80 240 100 240 L220 240 Q240 240 240 220 L210 130 L210 50", fill: `url(#grad-lab)`, stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("line", { x1: "100", y1: "50", x2: "220", y2: "50", stroke: accentVar, strokeWidth: "3" }), /* @__PURE__ */ React.createElement("circle", { cx: "140", cy: "180", r: "8", fill: accentVar }), /* @__PURE__ */ React.createElement("circle", { cx: "180", cy: "160", r: "6", fill: accentVar, opacity: "0.7" }), /* @__PURE__ */ React.createElement("circle", { cx: "160", cy: "210", r: "10", fill: accentVar, opacity: "0.85" }), /* @__PURE__ */ React.createElement("circle", { cx: "200", cy: "200", r: "5", fill: accentVar, opacity: "0.6" }), /* @__PURE__ */ React.createElement("circle", { cx: "155", cy: "100", r: "3", fill: accentVar, opacity: "0.4" }), /* @__PURE__ */ React.createElement("circle", { cx: "180", cy: "80", r: "2", fill: accentVar, opacity: "0.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "135", cy: "70", r: "2.5", fill: accentVar, opacity: "0.4" }), /* @__PURE__ */ React.createElement("text", { x: "160", y: "35", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "9", fill: "var(--text-mid)", letterSpacing: "2" }, "TESTBED"))
    ),
    factory: (
      // factory roofline with antennas
      /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 320 260", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement("line", { x1: "20", y1: "220", x2: "300", y2: "220", stroke: "var(--text-dim)", strokeWidth: "1", strokeDasharray: "3 4", opacity: "0.4" }), /* @__PURE__ */ React.createElement("path", { d: "M40 220 L40 140 L80 110 L80 140 L120 110 L120 140 L160 110 L160 220 Z", fill: accentVar, opacity: "0.15", stroke: accentVar, strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("rect", { x: "170", y: "160", width: "80", height: "60", fill: accentVar, opacity: "0.2", stroke: accentVar, strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("line", { x1: "60", y1: "80", x2: "60", y2: "125", stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "60", cy: "78", r: "4", fill: accentVar }), /* @__PURE__ */ React.createElement("line", { x1: "210", y1: "120", x2: "210", y2: "165", stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "210", cy: "118", r: "4", fill: accentVar }), /* @__PURE__ */ React.createElement("path", { d: "M60 78 Q40 60 30 50", fill: "none", stroke: accentVar, strokeWidth: "1", opacity: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: "M60 78 Q80 60 90 50", fill: "none", stroke: accentVar, strokeWidth: "1", opacity: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: "M60 78 Q40 50 25 30", fill: "none", stroke: accentVar, strokeWidth: "1", opacity: "0.3" }), /* @__PURE__ */ React.createElement("path", { d: "M60 78 Q80 50 95 30", fill: "none", stroke: accentVar, strokeWidth: "1", opacity: "0.3" }), /* @__PURE__ */ React.createElement("g", { fill: "var(--bg)" }, /* @__PURE__ */ React.createElement("rect", { x: "50", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "65", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "90", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "105", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "130", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "145", y: "170", width: "6", height: "8" }), /* @__PURE__ */ React.createElement("rect", { x: "180", y: "170", width: "8", height: "10" }), /* @__PURE__ */ React.createElement("rect", { x: "195", y: "170", width: "8", height: "10" }), /* @__PURE__ */ React.createElement("rect", { x: "180", y: "190", width: "8", height: "10" }), /* @__PURE__ */ React.createElement("rect", { x: "195", y: "190", width: "8", height: "10" })), /* @__PURE__ */ React.createElement("rect", { x: "240", y: "200", width: "40", height: "18", rx: "3", fill: accentVar }), /* @__PURE__ */ React.createElement("circle", { cx: "248", cy: "222", r: "3", fill: "var(--text)" }), /* @__PURE__ */ React.createElement("circle", { cx: "272", cy: "222", r: "3", fill: "var(--text)" }), /* @__PURE__ */ React.createElement("text", { x: "160", y: "40", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "9", fill: "var(--text-mid)", letterSpacing: "2" }, "PRIVATE 5G CAMPUS"))
    ),
    globe: (
      // stylized globe
      /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 320 260", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "globeGrad", cx: "35%", cy: "35%", r: "70%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: accentVar, stopOpacity: "0.4" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: accentVar, stopOpacity: "0.05" }))), /* @__PURE__ */ React.createElement("circle", { cx: "160", cy: "130", r: "80", fill: "url(#globeGrad)", stroke: accentVar, strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "160", cy: "130", rx: "80", ry: "20", fill: "none", stroke: accentVar, strokeWidth: "0.7", opacity: "0.5" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "160", cy: "130", rx: "80", ry: "40", fill: "none", stroke: accentVar, strokeWidth: "0.7", opacity: "0.5" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "160", cy: "130", rx: "80", ry: "60", fill: "none", stroke: accentVar, strokeWidth: "0.7", opacity: "0.4" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "160", cy: "130", rx: "25", ry: "80", fill: "none", stroke: accentVar, strokeWidth: "0.7", opacity: "0.5" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "160", cy: "130", rx: "55", ry: "80", fill: "none", stroke: accentVar, strokeWidth: "0.7", opacity: "0.4" }), /* @__PURE__ */ React.createElement("g", { fill: accentVar }, /* @__PURE__ */ React.createElement("circle", { cx: "125", cy: "155", r: "4" }), /* @__PURE__ */ React.createElement("circle", { cx: "170", cy: "145", r: "4" }), /* @__PURE__ */ React.createElement("circle", { cx: "200", cy: "170", r: "4" }), /* @__PURE__ */ React.createElement("circle", { cx: "155", cy: "115", r: "3", opacity: "0.7" })), /* @__PURE__ */ React.createElement("g", { transform: "translate(265 60) rotate(15)" }, /* @__PURE__ */ React.createElement("rect", { x: "-12", y: "-3", width: "24", height: "6", fill: accentVar }), /* @__PURE__ */ React.createElement("rect", { x: "-22", y: "-1.5", width: "8", height: "3", fill: accentVar, opacity: "0.6" }), /* @__PURE__ */ React.createElement("rect", { x: "14", y: "-1.5", width: "8", height: "3", fill: accentVar, opacity: "0.6" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "3", x2: "0", y2: "12", stroke: accentVar, strokeWidth: "1" })), /* @__PURE__ */ React.createElement("path", { d: "M265 75 Q220 100 200 170", fill: "none", stroke: accentVar, strokeWidth: "1", strokeDasharray: "3 3", opacity: "0.6" }), /* @__PURE__ */ React.createElement("text", { x: "160", y: "240", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "9", fill: "var(--text-mid)", letterSpacing: "2" }, "WORLD \xB7 NTN"))
    ),
    gitops: (
      // git graph + reconciliation loop
      /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 320 260", width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement("line", { x1: "40", y1: "130", x2: "280", y2: "130", stroke: accentVar, strokeWidth: "2" }), [60, 110, 160, 210, 260].map((x, i) => /* @__PURE__ */ React.createElement("g", { key: i }, /* @__PURE__ */ React.createElement("circle", { cx: x, cy: "130", r: "8", fill: "var(--surface)", stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("text", { x, y: "118", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "8", fill: "var(--text-dim)" }, "c", i + 1))), /* @__PURE__ */ React.createElement("path", { d: "M110 130 Q140 90 160 80 L210 80 Q230 80 230 100 L230 130", fill: "none", stroke: accentVar, strokeWidth: "1.5", opacity: "0.6" }), /* @__PURE__ */ React.createElement("circle", { cx: "180", cy: "80", r: "6", fill: "var(--surface)", stroke: accentVar, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("g", { transform: "translate(160 200)" }, /* @__PURE__ */ React.createElement("circle", { r: "32", fill: "none", stroke: accentVar, strokeWidth: "1.5", strokeDasharray: "4 4", opacity: "0.6" }), /* @__PURE__ */ React.createElement("text", { textAnchor: "middle", y: "-8", fontFamily: "Space Grotesk", fontSize: "9", fontWeight: "700", fill: accentVar }, "FluxCD"), /* @__PURE__ */ React.createElement("text", { textAnchor: "middle", y: "6", fontFamily: "JetBrains Mono", fontSize: "7", fill: "var(--text-mid)" }, "reconcile"), /* @__PURE__ */ React.createElement("text", { textAnchor: "middle", y: "16", fontFamily: "JetBrains Mono", fontSize: "7", fill: "var(--text-mid)" }, "every 60s"), /* @__PURE__ */ React.createElement("path", { d: "M28 -12 L34 -8 L28 -4 Z", fill: accentVar })), /* @__PURE__ */ React.createElement("text", { x: "160", y: "40", textAnchor: "middle", fontFamily: "JetBrains Mono", fontSize: "9", fill: "var(--text-mid)", letterSpacing: "2" }, "GITOPS \xB7 K8s NATIVE"))
    )
  };
  return visuals[kind] || visuals.lab;
}
function SolutionRow({ solution, index }) {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.15 });
  const flip = index % 2 === 1;
  const accentVar = `var(--${solution.accent})`;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      style: {
        display: "grid",
        gridTemplateColumns: flip ? "1fr 1.05fr" : "1.05fr 1fr",
        gap: "4rem",
        alignItems: "center",
        marginBottom: "7rem",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(40px)",
        transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
      },
      className: "solution-row"
    },
    /* @__PURE__ */ React.createElement("div", { style: { order: flip ? 2 : 1 }, className: "solution-copy" }, /* @__PURE__ */ React.createElement("p", { style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.72rem",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: accentVar,
      marginBottom: "1.25rem",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem"
    } }, solution.eyebrow), /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: "clamp(1.7rem, 2.6vw, 2.4rem)",
      lineHeight: 1.05,
      letterSpacing: "-0.025em",
      marginBottom: "1.25rem"
    } }, solution.title), /* @__PURE__ */ React.createElement("p", { style: {
      color: "var(--text-mid)",
      fontSize: "1.02rem",
      lineHeight: 1.7,
      marginBottom: "1.75rem"
    } }, solution.desc), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem" } }, solution.points.map((p) => /* @__PURE__ */ React.createElement("li", { key: p, style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.85rem",
      color: "var(--text)",
      fontSize: "0.97rem"
    } }, /* @__PURE__ */ React.createElement("span", { style: {
      flexShrink: 0,
      marginTop: "5px",
      width: "18px",
      height: "18px",
      borderRadius: "50%",
      background: `color-mix(in oklab, ${accentVar} 20%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 40%, transparent)`,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: accentVar,
      fontFamily: "var(--font-mono)",
      fontSize: "0.7rem",
      fontWeight: 700
    } }, "\u2713"), p)))),
    /* @__PURE__ */ React.createElement("div", { style: {
      order: flip ? 1 : 2,
      position: "relative",
      aspectRatio: "5/4",
      background: "var(--surface)",
      border: "1px solid var(--border-strong)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem",
      overflow: "hidden",
      boxShadow: "var(--shadow-card)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      background: `radial-gradient(circle at ${flip ? "80%" : "20%"} 0%, color-mix(in oklab, ${accentVar} 22%, transparent), transparent 50%)`,
      pointerEvents: "none"
    } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: "100%", height: "100%" } }, /* @__PURE__ */ React.createElement(SolutionVisual, { kind: solution.visual, accent: solution.accent }))),
    /* @__PURE__ */ React.createElement("style", null, `
        @media (max-width: 860px) {
          .solution-row {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            margin-bottom: 4rem !important;
          }
          .solution-row .solution-copy { order: 1 !important; }
          .solution-row > div:last-child { order: 2 !important; }
        }
      `)
  );
}
function Solutions() {
  return /* @__PURE__ */ React.createElement("section", { id: "solutions", style: {
    background: "var(--bg-2)",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "5rem", maxWidth: "720px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "02"), "Solutions"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "Built for ", /* @__PURE__ */ React.createElement("span", { className: "serif" }, "every"), " operator."), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.1rem",
    lineHeight: 1.65
  } }, "From research labs in Bogot\xE1 to ministries deploying rural broadband \u2014 Beanters scales to fit any operator.")), SOLUTIONS.map((s, i) => /* @__PURE__ */ React.createElement(SolutionRow, { key: i, solution: s, index: i }))));
}
Object.assign(window, {
  LogoWall,
  Products,
  Solutions
});
const TECH_PILLARS = [
  {
    icon: "layers",
    accent: "teal",
    title: "Orchestration",
    items: ["Docker Compose", "Helm Charts", "Kustomize", "FluxCD", "Kubernetes (k3s/k8s)", "Nephio"]
  },
  {
    icon: "radio",
    accent: "aqua",
    title: "RAN Stack",
    items: ["OpenAirInterface", "srsRAN Project", "OAI-gNB / eNB", "USRP / ADALM-PLUTO", "Commodity x86", "Cloud-agnostic RAN"]
  },
  {
    icon: "cpu",
    accent: "magenta",
    title: "Core Network",
    items: ["Open5GS (5G SA/NSA)", "Magma", "Free5GC", "OAI 5G Core", "AMF / SMF / UPF", "AUSF / UDM / PCF"]
  },
  {
    icon: "barchart",
    accent: "gold",
    title: "Observability",
    items: ["Prometheus + Grafana", "Jaeger Tracing", "Loki Logs", "KPI Dashboards", "Real-time alerts", "MLOps for RAN"]
  }
];
function TechPillar({ pillar }) {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.15 });
  const [hover, setHover] = useState(false);
  const accentVar = `var(--${pillar.accent})`;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        background: "var(--surface)",
        border: `1px solid ${hover ? accentVar : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "1.75rem",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: hover ? `0 18px 50px -20px color-mix(in oklab, ${accentVar} 50%, transparent)` : "none",
        position: "relative",
        overflow: "hidden"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-40px",
      right: "-40px",
      width: "140px",
      height: "140px",
      background: `radial-gradient(circle, ${accentVar} 0%, transparent 70%)`,
      opacity: hover ? 0.15 : 0.05,
      pointerEvents: "none",
      filter: "blur(25px)",
      transition: "opacity 0.4s"
    } }),
    /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "42px",
      height: "42px",
      borderRadius: "var(--radius-sm)",
      background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 30%, transparent)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.25rem",
      marginBottom: "1.25rem"
    } }, React.createElement(Icon, { name: pillar.icon, size: 22, color: "currentColor" })), /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: "1rem",
      letterSpacing: "-0.01em",
      marginBottom: "1rem",
      color: "var(--text)"
    } }, pillar.title), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" } }, pillar.items.map((it) => /* @__PURE__ */ React.createElement("li", { key: it, style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.74rem",
      color: "var(--text-mid)",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    } }, /* @__PURE__ */ React.createElement("span", { style: { color: accentVar, fontWeight: 700 } }, "\u25B8"), it))))
  );
}
function Technology() {
  return /* @__PURE__ */ React.createElement("section", { id: "tech", style: { position: "relative" } }, /* @__PURE__ */ React.createElement(AuroraField, { blobs: [
    { color: "var(--violet)", size: "500px", top: "20%", left: "-150px", duration: "22s" },
    { color: "var(--gold)", size: "420px", bottom: "15%", right: "-100px", duration: "18s", delay: "-4s", anim: "float2" }
  ] }), /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "4rem", maxWidth: "780px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "03"), "Technology"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "100% open-source. Zero ", /* @__PURE__ */ React.createElement("span", { className: "serif" }, "vendor lock-in.")), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.1rem",
    lineHeight: 1.65
  } }, "Beanters is built entirely on open-source projects and runs on general-purpose hardware. Own your stack \u2014 from the GitOps reconciliation loop down to the SDR.")), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1.25rem"
  }, className: "tech-grid" }, TECH_PILLARS.map((p) => /* @__PURE__ */ React.createElement(TechPillar, { key: p.title, pillar: p }))), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 1000px) {
            .tech-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 600px) {
            .tech-grid { grid-template-columns: 1fr !important; }
          }
        `)));
}
function Mission() {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.1 });
  const cards = [
    { icon: "mappin", title: "Latin America first", desc: "Born in Colombia. Rooted in the OpenInfra community. Built for regulators, universities, and operators across LATAM.", accent: "magenta" },
    { icon: "lightbulb", title: "Sovereign infrastructure", desc: "Open-source RAN and core means no black boxes. Governments own their network, spectrum, and data \u2014 fully.", accent: "gold" },
    { icon: "bookopen", title: "Research & education", desc: "Academic pricing and open curricula for universities building the next generation of cloud-native telco engineers.", accent: "aqua" }
  ];
  return /* @__PURE__ */ React.createElement("section", { id: "mission", style: {
    background: "var(--bg-2)",
    borderTop: "1px solid var(--border)",
    position: "relative",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { ref, className: "container", style: {
    textAlign: "center",
    maxWidth: "1080px",
    position: "relative",
    zIndex: 1,
    opacity: vis ? 1 : 0,
    transform: vis ? "none" : "translateY(30px)",
    transition: "all 0.7s ease"
  } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow", style: { justifyContent: "center", display: "inline-flex" } }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "04"), "Our mission"), /* @__PURE__ */ React.createElement("h2", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "clamp(2.3rem, 4.5vw, 3.6rem)",
    lineHeight: 1.05,
    letterSpacing: "-0.035em",
    marginBottom: "1.75rem"
  } }, "Connecting the unconnected", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "gradient-text-warm", style: {
    fontFamily: "var(--font-serif)",
    fontWeight: 400,
    fontStyle: "italic",
    letterSpacing: "-0.02em"
  } }, "across the World.")), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.15rem",
    lineHeight: 1.7,
    maxWidth: "740px",
    margin: "0 auto 4rem",
    textWrap: "pretty"
  } }, "Billions of people in Latin America, Africa, and Southeast Asia remain without reliable cellular connectivity. Beanters was built on the belief that ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, "open-source software + commodity hardware"), " can deliver world-class telecom infrastructure at a fraction of the cost \u2014 no proprietary systems, no foreign vendor dependencies."), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.25rem",
    textAlign: "left"
  }, className: "mission-grid" }, cards.map((c, i) => {
    const accentVar = `var(--${c.accent})`;
    return /* @__PURE__ */ React.createElement("div", { key: c.title, style: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)",
      padding: "1.75rem",
      transition: "all 0.3s",
      position: "relative",
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-30px",
      right: "-30px",
      width: "100px",
      height: "100px",
      background: `radial-gradient(circle, ${accentVar} 0%, transparent 70%)`,
      opacity: 0.12,
      filter: "blur(20px)"
    } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "46px",
      height: "46px",
      borderRadius: "var(--radius-sm)",
      background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 30%, transparent)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1.1rem"
    } }, React.createElement(Icon, { name: c.icon, size: 20, color: accentVar })), /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: "1.05rem",
      marginBottom: "0.5rem",
      letterSpacing: "-0.01em"
    } }, c.title), /* @__PURE__ */ React.createElement("p", { style: {
      color: "var(--text-mid)",
      fontSize: "0.9rem",
      lineHeight: 1.65
    } }, c.desc)));
  })), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .mission-grid { grid-template-columns: 1fr !important; }
          }
        `)));
}
const TESTIMONIALS = [
  {
    quote: "Beanters cut our 5G testbed setup from six weeks to one afternoon. Our graduate students are now running real experiments instead of fighting Helm charts.",
    author: "Dr. M. Restrepo",
    role: "Telecom Research Lead",
    org: "Northern Andean University",
    accent: "aqua",
    placeholder: "university"
  },
  {
    quote: "We deployed private 5G across three logistics yards in one quarter. The CLI is the most elegant piece of telco tooling I've seen in twenty years.",
    author: "C. Vasquez",
    role: "CTO",
    org: "Palladium Industrial",
    accent: "gold",
    placeholder: "industrial"
  },
  {
    quote: "Sovereign infrastructure isn't a slogan for us \u2014 it's policy. Beanters made it executable. Our rural pilots are live in regions vendors wouldn't touch.",
    author: "A. Okonkwo",
    role: "Director, Digital Inclusion",
    org: "Ministry of Digital",
    accent: "magenta",
    placeholder: "gov"
  }
];
function TestimonialCard({ t }) {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.15 });
  const accentVar = `var(--${t.accent})`;
  return /* @__PURE__ */ React.createElement("div", { ref, style: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "2rem",
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(28px)",
    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    top: "-50px",
    right: "-50px",
    width: "180px",
    height: "180px",
    background: `radial-gradient(circle, ${accentVar} 0%, transparent 70%)`,
    opacity: 0.12,
    filter: "blur(30px)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", flex: 1, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--font-serif)",
    fontSize: "4rem",
    lineHeight: 0.6,
    color: accentVar,
    opacity: 0.8,
    marginBottom: "0.5rem"
  } }, '"'), /* @__PURE__ */ React.createElement("p", { style: {
    fontFamily: "var(--font-head)",
    fontSize: "1.05rem",
    lineHeight: 1.5,
    color: "var(--text)",
    marginBottom: "2rem",
    letterSpacing: "-0.01em",
    textWrap: "pretty",
    fontWeight: 500,
    flex: 1
  } }, t.quote), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.85rem", marginTop: "auto" } }, /* @__PURE__ */ React.createElement("div", { style: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${accentVar} 0%, color-mix(in oklab, ${accentVar} 40%, var(--surface-2)) 100%)`,
    border: "1px solid var(--border-strong)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--surface)",
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "0.95rem",
    letterSpacing: "0.03em",
    flexShrink: 0
  } }, t.author.split(" ").slice(-1)[0][0], t.author.split(" ")[0][0]), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.92rem" } }, t.author), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-dim)", letterSpacing: "0.02em" } }, t.role, " \xB7 ", t.org)))));
}
function Testimonials() {
  return /* @__PURE__ */ React.createElement("section", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "3.5rem", maxWidth: "720px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "05"), "What teams say"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, /* @__PURE__ */ React.createElement("span", { className: "serif" }, "Trusted"), " by operators", /* @__PURE__ */ React.createElement("br", null), "shipping real networks.")), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.25rem"
  }, className: "testimonials-grid" }, TESTIMONIALS.map((t, i) => /* @__PURE__ */ React.createElement(TestimonialCard, { key: i, t }))), /* @__PURE__ */ React.createElement("p", { style: {
    marginTop: "2rem",
    textAlign: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    color: "var(--text-dim)",
    letterSpacing: "0.05em",
    opacity: 0.6
  } }, "Representative feedback from early pilots \u2014 attributed with permission at launch"), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .testimonials-grid { grid-template-columns: 1fr !important; }
          }
        `)));
}
function About() {
  return /* @__PURE__ */ React.createElement("section", { id: "about", style: {
    background: "var(--bg-2)",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)"
  } }, /* @__PURE__ */ React.createElement("div", { className: "container" }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "0.85fr 1.15fr",
    gap: "5rem",
    alignItems: "center"
  }, className: "about-grid" }, /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    aspectRatio: "1/1",
    maxWidth: "420px",
    margin: "0 auto",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    border: "1px solid var(--border-strong)",
    boxShadow: "var(--shadow-card)"
  } }, /* @__PURE__ */ React.createElement("img", { src: "luis.webp", alt: "Luis Felipe Ariza Vesga", loading: "lazy", style: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block"
  } }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "06"), "About the founder"), /* @__PURE__ */ React.createElement("h2", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "clamp(1.9rem, 3vw, 2.6rem)",
    letterSpacing: "-0.025em",
    lineHeight: 1.08,
    marginBottom: "0.6rem"
  } }, "Luis Felipe Ariza Vesga"), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--teal)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.82rem",
    marginBottom: "1.75rem",
    letterSpacing: "0.02em"
  } }, "PhD telecom \xB7 MSc RF microelectronics \xB7 \u2744 Kubestronaut"), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.02rem",
    lineHeight: 1.75,
    marginBottom: "1.25rem"
  } }, "Former researcher at ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, "EURECOM (France)"), ", contributor to the ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, "OpenAirInterface Software Alliance"), ", and principal researcher recognized by ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, "MinCiencias (Colombia)"), ". Deep expertise in cloud-native RAN, 5G broadcast, and many-objective optimization for heterogeneous networks."), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.02rem",
    lineHeight: 1.75,
    marginBottom: "2rem"
  } }, "Organizer of the ", /* @__PURE__ */ React.createElement("strong", { style: { color: "var(--text)" } }, "Colombia OpenInfra User Group"), " and KCD Colombia 2025 \u2014 building a thriving community of engineers advancing open-source telecom across Latin America."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem" } }, ["OpenAirInterface", "srsRAN", "Magma", "Open5GS", "Kubestronaut", "OAI Contributor", "EURECOM Alumni", "MinCiencias"].map((t) => /* @__PURE__ */ React.createElement("span", { key: t, style: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "0.25rem 0.65rem",
    color: "var(--text-mid)"
  } }, t))))), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .about-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `)));
}
const TALKS = [
  {
    featured: true,
    event: "KubeCon + CloudNativeCon Europe 2026",
    location: "Amsterdam, Netherlands",
    date: "April 2026",
    flag: "\u{1F1F3}\u{1F1F1}",
    badge: "KubeCon Speaker",
    icon: "k8s",
    title: "From chaos to control: managing apps on private cellular networks",
    desc: "How cloud-native tooling \u2014 Helm, FluxCD, Kubernetes operators \u2014 tames the operational complexity of deploying 5G/4G network functions in production on commodity clusters.",
    tags: ["KubeCon", "Kubernetes", "5G SA", "Helm", "FluxCD", "Private Networks"],
    slidesUrl: "https://github.com/lfarizav/techtalk-slides/blob/main/kubecon%202026/FromChaostoControlAPrescriptionforManagingAppsonPrivateCellularNetworksLuisArizaBeanters.pdf",
    accent: "aqua"
  },
  {
    event: "5th Colombia OpenInfra User Group",
    location: "Pontificia Universidad Javeriana, Bogot\xE1",
    date: "June 5, 2026",
    flag: "\u{1F1E8}\u{1F1F4}",
    badge: "Speaker",
    icon: "university",
    title: "Despliegue automatizado de redes celulares usando lenguaje natural",
    desc: "Natural language automation for cellular network deployment \u2014 using LLMs and the ngntelco CLI to turn plain-language instructions into 4G/5G deployment commands. Live demo at the Colombia OpenInfra community.",
    tags: ["OpenInfra", "Natural Language", "LLMs", "5G", "Automation", "ngntelco"],
    videoUrl: "https://www.youtube.com/watch?v=sMaHOMGwTUE",
    accent: "teal"
  },
  {
    event: "KCD Colombia 2025",
    location: "Bogot\xE1, Colombia",
    date: "2025",
    flag: "\u{1F1E8}\u{1F1F4}",
    badge: "Organizer + Speaker",
    icon: "\u{1F3D4}\uFE0F",
    title: "Cloud-native capabilities for private cellular networks",
    desc: "Bringing cloud-native resilience patterns \u2014 health probes, rolling upgrades, GitOps reconciliation \u2014 to private 4G/5G running as containerized workloads on Kubernetes.",
    tags: ["KCD", "Kubernetes", "Private Networks", "Cloud-Native"],
    slidesUrl: "https://github.com/lfarizav/techtalk-slides/blob/main/KCD%20Colombia%202025/EnhancingStabilityandEnabling%20CloudNativeCapabilitiesforPrivateCellularNetworks-KCDColombia2025.pdf",
    accent: "gold"
  },
  {
    event: "La Hora de Kubernetes \u2014 Virtual",
    location: "Online \xB7 LATAM Spanish",
    date: "Sep 11, 2025",
    flag: "\u{1F310}",
    badge: "Guest Speaker",
    icon: "refresh",
    title: "FluxCD para reconciliar aplicaciones de redes celulares",
    desc: "Practical GitOps: how FluxCD continuous reconciliation keeps Open5GS and OAI gNB workloads always converging to their desired state \u2014 no manual intervention.",
    tags: ["FluxCD", "GitOps", "Open5GS", "OAI gNB", "LTE/5G"],
    slidesUrl: "https://github.com/lfarizav/techtalk-slides/blob/main/lahoradekubernetes/Beneficios%20de%20usar%20FluxCD%20para%20reconciliar%20aplicaciones%20de%20redes%20celulares%20en%20kubernetes-Hora%20de%20Kubernetes-11092025.pdf",
    accent: "violet"
  },
  {
    event: "MLOps & AI Community Talk",
    location: "Online",
    date: "2025",
    flag: "\u{1F916}",
    badge: "Speaker",
    icon: "activity",
    title: "MLOps for telecom: AI-driven RAN optimization",
    desc: "MLOps practices \u2014 model registries, automated retraining, K8s inference \u2014 to optimize RAN performance, predict failures, and automate resource allocation in private cellular.",
    tags: ["MLOps", "AI/ML", "RAN", "Kubeflow", "Open5GS"],
    slidesUrl: "https://github.com/lfarizav/techtalk-slides/blob/main/MLOPs/MLOps%20presentation.pdf",
    accent: "coral"
  }
];
function TalkCard({ talk }) {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.07 });
  const [hover, setHover] = useState(false);
  const accentVar = `var(--${talk.accent})`;
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        background: "var(--surface)",
        border: `1px solid ${hover ? accentVar : "var(--border)"}`,
        borderRadius: talk.featured ? "var(--radius-lg)" : "var(--radius-md)",
        padding: talk.featured ? "2.25rem 2.5rem" : "1.6rem",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
        boxShadow: hover ? `0 24px 60px -20px color-mix(in oklab, ${accentVar} 50%, transparent)` : "none",
        display: "flex",
        flexDirection: talk.featured ? "row" : "column",
        gap: talk.featured ? "2rem" : "1.1rem",
        alignItems: "flex-start",
        position: "relative",
        overflow: "hidden"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-60px",
      right: "-60px",
      width: "200px",
      height: "200px",
      background: `radial-gradient(circle, ${accentVar} 0%, transparent 70%)`,
      opacity: hover ? 0.18 : 0.06,
      filter: "blur(30px)",
      pointerEvents: "none",
      transition: "opacity 0.4s"
    } }),
    talk.featured && /* @__PURE__ */ React.createElement("div", { style: { flexShrink: 0, position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "64px",
      height: "64px",
      borderRadius: "var(--radius-md)",
      background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 35%, transparent)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.85rem"
    } }, React.createElement(Icon, { name: talk.icon, size: 20, color: "currentColor" }))),
    /* @__PURE__ */ React.createElement("div", { style: { flex: 1, position: "relative", display: "flex", flexDirection: "column", gap: "0.7rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem" } }, /* @__PURE__ */ React.createElement("div", null, talk.featured && /* @__PURE__ */ React.createElement("p", { style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.7rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: accentVar,
      marginBottom: "0.35rem",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem"
    } }, /* @__PURE__ */ React.createElement(Sparkle, { size: 10, color: accentVar }), "Featured talk"), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: "0.45rem",
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: "0.92rem",
      color: "var(--text)",
      marginBottom: "0.2rem"
    } }, !talk.featured && /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.05rem" } }, React.createElement(Icon, { name: talk.icon, size: 20, color: "currentColor" })), /* @__PURE__ */ React.createElement("span", null, talk.flag, " ", talk.event)), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-dim)" } }, talk.location, " \xB7 ", talk.date)), /* @__PURE__ */ React.createElement("span", { style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.64rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: accentVar,
      border: `1px solid color-mix(in oklab, ${accentVar} 40%, transparent)`,
      borderRadius: "100px",
      padding: "0.22rem 0.7rem",
      background: `color-mix(in oklab, ${accentVar} 12%, transparent)`,
      whiteSpace: "nowrap",
      flexShrink: 0
    } }, talk.badge)), /* @__PURE__ */ React.createElement("h3", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: talk.featured ? "1.3rem" : "1rem",
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
      color: "var(--text)",
      textWrap: "pretty"
    } }, talk.title), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-mid)", fontSize: "0.88rem", lineHeight: 1.65 } }, talk.desc), /* @__PURE__ */ React.createElement("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "0.85rem",
      marginTop: "auto",
      paddingTop: "0.5rem"
    } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: "0.4rem" } }, talk.tags.slice(0, talk.featured ? 6 : 4).map((t) => /* @__PURE__ */ React.createElement("span", { key: t, style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.66rem",
      background: "var(--bg-2)",
      border: "1px solid var(--border)",
      borderRadius: "5px",
      padding: "0.15rem 0.5rem",
      color: "var(--text-dim)"
    } }, t))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap" } }, talk.videoUrl && /* @__PURE__ */ React.createElement(
      "a",
      {
        href: talk.videoUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: accentVar,
          textDecoration: "none",
          border: `1px solid color-mix(in oklab, ${accentVar} 40%, transparent)`,
          borderRadius: "6px",
          padding: "0.4rem 0.85rem",
          background: `color-mix(in oklab, ${accentVar} 10%, transparent)`,
          transition: "background 0.2s",
          whiteSpace: "nowrap"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.background = `color-mix(in oklab, ${accentVar} 22%, transparent)`;
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = `color-mix(in oklab, ${accentVar} 10%, transparent)`;
        }
      },
      "\u25B6 Watch on YouTube"
    ), talk.slidesUrl && /* @__PURE__ */ React.createElement(
      "a",
      {
        href: talk.slidesUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
          fontWeight: 600,
          color: accentVar,
          textDecoration: "none",
          border: `1px solid color-mix(in oklab, ${accentVar} 40%, transparent)`,
          borderRadius: "6px",
          padding: "0.4rem 0.85rem",
          background: `color-mix(in oklab, ${accentVar} 10%, transparent)`,
          transition: "background 0.2s",
          whiteSpace: "nowrap"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.background = `color-mix(in oklab, ${accentVar} 22%, transparent)`;
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.background = `color-mix(in oklab, ${accentVar} 10%, transparent)`;
        }
      },
      "View slides \u2192"
    ))))
  );
}
function Speaking() {
  return /* @__PURE__ */ React.createElement("section", { id: "speaking", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative", zIndex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "3.5rem", maxWidth: "740px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "07"), "Public talks & events"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "From Bogot\xE1 to ", /* @__PURE__ */ React.createElement("span", { className: "serif" }, "Amsterdam.")), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.05rem",
    lineHeight: 1.65
  } }, "Presenting production experience on cloud-native cellular networks, GitOps, and open-source telecom \u2014 at the world's leading conferences.")), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "1.25rem" } }, /* @__PURE__ */ React.createElement(TalkCard, { talk: TALKS[0] })), /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.25rem",
    marginBottom: "2.5rem"
  }, className: "talks-grid" }, TALKS.slice(1).map((t, i) => /* @__PURE__ */ React.createElement(TalkCard, { key: i, talk: t }))), /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "2.5rem",
    padding: "1.5rem 2rem",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)"
  }, className: "talks-footer" }, [
    { n: "5+", label: "Conference talks" },
    { n: "3+", label: "Countries" },
    { n: "2026", label: "KubeCon alumnus" },
    { n: "\u{1F1E8}\u{1F1F4}", label: "Born in Colombia" }
  ].map((s) => /* @__PURE__ */ React.createElement("div", { key: s.label }, /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "1.35rem",
    background: "linear-gradient(135deg, var(--teal), var(--magenta))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent"
  } }, s.n), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-body)", fontSize: "0.76rem", color: "var(--text-dim)" } }, s.label))), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://github.com/lfarizav/techtalk-slides",
      target: "_blank",
      rel: "noopener noreferrer",
      style: {
        marginLeft: "auto",
        fontFamily: "var(--font-mono)",
        fontSize: "0.8rem",
        color: "var(--text-mid)",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        transition: "all 0.2s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.color = "var(--teal)";
        e.currentTarget.style.borderColor = "var(--teal)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.color = "var(--text-mid)";
        e.currentTarget.style.borderColor = "var(--border)";
      }
    },
    "All slides on GitHub \u2192"
  )), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .talks-grid { grid-template-columns: 1fr !important; }
            .talks-footer { gap: 1.5rem !important; padding: 1.25rem !important; }
            .talks-footer a { margin-left: 0 !important; }
          }
        `)));
}
Object.assign(window, {
  Technology,
  Mission,
  Testimonials,
  About,
  Speaking
});
function Training() {
  const ref = useRef();
  const vis = useIntersection(ref, { threshold: 0.1 });
  const MODULES = [
    { num: "01", title: "2G/3G Networks", desc: "GSM, GPRS, EDGE, UMTS", accent: "teal" },
    { num: "02", title: "4G LTE", desc: "EPC, eNodeB, IMS, VoLTE", accent: "aqua" },
    { num: "03", title: "5G NR", desc: "gNB, 5G Core, Network Slicing", accent: "magenta" }
  ];
  const ENROLL_URL = "mailto:lfarizav@gmail.com?subject=Enroll%20Cellular%20Networks%20Course%20%E2%80%94%2089%20USD&body=Hi%20Luis%2C%0A%0AI%20would%20like%20to%20enroll%20in%20the%20full%20Cellular%20Networks%20course%20(USD%2089).%0A%0AName%3A%20%0AOrganization%3A%20%0ACountry%3A%20%0A%0AThanks.";
  const PRICES = [
    { label: "Free preview", amount: "Free", sub: "3 starter modules", accent: "teal", free: true },
    { label: "Full access", amount: "$89 USD", sub: "25 modules + labs + quizzes", accent: "gold", featured: true },
    { label: "Team / University", amount: "$490 USD", sub: "10 seats \xB7 invoice available", accent: "violet" }
  ];
  return /* @__PURE__ */ React.createElement("section", { id: "training", style: { position: "relative", background: "var(--bg-2)", borderTop: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("div", { ref, className: "container", style: {
    position: "relative",
    zIndex: 1,
    opacity: vis ? 1 : 0,
    transform: vis ? "none" : "translateY(30px)",
    transition: "all 0.7s ease"
  } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "4rem", maxWidth: "720px" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow" }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "08"), "Training & courses"), /* @__PURE__ */ React.createElement("h2", { className: "section-title" }, "Learn from the ", /* @__PURE__ */ React.createElement("span", { className: "serif" }, "source.")), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-mid)", fontSize: "1.1rem", lineHeight: 1.65 } }, "Structured courses on private cellular networks \u2014 from 2G fundamentals to 6G. Built by practitioners, for engineers who need to ship real networks.")), /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    padding: "2rem 2.5rem",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    background: "linear-gradient(135deg, color-mix(in oklab, var(--teal) 8%, transparent), color-mix(in oklab, var(--magenta) 5%, transparent))"
  } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "100px",
    background: "color-mix(in oklab, var(--teal) 15%, transparent)",
    border: "1px solid color-mix(in oklab, var(--teal) 30%, transparent)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.68rem",
    letterSpacing: "0.12em",
    color: "var(--teal)",
    textTransform: "uppercase",
    marginBottom: "0.85rem"
  } }, /* @__PURE__ */ React.createElement(Sparkle, { size: 9, color: "var(--teal)" }), "3 free starter modules"), /* @__PURE__ */ React.createElement("h3", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "1.5rem",
    letterSpacing: "-0.02em",
    marginBottom: "0.35rem"
  } }, "Cellular Networks: 2G \u2192 6G"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-mid)", fontSize: "0.92rem" } }, "25 modules \xB7 Self-paced \xB7 Spanish & English")), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "courses/cellular-networks/slides.html",
      className: "btn btn-primary",
      style: { fontSize: "0.88rem", padding: "0.65rem 1.35rem", flexShrink: 0 }
    },
    "Open free preview \u2192"
  )), MODULES.map((m, i) => {
    const accentVar = `var(--${m.accent})`;
    return /* @__PURE__ */ React.createElement("div", { key: m.num, style: {
      padding: "1.2rem 2.5rem",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      gap: "1.5rem"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      flexShrink: 0,
      width: "40px",
      height: "40px",
      borderRadius: "var(--radius-sm)",
      background: `color-mix(in oklab, ${accentVar} 15%, transparent)`,
      border: `1px solid color-mix(in oklab, ${accentVar} 30%, transparent)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-mono)",
      fontSize: "0.78rem",
      fontWeight: 700,
      color: accentVar
    } }, m.num), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.98rem", letterSpacing: "-0.01em" } }, m.title), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--text-dim)", marginTop: "0.1rem" } }, m.desc)), /* @__PURE__ */ React.createElement("span", { style: {
      flexShrink: 0,
      fontFamily: "var(--font-mono)",
      fontSize: "0.64rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--gold)",
      border: "1px solid color-mix(in oklab, var(--gold) 40%, transparent)",
      borderRadius: "100px",
      padding: "0.2rem 0.65rem",
      background: "color-mix(in oklab, var(--gold) 12%, transparent)"
    } }, "\u{1F513} Free"));
  }), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "1rem 2.5rem",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: "1.5rem"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    flexShrink: 0,
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-sm)",
    background: "var(--bg-2)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-mono)",
    fontSize: "0.78rem",
    color: "var(--text-dim)"
  } }, "04\u201325"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "0.9rem", color: "var(--text-mid)" } }, "22 more modules \u2014 LTE-A, 5G SA core, Open RAN, NB-IoT, NTN, MLOps for RAN, 6G\u2026")), /* @__PURE__ */ React.createElement("span", { style: {
    flexShrink: 0,
    fontFamily: "var(--font-mono)",
    fontSize: "0.64rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
    borderRadius: "100px",
    padding: "0.2rem 0.65rem"
  } }, "\u{1F512} Full access")), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "2rem 2.5rem",
    background: "var(--bg)",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem"
  }, className: "pricing-grid" }, PRICES.map((p) => {
    const av = `var(--${p.accent})`;
    return /* @__PURE__ */ React.createElement("div", { key: p.label, style: {
      background: p.featured ? `color-mix(in oklab, ${av} 8%, var(--surface))` : "var(--surface)",
      border: `1px solid ${p.featured ? `color-mix(in oklab, ${av} 40%, transparent)` : "var(--border)"}`,
      borderRadius: "var(--radius-md)",
      padding: "1.5rem",
      textAlign: "center",
      position: "relative"
    } }, p.featured && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "-1px",
      left: "50%",
      transform: "translateX(-50%)",
      fontFamily: "var(--font-mono)",
      fontSize: "0.6rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      background: av,
      color: "var(--bg)",
      padding: "0.2rem 0.7rem",
      borderRadius: "0 0 6px 6px"
    } }, "Most popular"), /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: "var(--font-head)",
      fontWeight: 700,
      fontSize: p.free ? "1.5rem" : "1.8rem",
      color: p.free ? "var(--teal)" : av,
      lineHeight: 1,
      marginTop: p.featured ? "0.75rem" : 0,
      marginBottom: "0.4rem"
    } }, p.amount), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "0.88rem", marginBottom: "0.3rem" } }, p.label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-dim)" } }, p.sub));
  })), /* @__PURE__ */ React.createElement("div", { style: {
    padding: "1.5rem 2.5rem",
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    background: "var(--bg)"
  } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--font-mono)", fontSize: "0.76rem", color: "var(--text-dim)" } }, "Enroll by email \xB7 Luis responds in <24 h \xB7 Accepts card, transfer, Nequi/Daviplata"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.75rem", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "courses/cellular-networks/",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: "var(--text-mid)",
        textDecoration: "none",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "0.5rem 1rem",
        transition: "all 0.2s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.color = "var(--teal)";
        e.currentTarget.style.borderColor = "var(--teal)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.color = "var(--text-mid)";
        e.currentTarget.style.borderColor = "var(--border)";
      }
    },
    "View full curriculum \u2192"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: ENROLL_URL,
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        fontFamily: "var(--font-head)",
        fontWeight: 600,
        fontSize: "0.9rem",
        background: "linear-gradient(135deg, var(--teal) 0%, var(--magenta) 100%)",
        color: "white",
        textDecoration: "none",
        borderRadius: "100px",
        padding: "0.6rem 1.35rem",
        boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--magenta) 50%, transparent)",
        transition: "transform 0.2s, box-shadow 0.2s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.transform = "none";
      }
    },
    /* @__PURE__ */ React.createElement(Sparkle, { size: 13, color: "white" }),
    "Enroll \u2014 $89 USD"
  )))), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 700px) {
            .pricing-grid { grid-template-columns: 1fr !important; }
          }
        `)));
}
Object.assign(window, { Training });
const Easing = {
  linear: (t) => t,
  // Quad
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // Quart
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - --t * t * t * t,
  easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // Expo
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },
  // Sine
  easeInSine: (t) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  // Elastic
  easeOutElastic: (t) => {
    const c4 = 2 * Math.PI / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}
const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);
const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);
function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value = { localTime, progress, duration, visible };
  return /* @__PURE__ */ React.createElement(SpriteContext.Provider, { value }, typeof children === "function" ? children(value) : children);
}
function TextSprite({
  text,
  x = 0,
  y = 0,
  size = 48,
  color = "#111",
  font = "Inter, system-ui, sans-serif",
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = "left",
  letterSpacing = "-0.01em"
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let ty = 0;
  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }
  const translateX = align === "center" ? "-50%" : align === "right" ? "-100%" : "0";
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    transform: `translate(${translateX}, ${ty}px)`,
    opacity,
    fontFamily: font,
    fontSize: size,
    fontWeight: weight,
    color,
    letterSpacing,
    whiteSpace: "pre",
    lineHeight: 1.1,
    willChange: "transform, opacity"
  } }, text);
}
function ImageSprite({
  src,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = "cover",
  placeholder = null
  // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }
  const content = placeholder ? /* @__PURE__ */ React.createElement("div", { style: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)",
    color: "#6b6458",
    fontFamily: "JetBrains Mono, ui-monospace, monospace",
    fontSize: 13,
    letterSpacing: "0.04em",
    textTransform: "uppercase"
  } }, placeholder.label || "image") : /* @__PURE__ */ React.createElement("img", { src, alt: "", loading: "lazy", style: { width: "100%", height: "100%", objectFit: fit, display: "block" } });
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center",
    borderRadius: radius,
    overflow: "hidden",
    willChange: "transform, opacity"
  } }, content);
}
function RectSprite({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  color = "#111",
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render
  // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }
  const overrides = render ? render(spriteCtx) : {};
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    left: x,
    top: y,
    width,
    height,
    background: color,
    borderRadius: radius,
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center",
    willChange: "transform, opacity",
    ...overrides
  } });
}
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = "#f6f4ef",
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = "animstage",
  children
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ":t") || "0");
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch {
      return 0;
    }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);
  React.useEffect(() => {
    try {
      localStorage.setItem(persistKey + ":t", String(time));
    } catch {
    }
  }, [time, persistKey]);
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const s = Math.min(
        el.clientWidth / width,
        el.clientHeight / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [width, height]);
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1e3;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else {
            next = duration;
            setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.code === "ArrowLeft") {
        setTime((t) => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === "ArrowRight") {
        setTime((t) => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === "0" || e.code === "Home") {
        setTime(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration]);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );
  return /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: stageRef,
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "transparent",
        fontFamily: "Inter, system-ui, sans-serif"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      flex: 1,
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      minHeight: 0
    } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: canvasRef,
        style: {
          width,
          height,
          background,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "center",
          flexShrink: 0,
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement(TimelineContext.Provider, { value: ctxValue }, children)
    ))
  );
}
function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };
  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };
  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? time / duration * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor(total * 100 % 100);
    return `${String(m).padStart(1, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };
  const mono = "JetBrains Mono, ui-monospace, SFMono-Regular, monospace";
  return /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    background: "rgba(20,20,20,0.92)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    borderRadius: 8,
    color: "#f6f4ef",
    fontFamily: "Inter, system-ui, sans-serif",
    userSelect: "none",
    flexShrink: 0
  } }, /* @__PURE__ */ React.createElement(IconButton, { onClick: onReset, title: "Return to start (0)" }, /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M3 2v10M12 2L5 7l7 5V2z", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round", strokeLinecap: "round" }))), /* @__PURE__ */ React.createElement(IconButton, { onClick: onPlayPause, title: "Play/pause (space)" }, playing ? /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none" }, /* @__PURE__ */ React.createElement("rect", { x: "3", y: "2", width: "3", height: "10", fill: "currentColor" }), /* @__PURE__ */ React.createElement("rect", { x: "8", y: "2", width: "3", height: "10", fill: "currentColor" })) : /* @__PURE__ */ React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none" }, /* @__PURE__ */ React.createElement("path", { d: "M3 2l9 5-9 5V2z", fill: "currentColor" }))), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: mono,
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    width: 64,
    textAlign: "right",
    color: "#f6f4ef"
  } }, fmt(time)), /* @__PURE__ */ React.createElement(
    "div",
    {
      ref: trackRef,
      onMouseMove: onTrackMove,
      onMouseLeave: onTrackLeave,
      onMouseDown: onTrackDown,
      style: {
        flex: 1,
        height: 22,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
      }
    },
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 4,
      background: "rgba(255,255,255,0.12)",
      borderRadius: 2
    } }),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: 0,
      width: `${pct}%`,
      height: 4,
      background: "oklch(72% 0.12 250)",
      borderRadius: 2
    } }),
    /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: `${pct}%`,
      top: "50%",
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      background: "#fff",
      borderRadius: 6,
      boxShadow: "0 2px 4px rgba(0,0,0,0.4)"
    } })
  ), /* @__PURE__ */ React.createElement("div", { style: {
    fontFamily: mono,
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    width: 64,
    textAlign: "left",
    color: "rgba(246,244,239,0.55)"
  } }, fmt(duration)));
}
function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick,
      title,
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hover ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        color: "#f6f4ef",
        cursor: "pointer",
        padding: 0,
        transition: "background 120ms"
      }
    },
    children
  );
}
Object.assign(window, {
  Easing,
  interpolate,
  animate,
  clamp,
  TimelineContext,
  useTime,
  useTimeline,
  Sprite,
  SpriteContext,
  useSprite,
  TextSprite,
  ImageSprite,
  RectSprite,
  Stage,
  PlaybackBar
});
const C = {
  bg0: "#02060f",
  bg1: "#0a1326",
  gridLine: "oklch(55% 0.06 230 / 0.35)",
  oldMetal0: "#9aa3ad",
  oldMetal1: "#5a6470",
  oldMetal2: "#2b323d",
  oldAccent: "oklch(72% 0.16 150)",
  // standard green status LED
  // Cloud force — cyan/azure
  cloud0: "oklch(85% 0.12 230)",
  cloud1: "oklch(72% 0.18 230)",
  cloud2: "oklch(55% 0.20 240)",
  // AI force — violet/magenta
  ai0: "oklch(85% 0.14 310)",
  ai1: "oklch(70% 0.22 310)",
  ai2: "oklch(55% 0.24 320)",
  // New station — chrome + cyan accents + violet brain
  chromeHi: "oklch(94% 0.02 230)",
  chromeMid: "oklch(72% 0.03 230)",
  chromeLo: "oklch(32% 0.04 240)",
  accent: "oklch(80% 0.18 200)",
  accent2: "oklch(75% 0.22 290)"
};
const FusionThemeCtx = React.createContext("dark");
const useFusionTheme = () => React.useContext(FusionThemeCtx);
function SceneDefs() {
  const ft = useFusionTheme();
  const isLight = ft === "light";
  return /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("filter", { id: "glowSoft", x: "-50%", y: "-50%", width: "200%", height: "200%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "4", result: "b" }), /* @__PURE__ */ React.createElement("feMerge", null, /* @__PURE__ */ React.createElement("feMergeNode", { in: "b" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "SourceGraphic" }))), /* @__PURE__ */ React.createElement("filter", { id: "glowStrong", x: "-100%", y: "-100%", width: "300%", height: "300%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "10", result: "b" }), /* @__PURE__ */ React.createElement("feMerge", null, /* @__PURE__ */ React.createElement("feMergeNode", { in: "b" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "b" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "SourceGraphic" }))), /* @__PURE__ */ React.createElement("filter", { id: "cyanGlow", x: "-100%", y: "-100%", width: "300%", height: "300%" }, /* @__PURE__ */ React.createElement("feGaussianBlur", { stdDeviation: "3", result: "b" }), /* @__PURE__ */ React.createElement("feFlood", { floodColor: C.accent, result: "c" }), /* @__PURE__ */ React.createElement("feComposite", { in: "c", in2: "b", operator: "in", result: "cb" }), /* @__PURE__ */ React.createElement("feMerge", null, /* @__PURE__ */ React.createElement("feMergeNode", { in: "cb" }), /* @__PURE__ */ React.createElement("feMergeNode", { in: "SourceGraphic" }))), /* @__PURE__ */ React.createElement("radialGradient", { id: "bgVignette", cx: "50%", cy: "55%", r: "70%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: isLight ? "rgba(200,215,255,0)" : "rgba(20,30,55,0)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: isLight ? "rgba(160,185,230,0.25)" : "rgba(0,0,0,0.95)" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "floorGrad", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: isLight ? "rgba(80,110,200,0.0)" : "rgba(20,40,80,0.0)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: isLight ? "rgba(80,110,200,0.12)" : "rgba(20,40,80,0.5)" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "cloudBeam", x1: "0", y1: "0.5", x2: "1", y2: "0.5" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: C.cloud2, stopOpacity: "0" }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: C.cloud0, stopOpacity: "1" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: C.cloud1, stopOpacity: "0.9" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "aiBeam", x1: "1", y1: "0.5", x2: "0", y2: "0.5" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: C.ai2, stopOpacity: "0" }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: C.ai0, stopOpacity: "1" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: C.ai1, stopOpacity: "0.9" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "chromeBody", x1: "0", y1: "0", x2: "0", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: C.chromeHi }), /* @__PURE__ */ React.createElement("stop", { offset: "35%", stopColor: C.chromeMid }), /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: C.chromeLo }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: C.chromeMid })), /* @__PURE__ */ React.createElement("linearGradient", { id: "chromeSide", x1: "0", y1: "0", x2: "1", y2: "0" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: C.chromeLo }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: C.chromeHi }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: C.chromeLo })), /* @__PURE__ */ React.createElement("radialGradient", { id: "brainGrad", cx: "45%", cy: "35%", r: "65%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "oklch(95% 0.08 290)", stopOpacity: "0.95" }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: "oklch(75% 0.22 290)", stopOpacity: "0.6" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "oklch(40% 0.20 280)", stopOpacity: "0.15" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "oldMetalGrad", x1: "0", y1: "0", x2: "1", y2: "0" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: C.oldMetal2 }), /* @__PURE__ */ React.createElement("stop", { offset: "50%", stopColor: C.oldMetal0 }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: C.oldMetal2 })));
}
function Background() {
  const t = useTime();
  const ft = useFusionTheme();
  const isLight = ft === "light";
  const gridColor = isLight ? "oklch(45% 0.14 230 / 0.35)" : C.gridLine;
  const starFill = isLight ? "rgba(30,50,140,0.5)" : "white";
  const starOpMul = isLight ? 0.22 : 0.18;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: "0", y: "0", width: "1280", height: "720", fill: "var(--bg)" }), /* @__PURE__ */ React.createElement("g", { opacity: "0.55" }, Array.from({ length: 18 }).map((_, i) => {
    const y = 500 + i * 14 + i * i * 0.6;
    if (y > 720) return null;
    return /* @__PURE__ */ React.createElement(
      "line",
      {
        key: "h" + i,
        x1: "0",
        y1: y,
        x2: "1280",
        y2: y,
        stroke: gridColor,
        strokeWidth: "0.6"
      }
    );
  }), Array.from({ length: 21 }).map((_, i) => {
    const px = i / 20;
    const x0 = 640;
    const x1 = px * 1280;
    return /* @__PURE__ */ React.createElement(
      "line",
      {
        key: "v" + i,
        x1: x0,
        y1: "500",
        x2: x1,
        y2: "720",
        stroke: gridColor,
        strokeWidth: "0.6"
      }
    );
  })), /* @__PURE__ */ React.createElement("rect", { x: "0", y: "500", width: "1280", height: "220", fill: "url(#floorGrad)" }), /* @__PURE__ */ React.createElement("rect", { x: "0", y: "0", width: "1280", height: "720", fill: "url(#bgVignette)" }), Array.from({ length: 60 }).map((_, i) => {
    const seed = i * 137.5;
    const x = seed % 1280;
    const y = seed * 1.7 % 460;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i));
    return /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: i,
        cx: x,
        cy: y,
        r: 0.6 + i % 3 * 0.3,
        fill: starFill,
        opacity: starOpMul * tw
      }
    );
  }));
}
function OldBaseStation({ cx, cy, opacity, scale = 1, shakeAmp = 0, dissolve = 0 }) {
  const t = useTime();
  const sx = shakeAmp ? Math.sin(t * 60) * shakeAmp : 0;
  const sy = shakeAmp ? Math.cos(t * 55) * shakeAmp * 0.6 : 0;
  const d = dissolve;
  const drift = d * 60;
  const op = opacity * (1 - d * 0.85);
  return /* @__PURE__ */ React.createElement("g", { transform: `translate(${cx + sx}, ${cy + sy}) scale(${scale})`, opacity: op }, /* @__PURE__ */ React.createElement("ellipse", { cx: "0", cy: "0", rx: "90", ry: "9", fill: "rgba(0,0,0,0.55)" }), /* @__PURE__ */ React.createElement("g", { transform: `translate(0, ${d * 5})` }, /* @__PURE__ */ React.createElement("rect", { x: "-44", y: "-46", width: "88", height: "46", fill: "url(#oldMetalGrad)", stroke: C.oldMetal2, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("rect", { x: "-40", y: "-42", width: "80", height: "38", fill: C.oldMetal2 }), /* @__PURE__ */ React.createElement("rect", { x: "-34", y: "-37", width: "20", height: "3", fill: C.oldAccent, opacity: "0.85" }), /* @__PURE__ */ React.createElement("rect", { x: "-34", y: "-30", width: "14", height: "3", fill: C.oldAccent, opacity: "0.55" }), /* @__PURE__ */ React.createElement("rect", { x: "-34", y: "-23", width: "22", height: "3", fill: "oklch(70% 0.18 60)", opacity: "0.7" }), /* @__PURE__ */ React.createElement("g", { stroke: C.oldMetal2, strokeWidth: "0.5" }, Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ React.createElement("line", { key: i, x1: 6, y1: -40 + i * 5, x2: 36, y2: -40 + i * 5 }))), /* @__PURE__ */ React.createElement("rect", { x: "-40", y: "-12", width: "34", height: "9", fill: "#0d0f12", stroke: C.oldMetal1, strokeWidth: "0.5" }), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "-23",
      y: "-5",
      textAnchor: "middle",
      fontSize: "6.5",
      fontFamily: "JetBrains Mono, monospace",
      fill: C.oldMetal0,
      letterSpacing: "0.05em"
    },
    "3GPP gNB"
  )), /* @__PURE__ */ React.createElement("g", { transform: `translate(0, ${-d * drift * 0.2})` }, /* @__PURE__ */ React.createElement("rect", { x: "-5", y: "-220", width: "10", height: "174", fill: "url(#oldMetalGrad)" }), /* @__PURE__ */ React.createElement("rect", { x: "-7", y: "-220", width: "14", height: "6", fill: C.oldMetal2 }), /* @__PURE__ */ React.createElement("line", { x1: "-5", y1: "-100", x2: "5", y2: "-100", stroke: C.oldMetal2, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("line", { x1: "-5", y1: "-160", x2: "5", y2: "-160", stroke: C.oldMetal2, strokeWidth: "1" })), /* @__PURE__ */ React.createElement("g", { transform: `translate(28, -140) translate(${d * 15}, ${-d * 30})`, opacity: 1 - d * 0.9 }, /* @__PURE__ */ React.createElement("line", { x1: "-28", y1: "0", x2: "-6", y2: "0", stroke: C.oldMetal2, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "0", cy: "0", rx: "14", ry: "20", fill: C.oldMetal0, stroke: C.oldMetal2, strokeWidth: "1" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "-2", cy: "-2", rx: "9", ry: "14", fill: C.oldMetal1 }), /* @__PURE__ */ React.createElement("circle", { cx: "-2", cy: "-2", r: "2", fill: C.oldMetal2 })), /* @__PURE__ */ React.createElement("g", { transform: `translate(0, ${-d * drift})` }, /* @__PURE__ */ React.createElement("rect", { x: "-46", y: "-228", width: "92", height: "10", fill: C.oldMetal2 }), /* @__PURE__ */ React.createElement("rect", { x: "-46", y: "-218", width: "92", height: "3", fill: C.oldMetal1 }), [
    { x: -52, y: -278, rot: -8 },
    { x: 0, y: -284, rot: 0 },
    { x: 52, y: -278, rot: 8 }
  ].map((p, i) => /* @__PURE__ */ React.createElement(
    "g",
    {
      key: i,
      transform: `translate(${p.x}, ${p.y}) rotate(${p.rot})`,
      opacity: 1 - d * (0.6 + i * 0.1)
    },
    /* @__PURE__ */ React.createElement("rect", { x: "-8", y: "0", width: "16", height: "56", fill: C.oldMetal0, stroke: C.oldMetal2, strokeWidth: "0.8", rx: "2" }),
    /* @__PURE__ */ React.createElement("rect", { x: "-6", y: "2", width: "12", height: "2", fill: C.oldMetal2 }),
    /* @__PURE__ */ React.createElement("rect", { x: "-6", y: "48", width: "12", height: "2", fill: C.oldMetal2 }),
    /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "56", x2: -p.x * 0.6, y2: 56 + (-p.y - 228) * 0 + 10, stroke: C.oldMetal2, strokeWidth: "1.2" })
  )), /* @__PURE__ */ React.createElement("g", { stroke: C.oldMetal2, strokeWidth: "1.2", fill: "none" }, /* @__PURE__ */ React.createElement("line", { x1: "-46", y1: "-222", x2: "-52", y2: "-262" }), /* @__PURE__ */ React.createElement("line", { x1: "46", y1: "-222", x2: "52", y2: "-262" }), /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "-228", x2: "0", y2: "-262" }))), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "0",
      cy: "-296",
      r: "3",
      fill: Math.sin(t * 4) > 0 ? "oklch(70% 0.22 25)" : "oklch(40% 0.18 25)",
      filter: "url(#glowSoft)"
    }
  ), d > 0.02 && Array.from({ length: 18 }).map((_, i) => {
    const ang = i / 18 * Math.PI * 2;
    const r = 30 + d * 140 + i % 3 * 12;
    const px = Math.cos(ang) * r;
    const py = -120 + Math.sin(ang) * r * 0.7 - d * 60;
    return /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: i,
        cx: px,
        cy: py,
        r: 1.2 + i % 4 * 0.5,
        fill: i % 2 ? C.cloud0 : C.ai0,
        opacity: Math.max(0, 1 - d) * 0.9
      }
    );
  }));
}
function CloudForce({ x0, x1, y, intensity, t, converge }) {
  const headX = x0 + (x1 - x0) * converge;
  return /* @__PURE__ */ React.createElement("g", { opacity: intensity }, /* @__PURE__ */ React.createElement("g", { transform: `translate(${x0 - 40}, ${y})` }, /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "0",
      cy: "0",
      rx: 130 * intensity,
      ry: 90 * intensity,
      fill: C.cloud2,
      opacity: "0.18",
      filter: "url(#glowStrong)"
    }
  ), /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "-30",
      cy: "-15",
      rx: 70 * intensity,
      ry: 55 * intensity,
      fill: C.cloud1,
      opacity: "0.22",
      filter: "url(#glowSoft)"
    }
  ), /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "30",
      cy: "10",
      rx: 60 * intensity,
      ry: 45 * intensity,
      fill: C.cloud0,
      opacity: "0.28",
      filter: "url(#glowSoft)"
    }
  )), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: `M ${x0} ${y} Q ${(x0 + headX) / 2} ${y + Math.sin(t * 3) * 18} ${headX} ${y}`,
      stroke: "url(#cloudBeam)",
      strokeWidth: 5 + intensity * 6,
      strokeLinecap: "round",
      fill: "none",
      filter: "url(#glowSoft)"
    }
  ), Array.from({ length: 14 }).map((_, i) => {
    const phase = (t * 0.7 + i / 14) % 1;
    const px = x0 + (headX - x0) * phase;
    const wob = Math.sin(t * 2 + i) * 14 * (1 - phase * 0.5);
    const py = y + wob;
    const op = Math.sin(phase * Math.PI) * intensity;
    return /* @__PURE__ */ React.createElement(
      "g",
      {
        key: i,
        transform: `translate(${px}, ${py}) rotate(${i * 25 + t * 30})`,
        opacity: op
      },
      /* @__PURE__ */ React.createElement(
        "polygon",
        {
          points: "0,-8 7,-4 7,4 0,8 -7,4 -7,-4",
          fill: "none",
          stroke: C.cloud0,
          strokeWidth: "1.4"
        }
      ),
      /* @__PURE__ */ React.createElement(
        "polygon",
        {
          points: "0,-4 3.5,-2 3.5,2 0,4 -3.5,2 -3.5,-2",
          fill: C.cloud0,
          opacity: "0.7"
        }
      )
    );
  }), /* @__PURE__ */ React.createElement("g", { transform: `translate(${x0 - 10}, ${y - 190})`, opacity: intensity }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: "-4",
      y: "-22",
      width: "232",
      height: "34",
      rx: "2",
      fill: "rgba(8,18,38,0.6)",
      stroke: C.cloud1,
      strokeWidth: "1"
    }
  ), /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "-5", r: "4", fill: C.cloud0, filter: "url(#glowSoft)" }), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "30",
      y: "-1",
      fontSize: "20",
      fontWeight: "700",
      fill: C.cloud0,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.14em"
    },
    "CLOUD-NATIVE"
  ), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "30",
      y: "11",
      fontSize: "9",
      fill: C.cloud1,
      fontFamily: "JetBrains Mono, monospace",
      letterSpacing: "0.18em"
    },
    "CONTAINERS \xB7 K8S \xB7 CI/CD"
  )));
}
function AIForce({ x0, x1, y, intensity, t, converge }) {
  const headX = x0 + (x1 - x0) * converge;
  return /* @__PURE__ */ React.createElement("g", { opacity: intensity }, /* @__PURE__ */ React.createElement("g", { transform: `translate(${x0 + 40}, ${y})` }, /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "0",
      cy: "0",
      rx: 130 * intensity,
      ry: 90 * intensity,
      fill: C.ai2,
      opacity: "0.20",
      filter: "url(#glowStrong)"
    }
  ), /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "30",
      cy: "-10",
      rx: 70 * intensity,
      ry: 55 * intensity,
      fill: C.ai1,
      opacity: "0.22",
      filter: "url(#glowSoft)"
    }
  ), /* @__PURE__ */ React.createElement(
    "ellipse",
    {
      cx: "-30",
      cy: "10",
      rx: 60 * intensity,
      ry: 45 * intensity,
      fill: C.ai0,
      opacity: "0.28",
      filter: "url(#glowSoft)"
    }
  ), (() => {
    const nodes = [[-40, -25], [-20, -10], [0, -30], [20, -5], [40, -20], [-30, 20], [10, 25], [35, 15]];
    return /* @__PURE__ */ React.createElement("g", null, nodes.map(
      ([nx, ny], i) => nodes.slice(i + 1).map(([mx, my], j) => /* @__PURE__ */ React.createElement(
        "line",
        {
          key: `${i}-${j}`,
          x1: nx,
          y1: ny,
          x2: mx,
          y2: my,
          stroke: C.ai0,
          strokeWidth: "0.6",
          opacity: 0.15 + 0.25 * Math.abs(Math.sin(t * 1.5 + i + j))
        }
      ))
    ), nodes.map(([nx, ny], i) => /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: i,
        cx: nx,
        cy: ny,
        r: 1.6 + Math.abs(Math.sin(t * 2 + i)) * 1.2,
        fill: C.ai0
      }
    )));
  })()), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: `M ${x0} ${y} Q ${(x0 + headX) / 2} ${y + Math.cos(t * 3) * 18} ${headX} ${y}`,
      stroke: "url(#aiBeam)",
      strokeWidth: 5 + intensity * 6,
      strokeLinecap: "round",
      fill: "none",
      filter: "url(#glowSoft)"
    }
  ), Array.from({ length: 14 }).map((_, i) => {
    const phase = (t * 0.7 + i / 14) % 1;
    const px = x0 + (headX - x0) * phase;
    const wob = Math.cos(t * 2 + i) * 14 * (1 - phase * 0.5);
    const py = y + wob;
    const op = Math.sin(phase * Math.PI) * intensity;
    return /* @__PURE__ */ React.createElement("g", { key: i, transform: `translate(${px}, ${py})`, opacity: op }, /* @__PURE__ */ React.createElement("circle", { r: "6", fill: "none", stroke: C.ai0, strokeWidth: "1.2" }), /* @__PURE__ */ React.createElement("circle", { r: "2.5", fill: C.ai0 }), /* @__PURE__ */ React.createElement("line", { x1: "-8", y1: "0", x2: "-12", y2: "0", stroke: C.ai0, strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("line", { x1: "8", y1: "0", x2: "12", y2: "0", stroke: C.ai0, strokeWidth: "0.8" }));
  }), /* @__PURE__ */ React.createElement("g", { transform: `translate(${x0 + 10}, ${y - 190})`, opacity: intensity }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: "-208",
      y: "-22",
      width: "212",
      height: "34",
      rx: "2",
      fill: "rgba(20,8,38,0.6)",
      stroke: C.ai1,
      strokeWidth: "1"
    }
  ), /* @__PURE__ */ React.createElement("circle", { cx: "-14", cy: "-5", r: "4", fill: C.ai0, filter: "url(#glowSoft)" }), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "-30",
      y: "-1",
      textAnchor: "end",
      fontSize: "20",
      fontWeight: "700",
      fill: C.ai0,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.14em"
    },
    "AI-NATIVE"
  ), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "-30",
      y: "11",
      textAnchor: "end",
      fontSize: "9",
      fill: C.ai1,
      fontFamily: "JetBrains Mono, monospace",
      letterSpacing: "0.18em"
    },
    "INFERENCE \xB7 LLM \xB7 AGENTIC"
  )));
}
function FusionBurst({ cx, cy, intensity, t }) {
  if (intensity <= 0) return null;
  const flash = intensity;
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx,
      cy,
      r: 40 + flash * 240,
      fill: "white",
      opacity: flash * 0.85,
      filter: "url(#glowStrong)"
    }
  ), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx,
      cy,
      r: 20 + flash * 120,
      fill: C.accent,
      opacity: flash * 0.7,
      filter: "url(#glowStrong)"
    }
  ), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx,
      cy,
      r: 10 + flash * 60,
      fill: C.accent2,
      opacity: flash * 0.7,
      filter: "url(#glowStrong)"
    }
  ), [0, 0.25, 0.5].map((delay, k) => {
    const local = clamp(intensity - delay, 0, 1);
    if (local <= 0) return null;
    const r = local * 360;
    return /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: k,
        cx,
        cy,
        r,
        fill: "none",
        stroke: k === 0 ? "white" : k === 1 ? C.accent : C.accent2,
        strokeWidth: 3 * (1 - local),
        opacity: 1 - local,
        filter: "url(#glowSoft)"
      }
    );
  }), Array.from({ length: 36 }).map((_, i) => {
    const ang = i / 36 * Math.PI * 2;
    const r = 60 + intensity * 260 + i % 4 * 18;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;
    const isCloud = i % 2 === 0;
    return /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: i,
        cx: px,
        cy: py,
        r: 1.5 + i % 3,
        fill: isCloud ? C.cloud0 : C.ai0,
        opacity: 1 - intensity * 0.6,
        filter: "url(#glowSoft)"
      }
    );
  }));
}
function NeuralBrain({ t, pulse }) {
  const nodes = [
    [-26, 4],
    [-12, -12],
    [4, -6],
    [18, -16],
    [26, 0],
    [-18, 12],
    [-2, 16],
    [14, 14],
    [-8, -2],
    [10, 2]
  ];
  return /* @__PURE__ */ React.createElement("g", null, nodes.map(
    ([nx, ny], i) => nodes.slice(i + 1).map(([mx, my], j) => {
      const d = Math.hypot(mx - nx, my - ny);
      if (d > 28) return null;
      const op = 0.18 + 0.5 * Math.abs(Math.sin(t * 1.8 + i + j));
      return /* @__PURE__ */ React.createElement(
        "line",
        {
          key: `${i}-${j}`,
          x1: nx,
          y1: ny,
          x2: mx,
          y2: my,
          stroke: "oklch(92% 0.10 290)",
          strokeWidth: "0.7",
          opacity: op
        }
      );
    })
  ), nodes.map(([nx, ny], i) => {
    const r = 1.6 + Math.abs(Math.sin(t * 2.2 + i * 0.7)) * 1.5;
    return /* @__PURE__ */ React.createElement(
      "circle",
      {
        key: i,
        cx: nx,
        cy: ny,
        r,
        fill: "oklch(95% 0.12 290)",
        opacity: 0.85,
        filter: "url(#glowSoft)"
      }
    );
  }), /* @__PURE__ */ React.createElement(
    "circle",
    {
      cx: "0",
      cy: "0",
      r: 6 + pulse * 26,
      fill: "none",
      stroke: "oklch(90% 0.15 290)",
      strokeWidth: 1 + pulse * 1.5,
      opacity: 1 - pulse,
      filter: "url(#glowSoft)"
    }
  ));
}
function Limb({ rootX, rootY, baseAngle, length1, length2, t, phase, deploy, accent = C.accent }) {
  const wobble = Math.sin(t * 1.2 + phase) * 4;
  const ang1 = (baseAngle + wobble) * Math.PI / 180;
  const seg1Len = length1 * deploy;
  const jx = rootX + Math.cos(ang1) * seg1Len;
  const jy = rootY + Math.sin(ang1) * seg1Len;
  const bend = 32 + Math.sin(t * 1.5 + phase + 1) * 6;
  const ang2 = (baseAngle + wobble + bend) * Math.PI / 180;
  const seg2Len = length2 * deploy;
  const ex = jx + Math.cos(ang2) * seg2Len;
  const ey = jy + Math.sin(ang2) * seg2Len;
  if (deploy <= 0.01) return null;
  return /* @__PURE__ */ React.createElement("g", { opacity: Math.min(1, deploy * 1.5) }, /* @__PURE__ */ React.createElement("circle", { cx: rootX, cy: rootY, r: "6", fill: C.chromeMid, stroke: C.chromeLo, strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("circle", { cx: rootX, cy: rootY, r: "3", fill: C.chromeLo }), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: rootX,
      y1: rootY,
      x2: jx,
      y2: jy,
      stroke: C.chromeLo,
      strokeWidth: "9",
      strokeLinecap: "round"
    }
  ), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: rootX,
      y1: rootY,
      x2: jx,
      y2: jy,
      stroke: "url(#chromeSide)",
      strokeWidth: "6",
      strokeLinecap: "round"
    }
  ), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: rootX,
      y1: rootY,
      x2: jx,
      y2: jy,
      stroke: accent,
      strokeWidth: "1",
      strokeLinecap: "round",
      opacity: "0.7"
    }
  ), /* @__PURE__ */ React.createElement("circle", { cx: jx, cy: jy, r: "5", fill: C.chromeMid, stroke: C.chromeLo, strokeWidth: "0.8" }), /* @__PURE__ */ React.createElement("circle", { cx: jx, cy: jy, r: "2.5", fill: accent, filter: "url(#glowSoft)" }), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: jx,
      y1: jy,
      x2: ex,
      y2: ey,
      stroke: C.chromeLo,
      strokeWidth: "7",
      strokeLinecap: "round"
    }
  ), /* @__PURE__ */ React.createElement(
    "line",
    {
      x1: jx,
      y1: jy,
      x2: ex,
      y2: ey,
      stroke: "url(#chromeSide)",
      strokeWidth: "4.5",
      strokeLinecap: "round"
    }
  ), /* @__PURE__ */ React.createElement("g", { transform: `translate(${ex}, ${ey}) rotate(${ang2 * 180 / Math.PI + 90})` }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: "-6",
      y: "-14",
      width: "12",
      height: "28",
      rx: "2.5",
      fill: "url(#chromeBody)",
      stroke: C.chromeLo,
      strokeWidth: "0.8"
    }
  ), /* @__PURE__ */ React.createElement("rect", { x: "-4", y: "-11", width: "8", height: "2", fill: accent, opacity: "0.9" }), /* @__PURE__ */ React.createElement("rect", { x: "-4", y: "-6", width: "8", height: "2", fill: accent, opacity: "0.6" }), /* @__PURE__ */ React.createElement("rect", { x: "-4", y: "-1", width: "8", height: "2", fill: accent, opacity: "0.9" }), /* @__PURE__ */ React.createElement("rect", { x: "-4", y: "4", width: "8", height: "2", fill: accent, opacity: "0.6" }), /* @__PURE__ */ React.createElement("circle", { cx: "0", cy: "-18", r: "2", fill: accent, filter: "url(#cyanGlow)" })));
}
function ShineSweep({ x, y, width, height, t, active }) {
  if (!active) return null;
  const period = 4;
  const phase = t % period / period;
  const sweepX = -width * 0.4 + phase * width * 1.6;
  return /* @__PURE__ */ React.createElement("g", { clipPath: "url(#bodyClip)" }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: x + sweepX - 30,
      y,
      width: "40",
      height,
      fill: "white",
      opacity: "0.25",
      transform: `skewX(-18)`,
      style: { mixBlendMode: "screen" }
    }
  ), /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: x + sweepX - 12,
      y,
      width: "14",
      height,
      fill: "white",
      opacity: "0.45",
      transform: `skewX(-18)`,
      style: { mixBlendMode: "screen" }
    }
  ));
}
function NewBaseStation({ cx, cy, opacity, scale = 1, materialize = 1, brainPulse = 0, shine = false, t }) {
  const m = clamp(materialize, 0, 1);
  const op = opacity * Math.min(1, m * 1.2);
  const blur = (1 - m) * 4;
  const deploy = clamp((m - 0.45) / 0.55, 0, 1);
  return /* @__PURE__ */ React.createElement(
    "g",
    {
      transform: `translate(${cx}, ${cy}) scale(${scale})`,
      opacity: op,
      style: { filter: blur > 0.1 ? `blur(${blur}px)` : "none" }
    },
    /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "bodyClip" }, /* @__PURE__ */ React.createElement("path", { d: "M -26 -30 Q -34 -110 -22 -200 L 22 -200 Q 34 -110 26 -30 Z" }))),
    /* @__PURE__ */ React.createElement("ellipse", { cx: "0", cy: "6", rx: "110", ry: "14", fill: "rgba(0,0,0,0.7)" }),
    /* @__PURE__ */ React.createElement(
      "ellipse",
      {
        cx: "0",
        cy: "0",
        rx: "100",
        ry: "9",
        fill: C.accent,
        opacity: 0.35 + brainPulse * 0.3,
        filter: "url(#glowStrong)"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-58",
        y: "-32",
        width: "116",
        height: "32",
        rx: "6",
        fill: "url(#chromeBody)",
        stroke: C.chromeLo,
        strokeWidth: "1"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-54",
        y: "-28",
        width: "108",
        height: "3",
        rx: "1.5",
        fill: C.accent,
        opacity: 0.8 + brainPulse * 0.2,
        filter: "url(#cyanGlow)"
      }
    ),
    /* @__PURE__ */ React.createElement("rect", { x: "-50", y: "-21", width: "100", height: "14", rx: "2", fill: C.chromeLo }),
    /* @__PURE__ */ React.createElement(
      "g",
      {
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "5",
        fill: C.accent,
        opacity: "0.95",
        letterSpacing: "0.05em"
      },
      /* @__PURE__ */ React.createElement("text", { x: "-46", y: "-13" }, "6G \xB7 CN/AI"),
      /* @__PURE__ */ React.createElement("text", { x: "-46", y: "-7" }, "\u25AE\u25AE\u25AE\u25AE\u25AE\u25AE\u25AE\u25AF"),
      /* @__PURE__ */ React.createElement("text", { x: "18", y: "-13", textAnchor: "start" }, "UPLINK"),
      /* @__PURE__ */ React.createElement("text", { x: "18", y: "-7", textAnchor: "start" }, Math.round(80 + Math.sin(t * 2) * 10), " Tb/s")
    ),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M -26 -30 Q -34 -110 -22 -200 L 22 -200 Q 34 -110 26 -30 Z",
        fill: "url(#chromeBody)",
        stroke: C.chromeLo,
        strokeWidth: "1.2"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M 0 -34 L 0 -198",
        stroke: C.accent,
        strokeWidth: "2",
        opacity: 0.55 + brainPulse * 0.45,
        filter: "url(#cyanGlow)"
      }
    ),
    [-60, -90, -120, -150, -180].map((y, i) => /* @__PURE__ */ React.createElement("g", { key: i, opacity: 0.7 }, /* @__PURE__ */ React.createElement(
      "path",
      {
        d: `M -14 ${y} L 0 ${y - 6} L 14 ${y}`,
        fill: "none",
        stroke: C.chromeHi,
        strokeWidth: "1",
        opacity: "0.7"
      }
    ), /* @__PURE__ */ React.createElement(
      "path",
      {
        d: `M -10 ${y - 2} L 0 ${y - 6} L 10 ${y - 2}`,
        fill: "none",
        stroke: C.accent,
        strokeWidth: "0.6",
        opacity: 0.4 + 0.5 * Math.abs(Math.sin(t * 2 + i))
      }
    ))),
    /* @__PURE__ */ React.createElement(ShineSweep, { x: -34, y: -200, width: 68, height: 170, t, active: shine }),
    /* @__PURE__ */ React.createElement(
      Limb,
      {
        rootX: -22,
        rootY: -150,
        baseAngle: 155,
        length1: 48,
        length2: 42,
        t,
        phase: 0.2,
        deploy,
        accent: C.cloud0
      }
    ),
    /* @__PURE__ */ React.createElement(
      Limb,
      {
        rootX: 22,
        rootY: -150,
        baseAngle: 25,
        length1: 48,
        length2: 42,
        t,
        phase: 1.1,
        deploy,
        accent: C.ai0
      }
    ),
    /* @__PURE__ */ React.createElement(
      Limb,
      {
        rootX: -22,
        rootY: -90,
        baseAngle: 175,
        length1: 42,
        length2: 36,
        t,
        phase: 2.3,
        deploy,
        accent: C.cloud0
      }
    ),
    /* @__PURE__ */ React.createElement(
      Limb,
      {
        rootX: 22,
        rootY: -90,
        baseAngle: 5,
        length1: 42,
        length2: 36,
        t,
        phase: 3,
        deploy,
        accent: C.ai0
      }
    ),
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-30",
        y: "-156",
        width: "60",
        height: "14",
        rx: "3",
        fill: "url(#chromeBody)",
        stroke: C.chromeLo,
        strokeWidth: "0.8"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-26",
        y: "-152",
        width: "52",
        height: "2",
        fill: C.accent,
        opacity: "0.85",
        filter: "url(#cyanGlow)"
      }
    ),
    /* @__PURE__ */ React.createElement(
      "rect",
      {
        x: "-12",
        y: "-220",
        width: "24",
        height: "22",
        fill: "url(#chromeBody)",
        stroke: C.chromeLo,
        strokeWidth: "0.8"
      }
    ),
    /* @__PURE__ */ React.createElement("rect", { x: "-10", y: "-218", width: "20", height: "2", fill: C.accent2, opacity: "0.85" }),
    /* @__PURE__ */ React.createElement("rect", { x: "-10", y: "-212", width: "20", height: "1.4", fill: C.accent2, opacity: "0.6" }),
    /* @__PURE__ */ React.createElement("g", { transform: "translate(0, -240)" }, /* @__PURE__ */ React.createElement(
      "ellipse",
      {
        cx: "0",
        cy: "0",
        rx: 48,
        ry: 42,
        fill: C.accent2,
        opacity: 0.25 + brainPulse * 0.35,
        filter: "url(#glowStrong)"
      }
    ), /* @__PURE__ */ React.createElement("ellipse", { cx: "0", cy: "0", rx: "40", ry: "36", fill: "url(#brainGrad)" }), /* @__PURE__ */ React.createElement(
      "ellipse",
      {
        cx: "0",
        cy: "0",
        rx: "40",
        ry: "36",
        fill: "none",
        stroke: C.accent2,
        strokeWidth: "1.2",
        opacity: "0.9"
      }
    ), /* @__PURE__ */ React.createElement(
      "ellipse",
      {
        cx: "0",
        cy: "0",
        rx: "40",
        ry: "6",
        fill: "none",
        stroke: "oklch(92% 0.10 290)",
        strokeWidth: "0.6",
        opacity: "0.5"
      }
    ), /* @__PURE__ */ React.createElement(NeuralBrain, { t, pulse: brainPulse }), /* @__PURE__ */ React.createElement("ellipse", { cx: "-14", cy: "-16", rx: "14", ry: "7", fill: "white", opacity: "0.35" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "12", cy: "14", rx: "8", ry: "3", fill: "white", opacity: "0.15" })),
    /* @__PURE__ */ React.createElement("line", { x1: "0", y1: "-276", x2: "0", y2: "-288", stroke: C.chromeMid, strokeWidth: "1.4" }),
    /* @__PURE__ */ React.createElement(
      "circle",
      {
        cx: "0",
        cy: "-292",
        r: "3",
        fill: C.accent,
        opacity: 0.7 + brainPulse * 0.3,
        filter: "url(#cyanGlow)"
      }
    ),
    deploy > 0.3 && [
      { lbl: "6G", ang: 0, r: 130, hue: 230 },
      { lbl: "\u221E", ang: 1.6, r: 150, hue: 290 },
      { lbl: "\u25C6", ang: 3, r: 120, hue: 200 },
      { lbl: "CN", ang: 4.4, r: 150, hue: 230 },
      { lbl: "AI", ang: 5.6, r: 135, hue: 310 }
    ].map((s, i) => {
      const a = s.ang + t * 0.25;
      const px = Math.cos(a) * s.r;
      const py = -150 + Math.sin(a) * s.r * 0.4;
      return /* @__PURE__ */ React.createElement(
        "g",
        {
          key: i,
          transform: `translate(${px}, ${py})`,
          opacity: (deploy - 0.3) / 0.7
        },
        /* @__PURE__ */ React.createElement(
          "rect",
          {
            x: "-14",
            y: "-10",
            width: "28",
            height: "20",
            rx: "3",
            fill: "rgba(8,16,32,0.85)",
            stroke: `oklch(75% 0.18 ${s.hue})`,
            strokeWidth: "1"
          }
        ),
        /* @__PURE__ */ React.createElement(
          "text",
          {
            x: "0",
            y: "4",
            textAnchor: "middle",
            fontSize: "11",
            fontWeight: "700",
            fontFamily: "JetBrains Mono, monospace",
            fill: `oklch(88% 0.16 ${s.hue})`
          },
          s.lbl
        )
      );
    }),
    m < 0.95 && Array.from({ length: 28 }).map((_, i) => {
      const ang = i / 28 * Math.PI * 2;
      const start = 220;
      const r = start * (1 - m);
      const px = Math.cos(ang) * r;
      const py = -130 + Math.sin(ang) * r * 0.7;
      return /* @__PURE__ */ React.createElement(
        "rect",
        {
          key: i,
          x: px - 2,
          y: py - 2,
          width: "4",
          height: "4",
          fill: i % 2 ? C.cloud0 : C.ai0,
          opacity: (1 - m) * 0.95,
          transform: `rotate(${i * 12 + t * 60} ${px} ${py})`,
          filter: "url(#glowSoft)"
        }
      );
    })
  );
}
function HUD({ phase, t }) {
  const titles = [
    { tag: "PHASE 01 \xB7 BASELINE", headline: "3GPP Standard 6G Base Station" },
    { tag: "PHASE 02 \xB7 CONVERGENCE", headline: "Two Forces Engage" },
    { tag: "PHASE 03 \xB7 FUSION", headline: "Architectural Singularity" },
    { tag: "PHASE 04 \xB7 GENESIS", headline: "Re-assembling the Radio" },
    { tag: "PHASE 05 \xB7 INTELLIGENT", headline: "Cloud-Native \xB7 AI-Native \xB7 6G" }
  ];
  const ti = titles[clamp(phase, 0, 4)];
  return /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("g", { stroke: C.accent, strokeWidth: "1.5", fill: "none", opacity: "0.7" }, /* @__PURE__ */ React.createElement("path", { d: "M 40 40 L 40 64 M 40 40 L 64 40" }), /* @__PURE__ */ React.createElement("path", { d: "M 1240 40 L 1240 64 M 1240 40 L 1216 40" }), /* @__PURE__ */ React.createElement("path", { d: "M 40 680 L 40 656 M 40 680 L 64 680" }), /* @__PURE__ */ React.createElement("path", { d: "M 1240 680 L 1240 656 M 1240 680 L 1216 680" })), /* @__PURE__ */ React.createElement("g", { transform: "translate(40, 40)" }, /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "0",
      y: "14",
      fontSize: "11",
      fontFamily: "JetBrains Mono, monospace",
      fill: C.accent,
      letterSpacing: "0.25em"
    },
    ti.tag
  ), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "0",
      y: "42",
      fontSize: "22",
      fontWeight: "600",
      fill: "white",
      fontFamily: "Inter, sans-serif",
      letterSpacing: "-0.005em"
    },
    ti.headline
  )), /* @__PURE__ */ React.createElement(
    "g",
    {
      transform: "translate(1240, 40)",
      textAnchor: "end",
      fontFamily: "JetBrains Mono, monospace",
      fill: C.accent,
      opacity: "0.85"
    },
    /* @__PURE__ */ React.createElement("text", { x: "0", y: "14", fontSize: "10", letterSpacing: "0.2em" }, "RAN.INTELLIGENCE.LAB"),
    /* @__PURE__ */ React.createElement(
      "text",
      {
        x: "0",
        y: "28",
        fontSize: "9",
        letterSpacing: "0.2em",
        fill: "rgba(255,255,255,0.5)"
      },
      "T+",
      t.toFixed(2),
      "s"
    )
  ), /* @__PURE__ */ React.createElement("g", { transform: "translate(0, 670)" }, /* @__PURE__ */ React.createElement("line", { x1: "40", y1: "0", x2: "1240", y2: "0", stroke: "rgba(255,255,255,0.1)" })), /* @__PURE__ */ React.createElement(
    "g",
    {
      transform: "translate(40, 692)",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: "9",
      letterSpacing: "0.2em",
      fill: "rgba(255,255,255,0.55)"
    },
    /* @__PURE__ */ React.createElement("text", null, "SECTORS \xB7 3"),
    /* @__PURE__ */ React.createElement("text", { x: "180" }, "SPECTRUM \xB7 SUB-THZ"),
    /* @__PURE__ */ React.createElement("text", { x: "420" }, "LATENCY \xB7 < 0.1 ms"),
    /* @__PURE__ */ React.createElement("text", { x: "640" }, "ARCH \xB7 CLOUD-NATIVE"),
    /* @__PURE__ */ React.createElement("text", { x: "880" }, "RUNTIME \xB7 AGENTIC AI")
  ));
}
function FinalBanner({ opacity }) {
  if (opacity <= 0.01) return null;
  return /* @__PURE__ */ React.createElement("g", { opacity, transform: "translate(640, 600)" }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: "-340",
      y: "-32",
      width: "680",
      height: "64",
      rx: "3",
      fill: "rgba(8,14,30,0.78)",
      stroke: C.accent,
      strokeWidth: "1"
    }
  ), /* @__PURE__ */ React.createElement("line", { x1: "-336", y1: "-28", x2: "-336", y2: "28", stroke: C.cloud0, strokeWidth: "3" }), /* @__PURE__ */ React.createElement("line", { x1: "336", y1: "-28", x2: "336", y2: "28", stroke: C.ai0, strokeWidth: "3" }), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "0",
      y: "-6",
      textAnchor: "middle",
      fontSize: "14",
      fontWeight: "700",
      fontFamily: "JetBrains Mono, monospace",
      fill: C.accent,
      letterSpacing: "0.35em"
    },
    "SMART \xB7 AUTONOMOUS \xB7 INFINITE"
  ), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: "0",
      y: "20",
      textAnchor: "middle",
      fontSize: "20",
      fontWeight: "600",
      fontFamily: "Inter, sans-serif",
      fill: "white",
      letterSpacing: "0.04em"
    },
    "The Cloud-Native + AI-Native 6G Base Station"
  ));
}
function FusionScene() {
  const t = useTime();
  const CX = 640;
  const CY = 600;
  const oldOpacity = animate({ from: 0, to: 1, start: 0.2, end: 1.6 })(t) * (1 - animate({ from: 0, to: 1, start: 7.2, end: 8.2 })(t));
  const oldScale = animate({ from: 0.92, to: 1, start: 0.2, end: 1.6 })(t);
  const oldShake = animate({ from: 0, to: 4, start: 5.5, end: 7.4 })(t);
  const oldDissolve = animate({ from: 0, to: 1, start: 6.6, end: 8.3 })(t);
  const cloudIntensity = interpolate(
    [0, 2.6, 4, 6.6, 7.4, 7.7],
    [0, 1, 1, 1, 0, 0],
    Easing.easeOutCubic
  )(t);
  const aiIntensity = cloudIntensity;
  const cloudConverge = animate({
    from: 0.08,
    to: 0.78,
    start: 2.6,
    end: 6.8,
    ease: Easing.easeInOutCubic
  })(t);
  const aiConverge = cloudConverge;
  const fusionFlash = interpolate(
    [6.7, 7.2, 7.9, 8.6],
    [0, 1, 0.4, 0],
    Easing.easeOutCubic
  )(t);
  const newMaterialize = animate({
    from: 0,
    to: 1,
    start: 8.2,
    end: 11.2,
    ease: Easing.easeOutCubic
  })(t);
  const newOpacity = animate({ from: 0, to: 1, start: 8, end: 9.2 })(t);
  const brainPulse = 0.4 + 0.6 * Math.max(0, Math.sin(t * 1.8));
  const shineActive = t > 10.8;
  const bannerOp = animate({ from: 0, to: 1, start: 12, end: 13 })(t);
  let phase = 0;
  if (t > 2.4) phase = 1;
  if (t > 6.5) phase = 2;
  if (t > 8.2) phase = 3;
  if (t > 11) phase = 4;
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: "1280",
      height: "720",
      viewBox: "0 0 1280 720",
      style: { position: "absolute", inset: 0 }
    },
    /* @__PURE__ */ React.createElement(SceneDefs, null),
    /* @__PURE__ */ React.createElement(Background, null),
    oldOpacity > 0.01 && /* @__PURE__ */ React.createElement(
      OldBaseStation,
      {
        cx: CX,
        cy: CY,
        opacity: oldOpacity,
        scale: oldScale,
        shakeAmp: oldShake,
        dissolve: oldDissolve
      }
    ),
    cloudIntensity > 0.01 && /* @__PURE__ */ React.createElement(
      CloudForce,
      {
        x0: 130,
        x1: CX - 30,
        y: CY - 130,
        intensity: cloudIntensity,
        t,
        converge: cloudConverge
      }
    ),
    aiIntensity > 0.01 && /* @__PURE__ */ React.createElement(
      AIForce,
      {
        x0: 1150,
        x1: CX + 30,
        y: CY - 130,
        intensity: aiIntensity,
        t,
        converge: aiConverge
      }
    ),
    /* @__PURE__ */ React.createElement(FusionBurst, { cx: CX, cy: CY - 140, intensity: fusionFlash, t }),
    newOpacity > 0.01 && /* @__PURE__ */ React.createElement(
      NewBaseStation,
      {
        cx: CX,
        cy: CY,
        opacity: newOpacity,
        materialize: newMaterialize,
        brainPulse,
        shine: shineActive,
        t
      }
    ),
    /* @__PURE__ */ React.createElement(FinalBanner, { opacity: bannerOp }),
    /* @__PURE__ */ React.createElement(HUD, { phase, t })
  );
}
function FusionStage({ theme = "dark" }) {
  return /* @__PURE__ */ React.createElement(FusionThemeCtx.Provider, { value: theme }, /* @__PURE__ */ React.createElement(
    Stage,
    {
      width: 1280,
      height: 720,
      duration: 16,
      background: "var(--bg)",
      persistKey: "6g-fusion"
    },
    /* @__PURE__ */ React.createElement(FusionScene, null)
  ));
}
function FusionSection({ theme = "dark" }) {
  return /* @__PURE__ */ React.createElement("section", { id: "fusion", style: {
    background: "var(--bg)",
    padding: "0",
    position: "relative"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    maxWidth: "1280px",
    margin: "0 auto",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement(FusionStage, { theme })));
}
Object.assign(window, { FusionStage, FusionSection });
const TWEAK_DEFAULTS = (
  /*EDITMODE-BEGIN*/
  {
    "theme": "dark",
    "showSparkles": true,
    "auroraIntensity": 1
  }
);
function Contact() {
  const [form, setForm] = useState({ name: "", org: "", email: "", usecase: "", msg: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const wa = `New demo booking:

Name: ${form.name || "N/A"}
Org: ${form.org || "N/A"}
Email: ${form.email || "N/A"}
Use case: ${form.usecase || "N/A"}
Message: ${form.msg || "(none)"}`;
      const waUrl = `https://wa.me/573113863080?text=${encodeURIComponent(wa)}`;
      const popup = window.open(waUrl, "_blank");
      if (!popup || popup.closed) {
        const mailtoUrl = `mailto:lfarizav@gmail.com?subject=Demo+Request+-+${encodeURIComponent(form.usecase || "General")}&body=${encodeURIComponent(wa)}`;
        window.location.href = mailtoUrl;
      }
      setForm({ name: "", org: "", email: "", usecase: "", msg: "" });
      setSent(true);
    } catch (err) {
      console.error(err);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement("section", { id: "contact", style: {
    background: "var(--bg-2)",
    borderTop: "1px solid var(--border)",
    position: "relative",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: {
    maxWidth: "720px",
    position: "relative",
    zIndex: 1
  } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: "3rem" } }, /* @__PURE__ */ React.createElement("p", { className: "section-eyebrow", style: { justifyContent: "center", display: "inline-flex" } }, /* @__PURE__ */ React.createElement("span", { className: "num" }, "09"), "Get started"), /* @__PURE__ */ React.createElement("h2", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
    letterSpacing: "-0.035em",
    lineHeight: 1.05,
    marginBottom: "1rem"
  } }, /* @__PURE__ */ React.createElement("span", { className: "gradient-text" }, "Book a demo."), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--font-serif)", fontWeight: 400, fontStyle: "italic" } }, "Deploy your network.")), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "1.08rem",
    lineHeight: 1.65,
    maxWidth: "540px",
    margin: "0 auto"
  } }, "Tell us about your use case \u2014 private network, broadcast, IoT, research lab \u2014 and we'll tailor a deployment plan.")), sent ? /* @__PURE__ */ React.createElement("div", { style: {
    background: "var(--surface)",
    border: "1px solid color-mix(in oklab, var(--teal) 40%, transparent)",
    borderRadius: "var(--radius-lg)",
    padding: "3rem 2rem",
    textAlign: "center",
    position: "relative",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(circle at 50% 0%, color-mix(in oklab, var(--teal) 20%, transparent), transparent 50%)",
    pointerEvents: "none"
  } }), /* @__PURE__ */ React.createElement("div", { style: {
    position: "relative",
    width: "64px",
    height: "64px",
    margin: "0 auto 1.25rem",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--teal), var(--aqua))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    color: "var(--bg)"
  } }, "\u2713"), /* @__PURE__ */ React.createElement("h3", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "1.4rem",
    marginBottom: "0.5rem",
    position: "relative"
  } }, "Message sent."), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-mid)", fontSize: "0.95rem", marginBottom: "0.5rem", position: "relative" } }, "WhatsApp is opening with your booking details."), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--text-dim)", fontSize: "0.78rem", marginBottom: "1.5rem", position: "relative" } }, "If it doesn't open, message us directly: +57 311-386-3080"), /* @__PURE__ */ React.createElement("button", { onClick: () => setSent(false), className: "btn btn-ghost", style: { position: "relative" } }, "Send another \u2192")) : /* @__PURE__ */ React.createElement("form", { onSubmit: handle, style: {
    background: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-lg)",
    padding: "2.25rem",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem"
  } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }, className: "form-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Full name"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "text",
      placeholder: "Jane Smith",
      required: true,
      value: form.name,
      onChange: (e) => setForm({ ...form, name: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Organization"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "text",
      placeholder: "University / company / ministry",
      required: true,
      value: form.org,
      onChange: (e) => setForm({ ...form, org: e.target.value })
    }
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Email"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "input",
      type: "email",
      placeholder: "jane@example.com",
      required: true,
      value: form.email,
      onChange: (e) => setForm({ ...form, email: e.target.value })
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label", htmlFor: "usecase" }, "Primary use case"), /* @__PURE__ */ React.createElement(
    "select",
    {
      id: "usecase",
      className: "input",
      required: true,
      value: form.usecase,
      onChange: (e) => setForm({ ...form, usecase: e.target.value }),
      style: { color: form.usecase ? "var(--text)" : "var(--text-dim)" }
    },
    /* @__PURE__ */ React.createElement("option", { value: "", disabled: true }, "Select a use case..."),
    /* @__PURE__ */ React.createElement("option", null, "4G / 5G Private Network"),
    /* @__PURE__ */ React.createElement("option", null, "5G Broadcast / MBS"),
    /* @__PURE__ */ React.createElement("option", null, "NB-IoT / LTE-M Deployment"),
    /* @__PURE__ */ React.createElement("option", null, "University / R&D Testbed"),
    /* @__PURE__ */ React.createElement("option", null, "Government / Rural Connectivity"),
    /* @__PURE__ */ React.createElement("option", null, "NTN / Satellite Integration"),
    /* @__PURE__ */ React.createElement("option", null, "Technical Consulting")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "label" }, "Tell us more ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--text-dim)" } }, "(optional)")), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "input",
      rows: 4,
      placeholder: "Describe your network requirements, scale, timeline...",
      value: form.msg,
      onChange: (e) => setForm({ ...form, msg: e.target.value }),
      style: { resize: "vertical", minHeight: "100px" }
    }
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      style: {
        background: "linear-gradient(135deg, var(--teal) 0%, var(--magenta) 100%)",
        color: "white",
        fontFamily: "var(--font-head)",
        fontWeight: 600,
        fontSize: "1rem",
        padding: "1rem 1.5rem",
        borderRadius: "100px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.25s",
        opacity: loading ? 0.6 : 1,
        boxShadow: "0 12px 30px -10px color-mix(in oklab, var(--magenta) 50%, transparent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        marginTop: "0.5rem"
      },
      onMouseEnter: (e) => {
        if (!loading) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 18px 40px -10px color-mix(in oklab, var(--magenta) 60%, transparent)";
        }
      },
      onMouseLeave: (e) => {
        if (!loading) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 12px 30px -10px color-mix(in oklab, var(--magenta) 50%, transparent)";
        }
      }
    },
    /* @__PURE__ */ React.createElement(Sparkle, { size: 14, color: "white" }),
    loading ? "Sending\u2026" : "Send message",
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.1em" } }, "\u2192")
  ), /* @__PURE__ */ React.createElement("style", null, `
              @media (max-width: 600px) {
                .form-grid { grid-template-columns: 1fr !important; }
              }
            `))));
}
function Footer() {
  const cols = [
    { title: "Products", links: [
      { label: "ngntelco CLI", href: "#products" },
      { label: "5G SA / 4G LTE", href: "#products" },
      { label: "5G Broadcast", href: "#products" },
      { label: "NB-IoT & LTE-M", href: "#products" },
      { label: "NTN \u2014 Satellite", href: "#products" }
    ] },
    { title: "Solutions", links: [
      { label: "Universities", href: "#solutions" },
      { label: "Enterprise", href: "#solutions" },
      { label: "Government & NGO", href: "#solutions" },
      { label: "Telecom Operators", href: "#solutions" }
    ] },
    { title: "Resources", links: [
      { label: "Speaking", href: "#speaking" },
      { label: "Mission", href: "#mission" },
      { label: "Courses", href: "/courses/" },
      { label: "GitHub \u2197", href: "https://github.com/lfarizav" }
    ] },
    { title: "Contact", links: [
      { label: "Book a demo", href: "#contact" },
      { label: "LinkedIn \u2197", href: "https://linkedin.com/in/lfarizav" },
      { label: "Email", href: "mailto:lfarizav@gmail.com" },
      { label: "+57 311 386 3080", href: "tel:+573113863080" }
    ] }
  ];
  return /* @__PURE__ */ React.createElement("footer", { style: {
    background: "var(--bg)",
    borderTop: "1px solid var(--border)",
    padding: "4rem 2rem 2rem",
    position: "relative",
    overflow: "hidden"
  } }, /* @__PURE__ */ React.createElement("div", { className: "container", style: { position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "grid",
    gridTemplateColumns: "1.6fr repeat(4, 1fr)",
    gap: "3rem",
    marginBottom: "3rem"
  }, className: "footer-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(BeantersLogo, { size: 1.5 }), /* @__PURE__ */ React.createElement("p", { style: {
    color: "var(--text-mid)",
    fontSize: "0.92rem",
    lineHeight: 1.65,
    marginTop: "1.25rem",
    maxWidth: "320px"
  } }, "AI-native cellular network orchestration. Cloud-native, open-source, built for the Global South."), /* @__PURE__ */ React.createElement("p", { style: {
    marginTop: "1.5rem",
    fontFamily: "var(--font-mono)",
    fontSize: "0.75rem",
    color: "var(--text-dim)",
    letterSpacing: "0.04em"
  } }, "Made with ", /* @__PURE__ */ React.createElement("span", { style: { color: "var(--coral)" } }, "\u2665"), " in Colombia ", /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, "\u{1F1E8}\u{1F1F4}"))), cols.map((col) => /* @__PURE__ */ React.createElement("div", { key: col.title }, /* @__PURE__ */ React.createElement("p", { style: {
    fontFamily: "var(--font-mono)",
    fontSize: "0.7rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-dim)",
    marginBottom: "1.1rem"
  } }, col.title), /* @__PURE__ */ React.createElement("ul", { style: { listStyle: "none", display: "flex", flexDirection: "column", gap: "0.7rem" } }, col.links.map((l) => /* @__PURE__ */ React.createElement("li", { key: l.label }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: l.href,
      target: l.href.startsWith("http") ? "_blank" : void 0,
      rel: l.href.startsWith("http") ? "noopener noreferrer" : void 0,
      className: "footer-link",
      style: {
        fontFamily: "var(--font-body)",
        fontSize: "0.88rem",
        color: "var(--text-mid)",
        textDecoration: "none",
        transition: "color 0.2s"
      }
    },
    l.label
  ))))))), /* @__PURE__ */ React.createElement("div", { style: {
    paddingTop: "2rem",
    borderTop: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    fontFamily: "var(--font-mono)",
    fontSize: "0.74rem",
    color: "var(--text-dim)"
  } }, /* @__PURE__ */ React.createElement("span", null, "\xA9 2026 Beanters Telecommunications"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", gap: "1.5rem" } }, /* @__PURE__ */ React.createElement("a", { href: "/privacy.html", style: { color: "var(--text-dim)", textDecoration: "none" } }, "Privacy"), /* @__PURE__ */ React.createElement("a", { href: "/terms.html", style: { color: "var(--text-dim)", textDecoration: "none" } }, "Terms"), /* @__PURE__ */ React.createElement("a", { href: "https://github.com/lfarizav", target: "_blank", rel: "noopener", style: { color: "var(--text-dim)", textDecoration: "none" } }, "GitHub \u2197"))), /* @__PURE__ */ React.createElement("style", null, `
          @media (max-width: 860px) {
            .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2.5rem !important; }
            .footer-grid > div:first-child { grid-column: 1 / -1; }
          }
          @media (max-width: 500px) {
            .footer-grid { grid-template-columns: 1fr !important; }
          }
        `)));
}
function TweaksPanel({ visible, theme, setTheme }) {
  if (!visible) return null;
  return /* @__PURE__ */ React.createElement("div", { style: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
    background: "var(--surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    padding: "1.25rem",
    width: "260px",
    fontFamily: "var(--font-body)",
    boxShadow: "var(--shadow-pop), 0 24px 60px -20px rgba(0,0,0,0.4)"
  } }, /* @__PURE__ */ React.createElement("div", { style: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.25rem"
  } }, /* @__PURE__ */ React.createElement(Sparkle, { size: 14, color: "var(--teal)" }), /* @__PURE__ */ React.createElement("p", { style: {
    fontFamily: "var(--font-head)",
    fontWeight: 700,
    fontSize: "0.9rem",
    background: "linear-gradient(135deg, var(--teal), var(--magenta))",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent"
  } }, "Tweaks")), /* @__PURE__ */ React.createElement("label", { className: "label", style: { marginBottom: "0.5rem" } }, "Theme"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.4rem" } }, [
    { key: "dark", label: "\u25D0 Dark" },
    { key: "light", label: "\u25D1 Light" }
  ].map((o) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: o.key,
      onClick: () => {
        setTheme(o.key);
        window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { theme: o.key } }, "*");
      },
      style: {
        flex: 1,
        background: theme === o.key ? "var(--text)" : "transparent",
        color: theme === o.key ? "var(--bg)" : "var(--text-mid)",
        border: "1px solid var(--border-strong)",
        borderRadius: "100px",
        padding: "0.5rem 0.75rem",
        fontFamily: "var(--font-head)",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
      }
    },
    o.label
  ))));
}
function App() {
  const [theme, setTheme, toggleTheme] = useTheme();
  const [tweaksVisible, setTweaksVisible] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksVisible(true);
      if (e.data?.type === "__deactivate_edit_mode") setTweaksVisible(false);
    };
    window.addEventListener("message", handler);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", handler);
  }, []);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Nav, { theme, onThemeToggle: toggleTheme }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement(Hero, null), /* @__PURE__ */ React.createElement(NetworksRibbon, null), /* @__PURE__ */ React.createElement(LogoWall, null), /* @__PURE__ */ React.createElement(Products, null), /* @__PURE__ */ React.createElement(Solutions, null), /* @__PURE__ */ React.createElement(Technology, null), /* @__PURE__ */ React.createElement(FusionSection, { theme }), /* @__PURE__ */ React.createElement(Mission, null), /* @__PURE__ */ React.createElement(Testimonials, null), /* @__PURE__ */ React.createElement(About, null), /* @__PURE__ */ React.createElement(Speaking, null), /* @__PURE__ */ React.createElement(Training, null), /* @__PURE__ */ React.createElement(Contact, null)), /* @__PURE__ */ React.createElement(Footer, null), /* @__PURE__ */ React.createElement(TweaksPanel, { visible: tweaksVisible, theme, setTheme }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
Object.assign(window, { Contact, Footer, TweaksPanel, App });
