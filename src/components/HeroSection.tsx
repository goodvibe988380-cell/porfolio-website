import React, { useState, useCallback } from 'react'
import santhoshLabImg from '../assets/santhosh-ai-lab.jpg'
import './HeroSection.css'

export interface HeroSectionProps {
  onOpenContact?: (message?: string) => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenContact }) => {
  const [parallax, setParallax] = useState({ x: 0, y: 0 })

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Only apply micro-parallax if user has not requested reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12
    setParallax({ x, y })
  }, [])

  const handlePointerLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 })
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      className="hero-section"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Introduction and hero showcase"
    >
      {/* 1. Cinematic High-Resolution Static Visual Backdrop */}
      <div className="hero-backdrop" aria-hidden="true">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/assets/hero-ai-globe-mobile.webp"
            type="image/webp"
          />
          <source
            media="(min-width: 769px)"
            srcSet="/assets/hero-ai-globe-1920.webp"
            type="image/webp"
          />
          <img
            src="/assets/hero-ai-globe-1920.webp"
            alt="Futuristic glowing AI globe with digital neural architecture"
            width={1920}
            height={1080}
            className="hero-backdrop-image"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            style={{
              transform: `translate3d(${parallax.x * -0.5}px, ${parallax.y * -0.5}px, 0) scale(1.03)`,
            }}
          />
        </picture>

        {/* Ambient Cosmic Lights & Negative Space Gradients for 100% Typography Contrast */}
        <div className="hero-gradient-left" />
        <div className="hero-gradient-top" />
        <div className="hero-gradient-bottom" />
        <div className="hero-cosmic-flare" />
      </div>

      {/* 2. Top Bar Utilities (Santhosh AI Lab Badge) */}
      <div className="hero-top-utility">
        <div className="hero-live-pill">
          <span className="live-indicator-dot" />
          <span className="live-pill-text">AI LAB • SYSTEMS ACTIVE</span>
        </div>

        <button
          className="hero-lab-card magnetic"
          onClick={() => scrollToSection('ai')}
          title="Santhosh AI Lab • Explore Core Intelligence"
          type="button"
        >
          <img
            src={santhoshLabImg}
            alt="Santhosh K AI Architect"
            className="hero-lab-thumb"
            width={38}
            height={38}
          />
          <div className="hero-lab-info">
            <span className="lab-title">SANTHOSH AI LAB</span>
            <span className="lab-subtitle">AI ARCHITECT ↗</span>
          </div>
        </button>
      </div>

      {/* 3. Hero Main Content Container */}
      <div className="hero-content-wrap">
        <div className="hero-narrative">
          {/* Eyebrow & Category Badges */}
          <div className="hero-eyebrow-container">
            <div className="hero-badge-pill">
              <span>CREATIVE</span>
              <span className="badge-sep">•</span>
              <span>TECH</span>
              <span className="badge-sep">•</span>
              <span>AI</span>
              <span className="badge-sep">•</span>
              <span>3D</span>
              <span className="badge-sep">•</span>
              <span>VIDEO</span>
            </div>
            <div className="hero-eyebrow">
              <span className="live-dot" />
              <span>AI ENGINEERING • INTELLIGENT AUTOMATION • INNOVATION</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="hero-headline">
            <span className="hero-brand-line">Maanvi Creation</span>
            <span className="hero-title-gradient">Building Intelligent AI Solutions</span>
            <span className="hero-title-sub">For Real-World Problems.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-description">
            Exploring AI engineering, LLM applications, intelligent agents, and automation
            through practical projects, high-performance WebGL platforms, and production systems.
          </p>

          {/* Sub-tag chips */}
          <div className="hero-tags-row">
            {['Websites', 'Apps', 'AI', '3D', 'Video', 'Automation'].map((tag) => (
              <span key={tag} className="hero-tag-chip">
                {tag}
              </span>
            ))}
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="hero-cta-row">
            <button
              className="button hero-btn-primary magnetic"
              onClick={() => scrollToSection('work')}
              data-cursor="VIEW"
              type="button"
            >
              Explore My Projects <span className="cta-arrow">→</span>
            </button>

            <button
              className="button hero-btn-secondary magnetic"
              onClick={() =>
                onOpenContact?.(
                  "Hi Santhosh, I'm interested in collaborating on an AI engineering or web architecture project."
                )
              }
              data-cursor="CHAT"
              type="button"
            >
              About Me / Contact
            </button>
          </div>

          {/* Stats Grid directly matching reference design */}
          <div className="hero-stats-bar">
            <div className="hero-stat-item">
              <div className="stat-number">200+</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-item">
              <div className="stat-number">3+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-divider" />
            <div className="hero-stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Elegant Vertical Track Accent (Right Border on Desktop) */}
      <div className="hero-vertical-track" aria-hidden="true">
        <span>IDEAS</span>
        <span>DESIGN</span>
        <span>DEVELOP</span>
        <span>CREATE</span>
        <span>GROW</span>
      </div>

      {/* 5. Scroll Cue */}
      <div className="hero-scroll-cue" onClick={() => scrollToSection('services')}>
        <span className="scroll-cue-text">SCROLL TO EXPLORE</span>
        <svg
          className="scroll-cue-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}

export default HeroSection
