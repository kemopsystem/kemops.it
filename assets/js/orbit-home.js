/*
  KEMOPS — ORBIT EXPERIENCE
  Original interaction & procedural visual system. No third-party templates,
  images, animation libraries, fonts, or external code dependencies.
*/
(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');
  const header = $('.site-header');
  const menuButton = $('.mobile-toggle');
  const menu = $('.mobile-menu');
  const meter = $('.scroll-meter-fill');
  const cursorGlow = $('.cursor-glow');
  const heroViz = $('.hero-viz');
  $('#year').textContent = String(new Date().getFullYear());

  // Responsive mobile navigation with accessible expanded state.
  function closeMenu() {
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    menuButton.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Apri menu');
  }
  menuButton.addEventListener('click', () => {
    const opening = menu.hidden;
    if (!opening) return closeMenu();
    menu.hidden = false;
    document.body.classList.add('menu-open');
    menuButton.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Chiudi menu');
    const firstLink = $('a', menu);
    if (firstLink) firstLink.focus();
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && !menu.hidden) closeMenu();
  });

  // Entrance reveals and navigation section tracking.
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(el => revealObserver.observe(el));
    const sections = $$('main section[id]');
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$('[data-nav]').forEach(nav => {
          const active = nav.getAttribute('href') === `#${entry.target.id}`;
          nav.classList.toggle('is-active', active);
        });
      });
    }, {rootMargin: '-25% 0px -65% 0px', threshold:0});
    sections.forEach(s => navObserver.observe(s));
  } else $$('.reveal').forEach(el => el.classList.add('visible'));

  let scrollPending = false;
  function updateScroll() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    meter.style.width = `${Math.min(100, Math.max(0, (scrolled / available) * 100))}%`;
    header.classList.toggle('scrolled', scrolled > 30);
    if (!reduceMotion.matches && heroViz) {
      heroViz.style.transform = `translate3d(0,${Math.min(130, scrolled * .12)}px,0)`;
    }
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, {passive:true});
  updateScroll();

  // Lightweight cursor atmosphere and magnetic CTA movement (fine pointers only).
  if (!coarsePointer.matches && !reduceMotion.matches) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let glowX = cx, glowY = cy;
    let pointerMovePending = false;
    window.addEventListener('pointermove', e => {
      cx = e.clientX; cy = e.clientY;
      cursorGlow.style.opacity = '1';
      if (!pointerMovePending) {
        pointerMovePending = true;
        requestAnimationFrame(() => {
          glowX += (cx-glowX)*.45; glowY += (cy-glowY)*.45;
          cursorGlow.style.left = `${glowX}px`;
          cursorGlow.style.top = `${glowY}px`;
          pointerMovePending = false;
        });
      }
    }, {passive:true});
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const b = el.getBoundingClientRect();
        const x = (e.clientX-b.left-b.width/2) * .06;
        const y = (e.clientY-b.top-b.height/2) * .09;
        el.style.translate = `${x}px ${y}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; });
    });
  }

  // Four interactive service prototypes, modeled only on KemOps' actual services.
  const frame = (category, graphic) => `
    <div class="service-stage-stage" data-stage="${category}">
      <div class="stage-corner top-left"></div><div class="stage-corner bottom-right"></div>
      ${graphic}
    </div>`;
  const dashboard = $('.service-stage-stage').outerHTML;
  const services = [
    {
      title: 'Web app e piattaforme',
      description: 'Progettiamo e sviluppiamo web app e piattaforme digitali veloci, accessibili e pronte a crescere insieme al tuo progetto.',
      email: 'Progetto web app e piattaforme',
      stage: dashboard
    },
    {
      title: 'Software su misura',
      description: 'Disegniamo strumenti, architetture e integrazioni intorno ai processi reali del tuo team, invece di forzare il team dentro strumenti rigidi.',
      email: 'Progetto software su misura',
      stage: frame('software architecture', `
        <div class="stage-architecture">
          <svg class="architecture-connector" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden="true"><path d="M 65 38 L 195 160 L 350 92 M 195 160 L 70 275 M 195 160 L 312 278" /></svg>
          <div class="architecture-ring"></div><div class="architecture-core">CORE / OPS</div>
          <div class="architecture-node a">PROCESSI</div><div class="architecture-node b">SISTEMI</div>
          <div class="architecture-node c">WORKFLOW</div><div class="architecture-node d">API</div>
        </div>`)
    },
    {
      title: 'Applicazioni mobile',
      description: 'Dalla strategia al rilascio, creiamo esperienze mobile native o multipiattaforma pensate per accompagnare gli utenti nel loro contesto quotidiano.',
      email: 'Progetto applicazione mobile',
      stage: frame('mobile experience', `
        <div class="stage-phone-orbit"></div><div class="stage-phone-orbit two"></div>
        <div class="stage-phone">
          <div class="stage-phone-card"><span></span><span></span><span></span></div>
          <div class="stage-phone-nav"><span>⌂</span><span>◎</span><span>▦</span></div>
        </div>`)
    },
    {
      title: 'Modelli AI specializzati',
      description: 'Valutiamo e sviluppiamo modelli per compiti specifici, dalla classificazione dei dati alla visione artificiale, dopo aver verificato dati e fattibilità.',
      email: 'Progetto modello AI specializzato',
      stage: frame('specialized ai', `
        <div class="stage-ai"><div class="ai-connection"></div><div class="ai-flow-line"></div>
          <div class="ai-core"><span>AI</span></div><div class="ai-flow-label left">INPUT / DATI</div>
          <div class="ai-flow-label right">OUTPUT / INSIGHT</div>
        </div>`)
    }
  ];
  let activeService = 0;
  const serviceTabs = $$('.service-tab');
  const serviceDisplay = $('.service-display');
  const servicePanel = $('#service-panel');
  function selectService(index, focus = false) {
    if (index < 0 || index >= services.length) return;
    activeService = index;
    const service = services[index];
    serviceTabs.forEach((tab, idx) => {
      const current = idx === index;
      tab.classList.toggle('is-active', current);
      tab.setAttribute('aria-selected', String(current));
      tab.setAttribute('tabindex', current ? '0' : '-1');
    });
    servicePanel.setAttribute('aria-labelledby', `service-tab-${index}`);
    serviceDisplay.innerHTML = service.stage;
    $('#service-title').textContent = service.title;
    $('#service-description').textContent = service.description;
    $('#service-cta').href = `mailto:kemops.consulting@gmail.com?subject=${encodeURIComponent(`KemOps - ${service.email}`)}`;
    if (focus) serviceTabs[index].focus();
  }
  serviceTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectService(index));
    tab.addEventListener('keydown', e => {
      const keys = ['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? services.length-1 :
        (index + (['ArrowDown','ArrowRight'].includes(e.key) ? 1 : -1) + services.length) % services.length;
      selectService(next, true);
    });
  });

  // Interactive four-step trajectory.
  const steps = [
    {title:'Capire prima di costruire.',text:'Partiamo da una domanda fondamentale: cosa deve cambiare davvero? Definiamo insieme il problema, le persone coinvolte e i vincoli tecnici e operativi.'},
    {title:'Trasformare un’idea in qualcosa di tangibile.',text:'Prototipi, percorsi utente e prime verifiche rendono visibile la direzione scelta. Raccogliamo feedback prima di investire nello sviluppo completo.'},
    {title:'Costruire, integrare, verificare.',text:'Sviluppiamo in cicli brevi, testiamo i componenti e valutiamo le integrazioni necessarie. Le scelte tecniche seguono gli obiettivi del progetto.'},
    {title:'Non un traguardo. Una traiettoria.',text:'Dopo il rilascio possiamo misurare, imparare e pianificare miglioramenti. Supporto ed evoluzione sono definiti insieme nel perimetro di progetto.'}
  ];
  $$('.method-step').forEach((button, index) => {
    button.addEventListener('click', () => {
      $$('.method-step').forEach((b, i) => {
        b.classList.toggle('is-current', index===i);
        b.setAttribute('aria-pressed', String(index===i));
      });
      $('#method-detail-title').textContent = steps[index].title;
      $('#method-detail-text').textContent = steps[index].text;
    });
  });
  // FAQ behaves like an accordion.
  $$('.faq-items details').forEach(detail => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      $$('.faq-items details').forEach(other => { if (other !== detail) other.open = false; });
    });
  });

  // Procedural orbit universe: drawn from scratch, no third-party images or models.
  // Elliptical orbit paths + parallax field + spherical latitude/longitude mapping.
  const canvas = $('#orbit-canvas');
  if (!canvas || getComputedStyle(heroViz).display === 'none') return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  let W=0,H=0,DPR=1,visible=true,raf=0,frameTime=0;
  let pointer={x:0,y:0};
  const random = (() => {let seed = 83721; return () => {seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296;};})();
  const stars = Array.from({length:210},()=>({x:random(),y:random(),r:random()*1.5+.25,phase:random()*6.28,speed:.5+random()*1.5}));
  const spherePoints = Array.from({length:185},()=>({lat:Math.acos(random()*2-1),lon:random()*Math.PI*2,size:random()*1.25+.4}));
  const rings = [
    {rx:1.30, ry:.42, rotation:-.37, speed:.17,phase:0,bright:.65},
    {rx:1.32, ry:.51, rotation:.48, speed:-.13,phase:2.4,bright:.56},
    {rx:1.07, ry:.80, rotation:-.14, speed:.11,phase:1.2,bright:.34},
    {rx:.84, ry:1.01, rotation:.45, speed:-.09,phase:3.1,bright:.26},
    {rx:1.54, ry:.18, rotation:.0, speed:.20,phase:.5,bright:.3}
  ];
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1,rect.width); H = Math.max(1,rect.height);
    DPR = Math.min(1.75,window.devicePixelRatio || 1);
    canvas.width = Math.round(W*DPR);canvas.height = Math.round(H*DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    if(reduceMotion.matches) draw(3.2);
  }
  const ro = ('ResizeObserver' in window) ? new ResizeObserver(resizeCanvas) : null;
  if(ro) ro.observe(canvas);
  else window.addEventListener('resize',resizeCanvas,{passive:true});
  function ringPoint(cx,cy,rx,ry,angle,t) {
    const x=rx*Math.cos(t),y=ry*Math.sin(t);const ca=Math.cos(angle),sa=Math.sin(angle);
    return [cx+x*ca-y*sa,cy+x*sa+y*ca];
  }
  function draw(time) {
    if (!W || !H) return;
    ctx.clearRect(0,0,W,H);
    const cx = W*.52 + pointer.x*12,cy=H*.515+pointer.y*10;
    const R=Math.min(W*.35,H*.39);
    // Star field, with a soft vignette naturally supplied by the hero container.
    stars.forEach(s=>{
      const x=s.x*W,y=s.y*H; const a=.08+.31*(.5+.5*Math.sin(time*s.speed+s.phase));
      ctx.fillStyle=`rgba(128,240,245,${a})`;ctx.beginPath();ctx.arc(x,y,s.r,0,6.283);ctx.fill();
    });
    // Ambient radial volume.
    let aura=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.6);
    aura.addColorStop(0,'rgba(0,197,218,.13)');aura.addColorStop(.55,'rgba(0,136,158,.07)');aura.addColorStop(1,'rgba(0,229,231,0)');
    ctx.fillStyle=aura;ctx.beginPath();ctx.arc(cx,cy,R*1.6,0,6.283);ctx.fill();
    // Orbit trails drawn as original layered luminous strokes.
    rings.forEach((ring,i)=>{
      const angle=ring.rotation+.085*Math.sin(time*.08+i);
      const rx=R*ring.rx,ry=R*ring.ry;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,6.283);
      ctx.lineWidth=i===0?1.6:1;ctx.strokeStyle=`rgba(0,229,231,${ring.bright*.40})`;ctx.stroke();
      // Short energized fragments rotate along their rings.
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,time*ring.speed+ring.phase,time*ring.speed+ring.phase+1.28);
      ctx.strokeStyle=`rgba(0,245,249,${ring.bright*.93})`;ctx.shadowColor='#00e5e7';ctx.shadowBlur=18;
      ctx.lineWidth=i===0?2.5:1.4;ctx.stroke();ctx.restore();
      const t=time*ring.speed+ring.phase+1.28;
      const [px,py]=ringPoint(cx,cy,rx,ry,angle,t);
      const glow=ctx.createRadialGradient(px,py,0,px,py,i===0?18:12);
      glow.addColorStop(0,'rgba(220,255,255,.95)');glow.addColorStop(.16,'rgba(0,229,231,.95)');glow.addColorStop(1,'rgba(0,229,231,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(px,py,i===0?18:12,0,6.283);ctx.fill();
    });
    // Core sphere: dark refractive material, self-generated lat/long lights.
    const SR=R*.51;
    const sphere=ctx.createRadialGradient(cx-SR*.31,cy-SR*.37,SR*.02,cx,cy,SR*1.15);
    sphere.addColorStop(0,'rgba(23,100,116,.9)');sphere.addColorStop(.28,'rgba(9,56,70,.98)');sphere.addColorStop(.72,'rgba(4,26,39,1)');sphere.addColorStop(1,'rgba(1,10,17,1)');
    ctx.beginPath();ctx.arc(cx,cy,SR,0,6.283);ctx.fillStyle=sphere;ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,SR-.5,0,6.283);ctx.clip();
    // spherical meridians tilt with time; perspective dots brighten at front.
    const rot=time*.095;
    for(let k=-5;k<=5;k++){
      const latitude=k*Math.PI/13;
      const y=Math.sin(latitude)*SR;
      const xr=Math.cos(latitude)*SR;
      ctx.beginPath();ctx.ellipse(cx,cy+y,xr,Math.max(1,xr*.24),0,0,6.283);
      ctx.strokeStyle=`rgba(61,223,230,${.05+(.06*(1-Math.abs(k)/6))})`;ctx.lineWidth=.65;ctx.stroke();
    }
    for(let k=0;k<10;k++){
      const a=rot+k*Math.PI/10;
      ctx.beginPath();ctx.ellipse(cx,cy,Math.abs(Math.cos(a))*SR,SR,0,0,6.283);
      ctx.strokeStyle=`rgba(0,223,229,${.07+.03*Math.abs(Math.cos(a))})`;ctx.lineWidth=.7;ctx.stroke();
    }
    spherePoints.forEach(pt=>{
      const lat=pt.lat,lon=pt.lon+rot*1.3;
      const x3=Math.sin(lat)*Math.cos(lon),y3=Math.cos(lat),z3=Math.sin(lat)*Math.sin(lon);
      if(z3<-.1) return;
      const px=cx+x3*SR,py=cy+y3*SR;
      ctx.fillStyle=`rgba(123,252,251,${(.14+z3*.45)})`;
      ctx.beginPath();ctx.arc(px,py,pt.size,0,6.283);ctx.fill();
    });ctx.restore();
    ctx.beginPath();ctx.arc(cx,cy,SR,0,6.283);ctx.strokeStyle='rgba(63,230,236,.38)';ctx.lineWidth=1.4;ctx.shadowColor='#00e5e7';ctx.shadowBlur=20;ctx.stroke();ctx.shadowBlur=0;
    // Optical concentric ticks and directional marks.
    for(let a=0;a<360;a+=15){
      const t=a*Math.PI/180+time*.025;
      const rr=R*1.65,rr2=rr+(a%45===0?10:5);
      ctx.beginPath();ctx.moveTo(cx+Math.cos(t)*rr,cy+Math.sin(t)*rr);ctx.lineTo(cx+Math.cos(t)*rr2,cy+Math.sin(t)*rr2);
      ctx.strokeStyle=`rgba(0,229,231,${a%45===0?.24:.1})`;ctx.lineWidth=.8;ctx.stroke();
    }
    // Orbit core focal light.
    const center=ctx.createRadialGradient(cx,cy,0,cx,cy,SR*.33);
    center.addColorStop(0,'rgba(0,229,231,.15)');center.addColorStop(1,'rgba(0,229,231,0)');
    ctx.fillStyle=center;ctx.fillRect(cx-SR,cy-SR,SR*2,SR*2);
  }
  function loop(t) {
    raf=0;
    if (!visible || document.hidden || reduceMotion.matches) return;
    frameTime=t*.001;
    draw(frameTime);
    raf=requestAnimationFrame(loop);
  }
  function start() {
    if (reduceMotion.matches) {draw(3.2);return;}
    if (!raf && visible && !document.hidden) raf=requestAnimationFrame(loop);
  }
  function stop() {if(raf) cancelAnimationFrame(raf);raf=0;}
  if ('IntersectionObserver' in window) {
    const canvasObserver=new IntersectionObserver(entries => {
      visible=entries[0].isIntersecting;
      if(visible) start(); else stop();
    }, {rootMargin:'150px'});
    canvasObserver.observe(canvas);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
  reduceMotion.addEventListener?.('change',()=>{stop();start();});
  window.addEventListener('pointermove', e=>{
    if(coarsePointer.matches || reduceMotion.matches) return;
    pointer.x=((e.clientX/window.innerWidth)-.5)*2;
    pointer.y=((e.clientY/window.innerHeight)-.5)*2;
  },{passive:true});
  resizeCanvas();start();
})();
