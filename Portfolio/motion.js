/**
 * MOTION & SCROLL-DRIVEN ANIMATION SYSTEM
 * Stack: GSAP 3 + ScrollTrigger + Lenis
 * Subhajit Das Portfolio Architecture
 */

// =============================================================================
// 0. ACCESSIBILITY / REDUCED MOTION CHECK
// =============================================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ===========================================================================
  // 1. SMOOTH SCROLL: LENIS SYNCED WITH SCROLLTRIGGER
  // ===========================================================================
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.05
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Anchor link handling via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
          }
        }
      });
    });
  }

  // ===========================================================================
  // 2. HERO DEPTH EFFECT (BACKGROUND "ARCHITECT" PARALLAX & DRIFT)
  // ===========================================================================
  const heroBg = document.querySelector('.hero-architect-bg');
  const heroSection = document.querySelector('#hero');

  if (heroBg && heroSection && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 45;
      const ny = (e.clientY / window.innerHeight - 0.5) * 35;
      gsap.to(heroBg, {
        x: nx,
        y: ny,
        duration: 1.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    gsap.to(heroBg, {
      yPercent: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      }
    });
  }

  // ===========================================================================
  // 3. HERO INTRO ANIMATION TIMELINE
  // ===========================================================================
  if (!prefersReducedMotion) {
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    heroTl
      .from('.hero-hud-box', {
        opacity: 0,
        scale: 0.88,
        y: -15,
        duration: 0.8,
        delay: 0.15
      })
      .from('.hero-title-line .hero-title-word', {
        yPercent: 120,
        duration: 1.05,
        stagger: 0.08
      }, '-=0.45')
      .from('.hero-desc', {
        opacity: 0,
        y: 25,
        duration: 0.85
      }, '-=0.6')
      .from('.hero-actions .btn-minimal', {
        opacity: 0,
        y: 20,
        stagger: 0.09,
        duration: 0.75
      }, '-=0.6')
      .from('.hero-visual .chassis-wrapper', {
        opacity: 0,
        y: 35,
        scale: 0.95,
        duration: 1.15
      }, '-=0.85')
      .from('.stat-item', {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.65
      }, '-=0.6');
  }

  // ===========================================================================
  // 4. FLOATING CURSOR PARTICLES (CANVAS GENTLE DRIFT & REPEL)
  // ===========================================================================
  initParticlesCanvas();

  // ===========================================================================
  // 5. CUSTOM CURSOR (DOT + TRAILING RING + VIEW BADGE)
  // ===========================================================================
  initCustomCursor();

  // ===========================================================================
  // 6. SCROLL PROGRESS LINE & JOURNEY TIMELINE NODES
  // ===========================================================================
  initScrollProgressLine();

  // ===========================================================================
  // 7. SECTION HEADLINE REVEALS (WORD BY WORD + UNDERLINE SWEEP)
  // ===========================================================================
  initSectionReveals();

  // ===========================================================================
  // 8. STATS COUNT-UP ANIMATION
  // ===========================================================================
  initStatsCountUp();

  // ===========================================================================
  // 9. MARQUEE VELOCITY ACCELERATION
  // ===========================================================================
  initMarqueeVelocity(lenis);

  // ===========================================================================
  // 10. FLAGSHIP CARDS (HORIZONTAL PINNED SCROLL & 3D TILT)
  // ===========================================================================
  initFlagshipsHorizontalScroll();

  // ===========================================================================
  // 11. BIG STATEMENT SECTION ("FROM IDEA. TO SHIPPED.")
  // ===========================================================================
  initStatementPin();

  // ===========================================================================
  // 12. FOOTER CTA & MAGNETIC BUTTON
  // ===========================================================================
  initMagneticButton();

  // Refresh ScrollTrigger after images and layout stabilize
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
});

// =============================================================================
// PARTICLES CANVAS IMPLEMENTATION
// =============================================================================
function initParticlesCanvas() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 12 : 36;
  const colors = ['#ff2e55', '#00e5ff', '#ffffff', 'rgba(255,46,85,0.7)'];

  const mouse = { x: -1000, y: -1000, real: false };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.real = true;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 2.8 + 1.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() > 0.45 ? 'sparkle' : 'arrow',
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02
    });
  }

  let animFrameId = null;
  let isRunning = true;

  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Gentle drift
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;

      // Mouse repulsion
      if (mouse.real) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 95;
        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 1.5;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }
      }

      // Screen wrap
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'sparkle') {
        // Draw 4-point sparkle
        ctx.beginPath();
        const s = p.size * 1.5;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else {
        // Tiny arrow / cursor chevron
        ctx.beginPath();
        const s = p.size * 1.4;
        ctx.moveTo(0, 0);
        ctx.lineTo(s * 1.2, s * 0.5);
        ctx.lineTo(s * 0.6, s * 1.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    animFrameId = requestAnimationFrame(render);
  }

  render();

  // Save CPU: pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
    } else {
      isRunning = true;
      render();
    }
  });
}

// =============================================================================
// CUSTOM CURSOR IMPLEMENTATION
// =============================================================================
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || prefersReducedMotion) return;

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function updateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(updateRing);
  }
  updateRing();

  // Hover states on interactive links & buttons
  const interactiveSelector = 'a, button, .term-quick-btn, .btn-minimal, input, textarea';
  document.querySelectorAll(interactiveSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-hover');
    });
  });

  // Project cards show "VIEW" inside the ring
  const projectCards = document.querySelectorAll('.flagship-card, .collab-card, .project-card');
  projectCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      ring.classList.add('cursor-view');
      ring.textContent = 'VIEW';
    });
    card.addEventListener('mouseleave', () => {
      ring.classList.remove('cursor-view');
      ring.textContent = '';
    });
  });
}

// =============================================================================
// SCROLL PROGRESS LINE & JOURNEY TIMELINE NODES
// =============================================================================
function initScrollProgressLine() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.height = `${Math.min(100, Math.max(0, progress))}%`;
  });

  // Timeline items in Journey section highlight as scroll reaches them
  const journeyCards = document.querySelectorAll('.journey-card');
  journeyCards.forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 70%',
      end: 'bottom 30%',
      onEnter: () => card.classList.add('journey-active'),
      onEnterBack: () => card.classList.add('journey-active'),
      onLeave: () => card.classList.remove('journey-active'),
      onLeaveBack: () => card.classList.remove('journey-active')
    });
  });
}

// =============================================================================
// SECTION HEADLINE REVEALS (WORD BY WORD)
// =============================================================================
function initSectionReveals() {
  if (prefersReducedMotion) return;

  const headers = document.querySelectorAll('.section-header');
  headers.forEach((header) => {
    const title = header.querySelector('.section-title');
    const label = header.querySelector('.section-label');
    const subtitle = header.querySelector('.section-subtitle');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 82%',
        toggleActions: 'play none none none'
      }
    });

    if (label) {
      tl.from(label, { opacity: 0, x: -20, duration: 0.6, ease: 'power3.out' });
    }

    if (title) {
      tl.from(title, {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power4.out'
      }, '-=0.35');
    }

    if (subtitle) {
      tl.from(subtitle, {
        opacity: 0,
        y: 25,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5');
    }
  });
}

// =============================================================================
// STATS COUNT-UP ANIMATION
// =============================================================================
function initStatsCountUp() {
  const statNumbers = document.querySelectorAll('[data-stat-val]');
  statNumbers.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-stat-val'));
    const isFloat = el.getAttribute('data-stat-val').includes('.');

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.8,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = isFloat ? obj.val.toFixed(2) : Math.floor(obj.val);
          }
        });
      }
    });
  });
}

// =============================================================================
// MARQUEE VELOCITY ACCELERATION
// =============================================================================
function initMarqueeVelocity(lenis) {
  const track = document.querySelector('.ticker-track');
  if (!track || !lenis || prefersReducedMotion) return;

  let currentSpeed = 1;
  lenis.on('scroll', (e) => {
    const velocity = Math.abs(e.velocity || 0);
    const targetSpeed = Math.min(3.2, 1 + velocity * 0.08);
    gsap.to(track, {
      timeScale: targetSpeed,
      duration: 0.4,
      overwrite: 'auto',
      onComplete: () => {
        gsap.to(track, { timeScale: 1, duration: 1.2 });
      }
    });
  });
}

// =============================================================================
// FLAGSHIP HORIZONTAL PINNED SCROLL & 3D TILT
// =============================================================================
function initFlagshipsHorizontalScroll() {
  const flagshipSection = document.querySelector('#flagships');
  const track = document.querySelector('.flagship-track');
  if (!flagshipSection || !track) return;

  const isDesktop = window.innerWidth > 1024;

  if (isDesktop && !prefersReducedMotion) {
    const cards = gsap.utils.toArray('.flagship-card');
    const totalScroll = track.scrollWidth - window.innerWidth + 120;

    gsap.to(track, {
      x: () => -totalScroll,
      ease: 'none',
      scrollTrigger: {
        trigger: flagshipSection,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${totalScroll}`,
        invalidateOnRefresh: true
      }
    });

    // 3D Card Tilt on Mouse Move
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (-y / (rect.height / 2)) * 6;
        const rotateY = (x / (rect.width / 2)) * 6;
        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
  }
}

// =============================================================================
// BIG STATEMENT SECTION ("FROM IDEA. TO SHIPPED.") PIN & SCALE
// =============================================================================
function initStatementPin() {
  const statementSec = document.querySelector('#statement');
  if (!statementSec || prefersReducedMotion) return;

  const title = statementSec.querySelector('.statement-title');
  const telemetry = statementSec.querySelector('.statement-telemetry-card');

  if (title) {
    gsap.from(title, {
      scale: 0.9,
      opacity: 0.2,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: statementSec,
        start: 'top 75%',
        end: 'top 20%',
        scrub: 1
      }
    });
  }

  if (telemetry) {
    gsap.from(telemetry, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: statementSec,
        start: 'top 65%'
      }
    });
  }
}

// =============================================================================
// FOOTER CTA MAGNETIC BUTTON
// =============================================================================
function initMagneticButton() {
  const btn = document.querySelector('.magnetic-btn');
  if (!btn || prefersReducedMotion) return;

  const maxDist = 80;

  window.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const dx = e.clientX - btnCenterX;
    const dy = e.clientY - btnCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < maxDist) {
      gsap.to(btn, {
        x: dx * 0.38,
        y: dy * 0.38,
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    }
  });
}

// =============================================================================
// CONTACT FORM SUBMISSION HANDLER
// =============================================================================
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;

  const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
  const body = encodeURIComponent(`Sender: ${name} (${email})\n\nMessage:\n${message}`);
  const mailtoUrl = `mailto:subhajit32das@gmail.com?subject=${subject}&body=${body}`;

  window.open(mailtoUrl, '_blank');
  alert(`Thank you, ${name}! Your transmission prompt has been composed in your default mail client.`);
}

// =============================================================================
// SOLUTIONS DRAWER INDUSTRIAL TERMINAL (PRESERVED & FULLY ACCESSIBLE)
// =============================================================================
const terminalState = {
  history: [],
  historyIndex: -1,
  isOpen: false
};

const terminalCommands = {
  help: () => `[SOLUTIONS DRAWER TERMINAL // COMMAND DECK]
--------------------------------------------------------------------------------
CORE SYSTEM COMMANDS:
  help         - Output this command directory & instructions
  about        - Detailed engineer background & architectural manifesto
  bio          - Read Subhajit's biographical profile & sovereign philosophies
  flagships    - Solutions Drawer, Findrr & Launup sovereign ecosystem
  collab       - Collaborative ventures: UCAP, Memento (SIH 2026) & Zuard
  projects     - Selected engineering works & computational pipelines
  journey      - Academic timeline, Brainware University CGPA 8.43 & milestones
  skills       - Technical capabilities: AI, Systems, Edge & Cloud
  contact      - Direct communication channels & remote work availability
  clear        - Clear terminal history buffer
  echo [text]  - Echo string back to stdout
  matrix       - Trigger cyber matrix rain sequence
  sudo         - Check administrative elevated root privileges
  date         - Current session timestamp & UTC synchronization`,

  about: () => `[ENGINEER PROFILE: SUBHAJIT DAS]
--------------------------------------------------------------------------------
Handle       : Krish / subhajit-io
Location     : Arambagh & Kolkata, West Bengal, India
Status       : B.Tech CSE (AI & Machine Learning) @ Brainware University
CGPA         : 8.43 / 10.0 (First Class with Distinction)
Core Focus   : On-Device Machine Learning, Sovereign Software, Zero-Trust PWAs
Philosophy   : Zero Corporate Lock-in, Client-Side Cryptography, Elegant Dots.`,

  bio: () => terminalCommands.about(),

  flagships: () => `[SOVEREIGN FLAGSHIP ARCHITECTURES]
--------------------------------------------------------------------------------
01. SOLUTIONS DRAWER (Web App Store & Verified Binary PWA)
    Status      : Production Live & Stable
    Stack       : Next.js 16, Cloudflare D1, AWS S3, Web Crypto SHA-256
    URL         : <a href="https://solutionsdrawer.pages.dev" target="_blank" rel="noreferrer">https://solutionsdrawer.pages.dev</a>

02. FINDRR (Zero-Knowledge Expense Vault & Forecasting)
    Status      : Production Live
    Stack       : Vanilla JS, AES-GCM-256, Web Workers, IndexedDB, PBKDF2
    URL         : <a href="https://findrr-f.pages.dev" target="_blank" rel="noreferrer">https://findrr-f.pages.dev</a>

03. LAUNUP (Sovereign Web Address & Bookmark Launchpad)
    Status      : Coming Soon (Q1 2027 Preview Stage Active)
    Stack       : Next.js 15, Solutions Drawer DB, Zero-URL Sandbox, PBKDF2-SHA512`,

  collab: () => `[COLLABORATIVE VENTURES & CO-FOUNDING]
--------------------------------------------------------------------------------
01. UCAP (UPCOMING FLAGSHIP STARTUP — COMING SOON)
    Role        : Co-Founder & Full-Stack Architect
    Partner     : Shusovan Dutta (github.com/shusovan-69) & Subhajit Das
    Type        : Social Learning & Real-Time Mentorship Platform
    Overview    : Virtual classrooms combining Jitsi WebRTC video, Monaco IDE
                  live code execution, and Excalidraw/Tldraw whiteboards.
    Stack       : Next.js 16, NestJS, Supabase (PostgreSQL + RBAC), Monaco, WebRTC.
    Status      : Coming Soon (Active Pre-Launch Development)

02. MEMENTO (SMART INDIA HACKATHON 2026 — PROBLEM STATEMENT 43)
    Role        : Co-Engineer & Core Platform Developer
    Team        : Sambu Chowdhury, Rana Tarafdar, Mousumi Bag,
                  Yuvraj Shaw, Masum Aktar & Subhajit Das
    Project     : Jharkhand Innovation & Civic Resolution Portal
    Overview    : Centralized platform linking citizen community issues with
                  Higher Education Institutions (HEIs) for research-driven
                  resolution with automated AI categorization and verification.
    Stack       : Next.js, React, Civic Tech, AI Routing, Tailwind CSS.
    Live URL    : <a href="https://sih-26-memento-teal.vercel.app/" target="_blank" rel="noreferrer">https://sih-26-memento-teal.vercel.app/</a>

03. ZUARD (REAL-TIME BRAND GOVERNANCE & PRE-SCREENING ENGINE)
    Role        : Co-Engineer & Full-Stack Architect
    Team        : Sambu Chowdhury, Mousumi Bag, Rana Tarafdar & Subhajit Das
    Type        : Deterministic Pre-Screening & Branched Multimodal RAG Engine
    Overview    : Sub-5ms parallel static workers verifying tone, terminology,
                  SQLite metric facts, OpenCV visual contrast, and WCAG math,
                  followed by zero-hallucination delta synthesis with page citations.
    Stack       : Python, FastAPI, asyncio, SQLite, OpenCV, RAG, PyMuPDF.
    Live URL    : <a href="https://zuard-topaz.vercel.app/" target="_blank" rel="noreferrer">https://zuard-topaz.vercel.app/</a>`,

  collaborations: () => terminalCommands.collab(),
  zuard: () => terminalCommands.collab(),

  projects: () => `[SELECTED WORKS & SYSTEM PIPELINES]
--------------------------------------------------------------------------------
• Schegent         : Local LLM (Qwen2.5) Calendar RAG System
                     <a href="https://github.com/subhajit-io/Schegent" target="_blank" rel="noreferrer">github.com/subhajit-io/Schegent</a>
• Cherm            : High-Performance Terminal IDE with Big-O Complexity
                     <a href="https://github.com/subhajit-io/Cherm" target="_blank" rel="noreferrer">github.com/subhajit-io/Cherm</a>
• Visual Tokenizer : Interactive Byte Pair Encoding (BPE) Visualizer
                     <a href="https://github.com/subhajit-io/Visual-Tokenizer" target="_blank" rel="noreferrer">github.com/subhajit-io/Visual-Tokenizer</a>`,

  work: () => terminalCommands.flagships(),

  journey: () => `[ACADEMIC FOUNDATION & MILESTONES]
--------------------------------------------------------------------------------
• BRAINWARE UNIVERSITY (2025 – 2029)
  Degree   : Bachelor of Technology (B.Tech)
  Major    : Computer Science & Engineering (AIML)
  Status   : In Progress • Current CGPA: 8.43 / 10.0
  Subjects : Neural Networks, Deep Learning, DSA, Discrete Mathematics, AI Safety
  Campus   : Barasat, Kolkata, West Bengal
  Map URL  : <a href="https://maps.app.goo.gl/hvu5bNGFRF4MAfDh6" target="_blank" rel="noreferrer">https://maps.app.goo.gl/hvu5bNGFRF4MAfDh6</a>

• ARAMBAGH HIGH SCHOOL (HIGHER SECONDARY)
  Stage    : Class XI & Class XII
  Stream   : Pure Science & Advanced Mathematics
  Location : Arambagh, Hooghly, West Bengal

• SMART INDIA HACKATHON (SIH 2026) — MEMENTO (PS-43)
  Team     : Sambu Chowdhury, Rana Tarafdar, Mousumi Bag, Yuvraj Shaw, Masum Aktar, Subhajit Das
  Live     : <a href="https://sih-26-memento-teal.vercel.app/" target="_blank" rel="noreferrer">https://sih-26-memento-teal.vercel.app/</a>

• HP CUSTOMER EXPERIENCE (CX) CERTIFICATION
  Verify   : <a href="https://www.life-global.org/certificate/4438a77d-669b-41f9-ac61-955cb9058235" target="_blank" rel="noreferrer">Verify HP CX Credential</a>`,

  edu: () => terminalCommands.journey(),

  skills: () => `[TECHNICAL CAPABILITIES & STACK MATRIX]
--------------------------------------------------------------------------------
[AI & ML]         : PyTorch, TensorFlow, OpenCV, Scikit-Learn, Gemini API,
                    Qwen 2.5 Coder, RAG Architectures, Byte Pair Encoding
[LANGUAGES]       : Python 3.12, C/C++, JavaScript (ESNext), TypeScript,
                    Dart (Flutter), Bash, SQL (SQLite / PostgreSQL)
[INFRA & CLOUD]   : Next.js 16, React 19, FastAPI, NestJS, Cloudflare Pages/D1,
                    Supabase, AWS S3, Docker, Vercel
[AGENTIC SUITE]   : Google Antigravity, Claude Code, Cursor, Windsurf, LM Studio`,

  toolkit: () => terminalCommands.skills(),

  contact: () => `[TRANSMISSION CHANNELS]
--------------------------------------------------------------------------------
Primary Email : <a href="mailto:subhajit32das@gmail.com">subhajit32das@gmail.com</a>
WhatsApp      : <a href="https://wa.me/+917001023356" target="_blank" rel="noreferrer">+91 7001023356</a>
GitHub        : <a href="https://github.com/subhajit-io" target="_blank" rel="noreferrer">github.com/subhajit-io</a>
LinkedIn      : <a href="https://www.linkedin.com/in/findrrsubhajit/" target="_blank" rel="noreferrer">linkedin.com/in/findrrsubhajit</a>
Work Style    : 100% Remote • Startup Leadership • Part-Time Openings`,

  clear: () => {
    const historyDiv = document.getElementById('terminal-history');
    if (historyDiv) historyDiv.innerHTML = '';
    return '';
  },

  matrix: () => `[SIMULATING NEURAL MATRIX STREAM...]
01000001 01001001 00100000 01010011 01011001 01010011 01010100 01000101 01001101
SOVEREIGN COMPUTE PROTOCOL LOADED // ZERO LEAKS DETECTED.`,

  sudo: () => `krish is already root in this universe. Permission granted.`,
  date: () => `CURRENT SESSION TIMESTAMP: ${new Date().toISOString()}`
};

function toggleTerminalMode() {
  const overlay = document.getElementById('terminal-overlay');
  const toggleBtn = document.getElementById('terminal-toggle-btn');
  const input = document.getElementById('terminal-input');
  if (!overlay) return;

  terminalState.isOpen = !terminalState.isOpen;

  if (terminalState.isOpen) {
    overlay.style.display = 'flex';
    if (toggleBtn) toggleBtn.classList.add('active');
    setTimeout(() => {
      if (input) input.focus();
    }, 100);
  } else {
    overlay.style.display = 'none';
    if (toggleBtn) toggleBtn.classList.remove('active');
  }
}

function handleTerminalOverlayClick(event) {
  if (event.target && event.target.id === 'terminal-overlay') {
    toggleTerminalMode();
  }
}

function runTerminalCommand(cmd) {
  const input = document.getElementById('terminal-input');
  if (input) {
    input.value = cmd;
    executeTerminal();
  }
}

function executeTerminal() {
  const input = document.getElementById('terminal-input');
  const historyDiv = document.getElementById('terminal-history');
  const termBody = document.getElementById('terminal-body');
  if (!input || !historyDiv) return;

  const rawCmd = input.value.trim();
  if (!rawCmd) return;

  terminalState.history.push(rawCmd);
  terminalState.historyIndex = terminalState.history.length;

  const parts = rawCmd.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg = parts.slice(1).join(' ');

  let output = '';
  if (terminalCommands[cmd]) {
    output = typeof terminalCommands[cmd] === 'function' ? terminalCommands[cmd](arg) : terminalCommands[cmd];
  } else if (cmd === 'echo') {
    output = escapeHtml(arg);
  } else {
    output = `Command not recognized: '${escapeHtml(rawCmd)}'. Type 'help' for available commands.`;
  }

  if (output !== '') {
    const block = document.createElement('div');
    block.innerHTML = `
      <div class="term-cmd-echo"><span class="terminal-prompt-user">krish@solutionsdrawer:~$</span> ${escapeHtml(rawCmd)}</div>
      <div class="term-output">${output}</div>
    `;
    historyDiv.appendChild(block);
  }

  input.value = '';
  if (termBody) {
    termBody.scrollTop = termBody.scrollHeight;
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Global Terminal Keybindings
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && terminalState.isOpen) {
    toggleTerminalMode();
  } else if ((e.ctrlKey || e.metaKey) && e.key === '`') {
    e.preventDefault();
    toggleTerminalMode();
  }
});

// Terminal Input Keyboard Controls (Arrow Up/Down history, Enter execute)
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('terminal-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeTerminal();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (terminalState.history.length > 0 && terminalState.historyIndex > 0) {
          terminalState.historyIndex--;
          input.value = terminalState.history[terminalState.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (terminalState.historyIndex < terminalState.history.length - 1) {
          terminalState.historyIndex++;
          input.value = terminalState.history[terminalState.historyIndex];
        } else {
          terminalState.historyIndex = terminalState.history.length;
          input.value = '';
        }
      }
    });
  }
});
