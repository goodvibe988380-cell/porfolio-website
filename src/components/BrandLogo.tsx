import React from 'react'
import './BrandLogo.css'

export interface BrandLogoProps {
  /** Visual display variant */
  variant?: 'header' | 'mobile' | 'footer' | 'hero' | 'compact'
  /** Explicitly toggle tagline (defaults: true for footer/hero, false for header) */
  showTagline?: boolean
  /** Optional custom CSS class name */
  className?: string
  /** Optional click handler (e.g. scrollTo top) */
  onClick?: () => void
  /** Optional custom emblem pixel height */
  emblemSize?: number
  /** Whether the logo is an interactive button link (defaults to true if onClick provided) */
  asButton?: boolean
}

/**
 * High-fidelity Vector SVG Emblem for Maanvi Creation
 * Features 3D beveled glass 'M', multi-color electric orbital ring, specular highlights, and neon glow.
 * 100% scalable vector artwork with resolution independence.
 */
export const BrandEmblem: React.FC<{
  size?: number
  className?: string
  animated?: boolean
}> = ({ size, className = '', animated = true }) => {
  return (
    <svg
      className={`brand-emblem-svg ${animated ? 'is-animated' : ''} ${className}`}
      viewBox="40 40 250 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={size ? { width: size * 1.35, height: size } : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Atmospheric Cyan-Blue Ambient Glow */}
        <radialGradient id="mcSpaceGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#0066ff" stopOpacity="0.14" />
          <stop offset="90%" stopColor="#020817" stopOpacity="0" />
        </radialGradient>

        {/* Outer Cosmic Halo Ring / Dome */}
        <radialGradient id="mcSphereArc" cx="50%" cy="40%" r="55%">
          <stop offset="70%" stopColor="#00e5ff" stopOpacity="0" />
          <stop offset="90%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="98%" stopColor="#00f2fe" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
        </radialGradient>

        {/* 3D Glass M Linear Gradients */}
        {/* Left Wing Front Face */}
        <linearGradient id="mcLeftFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="25%" stopColor="#a5f3fc" />
          <stop offset="60%" stopColor="#00c8ff" />
          <stop offset="100%" stopColor="#0052e0" />
        </linearGradient>

        {/* Left Wing Lower Foot Shading */}
        <linearGradient id="mcLeftFoot" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00c8ff" />
          <stop offset="60%" stopColor="#0066ff" />
          <stop offset="100%" stopColor="#003db3" />
        </linearGradient>

        {/* Center Diagonal Main Face */}
        <linearGradient id="mcDiagFront" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="35%" stopColor="#38bdf8" />
          <stop offset="75%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Center Diagonal Bevel Bottom Face (Depth) */}
        <linearGradient id="mcDiagBevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#003db3" />
        </linearGradient>

        {/* Right Leg Front Face */}
        <linearGradient id="mcRightFront" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0047cc" />
        </linearGradient>

        {/* Orbital Ring Multi-color Gradient (Purple to Electric Cyan & White) */}
        <linearGradient id="mcOrbitGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c026d3" stopOpacity="0.95" />
          <stop offset="18%" stopColor="#9333ea" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#00d2ff" stopOpacity="0.95" />
          <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>

        {/* Soft Glow Filters */}
        <filter id="mcNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur1" />
          <feGaussianBlur stdDeviation="12" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="mcSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background Atmosphere & Ambient Dome Sphere */}
      <g className="emblem-atmosphere">
        <ellipse cx="160" cy="130" rx="110" ry="95" fill="url(#mcSpaceGlow)" />
        <ellipse
          cx="160"
          cy="125"
          rx="106"
          ry="92"
          fill="none"
          stroke="url(#mcSphereArc)"
          strokeWidth="1.8"
          opacity="0.65"
        />
      </g>

      {/* 1. ORBITAL RING - BACK ARC (Visually passes behind top-right of M) */}
      <g className="emblem-orbit-back" opacity="0.85">
        <path
          d="M 64 172 C 34 148 38 106 84 76 C 132 45 200 44 250 72 C 272 84 282 98 280 112"
          fill="none"
          stroke="url(#mcOrbitGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#mcSoftGlow)"
        />
        <path
          d="M 64 172 C 34 148 38 106 84 76 C 132 45 200 44 250 72 C 272 84 282 98 280 112"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          strokeOpacity="0.65"
          strokeLinecap="round"
        />
      </g>

      {/* 2. MAIN EMBLEM 'M' (Futuristic 3D Glass Geometry) */}
      <g id="emblem-m-group" filter="url(#mcSoftGlow)">
        {/* Outer Neon Glow Underlayer */}
        <g opacity="0.38" filter="url(#mcNeonGlow)">
          <path
            d="M 94 66 C 94 56 102 50 112 50 L 126 50 C 131 50 135 53 138 56 L 158 80 C 161 84 161 90 157 94 L 142 108 C 139 111 134 110 131 106 L 119 92 C 117 90 114 91 114 94 L 114 186 C 114 192 108 198 102 198 L 94 198 Z"
            fill="#00f0ff"
          />
          <path
            d="M 118 198 L 142 198 C 147 198 152 195 155 190 L 226 76 C 229 70 227 62 221 58 L 204 52 C 199 50 193 53 190 58 L 116 182 C 113 187 114 194 118 198 Z"
            fill="#00f0ff"
          />
          <path
            d="M 170 120 L 216 172 C 221 178 224 185 224 192 L 224 193 C 224 197 220 200 215 200 L 198 200 C 193 200 189 196 189 191 L 189 166 C 189 162 187 158 184 155 L 168 136 C 164 130 165 122 170 120 Z"
            fill="#00f0ff"
          />
        </g>

        {/* PIECE 1: LEFT WING & TOP VALLEY */}
        <g className="emblem-left-wing">
          <path
            d="M 94 66 C 94 57 101 52 110 52 L 124 52 C 128 52 131 54 134 57 L 155 81 C 158 85 158 90 155 94 L 142 106 C 139 108 135 108 132 105 L 118 89 C 115 86 112 88 112 92 L 112 186 C 112 192 106 196 100 196 L 96 196 C 94 196 94 194 94 192 Z"
            fill="url(#mcLeftFront)"
          />
          <path
            d="M 94 120 L 112 120 L 112 186 C 112 192 106 196 100 196 L 96 196 C 94 196 94 194 94 192 Z"
            fill="url(#mcLeftFoot)"
            opacity="0.6"
          />
          <path
            d="M 124 52 L 134 57 L 155 81 C 158 85 158 90 155 94 L 142 106 L 134 94 L 118 76 L 112 68 L 112 52 Z"
            fill="url(#mcLeftFront)"
            opacity="0.4"
          />
          {/* Specular White Rim Highlight */}
          <path
            d="M 94 72 C 94 61 100 54 110 54 L 124 54 C 127 54 130 56 132 58 L 153 82"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 96 68 L 96 192"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.8"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* PIECE 2: MAIN ASCENDING DIAGONAL PRISM */}
        <g className="emblem-center-diagonal">
          <path
            d="M 120 196 L 142 196 C 147 196 152 193 155 188 L 226 76 C 229 70 227 63 221 59 L 205 53 C 200 51 194 54 191 59 L 117 182 C 114 187 115 193 120 196 Z"
            fill="url(#mcDiagFront)"
          />
          {/* 3D Bottom Bevel Edge (Depth facet) */}
          <path
            d="M 120 196 L 142 196 C 147 196 152 193 155 188 L 226 76 L 223 85 L 155 193 C 151 198 145 200 139 200 L 123 200 C 119 200 117 198 120 196 Z"
            fill="url(#mcDiagBevel)"
            opacity="0.95"
          />
          {/* Specular Edge Highlight on Top Ridge */}
          <path
            d="M 194 58 L 221 63 C 225 66 226 71 224 75 L 155 188"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 197 54 L 220 54"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* PIECE 3: RIGHT PILLAR & BEVELED FACET */}
        <g className="emblem-right-leg">
          <path
            d="M 170 120 L 216 172 C 221 178 224 185 224 192 L 224 193 C 224 197 220 200 215 200 L 198 200 C 193 200 189 196 189 191 L 189 166 C 189 162 187 158 184 155 L 168 136 C 164 130 165 122 170 120 Z"
            fill="url(#mcRightFront)"
          />
          {/* Inner 3D Chamfered Highlight */}
          <path
            d="M 170 120 L 214 170 L 214 192 L 202 192 L 189 166 L 170 144 Z"
            fill="url(#mcDiagFront)"
            opacity="0.35"
          />
          {/* Specular Edge Highlights */}
          <path
            d="M 224 175 L 224 192"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.95"
          />
          <path
            d="M 172 122 L 216 172"
            stroke="#ffffff"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
        </g>
      </g>

      {/* 3. ORBITAL RING - FRONT ARC (Visually passes in front of lower-left of M) */}
      <g className="emblem-orbit-front">
        <path
          d="M 280 112 C 276 132 242 168 188 196 C 142 218 92 208 64 172"
          fill="none"
          stroke="url(#mcOrbitGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#mcSoftGlow)"
        />
        {/* Intense Inner White Energy Core */}
        <path
          d="M 268 124 C 250 152 210 184 164 202 C 118 214 80 198 64 172"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
      </g>

      {/* Lens Flare Sparkle Horizon */}
      <g className="emblem-sparkle" transform="translate(276, 112)" filter="url(#mcSoftGlow)">
        <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
        <ellipse cx="0" cy="0" rx="16" ry="1.5" fill="#a5f3fc" transform="rotate(-28)" />
        <ellipse cx="0" cy="0" rx="9" ry="1.5" fill="#ffffff" transform="rotate(62)" />
      </g>

      {/* Particle Energy Sparks */}
      <g className="emblem-particles">
        <circle cx="70" cy="180" r="1.8" fill="#d946ef" opacity="0.9" />
        <circle cx="254" cy="80" r="1.4" fill="#38bdf8" opacity="0.85" />
        <circle cx="172" cy="206" r="1.2" fill="#00d2ff" opacity="0.9" />
      </g>
    </svg>
  )
}

/**
 * Responsive Brand Logo System Component
 * Renders the emblem + wordmark + optional tagline in Desktop Header, Mobile Header, Footer, and Hero formats.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  showTagline,
  className = '',
  onClick,
  emblemSize,
  asButton = !!onClick,
}) => {
  const isFooter = variant === 'footer'
  const isHero = variant === 'hero'
  const isMobile = variant === 'mobile'
  const isCompact = variant === 'compact'

  // Tagline defaults: show on footer & hero, hide on header & mobile
  const renderTagline = showTagline ?? (isFooter || isHero)

  const content = (
    <div className={`brand-logo-container brand-logo--${variant} ${className}`}>
      {/* 3D Glass M Emblem */}
      <div className="brand-logo-emblem-wrap">
        <BrandEmblem size={emblemSize} />
      </div>

      {/* Typography Wordmark + Optional Tagline */}
      {!isCompact && (
        <div className="brand-logo-text-group">
          <div className="brand-wordmark" aria-label="Maanvi Creation">
            <span className="brand-word-maanvi">MAANVI</span>
            <span className="brand-word-creation">CREATION</span>
          </div>
          {renderTagline && !isMobile && (
            <div className="brand-tagline" aria-label="Ideas, Innovation, Impact">
              <span>IDEAS</span>
              <span className="brand-tagline-dot">•</span>
              <span>INNOVATION</span>
              <span className="brand-tagline-dot">•</span>
              <span>IMPACT</span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (asButton) {
    return (
      <button
        type="button"
        className="brand-logo-button"
        onClick={onClick}
        aria-label="Maanvi Creation home"
      >
        {content}
      </button>
    )
  }

  return content
}

export default BrandLogo
