/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio, TweakSelect, TweakToggle,
   PALETTES, FONTS, TWEAK_DEFAULTS, StarField, Nav, Hero, DirectionsStrip,
   About, Formats, QuoteSection, Contact, Footer,
   ScrollProgress, CursorGlow,
   DeepSpace, HeroAura, EntranceScene */

const KEYFRAMES = `
  @keyframes sf-rotate { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  @keyframes sf-rotate-rev { from { transform: rotate(360deg); } to { transform: rotate(0); } }
  @keyframes sf-marquee { from { transform: translateX(0); } to { transform: translateX(-33.333%); } }
  @keyframes sf-marquee-loop { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes sf-scroll { 0%,100% { opacity: .3; transform: scaleY(.5); } 50% { opacity: 1; transform: scaleY(1); } }
  @keyframes sf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
  @keyframes sf-pulse { 0%,100% { transform: scale(1); opacity:.7; } 50% { transform: scale(1.15); opacity: 1; } }
  @keyframes sf-pulse-ring {
    0% { transform: scale(.7); opacity: .8; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes sf-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes sf-orbit-dot {
    from { transform: rotate(0) translateX(var(--orbit-r, 200px)) rotate(0); }
    to   { transform: rotate(360deg) translateX(var(--orbit-r, 200px)) rotate(-360deg); }
  }
  @keyframes sf-gradient-pan {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes sf-blink { 0%,100% { opacity:.4 } 50% { opacity:1 } }
  @keyframes sf-rise {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  html { scroll-behavior: smooth; }
  body { font-feature-settings: "ss01","ss02","cv02"; }
  image-slot { background: rgba(255,255,255,.04); }

  /* Unified premium easing variable */
  :root { --ease-cosmos: cubic-bezier(0.16, 1, 0.3, 1); }

  /* Section + element separators for subtle scroll cues */
  section { scroll-margin-top: 80px; }

  /* Reduced motion: collapse all FX to a soft fade. Override starfield etc. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: 250ms !important; }
  }

  /* Hide cursor glow on touch / mobile */
  @media (hover: none) {
    .sf-cursor-glow { display: none !important; }
  }
  @media (max-width: 720px) {
    .sf-cursor-glow { display: none !important; }
  }
`;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const palette = PALETTES[t.palette] || PALETTES.cosmos;
  const fonts = FONTS[t.fonts] || FONTS.grotesk;
  const accent = palette.accent;
  const accent2 = palette.accent2;
  const radius = t.radius;

  // Apply CSS vars
  React.useEffect(() => {
    document.documentElement.style.setProperty("--font-display", fonts.display);
    document.documentElement.style.setProperty("--font-body", fonts.body);
    document.documentElement.style.setProperty("--font-mono", fonts.mono);
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent2", accent2);
    document.body.style.background = palette.bg;
    document.body.style.color = palette.text;
    document.body.style.fontFamily = `${fonts.body}, system-ui, sans-serif`;
  }, [t.palette, t.fonts, accent, accent2, palette.bg, palette.text, fonts.body]);

  return (
    <div style={{position:"relative",minHeight:"100vh",color:palette.text,overflow:"hidden"}}>
      {/* Unified multi-layer deep space background (replaces old StarField) */}
      {t.stars
        ? <DeepSpace palette={palette} accent={accent} accent2={accent2}/>
        : (
          <div style={{
            position:"fixed",inset:0,zIndex:0,pointerEvents:"none",
            background:`radial-gradient(120% 80% at 50% 0%, ${palette.bg2} 0%, ${palette.bg} 50%, ${palette.deep} 100%)`,
          }}/>
        )
      }

      {/* Grain — soft, fixed, beneath content */}
      <div style={{
        position:"fixed",inset:0,zIndex:1,pointerEvents:"none",opacity:.45,mixBlendMode:"overlay",
        backgroundImage:"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.16'/></svg>\")",
      }}/>

      {/* Cursor follow glow + scroll progress */}
      <div className="sf-cursor-glow">
        <CursorGlow color={`${accent}22`} size={620}/>
      </div>
      <ScrollProgress color={accent} color2={accent2}/>

      <div style={{position:"relative",zIndex:2}}>
        <Nav accent={accent} radius={radius}/>
        <div style={{position:"relative"}}>
          <HeroAura accent={accent}/>
          <Hero palette={palette} accent={accent} accent2={accent2} radius={radius} variant={t.hero}/>
        </div>
        <DirectionsStrip accent={accent}/>

        {/* About — orbit-around-planet entrance */}
        <EntranceScene type="orbit" accent={accent} accent2={accent2} palette={palette}>
          <About palette={palette} accent={accent} accent2={accent2} radius={radius}/>
        </EntranceScene>

        {/* Formats — clean section, no special backdrop */}
        <Formats palette={palette} accent={accent} accent2={accent2} radius={radius}/>

        {/* Quote — cosmic portal entrance (climactic, one-off) */}
        <EntranceScene type="portal" accent={accent} accent2={accent2} palette={palette}>
          <QuoteSection palette={palette} accent={accent} accent2={accent2} radius={radius}/>
        </EntranceScene>

        {/* Contact — calm signal-line entrance */}
        <EntranceScene type="calm" accent={accent} accent2={accent2} palette={palette}>
          <Contact palette={palette} accent={accent} accent2={accent2} radius={radius}/>
        </EntranceScene>

        <Footer accent={accent}/>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Палитра" />
        <TweakRadio label="Цвета" value={t.palette}
          options={["cosmos","nebula","void"]}
          onChange={v=>setTweak("palette",v)} />
        <TweakSection label="Шрифты" />
        <TweakRadio label="Display" value={t.fonts}
          options={["grotesk","serif","unbound"]}
          onChange={v=>setTweak("fonts",v)} />
        <TweakSection label="Hero" />
        <TweakRadio label="Layout" value={t.hero}
          options={["split","center","stack"]}
          onChange={v=>setTweak("hero",v)} />
        <TweakSection label="Атмосфера" />
        <TweakToggle label="Звёзды" value={t.stars}
          onChange={v=>setTweak("stars",v)} />
        <TweakSlider label="Скругление" value={t.radius}
          min={0} max={60} unit="px"
          onChange={v=>setTweak("radius",v)} />
      </TweaksPanel>
    </div>
  );
}

// Inject keyframes
const styleEl = document.createElement("style");
styleEl.textContent = KEYFRAMES;
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
