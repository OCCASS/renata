/* global React */
// ─────────────────────────────────────────────────────────────────────────────
// SCROLL + INTERACTION PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const { useState: useS, useEffect: useE, useRef: useR, useMemo: useM, useLayoutEffect: useL } = React;

// IntersectionObserver-based reveal. Returns [ref, inView].
function useReveal({ threshold = 0.15, once = true, rootMargin = "0px 0px -8% 0px" } = {}) {
  const ref = useR(null);
  const [inView, setInView] = useS(false);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once, rootMargin]);
  return [ref, inView];
}

// <Reveal> wrapper. Variants: fade, up, down, left, right, zoom, blur, mask
const COSMOS_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
function Reveal({ children, as = "div", variant = "up", delay = 0, duration = 900, distance = 40, threshold, once = true, style, ...rest }) {
  const [ref, inView] = useReveal({ threshold, once });
  const Tag = as;
  const base = {
    opacity: inView ? 1 : 0,
    transition: `opacity ${duration}ms ${COSMOS_EASE} ${delay}ms, transform ${duration}ms ${COSMOS_EASE} ${delay}ms, filter ${duration}ms ${COSMOS_EASE} ${delay}ms, clip-path ${duration}ms ${COSMOS_EASE} ${delay}ms`,
    willChange: "transform, opacity, filter, clip-path",
  };
  const variants = {
    fade:  { transform: inView ? "none" : "none" },
    up:    { transform: inView ? "translate3d(0,0,0)" : `translate3d(0,${distance}px,0)` },
    down:  { transform: inView ? "translate3d(0,0,0)" : `translate3d(0,${-distance}px,0)` },
    left:  { transform: inView ? "translate3d(0,0,0)" : `translate3d(${-distance}px,0,0)` },
    right: { transform: inView ? "translate3d(0,0,0)" : `translate3d(${distance}px,0,0)` },
    zoom:  { transform: inView ? "scale(1)" : "scale(.92)" },
    blur:  { transform: inView ? "translate3d(0,0,0)" : `translate3d(0,${distance/2}px,0)`, filter: inView ? "blur(0px)" : "blur(14px)" },
    mask:  { clipPath: inView ? "inset(0 0 0 0 round 0)" : "inset(0 0 100% 0 round 0)", transform: inView ? "translate3d(0,0,0)" : "translate3d(0,12px,0)" },
  };
  return <Tag ref={ref} style={{...base, ...variants[variant], ...style}} {...rest}>{children}</Tag>;
}

// Stagger reveal — splits children and animates one by one
function Stagger({ children, step = 80, variant = "up", duration = 800, distance = 24, as = "div", style, ...rest }) {
  const arr = React.Children.toArray(children);
  const Tag = as;
  return (
    <Tag style={style} {...rest}>
      {arr.map((c, i) => (
        <Reveal key={i} variant={variant} delay={i * step} duration={duration} distance={distance}>{c}</Reveal>
      ))}
    </Tag>
  );
}

// Split-text per word/char reveal
function SplitText({ text, by = "word", as = "span", delay = 0, step = 28, duration = 700, variant = "up", distance = 18, style, gradient }) {
  const [ref, inView] = useReveal({ threshold: 0.2 });
  const Tag = as;
  const tokens = by === "char" ? Array.from(text) : text.split(" ");
  return (
    <Tag ref={ref} style={{display:"inline-block", ...style}}>
      {tokens.map((tok, i) => {
        if (tok === " ") return <span key={i}>&nbsp;</span>;
        const d = delay + i * step;
        const transform = inView
          ? "translate3d(0,0,0) rotate(0)"
          : variant === "up"   ? `translate3d(0,${distance}px,0) rotate(2deg)`
          : variant === "down" ? `translate3d(0,${-distance}px,0) rotate(-2deg)`
          : variant === "zoom" ? "scale(.6)"
          : "translate3d(0,0,0)";
        return (
          <span key={i} style={{
            display:"inline-block",
            opacity: inView ? 1 : 0,
            transform,
            transition: `opacity ${duration}ms ${COSMOS_EASE} ${d}ms, transform ${duration}ms ${COSMOS_EASE} ${d}ms`,
            willChange:"transform, opacity",
            ...(gradient ? {
              background: gradient,
              WebkitBackgroundClip:"text",
              backgroundClip:"text",
              color:"transparent",
            } : {}),
          }}>
            {tok}{by==="word" && i < tokens.length-1 ? "\u00A0" : ""}
          </span>
        );
      })}
    </Tag>
  );
}

// Scroll-linked parallax (translateY proportional to viewport position)
function useParallax(strength = 0.2) {
  const ref = useR(null);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const offset = (center - vh / 2) * -strength;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}

function Parallax({ strength = 0.15, children, style, ...rest }) {
  const ref = useParallax(strength);
  return <div ref={ref} style={{willChange:"transform", ...style}} {...rest}>{children}</div>;
}

// Magnetic hover — element gravitates to cursor
function useMagnet(strength = 0.35, max = 22) {
  const ref = useR(null);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * strength;
      const dy = (e.clientY - (r.top + r.height / 2)) * strength;
      tx = Math.max(-max, Math.min(max, dx));
      ty = Math.max(-max, Math.min(max, dy));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); };
    const loop = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength, max]);
  return ref;
}

function Magnet({ children, strength = 0.35, max = 22, style, ...rest }) {
  const ref = useMagnet(strength, max);
  return <div ref={ref} style={{display:"inline-block", willChange:"transform", ...style}} {...rest}>{children}</div>;
}

// 3D-tilt on hover (rotateX/rotateY based on cursor)
function useTilt(max = 8) {
  const ref = useR(null);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = -py * max * 2;
      ty = px * max * 2;
      el.style.setProperty("--mx", `${((e.clientX - r.left)/r.width*100).toFixed(1)}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top)/r.height*100).toFixed(1)}%`);
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onLeave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); };
    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.transform = `perspective(900px) rotateX(${cx.toFixed(2)}deg) rotateY(${cy.toFixed(2)}deg) translateZ(0)`;
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = 0;
      }
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max]);
  return ref;
}

function Tilt({ children, max = 8, style, ...rest }) {
  const ref = useTilt(max);
  return <div ref={ref} style={{transformStyle:"preserve-3d", willChange:"transform", ...style}} {...rest}>{children}</div>;
}

// Animated counter — counts up when in view
function Counter({ to, duration = 1600, suffix = "", prefix = "", style, format }) {
  const [ref, inView] = useReveal({ threshold: 0.35 });
  const [val, setVal] = useS(0);
  const target = typeof to === "number" ? to : parseFloat(to) || 0;
  useE(() => {
    if (!inView) return;
    let raf, start;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      setVal(target * ease(p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => raf && cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  const display = format
    ? format(val)
    : Number.isInteger(target) ? Math.round(val).toString() : val.toFixed(1);
  return <span ref={ref} style={style}>{prefix}{display}{suffix}</span>;
}

// Scroll progress bar pinned to top of viewport
function ScrollProgress({ color = "#7cc6ff", color2 = "#9b8cff", height = 2 }) {
  const ref = useR(null);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      el.style.transform = `scaleX(${p})`;
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,height,zIndex:100,pointerEvents:"none",background:"rgba(255,255,255,.04)"}}>
      <div ref={ref} style={{
        height:"100%",width:"100%",transformOrigin:"0 50%",transform:"scaleX(0)",
        background:`linear-gradient(90deg, ${color}, ${color2})`,
        boxShadow:`0 0 14px ${color}`,
        willChange:"transform",
      }}/>
    </div>
  );
}

// Cursor glow — a soft radial gradient follows the cursor
function CursorGlow({ color = "rgba(124,198,255,.18)", size = 520 }) {
  const ref = useR(null);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0, init = false;
    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!init) { cx = tx; cy = ty; init = true; }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      el.style.transform = `translate3d(${(cx - size/2).toFixed(1)}px, ${(cy - size/2).toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else { raf = 0; }
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, [size]);
  return (
    <div ref={ref} style={{
      position:"fixed",top:0,left:0,width:size,height:size,
      borderRadius:"50%",pointerEvents:"none",zIndex:3,
      background:`radial-gradient(circle, ${color} 0%, transparent 65%)`,
      mixBlendMode:"screen",willChange:"transform",
    }}/>
  );
}

// Section transition — sticky planet that scales with scroll, drifts between sections
function useScrollT(ref) {
  const [t, setT] = useS(0);
  useE(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when section enters bottom, 1 when fully scrolled past top
      const t = Math.max(0, Math.min(1, 1 - (r.top + r.height * 0.2) / (vh + r.height * 0.2)));
      setT(t);
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    tick();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return t;
}

// Media-query hook (used for mobile/desktop branching)
function useMediaQuery(query) {
  const [match, setMatch] = useS(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false
  );
  useE(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = (e) => setMatch(e.matches);
    setMatch(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", on);
    else if (mq.addListener) mq.addListener(on);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", on);
      else if (mq.removeListener) mq.removeListener(on);
    };
  }, [query]);
  return match;
}

function useIsMobile(bp = 768) { return useMediaQuery(`(max-width: ${bp - 1}px)`); }
function useIsTablet(bp = 1024) { return useMediaQuery(`(max-width: ${bp - 1}px)`); }

Object.assign(window, {
  useReveal, Reveal, Stagger, SplitText,
  useParallax, Parallax,
  useMagnet, Magnet,
  useTilt, Tilt,
  Counter, ScrollProgress, CursorGlow,
  useScrollT,
  useMediaQuery, useIsMobile, useIsTablet,
});
