/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakRadio, TweakSelect, TweakToggle, TweakColor,
   PALETTES, FONTS, TWEAK_DEFAULTS, StarField, OrbitRings, Planet, Pill, CTAButton, Nav, Hero, DirectionsStrip */
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2, useRef: useRef2 } = React;

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────────────────────
function About({ palette, accent, accent2, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const items = [
    { tag: "01 · подход", icon:"⌬", text:"Прививание тяги к знаниям, желание разобраться. Мир — это вибрации, поля и бесконечное любопытство." },
    { tag: "02 · практика", icon:"◐", text:"Изучаем основы, решаем задачи, обсуждаем эксперименты и применение тем в реальной жизни." },
    { tag: "03 · результат", icon:"✦", text:"98 баллов ЕГЭ — и я знаю, как прийти к такому результату. От механики до квантов." },
  ];
  return (
    <section id="about" style={{
      position:"relative",
      padding: isMobile ? "90px 20px 80px" : "140px 56px 120px",
      overflow:"hidden",
    }}>
      <div style={{
        position:"absolute",top:"-10%",right:"-15%",width:"60%",aspectRatio:"1/1",
        background:`radial-gradient(circle, ${accent}18 0%, transparent 60%)`,filter:"blur(40px)",pointerEvents:"none",
      }}/>
      <div style={{position:"relative",maxWidth:1400,margin:"0 auto"}}>
        {/* Section header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap: isMobile ? 24 : 40, marginBottom: isMobile ? 48 : 80,flexWrap:"wrap"}}>
          <div style={{maxWidth:760}}>
            <window.Reveal variant="up" duration={700}>
              <Pill accent={accent} icon>· обо мне</Pill>
            </window.Reveal>
            <h2 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(40px, 5.5vw, 84px)",
              lineHeight:1,letterSpacing:"-.025em",fontWeight:600,
              margin:"20px 0 0",textWrap:"balance",
            }}>
              <window.SplitText text="однажды я тоже была" by="word" step={50} duration={800} variant="up" distance={20}/>{" "}
              <window.SplitText text="на вашем месте" by="word" step={60} duration={800} delay={400} variant="up" distance={20}
                gradient={`linear-gradient(120deg, ${accent} 0%, ${accent2} 80%, #fff 110%)`}
                style={{fontStyle:"italic"}}/>{" "}
              <window.SplitText text="— и за лето полюбила физику." by="word" step={45} duration={800} delay={900}/>
            </h2>
          </div>
          <window.Reveal variant="left" delay={300}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:12,letterSpacing:".1em",
              textTransform:"uppercase",color:"rgba(255,255,255,.45)",textAlign:"right"}}>
              renata · 1999 → ∞<br/>казань ↦ москва ↦ германия
            </div>
          </window.Reveal>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.15fr",
          gap: isMobile ? 36 : 60,
          alignItems:"start",
        }}>
          {/* Left: Profile image card */}
          <div style={{position: isMobile ? "static" : "sticky", top:120}}>
            <window.Reveal variant="up" duration={1000} distance={60}>
              <window.Tilt max={6}>
                <div style={{
                  position:"relative",borderRadius:radius,overflow:"hidden",
                  border:"1px solid rgba(255,255,255,.10)",
                  boxShadow:`0 30px 80px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.04)`,
                  aspectRatio:"4/5",
                }}>
              <image-slot id="about-photo" src="assets/renata-1.png" placeholder="фото"
                style={{display:"block",width:"100%",height:"100%"}}/>
              <div style={{
                position:"absolute",inset:0,pointerEvents:"none",
                background:`linear-gradient(180deg, transparent 50%, ${palette.bg}cc 100%)`,
              }}/>
              {/* tilt-driven sheen */}
              <div style={{
                position:"absolute",inset:0,pointerEvents:"none",mixBlendMode:"overlay",
                background:`radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,.25) 0%, transparent 35%)`,
              }}/>
              {/* corner annotations */}
              <div style={{
                position:"absolute",top:18,left:18,
                fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:".15em",textTransform:"uppercase",
                color:"rgba(255,255,255,.7)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:accent,boxShadow:`0 0 8px ${accent}`,animation:"sf-blink 1.6s ease-in-out infinite"}}/>
                  rec · 01.cas → de
                </div>
              </div>
              <div style={{
                position:"absolute",top:18,right:18,
                fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:".15em",
                color:"rgba(255,255,255,.7)",textAlign:"right",
              }}>
                f / 2.8<br/>iso 400
              </div>
              <div style={{
                position:"absolute",bottom:20,left:20,right:20,
                display:"flex",alignItems:"flex-end",justifyContent:"space-between",
              }}>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:28,fontWeight:600,lineHeight:1}}>Рената</div>
                  <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"rgba(255,255,255,.62)",
                    letterSpacing:".1em",textTransform:"uppercase",marginTop:6}}>репетитор по физике</div>
                </div>
                <div style={{
                  width:48,height:48,borderRadius:"50%",
                  background:"rgba(255,255,255,.1)",backdropFilter:"blur(8px)",
                  border:"1px solid rgba(255,255,255,.18)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
                }}>↗</div>
              </div>
                </div>
              </window.Tilt>
            </window.Reveal>

            {/* Achievements list under photo — staggered */}
            <div style={{marginTop:32,display:"grid",gap:8}}>
              {[
                "Золотая медаль · лицей №131",
                "Стипендиат МГУ",
                "ЕГЭ физика · 98 баллов",
                "Поступление в вузы Германии",
                "Прививаю любовь к науке",
              ].map((s,i)=>(
                <window.Reveal key={i} variant="left" delay={i*100} duration={700} distance={30}>
                  <div style={{
                    display:"flex",alignItems:"center",gap:14,padding:"14px 18px",
                    background:"rgba(255,255,255,.03)",
                    border:"1px solid rgba(255,255,255,.07)",
                    borderRadius:radius/3,
                    fontSize:14,
                    transition:"background .3s, border-color .3s, transform .3s",
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.06)";e.currentTarget.style.borderColor=`${accent}55`;e.currentTarget.style.transform="translateX(6px)"}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform="translateX(0)"}}
                  >
                    <span style={{
                      fontFamily:"var(--font-mono)",fontSize:11,color:accent,minWidth:24,
                    }}>0{i+1}</span>
                    <span style={{flex:1}}>{s}</span>
                    <span style={{color:"rgba(255,255,255,.3)"}}>✦</span>
                  </div>
                </window.Reveal>
              ))}
            </div>
          </div>

          {/* Right: Story */}
          <div>
            <window.Reveal variant="mask" duration={1200}>
              <div style={{
                fontSize:22,lineHeight:1.55,color:"rgba(255,255,255,.82)",fontWeight:300,
                borderLeft:`1px solid ${accent}`,paddingLeft:24,
                textWrap:"pretty",
              }}>
                <span style={{
                  fontFamily:"var(--font-display)",fontSize:64,float:"left",lineHeight:.8,
                  marginRight:14,marginTop:6,color:accent,fontStyle:"italic",fontWeight:600,
                }}>«</span>
                Привет! Я Рената. Закончила физмат лицей №131 в Казани с золотой медалью,
                а затем поступила на физический факультет МГУ, где была стипендиатом по успеваемости.
                Сейчас готовлюсь к поступлению в технические вузы Германии,
                чтобы исследовать передовые технологии.
              </div>
            </window.Reveal>

            <window.Reveal variant="up" delay={200} duration={900}>
              <p style={{
                marginTop:36,fontSize:17,lineHeight:1.65,color:"rgba(255,255,255,.66)",
                maxWidth:560,textWrap:"pretty",
              }}>
                Однажды мне самой пришлось быть на вашем месте и изучать физику с азов.
                За лето я сумела подготовиться к поступлению в лицей и полюбить эту науку —
                ведь это совсем несложно.
              </p>
            </window.Reveal>

            {/* Three-step approach */}
            <div style={{marginTop:64,display:"grid",gap:18}}>
              {items.map((it,i)=>(
                <window.Reveal key={i} variant="up" delay={i*150} duration={900} distance={50}>
                  <div style={{
                    position:"relative",display:"grid",gridTemplateColumns:"auto 1fr",gap:24,
                    padding:"28px 28px 28px 24px",
                    background:`linear-gradient(135deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 100%)`,
                    border:"1px solid rgba(255,255,255,.08)",borderRadius:radius/2,
                    transition:"all .35s cubic-bezier(.2,.7,.2,1)",
                    overflow:"hidden",
                  }}
                    onMouseEnter={e=>{
                      e.currentTarget.style.borderColor=`${accent}55`;
                      e.currentTarget.style.transform="translateY(-4px)";
                      e.currentTarget.style.boxShadow=`0 22px 50px rgba(0,0,0,.35), 0 0 40px ${accent}22`;
                    }}
                    onMouseLeave={e=>{
                      e.currentTarget.style.borderColor="rgba(255,255,255,.08)";
                      e.currentTarget.style.transform="translateY(0)";
                      e.currentTarget.style.boxShadow="none";
                    }}
                  >
                    <div style={{
                      width:54,height:54,borderRadius:"50%",position:"relative",
                      background:`radial-gradient(circle at 30% 30%, ${accent2} 0%, ${accent} 60%, #0a0a18 100%)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:24,color:"#0a0a18",fontFamily:"var(--font-display)",
                      boxShadow:`0 0 24px ${accent}55`,
                    }}>
                      <span style={{
                        position:"absolute",inset:0,borderRadius:"50%",
                        border:`1px solid ${accent}`,
                        animation:"sf-pulse-ring 2.4s ease-out infinite",
                        animationDelay:`${i*0.4}s`,
                      }}/>
                      {it.icon}
                    </div>
                    <div>
                      <div style={{
                        fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".15em",
                        textTransform:"uppercase",color:accent,marginBottom:8,
                      }}>{it.tag}</div>
                      <div style={{fontSize:16,lineHeight:1.55,color:"rgba(255,255,255,.82)",textWrap:"pretty"}}>
                        {it.text}
                      </div>
                    </div>
                  </div>
                </window.Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMATS
// ─────────────────────────────────────────────────────────────────────────────
function Formats({ palette, accent, accent2, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  const isTablet = window.useIsTablet ? window.useIsTablet() : false;
  const formats = [
    {
      id:"mini",
      tag:"01 / mini-group",
      title:"мини-группа",
      meta:"до 5 учеников · 1–2 раза/нед",
      desc:"Живое общение, обсуждение и общий ритм. Домашние задания с разбором, поддержка между занятиями.",
      cta:"Записаться в группу",
      bullets:["до 5 человек","живые обсуждения","разбор д/з","еженедельный темп"],
      planet:`radial-gradient(circle at 30% 28%, #cbe6ff 0%, ${accent} 35%, #0a2554 70%, ${palette.bg} 100%)`,
    },
    {
      id:"solo",
      tag:"02 / individual",
      title:"индивидуально",
      meta:"1:1 · гибкий график",
      desc:"Персональный план, закрытие пробелов, интенсивная подготовка к ЕГЭ / ОГЭ под ваш уровень.",
      cta:"Индивидуальная запись",
      bullets:["план под тебя","закрываем пробелы","интенсив к экзамену","гибкий график"],
      planet:`radial-gradient(circle at 30% 28%, #ffd6f1 0%, ${accent2} 35%, #4a1c6e 70%, ${palette.bg} 100%)`,
      featured:true,
    },
    {
      id:"trial",
      tag:"03 / trial",
      title:"пробное занятие",
      meta:"знакомство · диагностика",
      desc:"Познакомимся, проверим текущий уровень, обсудим цели и почувствуем мой стиль работы.",
      cta:"Хочу попробовать",
      bullets:["знакомство","диагностика знаний","разбор целей","без обязательств"],
      planet:`radial-gradient(circle at 30% 28%, #d4ffe6 0%, #76f3d6 35%, #0e4a3f 70%, ${palette.bg} 100%)`,
    },
  ];
  return (
    <section id="formats" style={{
      position:"relative",
      padding: isMobile ? "90px 20px 80px" : "140px 56px 120px",
    }}>
      <div style={{maxWidth:1400,margin:"0 auto"}}>
        <div style={{
          display:"flex",justifyContent:"space-between",alignItems:"flex-end",
          gap: isMobile ? 24 : 40, marginBottom: isMobile ? 40 : 64, flexWrap:"wrap",
        }}>
          <div>
            <window.Reveal variant="up" duration={700}>
              <Pill accent={accent} icon>· форматы занятий</Pill>
            </window.Reveal>
            <h2 style={{
              fontFamily:"var(--font-display)",
              fontSize:"clamp(40px, 5.5vw, 84px)",
              lineHeight:1,letterSpacing:"-.025em",fontWeight:600,
              margin:"20px 0 0",maxWidth:900,textWrap:"balance",
            }}>
              <window.SplitText text="выбери свою" by="word" step={70} duration={800} variant="up" distance={22}/>{" "}
              <window.SplitText text="орбиту" by="char" step={50} duration={900} delay={400} variant="up" distance={24}
                gradient={`linear-gradient(120deg, ${accent} 0%, ${accent2} 80%, #fff 110%)`}
                style={{fontStyle:"italic"}}/>
            </h2>
          </div>
          <window.Reveal variant="left" delay={200}>
            <p style={{
              fontSize:15,lineHeight:1.6,color:"rgba(255,255,255,.6)",maxWidth:340,
              textWrap:"pretty",
            }}>
              Три формата — от мягкого знакомства до интенсива.
              Любые темы школьной и углублённой физики: механика → кванты.
            </p>
          </window.Reveal>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: isMobile ? 18 : 22,
        }}>
          {formats.map((f,i)=>(
            <window.Reveal key={f.id} variant="up" delay={i*150} duration={1000} distance={60}>
              <FormatCard f={f} accent={accent} accent2={accent2} radius={radius} bg={palette.bg}/>
            </window.Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormatCard({ f, accent, accent2, radius, bg }) {
  const [hov, setHov] = useState2(false);
  const tiltRef = window.useTilt ? window.useTilt(5) : useRef2(null);
  const isFeatured = !!f.featured;
  return (
    <div
      ref={tiltRef}
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        position:"relative",overflow:"hidden",
        background: isFeatured
          ? `linear-gradient(180deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,.02) 100%)`
          : `linear-gradient(180deg, rgba(255,255,255,.03) 0%, rgba(255,255,255,.01) 100%)`,
        border: isFeatured ? `1px solid ${accent}66` : "1px solid rgba(255,255,255,.10)",
        borderRadius: radius,
        padding:"32px 28px 28px",
        minHeight:520,
        display:"flex",flexDirection:"column",justifyContent:"space-between",
        transition:"box-shadow .35s ease, border-color .35s ease, background .35s ease",
        transformStyle:"preserve-3d",
        willChange:"transform",
        boxShadow: hov
          ? `0 40px 80px rgba(0,0,0,.45), 0 0 0 1px ${accent}55, 0 0 60px ${accent}33`
          : isFeatured ? `0 0 0 1px ${accent}22, 0 0 40px ${accent}22` : "0 12px 30px rgba(0,0,0,.25)",
      }}
    >
      {/* Tilt-driven sheen */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",borderRadius:radius,
        background:`radial-gradient(circle at var(--mx,50%) var(--my,50%), ${accent}28 0%, transparent 45%)`,
        opacity: hov ? 1 : 0,
        transition:"opacity .35s",
        mixBlendMode:"screen",
      }}/>
      {/* Planet decoration */}
      <div style={{
        position:"absolute",top:-100,right:-90,width:280,height:280,
        borderRadius:"50%",background:f.planet,
        boxShadow:"inset -20px -30px 50px rgba(0,0,0,.5)",
        opacity: hov ? 0.95 : 0.7,
        transform: hov ? "scale(1.12) rotate(-12deg) translateZ(40px)" : "scale(1) rotate(0) translateZ(20px)",
        transition:"all .8s cubic-bezier(.2,.7,.2,1)",
        filter: hov ? `drop-shadow(0 0 30px ${accent}88)` : "none",
      }}/>
      <div style={{
        position:"absolute",top:-100,right:-90,width:280,height:280,
        borderRadius:"50%",
        background:"radial-gradient(circle at 30% 30%, rgba(255,255,255,.5) 0%, transparent 25%)",
        mixBlendMode:"screen",pointerEvents:"none",
        opacity:0.6,
      }}/>

      <div style={{position:"relative",transform:"translateZ(20px)"}}>
        <div style={{
          fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".15em",
          textTransform:"uppercase",color:accent,
        }}>{f.tag}</div>
        <h3 style={{
          fontFamily:"var(--font-display)",fontSize:42,fontWeight:600,
          letterSpacing:"-.02em",lineHeight:1,margin:"18px 0 12px",
        }}>{f.title}</h3>
        <div style={{
          fontFamily:"var(--font-mono)",fontSize:12,color:"rgba(255,255,255,.55)",
          letterSpacing:".05em",marginBottom:24,
        }}>{f.meta}</div>
        <p style={{
          fontSize:15,lineHeight:1.55,color:"rgba(255,255,255,.74)",margin:0,
          maxWidth:280,textWrap:"pretty",
        }}>{f.desc}</p>
      </div>

      <div style={{position:"relative",marginTop:32,transform:"translateZ(20px)"}}>
        <ul style={{listStyle:"none",padding:0,margin:"0 0 26px",display:"grid",gap:8}}>
          {f.bullets.map((b,i)=>(
            <li key={i} style={{
              display:"flex",alignItems:"center",gap:10,
              fontSize:13,color:"rgba(255,255,255,.7)",
              fontFamily:"var(--font-mono)",
            }}>
              <span style={{
                width:14,height:14,borderRadius:"50%",
                border:`1px solid ${accent}`,position:"relative",flexShrink:0,
              }}>
                <span style={{
                  position:"absolute",inset:3,borderRadius:"50%",background:accent,
                  boxShadow:`0 0 6px ${accent}`,
                }}/>
              </span>
              {b}
            </li>
          ))}
        </ul>
        <a href="https://t.me/renchikik" target="_blank" style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"16px 22px",borderRadius: radius * .8,
          background: isFeatured ? "#fff" : "rgba(255,255,255,.06)",
          color: isFeatured ? "#0a0a18" : "#fff",
          border: isFeatured ? "1px solid transparent" : "1px solid rgba(255,255,255,.14)",
          textDecoration:"none",fontSize:14,fontWeight:500,
          transition:"all .25s",
        }}
          onMouseEnter={e=>{
            if (!isFeatured) {
              e.currentTarget.style.background="#fff";
              e.currentTarget.style.color="#0a0a18";
            }
          }}
          onMouseLeave={e=>{
            if (!isFeatured) {
              e.currentTarget.style.background="rgba(255,255,255,.06)";
              e.currentTarget.style.color="#fff";
            }
          }}>
          {f.cta}
          <span style={{
            width:32,height:32,borderRadius:"50%",
            background:isFeatured?"#0a0a18":accent,
            color:isFeatured?"#fff":"#0a0a18",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
          }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTE
// ─────────────────────────────────────────────────────────────────────────────
function QuoteSection({ palette, accent, accent2, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <section id="quote" style={{
      position:"relative",
      padding: isMobile ? "80px 20px" : "120px 56px",
      overflow:"hidden",
    }}>
      <div style={{
        position:"absolute",inset:0,
        background:`radial-gradient(60% 80% at 50% 50%, ${accent}22 0%, transparent 60%)`,
        pointerEvents:"none",
      }}/>
      <div style={{position:"relative",maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
        {/* small planet — parallax */}
        <window.Parallax strength={-0.18}>
          <div style={{margin:"0 auto 40px",width:120,height:120,animation:"sf-float 6s ease-in-out infinite"}}>
            <Planet gradient={palette.planet} size={120} glow={accent}/>
          </div>
        </window.Parallax>
        <window.Reveal variant="up" duration={700}>
          <div style={{
            fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".2em",
            textTransform:"uppercase",color:accent,marginBottom:24,
          }}>· манифест ·</div>
        </window.Reveal>
        <blockquote style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(28px, 4.2vw, 56px)",
          lineHeight:1.3,letterSpacing:"-.02em",fontWeight:500,
          margin:0,textWrap:"balance",fontStyle:"italic",
          padding:"0.15em 0",
        }}>
          <window.SplitText text="«Физика — это не скучные формулы, это" by="word" step={55} duration={800} variant="up" distance={18}/>{" "}
          <window.SplitText
            text="язык, на котором написана Вселенная"
            by="word" step={55} duration={900} delay={1500} variant="up" distance={20}
            style={{textShadow:`0 0 24px ${accent}66`}}
            gradient={`linear-gradient(120deg, ${accent} 0%, ${accent2} 80%, #fff 110%)`}
          />
          <window.SplitText text=". И каждому бы стоило изучить его.»" by="word" step={50} duration={800} delay={3500}/>
        </blockquote>
        <window.Reveal variant="up" delay={400} duration={800}>
          <div style={{
            marginTop:36,display:"inline-flex",alignItems:"center",gap:14,
            fontFamily:"var(--font-mono)",fontSize:13,letterSpacing:".15em",
            textTransform:"uppercase",color:"rgba(255,255,255,.55)",
          }}>
            <span style={{width:40,height:1,background:"rgba(255,255,255,.3)"}}/>
            renchik
            <span style={{width:40,height:1,background:"rgba(255,255,255,.3)"}}/>
          </div>
        </window.Reveal>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────
function Contact({ palette, accent, accent2, radius }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <section id="contact" style={{
      position:"relative",
      padding: isMobile ? "90px 20px 70px" : "140px 56px 100px",
      overflow:"hidden",
    }}>
      {/* Big planet on right — hide on mobile (too noisy) */}
      {!isMobile && (
      <window.Parallax strength={-0.12} style={{
        position:"absolute",top:"50%",right:"-15%",transform:"translateY(-50%)",
        width:"min(680px, 50vw)",aspectRatio:"1/1",pointerEvents:"none",opacity:.85,zIndex:0,
      }}>
        <div style={{position:"relative",width:"100%",height:"100%",animation:"sf-float 9s ease-in-out infinite"}}>
          <Planet gradient={palette.planet} size="100%" glow={accent} style={{width:"100%",height:"100%"}}/>
          <div style={{position:"absolute",inset:0,color:accent,animation:"sf-rotate 120s linear infinite"}}>
            <OrbitRings count={3} opacity={0.25}/>
          </div>
        </div>
      </window.Parallax>
      )}

      <div style={{position:"relative",maxWidth:1400,margin:"0 auto",zIndex:2}}>
        <window.Reveal variant="up" duration={700}>
          <Pill accent={accent} icon>· контакты</Pill>
        </window.Reveal>
        <h2 style={{
          fontFamily:"var(--font-display)",
          fontSize:"clamp(48px, 7.5vw, 124px)",
          lineHeight:.95,letterSpacing:"-.03em",fontWeight:600,
          margin:"22px 0 28px",maxWidth:1100,textWrap:"balance",
        }}>
          <window.SplitText text="Вселенная ждёт" by="word" step={70} duration={900} variant="up" distance={28}/>
          <br/>
          <window.SplitText
            text="твоих открытий"
            by="char" step={36} duration={900} delay={600} variant="up" distance={28}
            style={{fontStyle:"italic"}}
            gradient={`linear-gradient(120deg, ${accent} 0%, ${accent2} 80%, #fff 110%)`}
          />
        </h2>
        <window.Reveal variant="up" delay={400} duration={800}>
          <p style={{
            fontSize:19,lineHeight:1.55,color:"rgba(255,255,255,.72)",
            maxWidth:520,margin:"0 0 44px",textWrap:"pretty",
          }}>
            Напиши в Telegram — обсудим цели и подберём формат.
            Знакомство всегда бесплатное.
          </p>
        </window.Reveal>

        <window.Reveal variant="up" delay={600} duration={700}>
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:64}}>
            <CTAButton accent={accent} radius={radius} href="https://t.me/renchikik">@renchikik в telegram</CTAButton>
            <CTAButton accent={accent} radius={radius} primary={false} href="#formats">смотреть форматы</CTAButton>
          </div>
        </window.Reveal>

        {/* Coordinates grid — staggered */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap:0,
          borderTop:"1px solid rgba(255,255,255,.10)",
          borderBottom:"1px solid rgba(255,255,255,.10)",
          maxWidth:900,
        }}>
          {[
            {l:"локация",v:"Казань · Москва"},
            {l:"формат",v:"онлайн · офлайн"},
            {l:"учится",v:"Германия"},
            {l:"связь",v:"@renchikik"},
          ].map((c,i)=>(
            <window.Reveal key={i} variant="up" delay={i*120} duration={800}>
              <div style={{
                padding: isMobile ? "18px 14px" : "24px 20px",
                borderLeft: isMobile
                  ? (i % 2 ? "1px solid rgba(255,255,255,.10)" : "none")
                  : (i ? "1px solid rgba(255,255,255,.10)" : "none"),
                borderTop: isMobile && i >= 2 ? "1px solid rgba(255,255,255,.10)" : "none",
                height:"100%",
              }}>
                <div style={{
                  fontFamily:"var(--font-mono)",fontSize:11,letterSpacing:".15em",
                  textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:10,
                }}>· {c.l}</div>
                <div style={{fontSize: isMobile ? 15 : 18,fontFamily:"var(--font-display)",fontWeight:500}}>{c.v}</div>
              </div>
            </window.Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer({ accent }) {
  const isMobile = window.useIsMobile ? window.useIsMobile() : false;
  return (
    <footer style={{
      position:"relative",
      padding: isMobile ? "32px 20px 28px" : "40px 56px 32px",
      borderTop:"1px solid rgba(255,255,255,.08)",
      display:"flex",
      justifyContent: isMobile ? "center" : "space-between",
      alignItems:"center",
      flexWrap:"wrap",
      gap: isMobile ? 14 : 20,
      textAlign: isMobile ? "center" : "left",
      fontFamily:"var(--font-mono)",fontSize: isMobile ? 11 : 12, letterSpacing:".08em",
      color:"rgba(255,255,255,.45)",textTransform:"uppercase",
    }}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{
          width:14,height:14,borderRadius:"50%",
          background:`radial-gradient(circle at 32% 30%, #fff 0%, ${accent} 40%, #0a0a18 100%)`,
          boxShadow:`0 0 8px ${accent}66`,
        }}/>
        © 2025 renchik · знания без границ
      </div>
      <div>казань ↦ москва ↦ берлин · v.0.2</div>
      <a href="https://t.me/renchikik" style={{color:"rgba(255,255,255,.62)",textDecoration:"none"}}>telegram ↗</a>
    </footer>
  );
}

Object.assign(window, { About, Formats, QuoteSection, Contact, Footer });
