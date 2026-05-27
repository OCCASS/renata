/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio, TweakSelect, TweakToggle, TweakColor */
const { useState, useEffect, useMemo, useRef } = React;

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = {
  cosmos: {
    bg: "#04060f",
    bg2: "#0a1124",
    deep: "#020410",
    surface: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.10)",
    text: "#eaeefb",
    mute: "rgba(234,238,251,.62)",
    accent: "#7cc6ff",
    accent2: "#9b8cff",
    glow: "rgba(124,198,255,.45)",
    planet: "radial-gradient(circle at 32% 30%, #9ad8ff 0%, #2e7bd1 35%, #0a2554 70%, #04060f 100%)",
    nebula: "radial-gradient(60% 60% at 70% 30%, rgba(124,198,255,.22) 0%, transparent 60%), radial-gradient(50% 50% at 20% 80%, rgba(155,140,255,.18) 0%, transparent 60%)",
    name: "Cosmos",
  },
  nebula: {
    bg: "#0c0420",
    bg2: "#1b083a",
    deep: "#06021a",
    surface: "rgba(255,255,255,0.045)",
    border: "rgba(255,255,255,0.12)",
    text: "#f5eaff",
    mute: "rgba(245,234,255,.62)",
    accent: "#ff7dc4",
    accent2: "#b48cff",
    glow: "rgba(255,125,196,.45)",
    planet: "radial-gradient(circle at 30% 28%, #ffc1e4 0%, #d05ca6 30%, #5b1b7a 70%, #0c0420 100%)",
    nebula: "radial-gradient(55% 55% at 75% 25%, rgba(255,125,196,.25) 0%, transparent 60%), radial-gradient(50% 50% at 15% 75%, rgba(180,140,255,.22) 0%, transparent 60%)",
    name: "Nebula",
  },
  void: {
    bg: "#000000",
    bg2: "#0c0d10",
    deep: "#000000",
    surface: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.10)",
    text: "#f1f1ee",
    mute: "rgba(241,241,238,.6)",
    accent: "#ffb070",
    accent2: "#76f3d6",
    glow: "rgba(255,176,112,.4)",
    planet: "radial-gradient(circle at 30% 28%, #ffd9ad 0%, #c8773a 35%, #482512 70%, #000 100%)",
    nebula: "radial-gradient(60% 60% at 70% 30%, rgba(255,176,112,.16) 0%, transparent 65%), radial-gradient(50% 50% at 18% 80%, rgba(118,243,214,.12) 0%, transparent 60%)",
    name: "Void",
  },
};

const FONTS = {
  grotesk: { display: '"Space Grotesk"', body: '"Manrope"', mono: '"JetBrains Mono"' },
  serif:   { display: '"Cormorant Garamond"', body: '"Manrope"', mono: '"JetBrains Mono"' },
  unbound: { display: '"Unbounded"', body: '"Manrope"', mono: '"JetBrains Mono"' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cosmos",
  "fonts": "grotesk",
  "hero": "split",
  "stars": true,
  "radius": 36
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────────────
// STARFIELD
// ─────────────────────────────────────────────────────────────────────────────
function StarField({ enabled, accent }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const cnv = ref.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    let w, h, stars, raf;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cnv.clientWidth; h = cnv.clientHeight;
      cnv.width = w * dpr; cnv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: Math.round((w * h) / 6500) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.7 + 0.2,
        s: Math.random() * 0.5 + 0.15,
        t: Math.random() * Math.PI * 2,
        c: Math.random() > 0.92,
      }));
    };
    fit();
    window.addEventListener("resize", fit);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.t += 0.02 * s.s;
        const a = s.a * (0.55 + Math.abs(Math.sin(s.t)) * 0.45);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.c ? accent : `rgba(255,255,255,${a})`;
        if (!s.c) ctx.fillStyle = `rgba(235,240,255,${a})`;
        ctx.fill();
        if (s.r > 1.1) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
          g.addColorStop(0, `rgba(255,255,255,${a * 0.25})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { window.removeEventListener("resize", fit); cancelAnimationFrame(raf); };
  }, [enabled, accent]);
  if (!enabled) return null;
  return <canvas ref={ref} style={{position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0}} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────────────────
function OrbitRings({ count = 4, opacity = 0.18 }) {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 1000 1000" preserveAspectRatio="none">
      {Array.from({length:count}).map((_,i)=>(
        <ellipse key={i} cx="500" cy="500" rx={420 + i*70} ry={140 + i*30}
          fill="none" stroke="currentColor" strokeOpacity={opacity - i*0.03} strokeWidth=".5"
          transform={`rotate(${-18 + i*4} 500 500)`} />
      ))}
    </svg>
  );
}

function Planet({ gradient, size = 360, glow, ring = false, style = {} }) {
  return (
    <div style={{position:"relative",width:size,height:size,...style}}>
      {ring && (
        <div style={{
          position:"absolute",inset:"-12%",borderRadius:"50%",
          border:`1px solid ${glow}`,opacity:.35,transform:"rotateX(72deg)",
        }}/>
      )}
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        background: gradient,
        boxShadow:`inset -20px -30px 60px rgba(0,0,0,.55), 0 0 120px ${glow}`,
      }}/>
      <div style={{
        position:"absolute",inset:0,borderRadius:"50%",
        background:"radial-gradient(circle at 30% 28%, rgba(255,255,255,.35) 0%, transparent 25%)",
        mixBlendMode:"screen",
      }}/>
    </div>
  );
}

function Pill({ children, accent, icon, big = false }) {
  return (
    <span style={{
      display:"inline-flex",alignItems:"center",gap:big?10:8,
      padding: big ? "10px 16px" : "6px 12px",
      borderRadius:999,
      background:"rgba(255,255,255,.04)",
      border:"1px solid rgba(255,255,255,.10)",
      backdropFilter:"blur(8px)",
      WebkitBackdropFilter:"blur(8px)",
      fontSize: big ? 13 : 11,
      letterSpacing:".06em",
      textTransform:"uppercase",
      color:"rgba(255,255,255,.78)",
      fontFamily:"var(--font-mono)",
    }}>
      {icon && <span style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 10px ${accent}`}}/>}
      {children}
    </span>
  );
}

function CTAButton({ children, accent, primary = true, radius, href = "#", style = {} }) {
  const [hov, setHov] = useState(false);
  const magnetRef = window.useMagnet ? window.useMagnet(0.25, 10) : useRef(null);
  const base = {
    position:"relative",overflow:"hidden",
    display:"inline-flex",alignItems:"center",gap:10,
    padding:"16px 26px",borderRadius:radius,
    fontSize:15,letterSpacing:".01em",fontWeight:500,
    textDecoration:"none",cursor:"pointer",
    transition:"box-shadow .25s ease, background .3s ease, color .3s ease, border-color .25s ease",
    fontFamily:"inherit",
    border:`1px solid ${primary ? "transparent" : "rgba(255,255,255,.18)"}`,
    background: primary
      ? `linear-gradient(120deg, ${accent} 0%, #fff 120%)`
      : hov ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.04)",
    color: primary ? "#0a0a18" : "rgba(255,255,255,.92)",
    boxShadow: primary
      ? (hov ? `0 16px 50px ${accent}66, 0 0 0 1px ${accent}55, inset 0 0 0 1px rgba(255,255,255,.5)` : `0 6px 20px ${accent}33`)
      : (hov ? `0 12px 30px rgba(0,0,0,.45), 0 0 0 1px ${accent}55` : "0 4px 14px rgba(0,0,0,.25)"),
    ...style,
  };
  return (
    <span ref={magnetRef} style={{display:"inline-block"}}>
      <a href={href} style={base} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
        {/* shimmer sweep */}
        {primary && (
          <span style={{
            position:"absolute",inset:0,pointerEvents:"none",
            background:"linear-gradient(120deg, transparent 30%, rgba(255,255,255,.55) 50%, transparent 70%)",
            backgroundSize:"200% 100%",
            opacity: hov ? 1 : 0,
            animation: hov ? "sf-shimmer 1.4s linear infinite" : "none",
            transition:"opacity .25s",
            mixBlendMode:"overlay",
          }}/>
        )}
        <span style={{position:"relative"}}>{children}</span>
        <span style={{
          position:"relative",display:"inline-flex",
          transition:"transform .35s cubic-bezier(.2,.7,.2,1)",
          transform: hov ? "translate(4px,-4px) rotate(8deg)" : "",
        }}>↗</span>
      </a>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ accent, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const links = [
    { href: "#about", label: "Обо мне" },
    { href: "#formats", label: "Форматы" },
    { href: "#quote", label: "Подход" },
    { href: "#contact", label: "Контакты" },
  ];
  return (
    <header style={{
      position:"fixed",top: isMobile ? 12 : 18, left:0,right:0,zIndex:50,
      display:"flex",justifyContent:"center",pointerEvents:"none",
      padding: isMobile ? "0 12px" : 0,
    }}>
      <div style={{
        pointerEvents:"auto",
        display:"flex",alignItems:"center",
        gap: isMobile ? 12 : 24,
        padding: isMobile ? "8px 8px 8px 14px" : "10px 12px 10px 22px",
        background:"rgba(8,10,22,.55)",
        backdropFilter:"blur(16px) saturate(160%)",
        WebkitBackdropFilter:"blur(16px) saturate(160%)",
        border:"1px solid rgba(255,255,255,.10)",
        borderRadius:999,
        boxShadow:"0 12px 40px rgba(0,0,0,.4)",
        maxWidth: "100%",
      }}>
        <a href="#top" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:"inherit"}}>
          <span style={{
            width: isMobile ? 22 : 24, height: isMobile ? 22 : 24, borderRadius:"50%",
            background:`radial-gradient(circle at 32% 30%, #fff 0%, ${accent} 40%, #0a0a18 100%)`,
            boxShadow:`0 0 12px ${accent}66`,
          }}/>
          <span style={{fontFamily:"var(--font-display)",fontSize: isMobile ? 14 : 15,fontWeight:600,letterSpacing:".02em"}}>
            renchik<span style={{color:accent}}>·</span>physics
          </span>
        </a>
        {!isMobile && (
          <nav style={{display:"flex",gap:4}}>
            {links.map(l=>(
              <a key={l.href} href={l.href} style={{
                padding:"8px 14px",fontSize:13,color:"rgba(255,255,255,.72)",
                textDecoration:"none",borderRadius:999,transition:"all .2s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.color="#fff"}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,.72)"}}>
                {l.label}
              </a>
            ))}
          </nav>
        )}
        <a href="https://t.me/renchikik" target="_blank" style={{
          display:"inline-flex",alignItems:"center",gap:6,
          padding: isMobile ? "7px 12px" : "9px 16px",
          borderRadius:999,fontSize: isMobile ? 12 : 13,fontWeight:500,
          background:"#fff",color:"#0a0a18",textDecoration:"none",
          transition:"transform .2s",whiteSpace:"nowrap",
        }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          {isMobile ? "TG" : "Telegram"} <span style={{fontSize:11}}>↗</span>
        </a>
      </div>
    </header>
  );
}

function Hero({ palette, accent, accent2, radius, variant }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  // On mobile, always use the stack layout for readability.
  const v = isMobile ? "stack" : variant;
  const isSplit = v === "split";
  const isCenter = v === "center";
  const isStack = v === "stack";

  return (
    <section id="top" style={{
      position:"relative",minHeight:"100vh",
      padding: isMobile
        ? "96px 20px 60px"
        : isStack ? "120px 32px 60px" : "140px 56px 80px",
      display:"flex",alignItems:"center",justifyContent:"center",
      overflow:"hidden",
    }}>
      {/* Background nebula glow */}
      <div style={{
        position:"absolute",inset:0,
        background: palette.nebula,
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute",inset:0,
        background:"radial-gradient(80% 60% at 50% 110%, rgba(0,0,0,.5) 0%, transparent 60%)",
        pointerEvents:"none",
      }}/>

      {/* Orbit rings overlay */}
      <div style={{position:"absolute",inset:0,color:accent,opacity:.6,pointerEvents:"none"}}>
        <OrbitRings count={5} opacity={0.14}/>
      </div>

      {isSplit && <HeroSplit palette={palette} accent={accent} accent2={accent2} radius={radius}/>}
      {isCenter && <HeroCenter palette={palette} accent={accent} accent2={accent2} radius={radius}/>}
      {isStack && <HeroStack palette={palette} accent={accent} accent2={accent2} radius={radius}/>}

      {/* Scroll hint */}
      <div style={{
        position:"absolute",bottom:30,left:"50%",transform:"translateX(-50%)",
        display:"flex",alignItems:"center",gap:12,color:"rgba(255,255,255,.45)",
        fontSize:11,letterSpacing:".18em",textTransform:"uppercase",fontFamily:"var(--font-mono)",
      }}>
        <span style={{width:1,height:28,background:"rgba(255,255,255,.3)",animation:"sf-scroll 2s infinite"}}/>
        прокрути дальше
      </div>
    </section>
  );
}

function HeroSplit({ palette, accent, accent2, radius }) {
  return (
    <div style={{
      position:"relative",zIndex:2,
      width:"100%",maxWidth:1400,
      display:"grid",gridTemplateColumns:"1.05fr .95fr",gap:60,alignItems:"center",
    }}>
      <div>
        <window.Reveal variant="up" duration={700}>
          <Pill accent={accent} icon big>· онлайн · казань · москва · германия</Pill>
        </window.Reveal>
        <h1 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(56px, 8.5vw, 132px)",
          lineHeight:.92,letterSpacing:"-.03em",
          margin:"26px 0 24px",fontWeight:600,
          textWrap:"balance",
        }}>
          <window.SplitText text="физика —" by="word" step={60} duration={900} variant="up" distance={26}/>
          <br/>
          <window.SplitText
            text="не часть"
            by="char"
            step={36}
            duration={900}
            distance={28}
            delay={200}
            style={{fontStyle:"italic",fontWeight:500}}
            gradient={`linear-gradient(120deg, ${accent} 0%, ${accent2} 60%, #fff 110%)`}
          />
          <br/>
          <window.SplitText text="Вселенной" by="char" step={28} duration={800} delay={650} variant="up" distance={20}/>
        </h1>
        <window.Reveal variant="up" delay={1100} duration={800}>
          <p style={{
            fontSize:19,lineHeight:1.55,maxWidth:520,
            color:"rgba(255,255,255,.72)",margin:"0 0 36px",
            textWrap:"pretty",
          }}>
            физика — её суть. Помогаю полюбить науку, понять мир вокруг
            и поступить туда, куда действительно хочется.
          </p>
        </window.Reveal>
        <window.Reveal variant="up" delay={1300} duration={700}>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <CTAButton accent={accent} radius={radius} href="#formats">записаться на занятие</CTAButton>
            <CTAButton accent={accent} radius={radius} primary={false} href="#about">узнать обо мне</CTAButton>
          </div>
        </window.Reveal>

        {/* Quick facts with animated counters */}
        <div style={{
          marginTop:64,display:"flex",gap:32,flexWrap:"wrap",
          paddingTop:28,borderTop:"1px dashed rgba(255,255,255,.14)",
        }}>
          {[
            {n:98, s:"баллов ЕГЭ", isNum:true},
            {n:131, s:"лицей · золото", isNum:true},
            {n:"МГУ", s:"стипендиат", isNum:false},
          ].map((f,i)=>(
            <window.Reveal key={i} variant="up" delay={1500 + i*120} duration={800}>
              <div>
                <div style={{
                  fontFamily:"var(--font-display)",fontSize:38,fontWeight:600,
                  background:`linear-gradient(180deg, #fff 0%, ${accent} 130%)`,
                  WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",
                  letterSpacing:"-.02em",lineHeight:1,
                }}>
                  {f.isNum ? <window.Counter to={f.n} duration={1800}/> : f.n}
                </div>
                <div style={{fontSize:12,letterSpacing:".1em",textTransform:"uppercase",
                  color:"rgba(255,255,255,.55)",marginTop:6,fontFamily:"var(--font-mono)"}}>{f.s}</div>
              </div>
            </window.Reveal>
          ))}
        </div>
      </div>

      <window.Reveal variant="zoom" delay={300} duration={1100}>
        <HeroPhoto palette={palette} accent={accent} accent2={accent2} radius={radius}/>
      </window.Reveal>
    </div>
  );
}

function HeroPhoto({ palette, accent, accent2, radius }) {
  return (
    <div style={{position:"relative",aspectRatio:"1/1.05",width:"100%",maxWidth:560,marginLeft:"auto"}}>
      {/* glow */}
      <div style={{
        position:"absolute",inset:"-20%",borderRadius:"50%",
        background:`radial-gradient(circle, ${accent}33 0%, transparent 60%)`,
        filter:"blur(40px)",
      }}/>
      {/* outer ring with ticks */}
      <svg viewBox="0 0 400 400" style={{position:"absolute",inset:0,width:"100%",height:"100%",animation:"sf-rotate 80s linear infinite"}}>
        <circle cx="200" cy="200" r="195" fill="none" stroke={accent} strokeOpacity=".25" strokeDasharray="2 8"/>
        <circle cx="200" cy="200" r="180" fill="none" stroke={accent2} strokeOpacity=".15"/>
      </svg>
      {/* orbiting micro-planet */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        width:520,height:520,transform:"translate(-50%,-50%)",
        animation:"sf-rotate 30s linear infinite",pointerEvents:"none",
      }}>
        <div style={{
          position:"absolute",top:-4,left:"50%",width:14,height:14,borderRadius:"50%",
          background:`radial-gradient(circle, #fff, ${accent2})`,
          boxShadow:`0 0 18px ${accent2}`,transform:"translateX(-50%)",
        }}/>
      </div>
      {/* photo disk */}
      <div style={{
        position:"absolute",inset:"6%",borderRadius:"50%",
        overflow:"hidden",
        boxShadow:`inset 0 0 0 1px rgba(255,255,255,.18), 0 30px 100px rgba(0,0,0,.55), 0 0 80px ${accent}33`,
      }}>
        <image-slot
          id="hero-photo"
          src="assets/renata-2.png"
          placeholder="фото Ренаты"
          style={{display:"block",width:"100%",height:"100%"}}
        />
        {/* color wash for cohesion */}
        <div style={{
          position:"absolute",inset:0,pointerEvents:"none",
          background:`linear-gradient(160deg, ${accent}1f 0%, transparent 40%, ${accent2}33 100%)`,
          mixBlendMode:"overlay",
        }}/>
        <div style={{
          position:"absolute",inset:0,pointerEvents:"none",
          boxShadow:"inset 0 -80px 120px rgba(0,0,0,.55)",
        }}/>
      </div>
      {/* corner pill */}
      <div style={{
        position:"absolute",bottom:"4%",left:"6%",
        display:"inline-flex",alignItems:"center",gap:10,
        padding:"10px 16px",borderRadius:999,
        background:"rgba(8,10,22,.6)",backdropFilter:"blur(10px)",
        border:"1px solid rgba(255,255,255,.14)",
        fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".1em",textTransform:"uppercase",
      }}>
        <span style={{width:7,height:7,borderRadius:"50%",background:"#7af3a8",boxShadow:"0 0 10px #7af3a8"}}/>
        принимаю учеников
      </div>
    </div>
  );
}

function HeroCenter({ palette, accent, accent2, radius }) {
  return (
    <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:1200,width:"100%"}}>
      {/* Planet/photo behind text */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-58%)",
        width:"clamp(360px, 42vw, 560px)",aspectRatio:"1/1",
        zIndex:-1,opacity:.95,
      }}>
        <Planet gradient={palette.planet} size={"100%"} glow={accent} style={{width:"100%",height:"100%"}}/>
      </div>

      <window.Reveal variant="up" duration={700}>
        <Pill accent={accent} icon big>· renchik · репетитор по физике</Pill>
      </window.Reveal>
      <h1 style={{
        fontFamily:"var(--font-display)",
        fontSize:"clamp(70px, 13vw, 220px)",
        fontWeight:700,letterSpacing:"-.04em",lineHeight:.85,
        margin:"30px 0",textTransform:"uppercase",
      }}>
        <window.SplitText text="РЕНАТА" by="char" step={70} duration={900} variant="up" distance={36}/>
      </h1>
      <window.Reveal variant="blur" delay={900} duration={900}>
        <p style={{
          fontSize:21,lineHeight:1.55,maxWidth:640,margin:"0 auto 40px",
          color:"rgba(255,255,255,.78)",
        }}>
          физика — это не скучные формулы, это язык,<br/>
          на котором написана Вселенная.
        </p>
      </window.Reveal>
      <window.Reveal variant="up" delay={1100} duration={700}>
        <div style={{display:"inline-flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
          <CTAButton accent={accent} radius={radius} href="#formats">записаться</CTAButton>
          <CTAButton accent={accent} radius={radius} primary={false} href="#about">обо мне</CTAButton>
        </div>
      </window.Reveal>
    </div>
  );
}

function HeroStack({ palette, accent, accent2, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:1000,width:"100%"}}>
      <div style={{
        width: isMobile ? 200 : 280,
        height: isMobile ? 200 : 280,
        margin:`0 auto ${isMobile ? 28 : 36}px`,
        borderRadius:"50%",overflow:"hidden",position:"relative",
        boxShadow:`0 0 0 1px rgba(255,255,255,.18), 0 0 100px ${accent}44`,
      }}>
        <image-slot id="hero-photo-stack" src="assets/renata-2.png" placeholder="фото"
          style={{display:"block",width:"100%",height:"100%"}}/>
      </div>
      <Pill accent={accent} icon big>{isMobile ? "репетитор по физике" : "репетитор по физике · казань / мск / de"}</Pill>
      <h1 style={{
        fontFamily:"var(--font-display)",
        fontSize:"clamp(44px, 11vw, 130px)",
        fontWeight:600,letterSpacing:"-.03em",lineHeight:.95,
        margin:"24px 0 20px",
      }}>
        Привет,<br/>
        <span style={{
          background:`linear-gradient(120deg, ${accent}, ${accent2}, #fff)`,
          WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent",fontStyle:"italic",
        }}>я Рената</span>
      </h1>
      <p style={{fontSize: isMobile ? 16 : 19, lineHeight:1.55,maxWidth:560,margin:"0 auto 36px",color:"rgba(255,255,255,.72)"}}>
        Помогаю полюбить физику, понять мир вокруг и поступить туда, куда действительно хочется.
      </p>
      <div style={{display:"inline-flex",gap:14,flexWrap:"wrap",justifyContent:"center"}}>
        <CTAButton accent={accent} radius={radius} href="#formats">записаться</CTAButton>
        <CTAButton accent={accent} radius={radius} primary={false} href="#about">подробнее</CTAButton>
      </div>
    </div>
  );
}

// Marquee strip with directions
function DirectionsStrip({ accent }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const items = ["ЕГЭ", "ОГЭ", "школьная программа", "мини-группы", "индивидуально", "физика 7—11 кл."];
  const Row = ({ariaHidden}) => (
    <div aria-hidden={ariaHidden ? "true" : undefined} style={{
      display:"flex", gap: isMobile ? 28 : 48, paddingRight: isMobile ? 28 : 48,
      flexShrink:0,whiteSpace:"nowrap",
    }}>
      {items.map((t,i)=>(
        <span key={i} style={{
          display:"inline-flex",alignItems:"center", gap: isMobile ? 14 : 20,
          fontFamily:'"Onest", "Manrope", system-ui, sans-serif',
          fontSize: isMobile ? 22 : 34, fontWeight:600,textTransform:"uppercase",
          color: i%2 ? "rgba(255,255,255,.92)" : "transparent",
          WebkitTextStroke: i%2 ? "0" : "1px rgba(255,255,255,.5)",
          letterSpacing:"-.01em",
        }}>
          {t}
          <span style={{
            width: isMobile ? 7 : 9, height: isMobile ? 7 : 9, borderRadius:"50%",background:accent,
            boxShadow:`0 0 14px ${accent}`,flexShrink:0,
          }}/>
        </span>
      ))}
    </div>
  );
  return (
    <div style={{
      position:"relative",overflow:"hidden", padding: isMobile ? "14px 0" : "22px 0",
      borderTop:"1px solid rgba(255,255,255,.08)",
      borderBottom:"1px solid rgba(255,255,255,.08)",
      background:"rgba(255,255,255,.02)",
    }}>
      <div style={{display:"flex",width:"max-content",animation:"sf-marquee-loop 32s linear infinite"}}>
        <Row/>
        <Row ariaHidden/>
      </div>
    </div>
  );
}

// Object.assign to global (for split file scoping)
Object.assign(window, {
  PALETTES, FONTS, TWEAK_DEFAULTS,
  StarField, OrbitRings, Planet, Pill, CTAButton,
  Nav, Hero, DirectionsStrip,
});
