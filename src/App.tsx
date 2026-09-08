import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import { Hero3DCanvas } from './components/Hero3DCanvas'
import { Services3DSection } from './components/Services3DSection'
import { AICreativeShowcase } from './components/AICreativeShowcase'
import { BrandLogo } from './components/BrandLogo'
import { type CreativeTemplate } from './data/creativeTemplates'
import santhoshLabImg from './assets/santhosh-ai-lab.jpg'
import './App.css'

const AIArchitectChallenge = lazy(() => import('./components/AIArchitectChallenge'))

// Projects are now handled dynamically via AICreativeShowcase

const whatsappNumber = '918123646126'
const emailAddress = 'goodvibe988380@gmail.com'
const defaultWhatsAppMessage = 'Hi Maanvi Creation, I would like to discuss a project.'
const emailSubject = 'Maanvi Creation - New Project Enquiry'
const emailBody = `Hi Maanvi Creation,

I would like to discuss a project.

Project type:
Budget:
Timeline:
Requirements:

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
    const handleCursorLeave = (event: PointerEvent) => { if (!event.relatedTarget) setCursor((current) => ({ ...current, visible: false })) }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handleCursor)
    window.addEventListener('pointerout', handleCursorLeave)
    const revealItems = document.querySelectorAll<HTMLElement>('.reveal-on-scroll')
    revealItems.forEach((item) => item.classList.add('reveal-ready'))
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible') }), { threshold: .14 })
    revealItems.forEach((item) => revealObserver.observe(item))
    const magneticItems = document.querySelectorAll<HTMLElement>('.magnetic')
    const magneticHandlers = new Map<HTMLElement, (event: PointerEvent) => void>()
    magneticItems.forEach((item) => {
      const handler = (event: PointerEvent) => {
        const bounds = item.getBoundingClientRect()
        const x = (event.clientX - (bounds.left + bounds.width / 2)) * .12
        const y = (event.clientY - (bounds.top + bounds.height / 2)) * .12
        item.style.transform = `translate(${Math.max(-7, Math.min(7, x))}px, ${Math.max(-7, Math.min(7, y))}px)`
      }
      magneticHandlers.set(item, handler)
      item.addEventListener('pointermove', handler)
      item.addEventListener('pointerleave', () => { item.style.transform = '' })
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
    return `Hi Maanvi Creation, I would like to discuss a new project.\n\nName: ${name}\nEmail: ${email}\nProject type: ${projectType}\nDetails: ${details || 'N/A'}`
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
      <header className={`site-header ${isPastHero ? 'is-scrolled' : 'is-dark-hero-theme'}`}>
        <BrandLogo variant="header" onClick={() => jumpTo('top')} />
        <nav id="main-nav" className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation">{[['home', 'top'], ['services', 'services'], ['projects', 'work'], ['about', 'ai'], ['contact', 'contact']].map(([label, target]) => <button key={label} onClick={() => jumpTo(target)}>{label}</button>)}<button className="nav-contact" onClick={() => openContact('Hi Maanvi Creation, I would like to discuss a new project.')}>Start a project <span>↗</span></button></nav>
        <button className={`menu-toggle ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="main-nav"><span></span><span></span></button>
      </header>
      {menuOpen && <div className="nav-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true"></div>}

      <Hero3DCanvas onOpenContact={openContact} />

      <Services3DSection onOpenContact={openContact} />

      <AICreativeShowcase 
        onOpenContact={openContact}
        onPreviewTemplate={(template) => setPreviewTemplate(template)}
      />

      <section className="motion-showcase dark-section section-pad reveal-on-scroll" data-cursor="PLAY"><div className="motion-copy"><p className="eyebrow eyebrow-light">/ Motion studio</p><h2>We turn ideas<br /><em>into motion.</em></h2><p>Cinematic videos, 3D animations and motion graphics that tell your story.</p><button className="button button-light magnetic" data-cursor="PLAY" onClick={() => openContact('Hi Maanvi Creation, I\'m interested in video and motion services.')}>Watch the showreel <span>↗</span></button></div><div className="motion-frame"><div className="motion-lens"></div><div className="motion-film"><i></i><i></i><i></i><i></i><i></i></div><span className="motion-meta">RENDER / 024 / 060</span><span className="motion-play">▶</span></div></section>

      <section className="ai-possibilities ai-lab-section section-pad reveal-on-scroll" id="ai">
        <div className="ai-copy">
          <p className="eyebrow">/ About the architect &amp; AI lab</p>
          <h2>Santhosh <em>AI Lab</em></h2>
          <div className="ai-lead">
            <strong>Build • Automate • Learn • Evolve</strong>
            Building intelligent systems, autonomous agents, and modern web architectures that create real business impact.
          </div>
          <div className="ai-focus-bars">
            <div className="focus-item">
              <div className="focus-label"><span>AI Engineering &amp; Agents</span><b>85%</b></div>
              <div className="focus-bar"><i style={{ width: '85%' }}></i></div>
            </div>
            <div className="focus-item">
              <div className="focus-label"><span>Automation Systems</span><b>90%</b></div>
              <div className="focus-bar"><i style={{ width: '90%' }}></i></div>
            </div>
            <div className="focus-item">
              <div className="focus-label"><span>Full Stack Web &amp; Apps</span><b>80%</b></div>
              <div className="focus-bar"><i style={{ width: '80%' }}></i></div>
            </div>
            <div className="focus-item">
              <div className="focus-label"><span>Systems Design &amp; Cloud</span><b>75%</b></div>
              <div className="focus-bar"><i style={{ width: '75%' }}></i></div>
            </div>
          </div>
          <div className="ai-quote-card">
            <blockquote>&ldquo;AI is not just a tool. It is a new way to build. I don&rsquo;t just use AI. I build systems with AI.&rdquo;</blockquote>
            <cite>— Santhosh K, AI/ML Architect</cite>
          </div>
          <div className="ai-actions">
            <button className="button button-dark magnetic" data-cursor="CHAT" onClick={() => openContact("Hi Santhosh, I'd like to collaborate on an AI/automation project.")}>
              Work with Santhosh <span>→</span>
            </button>
          </div>
        </div>
        <div className="ai-lab-visual" data-cursor="VIEW" onClick={() => setLabImageOpen(true)} title="Click to inspect full AI Lab workspace">
          <div className="ai-lab-frame">
            <img src={santhoshLabImg} alt="Santhosh AI Lab - AI Architect Workspace" className="ai-lab-image" />
            <div className="ai-lab-overlay-glare" aria-hidden="true"></div>
            <div className="ai-lab-badge top-left">
              <span className="live-dot"></span>
              <span>SANTHOSH AI LAB</span>
            </div>
            <div className="ai-lab-badge bottom-right">
              <span>VIEW FULL LAB ↗</span>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-section section-pad" id="contact">
        <div className="contact-top reveal-on-scroll">
          <p className="eyebrow">/ Start a conversation</p>
          <h2>Let's build<br /><em>something amazing.</em></h2>
          <p>Have a project in mind? Let's turn your ideas into reality.</p>
          <div className="contact-quick-actions">
            <a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer" data-cursor="CHAT">Chat on WhatsApp <span>↗</span></a>
            <a className="button button-email" href={emailLink} data-cursor="VIEW">Send an email <span>↗</span></a>
          </div>
        </div>

        <div className="contact-orb" aria-hidden="true">
          <span>MC</span>
          <small>MAANVI CREATION</small>
        </div>

        <form className="contact-form reveal-on-scroll" onSubmit={handleFormSubmit}>
          <label>Your name<input name="name" type="text" placeholder="Jane Smith" required /></label>
          <label>Your email<input name="email" type="email" placeholder="jane@company.com" required /></label>
          <label>What are we making?
            <select name="projectType" defaultValue="">
              <option value="" disabled>Select one</option>
              <option>Website</option>
              <option>Web app</option>
              <option>Brand world</option>
              <option>AI experience</option>
              <option>Something else</option>
            </select>
          </label>
          <label>Tell us a little more<textarea name="details" placeholder="The more context, the better (but no pressure)."></textarea></label>
          <button className="button button-dark magnetic" data-cursor="VIEW" type="submit">Send the brief <span>↗</span></button>
        </form>

        <Suspense fallback={<div className="ai-architect-card ai-architect-skeleton"><span className="live-dot"></span><span>INITIALIZING 3D AI ENVIRONMENT...</span></div>}>
          <AIArchitectChallenge onOpenContact={openContact} />
        </Suspense>
      </section>

      <footer className="site-footer section-pad"><div className="footer-brand"><BrandLogo variant="footer" showTagline={true} onClick={() => jumpTo('top')} /><p>Digital things for<br />people going places.</p></div><div className="footer-links"><div><span>Explore</span><button onClick={() => jumpTo('services')}>Services</button><button onClick={() => jumpTo('work')}>Projects</button><button onClick={() => jumpTo('ai')}>About</button></div><div><span>Say hello</span><a href={emailLink}>Email us ↗</a><a href={whatsappLink} target="_blank" rel="noreferrer">WhatsApp ↗</a><a href="#contact">LinkedIn ↗</a></div></div><div className="footer-bottom"><span>© 2026 Maanvi Creation</span><span>Made with intent in India</span></div></footer>

      <button className="whatsapp-launcher" data-cursor="CHAT" onClick={() => openContact()} aria-label="Chat with Maanvi Creation on WhatsApp" title="Chat with Maanvi Creation"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.2a12.6 12.6 0 0 0-10.8 19L3.4 29l7-1.8A12.8 12.8 0 1 0 16 3.2Zm0 23.2c-2 0-3.9-.6-5.5-1.7l-.4-.3-4.1 1.1 1.1-4-.3-.4A10.3 10.3 0 1 1 16 26.4Zm5.7-7.7c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2l-.9 1.1c-.2.2-.3.3-.6.1a8.4 8.4 0 0 1-2.5-1.5 9.2 9.2 0 0 1-1.7-2.1c-.2-.3 0-.5.2-.7l.5-.6.2-.5-.1-.5c-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z" /></svg><span>Chat with Maanvi Creation</span></button>
      <div className={`custom-cursor ${cursor.visible ? 'is-visible' : ''} cursor-${cursor.mode.toLowerCase()}`} style={{ transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)` }} aria-hidden="true"><span>{cursor.mode}</span></div>
      {contactOpen && <div className="contact-backdrop" role="presentation" onClick={() => setContactOpen(false)}><section className="contact-popover" role="dialog" aria-modal="true" aria-labelledby="contact-title" onClick={(event) => event.stopPropagation()}><button className="contact-close" onClick={() => setContactOpen(false)} aria-label="Close contact options">×</button><p className="eyebrow">/ Direct line</p><h2 id="contact-title">Let's build<br /><em>something.</em></h2><p>Have a project, website, app or creative idea? Message Maanvi Creation directly on WhatsApp.</p><div className="contact-popover-actions"><a className="button button-whatsapp" href={whatsappLink} target="_blank" rel="noreferrer">Chat on WhatsApp <span>↗</span></a><a className="button button-email" href={emailLink}>Email us <span>↗</span></a></div><small>WhatsApp will open with your message ready to edit. Any automated greeting is handled by WhatsApp Business after you send.</small></section></div>}
      {labImageOpen && (
        <div className="image-lightbox-backdrop" role="dialog" aria-modal="true" onClick={() => setLabImageOpen(false)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-lightbox-close" onClick={() => setLabImageOpen(false)} aria-label="Close image">×</button>
            <img src={santhoshLabImg} alt="Santhosh AI Lab Full View" className="image-lightbox-img" />
            <div className="image-lightbox-caption">
              <span className="live-dot"></span>
              <span>SANTHOSH AI LAB • AI/ML ARCHITECT WORKSPACE</span>
            </div>
          </div>
        </div>
      )}
      {previewTemplate && (
        <div className="image-lightbox-backdrop" role="dialog" aria-modal="true" onClick={() => setPreviewTemplate(null)}>
          <div className="image-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-lightbox-close" onClick={() => setPreviewTemplate(null)} aria-label="Close image">×</button>
            <img src={previewTemplate.previewImage} alt={previewTemplate.title} className="image-lightbox-img" style={previewTemplate.aspectRatio === 'portrait' ? { maxHeight: '90vh', objectFit: 'contain' } : {}} />
            <div className="image-lightbox-caption">
              <span className="live-dot"></span>
              <span>{previewTemplate.badge} • {previewTemplate.title.toUpperCase()}</span>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button className="button button-dark magnetic" onClick={() => { setPreviewTemplate(null); openContact(previewTemplate.defaultMessage); }}>
                {previewTemplate.ctaText} <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App
