import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { Hero3DCanvas } from './components/Hero3DCanvas'
import { Services3DSection } from './components/Services3DSection'
import { AICreativeShowcase } from './components/AICreativeShowcase'
import { BrandLogo } from './components/BrandLogo'
import { type CreativeTemplate } from './data/creativeTemplates'
import santhoshLabImg from './assets/santhosh-ai-lab.jpg'
import './App.css'

const AIArchitectChallenge = lazy(() => import('./components/AIArchitectChallenge'))

const whatsappNumber = '918123646126'
const emailAddress = 'goodvibe988380@gmail.com'
const defaultWhatsAppMessage = 'Hi Santhosh, I would like to discuss an AI or web architecture project.'
const emailSubject = 'Santhosh AI Lab — New Architecture Project Inquiry'
const emailBody = `Hi Santhosh,

I would like to discuss a project with Santhosh AI Lab.

Project type:
Budget / Scope:
Timeline:
System Requirements:

Thank you.`

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPastHero, setIsPastHero] = useState(false)
  const [cursor, setCursor] = useState({ x: -100, y: -100, mode: '', visible: false })
  const [contactOpen, setContactOpen] = useState(false)
  const [contactMessage, setContactMessage] = useState(defaultWhatsAppMessage)
  const [labImageOpen, setLabImageOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<CreativeTemplate | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const hero = document.getElementById('top')
        if (hero) {
          setIsPastHero(window.scrollY >= hero.offsetHeight - 90)
        } else {
          setIsPastHero(window.scrollY > 400)
        }
        rafRef.current = 0
      })
    }
    const handleCursor = (event: PointerEvent) => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        const target = event.target as HTMLElement
        const interactive = target.closest<HTMLElement>('[data-cursor]')
        setCursor({ x: event.clientX, y: event.clientY, mode: interactive?.dataset.cursor ?? '', visible: true })
        rafRef.current = 0
      })
    }
    const handleCursorLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) setCursor((current) => ({ ...current, visible: false }))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handleCursor)
    window.addEventListener('pointerout', handleCursorLeave)

    const revealItems = document.querySelectorAll<HTMLElement>('.reveal-on-scroll')
    revealItems.forEach((item) => item.classList.add('reveal-ready'))
    const revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible')
        }),
      { threshold: 0.14 }
    )
    revealItems.forEach((item) => revealObserver.observe(item))

    const magneticItems = document.querySelectorAll<HTMLElement>('.magnetic')
    const magneticHandlers = new Map<HTMLElement, (event: PointerEvent) => void>()
    magneticItems.forEach((item) => {
      const handler = (event: PointerEvent) => {
        const bounds = item.getBoundingClientRect()
        const x = (event.clientX - (bounds.left + bounds.width / 2)) * 0.12
        const y = (event.clientY - (bounds.top + bounds.height / 2)) * 0.12
        item.style.transform = `translate(${Math.max(-7, Math.min(7, x))}px, ${Math.max(-7, Math.min(7, y))}px)`
      }
      magneticHandlers.set(item, handler)
      item.addEventListener('pointermove', handler)
      item.addEventListener('pointerleave', () => {
        item.style.transform = ''
      })
    })

    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handleCursor)
      window.removeEventListener('pointerout', handleCursorLeave)
      revealObserver.disconnect()
      magneticHandlers.forEach((handler, item) => item.removeEventListener('pointermove', handler))
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const buildProjectBrief = (form: HTMLFormElement) => {
    const name = (form.elements.namedItem('name') as HTMLInputElement | null)?.value?.trim() || ''
    const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value?.trim() || ''
    const projectType = (form.elements.namedItem('projectType') as HTMLSelectElement | null)?.value || ''
    const details = (form.elements.namedItem('details') as HTMLTextAreaElement | null)?.value?.trim() || ''
    const missing = [name ? '' : 'name', email ? '' : 'email', projectType ? '' : 'project type'].filter(Boolean)
    if (missing.length) {
      alert(`Please fill in your ${missing.join(' and ')}.`)
      return null
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.')
      return null
    }
    return `Hi Santhosh, I would like to discuss a project with Santhosh AI Lab.\n\nName: ${name}\nEmail: ${email}\nProject Type: ${projectType}\nDetails: ${details || 'N/A'}`
  }

  const openContact = (message = defaultWhatsAppMessage) => {
    setContactMessage(message)
    setContactOpen(true)
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = buildProjectBrief(event.currentTarget)
    if (message) {
      openContact(message)
    }
  }

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(contactMessage)}`
  const emailLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

  return (
    <main>
      <header className={`site-header ${isPastHero ? 'is-scrolled' : ''}`}>
        <BrandLogo variant="header" onClick={() => jumpTo('top')} />
        <nav id="main-nav" className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation">
          {[
            ['Home', 'top'],
            ['Capabilities', 'services'],
            ['Showcase', 'work'],
            ['AI Lab', 'ai'],
            ['Connect', 'contact'],
          ].map(([label, target]) => (
            <button key={label} onClick={() => jumpTo(target)}>
              {label}
            </button>
          ))}
          <button
            className="nav-contact"
            onClick={() => openContact('Hi Santhosh, I would like to discuss an AI/systems project.')}
          >
            Launch Project <span>↗</span>
          </button>
        </nav>
        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
        >
          <span />
          <span />
        </button>
      </header>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <Hero3DCanvas onOpenContact={openContact} />

      <Services3DSection onOpenContact={openContact} />

      <AICreativeShowcase
        onOpenContact={openContact}
        onPreviewTemplate={(template) => setPreviewTemplate(template)}
      />

      <section className="motion-showcase dark-section section-pad reveal-on-scroll" data-cursor="PLAY">
        <div className="motion-copy">
          <p className="eyebrow eyebrow-light">
            <span className="live-dot" />
            / Multimodal Generative Studio
          </p>
          <h2>
            Turning Complex Ideas<br />
            <em>into Pure Motion.</em>
          </h2>
          <p>
            Cinematic 3D trailers, animated mascots, explainer stories, and viral commercial campaigns crafted with
            generative AI, WebGL, and studio-grade post-production.
          </p>
          <button
            className="button button-light magnetic"
            data-cursor="PLAY"
            onClick={() => openContact("Hi Santhosh, I'm interested in AI video ads and 3D motion studio services.")}
          >
            Explore Motion Studio <span>↗</span>
          </button>
        </div>
        <div className="motion-frame">
          <div className="motion-lens" />
          <div className="motion-film">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="motion-meta">RENDER / 024 / 060 • 4K</span>
          <span className="motion-play">▶</span>
        </div>
      </section>

      <section className="ai-possibilities ai-lab-section section-pad reveal-on-scroll" id="ai">
        <div className="ai-copy">
          <p className="eyebrow">
            <span className="live-dot" />
            / Core Intelligence &amp; AI Lab
          </p>
          <h2>
            Santhosh <em>AI Lab</em>
          </h2>
          <div className="ai-lead">
            <strong>Architect • Automate • Deploy • Scale</strong>
            Architecting production-ready autonomous agents, RAG knowledge retrieval systems, and high-velocity web
            architectures that deliver measurable business impact.
          </div>

          <div className="ai-focus-bars">
            <div className="focus-item">
              <div className="focus-label">
                <span>AI Engineering &amp; Autonomous Agents</span>
                <b>94%</b>
              </div>
              <div className="focus-bar bar-cyan">
                <i style={{ width: '94%' }} />
              </div>
            </div>
            <div className="focus-item">
              <div className="focus-label">
                <span>Automation &amp; Orchestration Workflows</span>
                <b>92%</b>
              </div>
              <div className="focus-bar bar-violet">
                <i style={{ width: '92%' }} />
              </div>
            </div>
            <div className="focus-item">
              <div className="focus-label">
                <span>Full-Stack Web &amp; Realtime 3D WebGL</span>
                <b>90%</b>
              </div>
              <div className="focus-bar bar-blue">
                <i style={{ width: '90%' }} />
              </div>
            </div>
            <div className="focus-item">
              <div className="focus-label">
                <span>Distributed Systems &amp; Cloud Scale</span>
                <b>86%</b>
              </div>
              <div className="focus-bar bar-lime">
                <i style={{ width: '86%' }} />
              </div>
            </div>
          </div>

          <div className="ai-quote-card">
            <blockquote>
              &ldquo;AI is not just a tool. It is a fundamental architecture. I don&rsquo;t just use AI &mdash; I design
              and deploy autonomous systems that drive businesses forward.&rdquo;
            </blockquote>
            <cite>&mdash; Santhosh K, AI/ML Architect &amp; Systems Engineer</cite>
          </div>

          <div className="ai-actions">
            <button
              className="button button-dark magnetic"
              data-cursor="CHAT"
              onClick={() => openContact("Hi Santhosh, I'd like to collaborate on an AI system or automation project.")}
            >
              Consult With Santhosh <span>→</span>
            </button>
          </div>
        </div>

        <div
          className="ai-lab-visual"
          data-cursor="VIEW"
          onClick={() => setLabImageOpen(true)}
          title="Click to inspect full AI Lab workspace"
        >
          <div className="ai-lab-frame">
            <img src={santhoshLabImg} alt="Santhosh AI Lab - AI Architect Workspace" className="ai-lab-image" />
            <div className="ai-lab-overlay-glare" aria-hidden="true" />
            <div className="ai-lab-badge top-left">
              <span className="live-dot" />
              <span>SANTHOSH AI LAB</span>
            </div>
            <div className="ai-lab-badge bottom-right">
              <span>INSPECT WORKSPACE ↗</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section section-pad" id="contact">
        <div className="contact-top reveal-on-scroll">
          <p className="eyebrow">
            <span className="live-dot" />
            / Architecture Brief &amp; Dispatch
          </p>
          <h2>
            Let&rsquo;s Architect<br />
            <em>Your Next System.</em>
          </h2>
          <p>
            Have an autonomous agent, web application, 3D experience, or creative campaign in mind? Dispatch your project
            brief directly to begin.
          </p>
          <div className="contact-quick-actions">
            <a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" data-cursor="CHAT">
              Chat on WhatsApp <span>↗</span>
            </a>
            <a className="button button-email" href={emailLink} data-cursor="VIEW">
              Send an Email <span>↗</span>
            </a>
          </div>

          <div className="contact-orb" aria-hidden="true">
            <span>SK</span>
            <small>SANTHOSH AI LAB</small>
          </div>
        </div>

        <form className="contact-form reveal-on-scroll" onSubmit={handleFormSubmit}>
          <label>
            Your Name
            <input name="name" type="text" placeholder="Alex Rivera" required />
          </label>
          <label>
            Your Email
            <input name="email" type="email" placeholder="alex@company.com" required />
          </label>
          <label>
            System or Project Architecture
            <select name="projectType" defaultValue="">
              <option value="" disabled>
                Select Scope
              </option>
              <option>AI Agent / Autonomous Pipeline</option>
              <option>High-Performance 3D Website</option>
              <option>Full-Stack Web or Mobile App</option>
              <option>Commercial AI Video Ad Campaign</option>
              <option>3D Mascot / Cartoon Animation</option>
              <option>Enterprise Process Automation</option>
              <option>Custom Architectural Consultation</option>
            </select>
          </label>
          <label>
            Project Context &amp; Objectives
            <textarea
              name="details"
              placeholder="Outline your objectives, timeline, or tech stack constraints..."
            />
          </label>
          <button className="button button-dark magnetic" data-cursor="VIEW" type="submit">
            Dispatch Brief <span>↗</span>
          </button>
        </form>

        <Suspense
          fallback={
            <div className="ai-architect-card ai-architect-skeleton">
              <span className="live-dot" />
              <span>INITIALIZING 3D AI ENVIRONMENT...</span>
            </div>
          }
        >
          <AIArchitectChallenge onOpenContact={openContact} />
        </Suspense>
      </section>

      <footer className="site-footer section-pad">
        <div className="footer-brand">
          <BrandLogo variant="footer" showTagline={true} onClick={() => jumpTo('top')} />
          <p>
            Architecting intelligent systems, autonomous agents, and 3D web experiences engineered for measurable impact.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <button onClick={() => jumpTo('services')}>Capabilities</button>
            <button onClick={() => jumpTo('work')}>Showcase</button>
            <button onClick={() => jumpTo('ai')}>AI Lab</button>
          </div>
          <div>
            <span>Say Hello</span>
            <a href={emailLink}>Email Direct ↗</a>
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp ↗
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Santhosh AI Lab &bull; Ideas &bull; Innovation &bull; Impact</span>
          <span>Made with intent in India</span>
        </div>
      </footer>

      <button
        className="whatsapp-launcher"
        data-cursor="CHAT"
        onClick={() => openContact()}
        aria-label="Chat with Santhosh on WhatsApp"
        title="Chat with Santhosh"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3.2a12.6 12.6 0 0 0-10.8 19L3.4 29l7-1.8A12.8 12.8 0 1 0 16 3.2Zm0 23.2c-2 0-3.9-.6-5.5-1.7l-.4-.3-4.1 1.1 1.1-4-.3-.4A10.3 10.3 0 1 1 16 26.4Zm5.7-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-.9 1.1c-.2.2-.3.3-.6.1a8.4 8.4 0 0 1-2.5-1.5 9.2 9.2 0 0 1-1.7-2.1c-.2-.3 0-.5.2-.7l.5-.6.2-.5-.1-.5c-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z" />
        </svg>
        <span>Direct WhatsApp</span>
      </button>

      <div
        className={`custom-cursor ${cursor.visible ? 'is-visible' : ''} cursor-${cursor.mode.toLowerCase()}`}
        style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }}
        aria-hidden="true"
      >
        <span>{cursor.mode}</span>
      </div>

      {contactOpen && (
        <div className="contact-backdrop" role="presentation" onClick={() => setContactOpen(false)}>
          <section
            className="contact-popover"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="contact-close" onClick={() => setContactOpen(false)} aria-label="Close contact options">
              &times;
            </button>
            <p className="eyebrow">
              <span className="live-dot" />
              / Direct Channel
            </p>
            <h2 id="contact-title">
              Let&rsquo;s Architect<br />
              <em>Something Great.</em>
            </h2>
            <p>
              Have a project, web app, AI system, or commercial creative in mind? Message Santhosh directly on WhatsApp
              or email.
            </p>
            <div className="contact-popover-actions">
              <a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">
                Chat on WhatsApp <span>↗</span>
              </a>
              <a className="button button-email" href={emailLink}>
                Send Email <span>↗</span>
              </a>
            </div>
            <small>
              WhatsApp will open with your project brief ready to edit. Response turnaround is typically within a few
              hours.
            </small>
          </section>
        </div>
      )}

      {labImageOpen && (
        <div className="image-lightbox-backdrop" role="dialog" aria-modal="true" onClick={() => setLabImageOpen(false)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-lightbox-close" onClick={() => setLabImageOpen(false)} aria-label="Close image">
              &times;
            </button>
            <img src={santhoshLabImg} alt="Santhosh AI Lab Full View" className="image-lightbox-img" />
            <div className="image-lightbox-caption">
              <span className="live-dot" />
              <span>SANTHOSH AI LAB &bull; AI/ML ARCHITECT WORKSPACE</span>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="image-lightbox-backdrop" role="dialog" aria-modal="true" onClick={() => setPreviewTemplate(null)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-lightbox-close" onClick={() => setPreviewTemplate(null)} aria-label="Close image">
              &times;
            </button>
            <img
              src={previewTemplate.previewImage}
              alt={previewTemplate.title}
              className="image-lightbox-img"
              style={previewTemplate.aspectRatio === 'portrait' ? { maxHeight: '90vh', objectFit: 'contain' } : {}}
            />
            <div className="image-lightbox-caption">
              <span className="live-dot" />
              <span>
                {previewTemplate.badge} &bull; {previewTemplate.title.toUpperCase()}
              </span>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button
                className="button button-dark magnetic"
                onClick={() => {
                  setPreviewTemplate(null)
                  openContact(previewTemplate.defaultMessage)
                }}
              >
                {previewTemplate.ctaText} <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
