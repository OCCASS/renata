/* global React */
// ─────────────────────────────────────────────────────────────────────────────
// COSMIC SYSTEM — multi-layer parallax background + per-section entrance scenes.
// Each section's reveal IS the transition: backdrop appears, section emerges
// through it, both settle. No standalone blocks between sections.
//
// Unified easing: cubic-bezier(0.16, 1, 0.3, 1)
// Scenes:
//   About    — orbit-around-planet entrance
//   Quote    — cosmic portal entrance (climactic, one-off)
//   Contact  — calm signal-line entrance
// ─────────────────────────────────────────────────────────────────────────────
const { useState: csState, useEffect: csEffect, useRef: csRef } = React;

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const REDUCED = typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const IS_TOUCH = typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(hover: none)").matches;

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = csState(0);
  csEffect(() => {
    let raf = 0;
    const tick = () => { setY(window.scrollY || 0); raf = 0; };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", on, { passive: true });
    tick();
    return () => window.removeEventListener("scroll", on);
  }, []);
  return y;
}

function useDocScroll() {
  const [p, setP] = csState(0);
  csEffect(() => {
    let raf = 0;
    const tick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
      raf = 0;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    tick();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return p;
}

function useMouseParallax(strength = 1) {
  const [pos, setPos] = csState({ x: 0, y: 0 });
  csEffect(() => {
    if (IS_TOUCH || REDUCED) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2 * strength;
      ty = (e.clientY / window.innerHeight - 0.5) * 2 * strength;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      setPos({ x: cx, y: cy });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(loop);
      } else { raf = 0; }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [strength]);
  return pos;
}

// Entrance progress: 0 when section TOP is at the BOTTOM of the viewport,
// 1 when section TOP reaches the TOP of the viewport. Exactly 1 vh of scroll.
function useEntranceProgress(ref) {
  const [p, setP] = csState(0);
  csEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const t = (vh - r.top) / vh;
      setP(Math.max(0, Math.min(1, t)));
      raf = 0;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    tick();
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

// ─────────────────────────────────────────────────────────────────────────────
// DEEP SPACE — multi-layer parallax background (fixed under everything)
// ─────────────────────────────────────────────────────────────────────────────
function DeepSpace({ palette, accent, accent2 }) {
  const y = useScrollY();
  const docP = useDocScroll();
  const mouse = useMouseParallax(1);
  const farRef = csRef(null);
  const nearRef = csRef(null);

  csEffect(() => {
    const cnv = farRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    let w, h, stars, raf;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cnv.clientWidth; h = cnv.clientHeight;
      cnv.width = w * dpr; cnv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.0 + 0.15,
        a: Math.random() * 0.55 + 0.18,
        s: Math.random() * 0.25 + 0.05,
        t: Math.random() * Math.PI * 2,
        c: Math.random() > 0.94,
      }));
    };
    fit();
    window.addEventListener("resize", fit);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.t += 0.012 * s.s;
        const a = s.a * (0.78 + Math.sin(s.t) * 0.22);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.c ? `rgba(180,210,255,${a})` : `rgba(235,240,255,${a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    if (!REDUCED) tick();
    return () => { window.removeEventListener("resize", fit); if (raf) cancelAnimationFrame(raf); };
  }, []);

  csEffect(() => {
    const cnv = nearRef.current;
    if (!cnv) return;
    const ctx = cnv.getContext("2d");
    let w, h, particles, raf;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cnv.clientWidth; h = cnv.clientHeight;
      cnv.width = w * dpr; cnv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 38000);
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.6,
        a: Math.random() * 0.7 + 0.3,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
        hue: Math.random() > 0.6,
      }));
    };
    fit();
    window.addEventListener("resize", fit);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue ? `rgba(124,198,255,${p.a*.65})` : `rgba(255,255,255,${p.a*.6})`;
        ctx.fill();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,255,255,${p.a*.18})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    if (!REDUCED) tick();
    return () => { window.removeEventListener("resize", fit); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const farY  = -y * 0.06 + mouse.y * 6;
  const farX  = mouse.x * 6;
  const midY  = -y * 0.14 + mouse.y * 14;
  const midX  = mouse.x * 14;
  const nebY  = -y * 0.10 + mouse.y * 10;
  const nebX  = mouse.x * 10;
  const nearY = -y * 0.28 + mouse.y * 22;
  const nearX = mouse.x * 22;
  const planetY = -y * 0.18 + mouse.y * 24;
  const planetX = mouse.x * 18;
  const planetRot = docP * 14;

  return (
    <div aria-hidden="true" style={{
      position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden",
    }}>
      <div style={{
        position:"absolute",inset:0,
        background:`radial-gradient(140% 90% at 50% -10%, ${palette.bg2} 0%, ${palette.bg} 45%, ${palette.deep} 100%)`,
      }}/>
      <div style={{
        position:"absolute",inset:"-10% -5%",
        transform:`translate3d(${farX}px, ${farY}px, 0)`,
        willChange:"transform",
      }}>
        <canvas ref={farRef} style={{width:"100%",height:"100%",display:"block"}}/>
      </div>
      <div style={{
        position:"absolute",inset:"-15% -10%",
        transform:`translate3d(${nebX}px, ${nebY}px, 0)`,
        opacity:.9,
        willChange:"transform",
      }}>
        <div style={{
          position:"absolute",top:"5%",left:"55%",width:"55%",aspectRatio:"1/.8",
          background:`radial-gradient(closest-side, ${accent}1f 0%, ${accent}08 40%, transparent 75%)`,
          filter:"blur(40px)",
        }}/>
        <div style={{
          position:"absolute",top:"40%",left:"-5%",width:"55%",aspectRatio:"1/.8",
          background:`radial-gradient(closest-side, ${accent2}22 0%, ${accent2}08 40%, transparent 75%)`,
          filter:"blur(50px)",
        }}/>
        <div style={{
          position:"absolute",top:"75%",left:"30%",width:"60%",aspectRatio:"1/.8",
          background:`radial-gradient(closest-side, ${accent}14 0%, transparent 75%)`,
          filter:"blur(60px)",
        }}/>
      </div>
      <div style={{
        position:"absolute",inset:0,
        transform:`translate3d(${midX*.5}px, ${midY}px, 0) rotate(${planetRot*.4}deg)`,
        transformOrigin:"50% 130%",
        willChange:"transform",
        opacity:.5,
      }}>
        <svg viewBox="0 0 1600 1600" preserveAspectRatio="xMidYMid slice"
             style={{position:"absolute",top:"-30%",left:"-20%",width:"140%",height:"160%",color:accent}}>
          {[0,1,2,3,4].map(i=>(
            <ellipse key={i} cx="800" cy="1280" rx={500+i*150} ry={180+i*60}
              fill="none" stroke="currentColor" strokeOpacity={0.08 - i*0.012} strokeWidth=".5"
              transform={`rotate(${-14 + i*3} 800 1280)`}/>
          ))}
        </svg>
      </div>
      <div style={{
        position:"absolute",
        top:"58%", right:"-22%",
        width:"min(820px, 60vw)", aspectRatio:"1/1",
        transform:`translate3d(${planetX}px, ${planetY}px, 0) rotate(${planetRot}deg)`,
        willChange:"transform",
        opacity:.85,
      }}>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          background: palette.planet,
          boxShadow:`inset -30px -50px 110px rgba(0,0,0,.6), 0 0 160px ${accent}38`,
        }}/>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          background:"radial-gradient(circle at 30% 28%, rgba(255,255,255,.32) 0%, transparent 28%)",
          mixBlendMode:"screen",
        }}/>
        <div style={{
          position:"absolute",inset:"-14%",borderRadius:"50%",
          border:`1px solid ${accent}66`,opacity:.28,transform:"rotateX(72deg)",
        }}/>
      </div>
      <div style={{
        position:"absolute",inset:"-20% -10%",
        transform:`translate3d(${nearX}px, ${nearY}px, 0)`,
        willChange:"transform",
      }}>
        <canvas ref={nearRef} style={{width:"100%",height:"100%",display:"block"}}/>
      </div>
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`linear-gradient(180deg, transparent 0%, transparent 70%, ${palette.deep}cc 100%)`,
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO ENTRANCE — soft halo that fades up after mount
// ─────────────────────────────────────────────────────────────────────────────
function HeroAura({ accent }) {
  const [shown, setShown] = csState(false);
  csEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div aria-hidden="true" style={{
      position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
      opacity: shown ? 1 : 0,
      transition: `opacity 1400ms ${EASE}`,
    }}>
      <div style={{
        position:"absolute",left:"50%",top:"58%",
        width:"min(780px,65vw)",aspectRatio:"1/1",transform:"translate(-50%,-50%)",
        background:`radial-gradient(closest-side, ${accent}22 0%, ${accent}08 40%, transparent 70%)`,
        filter:"blur(30px)",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKDROPS — these render INSIDE the EntranceScene's fixed overlay
// They get a `progress` (0..1) driven by section entry.
// ─────────────────────────────────────────────────────────────────────────────
function OrbitBackdrop({ progress: p, accent, palette }) {
  const peak = Math.sin(p * Math.PI);
  const rot = -28 + p * 75;
  const planetX = (1 - p) * 320;
  const planetScale = 0.65 + p * 0.45;
  return (
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      {/* Orbital rings */}
      <div style={{
        position:"absolute", width:"200%", aspectRatio:"1/1",
        transform:`rotate(${rot}deg)`,
        opacity: peak * 0.9,
        willChange:"transform, opacity",
      }}>
        <svg viewBox="0 0 1000 1000" style={{width:"100%",height:"100%",color:accent}}>
          {[0,1,2,3,4].map(i=>(
            <ellipse key={i} cx="500" cy="500" rx={460 - i*55} ry={150 - i*22}
              fill="none" stroke="currentColor"
              strokeOpacity={0.55 - i*0.08} strokeWidth=".7"/>
          ))}
          <circle cx="500" cy="500" r="5" fill="#fff"
            transform={`rotate(${p*260} 500 500) translate(400 0)`}
            style={{filter:`drop-shadow(0 0 10px ${accent})`}}/>
        </svg>
      </div>

      {/* Mini planet */}
      <div style={{
        position:"absolute",
        width:"clamp(140px, 18vw, 260px)", aspectRatio:"1/1",
        transform:`translate(${planetX}px, 0) scale(${planetScale})`,
        opacity: peak,
        willChange:"transform, opacity",
      }}>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          background: palette.planet,
          boxShadow:`inset -10px -16px 32px rgba(0,0,0,.55), 0 0 90px ${accent}55`,
        }}/>
        <div style={{
          position:"absolute",inset:0,borderRadius:"50%",
          background:"radial-gradient(circle at 30% 28%, rgba(255,255,255,.38) 0%, transparent 28%)",
          mixBlendMode:"screen",
        }}/>
      </div>

      {/* Horizon bloom */}
      <div style={{
        position:"absolute", width:"110%", height:"42%",
        background:`radial-gradient(closest-side, ${accent}30 0%, transparent 70%)`,
        opacity: peak * 0.7,
        filter:"blur(20px)",
      }}/>
    </div>
  );
}

function PortalBackdrop({ progress: p, accent, accent2, palette }) {
  const open = Math.min(1, p * 1.15);
  const peak = Math.sin(p * Math.PI);
  const ringScale = 0.3 + open * 1.4;
  return (
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <div style={{
        position:"absolute",width:"min(70vw, 900px)",aspectRatio:"1/1",
        borderRadius:"50%",
        background:`radial-gradient(closest-side, ${accent}33 0%, ${accent2}1a 35%, transparent 75%)`,
        transform:`scale(${0.6 + open*1.8})`,
        opacity: peak * 0.9,
        filter:"blur(20px)",
        willChange:"transform, opacity",
      }}/>
      <div style={{
        position:"absolute",
        width:"min(48vw, 560px)", aspectRatio:"1/1", borderRadius:"50%",
        border:`1px solid ${accent}`,
        boxShadow:`0 0 30px ${accent}88, inset 0 0 30px ${accent}55, 0 0 80px ${accent2}55`,
        transform:`scale(${ringScale})`,
        opacity: peak,
        willChange:"transform, opacity",
      }}/>
      <div style={{
        position:"absolute",
        width:"min(40vw, 480px)", aspectRatio:"1/1", borderRadius:"50%",
        border:`1px solid ${accent2}aa`,
        opacity: peak * 0.6,
        transform:`scale(${ringScale * .92}) rotate(${open*60}deg)`,
        willChange:"transform, opacity",
      }}/>
      <div style={{
        position:"absolute",
        width:"min(36vw, 440px)", aspectRatio:"1/1", borderRadius:"50%",
        background:`radial-gradient(closest-side, ${palette.deep} 0%, ${palette.deep}00 70%)`,
        transform:`scale(${ringScale * .9})`,
        opacity: peak * 0.7,
        willChange:"transform, opacity",
      }}/>
      {Array.from({length: 12}).map((_, i)=>{
        const angle = (i / 12) * Math.PI * 2 + open * Math.PI;
        const radius = 220 + (1 - open) * 280;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.6;
        return (
          <div key={i} style={{
            position:"absolute",
            width:5,height:5,borderRadius:"50%",
            background:"#fff",
            boxShadow:`0 0 10px ${accent}`,
            transform:`translate(${x}px, ${y}px) scale(${1 + peak*.6})`,
            opacity: peak * 0.95,
            willChange:"transform, opacity",
          }}/>
        );
      })}
      <div style={{
        position:"absolute",
        width:90, height:90, borderRadius:"50%",
        background:`radial-gradient(closest-side, #fff 0%, ${accent} 40%, transparent 75%)`,
        transform:`scale(${0.4 + peak*1.8})`,
        opacity: peak * 0.6,
        filter:"blur(8px)",
        willChange:"transform, opacity",
      }}/>
    </div>
  );
}

function CalmBackdrop({ progress: p, accent }) {
  const peak = Math.sin(p * Math.PI);
  const dashOffset = 200 - p * 200;
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none"
        style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
        <defs>
          <linearGradient id="cf-grx" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0"/>
            <stop offset="50%" stopColor={accent} stopOpacity="0.55"/>
            <stop offset="100%" stopColor={accent} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[
          {y1: 280, y2: 500, dash: "1 6"},
          {y1: 380, y2: 500, dash: "1 8"},
          {y1: 500, y2: 500, dash: "1 4"},
          {y1: 620, y2: 500, dash: "1 8"},
          {y1: 720, y2: 500, dash: "1 6"},
        ].map((l, i)=>(
          <line key={i} x1="0" y1={l.y1} x2="1000" y2={l.y2}
            stroke="url(#cf-grx)" strokeWidth=".6"
            strokeDasharray={l.dash}
            strokeDashoffset={dashOffset}
            opacity={peak * 0.7}/>
        ))}
        <circle cx="1000" cy="500" r={3 + p*2} fill="#fff" opacity={peak * 0.8}/>
      </svg>
      <div style={{
        position:"absolute",inset:0,
        background:`radial-gradient(60% 50% at 50% 60%, rgba(0,0,0,${peak*0.25}) 0%, transparent 70%)`,
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EntranceScene — wraps a section. While the section is entering the viewport
// (top moves from vh → 0), a fixed cinematic backdrop appears + peaks + fades,
// and the section content emerges through it (opacity + translateY).
// Once entered (p=1) the section behaves like normal scroll content.
// ─────────────────────────────────────────────────────────────────────────────
function EntranceScene({ type, accent, accent2, palette, children }) {
  const ref = csRef(null);
  const p = useEntranceProgress(ref);

  // Content emergence — slightly delayed so backdrop registers first.
  const cp = Math.min(1, Math.max(0, (p - 0.10) / 0.75));
  const eased = 1 - Math.pow(1 - cp, 3); // ease-out cubic
  const visible = p > 0.001 && p < 0.999;

  const Backdrop = type === "orbit"  ? OrbitBackdrop
                : type === "portal" ? PortalBackdrop
                : type === "calm"   ? CalmBackdrop
                : null;

  return (
    <div ref={ref} style={{position:"relative"}}>
      {/* Fixed cinematic backdrop — covers viewport while section is entering */}
      <div aria-hidden="true" style={{
        position:"fixed", inset:0, zIndex:0,
        pointerEvents:"none",
        display: visible && Backdrop ? "block" : "none",
      }}>
        {Backdrop && <Backdrop progress={p} accent={accent} accent2={accent2} palette={palette}/>}
      </div>

      {/* Section content — emerges through the backdrop */}
      <div style={{
        position:"relative", zIndex:1,
        opacity: eased,
        transform: `translate3d(0, ${(1 - eased) * 40}px, 0) scale(${0.97 + eased * 0.03})`,
        transformOrigin:"50% 0%",
        willChange:"transform, opacity",
      }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  EASE_OUT_EXPO: EASE,
  DeepSpace, HeroAura,
  EntranceScene,
  useScrollY, useDocScroll, useMouseParallax, useEntranceProgress,
});
