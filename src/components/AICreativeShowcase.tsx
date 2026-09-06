import React, { useState, useMemo } from 'react'
import { CATEGORIES, CREATIVE_TEMPLATES, type CreativeTemplate } from '../data/creativeTemplates'
import './AICreativeShowcase.css'

export interface AICreativeShowcaseProps {
  onOpenContact?: (message?: string) => void
  onPreviewTemplate?: (template: CreativeTemplate) => void
}

export const AICreativeShowcase: React.FC<AICreativeShowcaseProps> = ({
  onOpenContact,
  onPreviewTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Curated list filtered by category
  const displayedTemplates = useMemo(() => {
    if (activeCategory === 'all') {
      return CREATIVE_TEMPLATES
    }
    return CREATIVE_TEMPLATES.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  return (
    <section className="creative-showcase-section section-pad" id="work">
      <div className="showcase-header reveal-on-scroll">
        <div className="showcase-header-left">
          <p className="eyebrow">/ AI Creative Showcase</p>
          <h2>
            What We Create<br />
            <em>For Your Business.</em>
          </h2>
        </div>
        <div className="showcase-header-right">
          <p className="showcase-lead">
            Explore production-ready examples across modern websites, high-converting video ads,
            3D cartoon animations, and social posters. Pick a style you love or request a customized build.
          </p>
          <div className="showcase-guarantee-pills">
            <span><b>⚡ 24–48h</b> Fast Delivery</span>
            <span><b>💎 Premium</b> 8K Visuals</span>
            <span><b>💰 Low Cost</b> Minimum Time</span>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="showcase-category-nav reveal-on-scroll" role="tablist" aria-label="Showcase Categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`showcase-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            role="tab"
            aria-selected={activeCategory === cat.id}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="showcase-grid">
        {displayedTemplates.map((template) => (
          <article
            key={template.id}
            className={`showcase-card reveal-on-scroll ${template.aspectRatio === 'portrait' ? 'card-portrait' : ''}`}
            data-cursor="VIEW"
          >
            <div
              className="showcase-card-visual"
              onClick={() => onPreviewTemplate ? onPreviewTemplate(template) : onOpenContact?.(template.defaultMessage)}
              title="Click to view full preview"
            >
              <img
                src={template.previewImage}
                alt={template.title}
                className="showcase-card-img"
                loading="lazy"
              />
              <div className="showcase-card-overlay">
                <span className="showcase-badge">{template.badge}</span>
                <span className="showcase-turnaround">{template.turnaround}</span>
              </div>
              <span className="showcase-view-indicator">Inspect Details ↗</span>
            </div>

            <div className="showcase-card-body">
              <div className="showcase-card-meta">
                <span className="showcase-cat-name">{template.categoryLabel}</span>
                <div className="showcase-tag-list">
                  {template.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="showcase-tag">{tag}</span>
                  ))}
                </div>
              </div>

              <h3 className="showcase-card-title">{template.title}</h3>
              <p className="showcase-card-desc">{template.description}</p>

              <div className="showcase-card-actions">
                <button
                  className="button button-dark showcase-cta-btn magnetic"
                  data-cursor="CHAT"
                  onClick={() => onOpenContact?.(template.defaultMessage)}
                >
                  {template.ctaText} <span>→</span>
                </button>
                <button
                  className="showcase-secondary-btn"
                  onClick={() => onPreviewTemplate?.(template)}
                  title="View full-size creative"
                >
                  Quick View ↗
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Customer Bottom Pitch Banner */}
      <div className="showcase-footer-pitch reveal-on-scroll">
        <div className="pitch-content">
          <p className="eyebrow">/ Custom Business Solutions</p>
          <h3>Don't see exactly what you need?<br /><em>We build custom from scratch.</em></h3>
          <p>Tell us your vision, budget, and timeline. We deliver high-performing websites, video campaigns, and posters within minimum time.</p>
        </div>
        <button
          className="button button-dark magnetic"
          data-cursor="CHAT"
          onClick={() => onOpenContact?.("Hi Maanvi Creation, I'd like to discuss a custom creative project for my business.")}
        >
          Request Custom Project <span>→</span>
        </button>
      </div>
    </section>
  )
}

export default AICreativeShowcase
