import React, { useState, useCallback } from 'react'
import './Services3DSection.css'

export interface ServiceItem {
  id: string
  number: string
  title: string
  category: 'web-mobile' | 'ai-systems' | 'creative-3d'
  tag: string
  tone: 'cyan' | 'blue' | 'purple' | 'amber' | 'emerald' | 'rose'
  copy: string
  details: string
  metrics: string
  techStack: string[]
  deliverables: string[]
  message: string
}

const servicesData: ServiceItem[] = [
  {
    id: 'websites',
    number: '01',
    title: 'High-End Websites',
    category: 'web-mobile',
    tag: 'DESIGN + FULL STACK',
    tone: 'cyan',
    copy: 'High-performance digital flagships, 3D interactive web experiences & sleek landing pages.',
    details: 'Custom engineered web platforms with 3D WebGL visuals, ultra-smooth micro-interactions, responsive design, and sub-second load times.',
    metrics: '< 0.5s Load',
    techStack: ['React 19', 'Next.js', 'Three.js', 'Vite'],
    deliverables: ['Full-Stack Web App', 'Interactive 3D Elements', 'SEO & Speed Optimized', 'CMS / Admin Integration'],
    message: "Hi Santhosh, I'm interested in building a high-end website / web app."
  },
  {
    id: 'apps',
    number: '02',
    title: 'App Development',
    category: 'web-mobile',
    tag: 'PRODUCT BUILD',
    tone: 'purple',
    copy: 'Thoughtful native & cross-platform applications that turn complex systems into intuitive tools.',
    details: 'End-to-end mobile and web app engineering with offline-first architecture, fluid animations, real-time sync, and scalable cloud APIs.',
    metrics: 'Native 60fps',
    techStack: ['React Native', 'TypeScript', 'Node / Go', 'PostgreSQL'],
    deliverables: ['iOS & Android Apps', 'Backend REST/GraphQL APIs', 'Real-time WebSocket Sync', 'Cloud Deployments'],
    message: "Hi Santhosh, I'm interested in custom app development."
  },
  {
    id: 'ai-solutions',
    number: '03',
    title: 'AI Solutions & Agents',
    category: 'ai-systems',
    tag: 'AI + INTELLIGENCE',
    tone: 'blue',
    copy: 'Autonomous AI agents, generative interfaces & intelligence woven directly into business workflows.',
    details: 'Custom LLM fine-tuning, RAG knowledge retrieval engines, intelligent autonomous agents, and AI copilot integrations.',
    metrics: '10x Speedup',
    techStack: ['LangChain', 'OpenAI / Gemini', 'Vector DBs', 'Python'],
    deliverables: ['Autonomous Agent Pipelines', 'Custom RAG Knowledge Bases', 'Interactive Chat & Voice AI', 'Predictive Workflows'],
    message: "Hi Santhosh, I'd like to discuss custom AI engineering and autonomous agents."
  },
  {
    id: 'motion',
    number: '04',
    title: 'Video & Motion Studio',
    category: 'creative-3d',
    tag: 'MOTION STUDIO',
    tone: 'amber',
    copy: 'Cinematic visual stories, product trailers & dynamic animations that capture attention instantly.',
    details: 'Studio-grade motion graphics, animated brand identities, kinetic typography, and 3D visual effects for modern launches.',
    metrics: '4K Cinematic',
    techStack: ['After Effects', 'Cinema 4D', 'Premiere Pro', 'Unreal 5'],
    deliverables: ['Product Launch Videos', 'Brand Motion Guidelines', '3D Promo Animations', 'Social Media Motion Cuts'],
    message: "Hi Santhosh, I'm interested in video and motion studio services."
  },
  {
    id: '3d-rendering',
    number: '05',
    title: '3D & Spatial Worlds',
    category: 'creative-3d',
    tag: '3D / SPATIAL',
    tone: 'cyan',
    copy: 'Spatial visuals, interactive 3D product configurators & cinematic CGI depth.',
    details: 'Real-time WebGL scenes, photorealistic 3D asset rendering, interactive product showcases, and immersive spatial environments.',
    metrics: 'Real-time WebGL',
    techStack: ['Blender', 'Three.js / WebGL', 'Spline', 'GLSL Shaders'],
    deliverables: ['Interactive 3D Canvas Models', 'Photorealistic Product Renders', 'Custom Shaders & Lighting', 'Optimized GLTF/GLB Assets'],
    message: "Hi Santhosh, I'm interested in 3D design and spatial rendering."
  },
  {
    id: 'ecommerce',
    number: '06',
    title: 'High-Scale E-Commerce',
    category: 'web-mobile',
    tag: 'COMMERCE ENGINE',
    tone: 'emerald',
    copy: 'Conversion-optimized storefronts engineered to make purchasing effortless and delightful.',
    details: 'Headless e-commerce setups with dynamic carts, frictionless checkout, automated inventory sync, and localized payment gateways.',
    metrics: '3.4x Conversion',
    techStack: ['Shopify Plus', 'Stripe', 'Next.js Commerce', 'Tailwind'],
    deliverables: ['Custom Headless Storefront', 'Global Payment Gateways', 'Inventory & ERP Automation', 'Conversion-First UI/UX'],
    message: "Hi Santhosh, I'm interested in an e-commerce development project."
  },
  {
    id: 'uiux',
    number: '07',
    title: 'UI/UX & Spatial Systems',
    category: 'creative-3d',
    tag: 'PRODUCT DESIGN',
    tone: 'rose',
    copy: 'Precision design systems, interactive prototypes & human-first digital experiences.',
    details: 'Comprehensive design frameworks, clickable micro-prototypes, user journey maps, and pixel-perfect design token architectures.',
    metrics: 'Pixel-Perfect',
    techStack: ['Figma', 'Design Tokens', 'Design Systems', 'Micro-Interactions'],
    deliverables: ['Complete Design System', 'High-Fidelity Prototypes', 'User Journey Architecture', 'Component Style Guide'],
    message: "Hi Santhosh, I'm interested in UI/UX and product design systems."
  },
  {
    id: 'automation',
    number: '08',
    title: 'Workflow Automation',
    category: 'ai-systems',
    tag: 'SYSTEMS / FLOW',
    tone: 'amber',
    copy: 'Connected automated pipelines that eliminate manual toil and drive unstoppable momentum.',
    details: 'Zero-downtime webhook integrations, multi-app synchronization, CRM automations, and self-healing data pipelines.',
    metrics: '24/7 Autopilot',
    techStack: ['n8n / Make', 'Python', 'Webhooks', 'REST / GraphQL'],
    deliverables: ['Multi-App Sync Pipelines', 'Automated Lead & CRM Routing', 'Error Recovery Logic', 'Analytics Dashboard Integration'],
    message: "Hi Santhosh, I'd like to discuss business process automation."
  }
]

interface Services3DSectionProps {
  onOpenContact: (message?: string) => void
}

export const Services3DSection: React.FC<Services3DSectionProps> = ({ onOpenContact }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'web-mobile' | 'ai-systems' | 'creative-3d'>('all')
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null)

  const filteredServices = activeTab === 'all' 
    ? servicesData 
    : servicesData.filter(s => s.category === activeTab)

  const handleCardMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calculate rotation (-12deg to 12deg max)
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`)
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`)
  }, [])

  const handleCardMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
  }, [])

  const renderVisualChamber = (id: string) => {
    switch (id) {
      case 'websites':
        return (
          <div className="scene-browser">
            <div className="scene-browser-bar">
              <span></span><span></span><span></span>
            </div>
            <div className="scene-browser-lines">
              <i></i><i></i><i></i>
            </div>
          </div>
        )
      case 'apps':
        return (
          <div className="scene-mobile">
            <div className="scene-mobile-notch"></div>
            <div className="scene-mobile-card">
              <span>APP // UI</span>
            </div>
            <div className="scene-browser-bar" style={{ justifyContent: 'center' }}>
              <span style={{ width: 14, height: 2, borderRadius: 2 }}></span>
            </div>
          </div>
        )
      case 'ai-solutions':
        return (
          <div className="scene-ai-core">
            <div className="ai-ring ai-ring-1"></div>
            <div className="ai-ring ai-ring-2"></div>
            <div className="ai-ring ai-ring-3"></div>
            <div className="ai-nucleus"></div>
          </div>
        )
      case 'motion':
        return (
          <div className="scene-motion-lens">
            <div className="lens-blades"></div>
            <div className="lens-center"></div>
          </div>
        )
      case '3d-rendering':
        return (
          <div className="scene-3d-poly">
            <div className="poly-face poly-1"></div>
            <div className="poly-face poly-2"></div>
            <div className="poly-face poly-3"></div>
            <div className="poly-face poly-4"></div>
          </div>
        )
      case 'ecommerce':
        return (
          <div className="scene-ecommerce">
            <div className="ecom-metric">
              <span>CHECKOUT</span>
              <span>$ LIVE</span>
            </div>
            <div className="ecom-bar"></div>
            <div className="scene-browser-lines">
              <i style={{ background: '#10b981' }}></i>
            </div>
          </div>
        )
      case 'uiux':
        return (
          <div className="scene-uiux">
            <div className="uiux-nodes">
              <span></span><span></span>
            </div>
            <div className="uiux-curve"></div>
          </div>
        )
      case 'automation':
        return (
          <div className="scene-automation">
            <div className="auto-node">API</div>
            <div className="auto-pipe"></div>
            <div className="auto-node">FLOW</div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <section className="services-3d-section section-pad" id="services">
      <div className="services-bg-mesh" aria-hidden="true"></div>
      <div className="services-glow-top" aria-hidden="true"></div>
      <div className="services-glow-bottom" aria-hidden="true"></div>

      <div className="services-header reveal-on-scroll">
        <div className="services-header-left">
          <p className="eyebrow eyebrow-light">
            <span className="live-dot" />
            / Architectural Capabilities &amp; Engineering
          </p>
          <h2>Architectural Systems.<br /><em>Spatial Depth &amp; AI.</em></h2>
          <p>
            Architecting world-class digital experiences, 3D web environments, and autonomous AI systems built for measurable enterprise impact.
          </p>
        </div>
      </div>

      <div className="services-tabs reveal-on-scroll">
        <button 
          className={`services-tab-btn ${activeTab === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Services <span className="tab-count">{servicesData.length}</span>
        </button>
        <button 
          className={`services-tab-btn ${activeTab === 'web-mobile' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('web-mobile')}
        >
          Web &amp; Mobile <span className="tab-count">3</span>
        </button>
        <button 
          className={`services-tab-btn ${activeTab === 'ai-systems' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('ai-systems')}
        >
          AI &amp; Automation <span className="tab-count">2</span>
        </button>
        <button 
          className={`services-tab-btn ${activeTab === 'creative-3d' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('creative-3d')}
        >
          3D &amp; Motion <span className="tab-count">3</span>
        </button>
      </div>

      <div className="services-3d-grid">
        {filteredServices.map((service) => (
          <div 
            key={service.id}
            className="service-3d-card-wrapper reveal-on-scroll"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            onClick={() => setSelectedService(service)}
            data-cursor="INSPECT"
          >
            <div className={`service-3d-card service-tone-${service.tone}`}>
              <div className="service-spotlight"></div>

              <div className="card-top-bar">
                <span className="service-tag-pill">
                  <span className="service-tag-dot"></span>
                  {service.tag}
                </span>
                <span className="service-number-badge">/{service.number}</span>
              </div>

              <div className="service-visual-chamber">
                <div 
                  className="chamber-ambient-glow" 
                  style={{
                    background: service.tone === 'cyan' ? '#38bdf8' :
                                service.tone === 'blue' ? '#3b82f6' :
                                service.tone === 'purple' ? '#a855f7' :
                                service.tone === 'amber' ? '#f59e0b' :
                                service.tone === 'emerald' ? '#10b981' : '#f43f5e'
                  }}
                ></div>
                {renderVisualChamber(service.id)}
              </div>

              <div className="card-content">
                <h3>{service.title}</h3>
                <p>{service.copy}</p>

                <div className="card-meta-row">
                  <span className="metric-chip">{service.metrics}</span>
                  {service.techStack.slice(0, 2).map((tech) => (
                    <span key={tech} className="tech-chip">{tech}</span>
                  ))}
                </div>

                <div className="card-action-bar">
                  <span className="card-action-text">Explore Specs</span>
                  <div className="card-arrow-circle">↗</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail & Booking Modal */}
      {selectedService && (
        <div 
          className="service-modal-backdrop" 
          role="dialog" 
          aria-modal="true"
          onClick={() => setSelectedService(null)}
        >
          <div className="service-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="service-modal-close" 
              onClick={() => setSelectedService(null)} 
              aria-label="Close service details"
            >
              ×
            </button>
            <div className="modal-tag">/ {selectedService.tag} • SERVICE {selectedService.number}</div>
            <h3>{selectedService.title}</h3>
            <p className="modal-desc">{selectedService.details}</p>

            <div className="modal-deliverables-title">What We Deliver:</div>
            <ul className="modal-deliverables-list">
              {selectedService.deliverables.map((item, idx) => (
                <li key={idx}>
                  <span>✓</span> {item}
                </li>
              ))}
            </ul>

            <div className="modal-deliverables-title" style={{ marginTop: 8 }}>Tech Stack &amp; Standards:</div>
            <div className="card-meta-row" style={{ marginBottom: 10 }}>
              {selectedService.techStack.map((tech) => (
                <span key={tech} className="tech-chip" style={{ fontSize: 11, padding: '5px 12px' }}>{tech}</span>
              ))}
              <span className="metric-chip" style={{ fontSize: 11, padding: '5px 12px' }}>{selectedService.metrics}</span>
            </div>

            <div className="modal-actions">
              <button 
                className="button button-dark magnetic" 
                onClick={() => {
                  const msg = selectedService.message
                  setSelectedService(null)
                  onOpenContact(msg)
                }}
              >
                Start This Project <span>↗</span>
              </button>
              <button 
                className="button button-light magnetic" 
                onClick={() => setSelectedService(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
