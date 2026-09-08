import React, { useEffect, useRef, useState, useCallback } from 'react'
import santhoshLabImg from '../assets/santhosh-ai-lab.jpg'
import { BrandEmblem } from './BrandLogo'
import './Hero3DCanvas.css'

export interface Hero3DCanvasProps {
  onOpenContact?: (message?: string) => void
}

const TOTAL_FRAMES = 300

// Dynamic responsive WebP frame resolver (Desktop vs Mobile delivery)
const getFrameUrl = (index: number, isMobileDevice: boolean) => {
  const paddedIndex = String(index + 1).padStart(3, '0')
  return isMobileDevice
    ? `/frames-mobile/frame-${paddedIndex}.webp`
    : `/frames-desktop/frame-${paddedIndex}.webp`
}

interface Chapter {
  id: string
  name: string
  label: string
  title: string
  emphasis: string
  subtitle: string
  tagline: string
  range: [number, number]
  targetFrame: number
}

const CHAPTERS: Chapter[] = [
  {
    id: 'world',
    name: '01 / STUDIO',
    label: 'Digital Experiences',
    title: 'We Build Websites & Apps',
    emphasis: 'At Low Cost, in Minimum Time.',
    subtitle: 'Build Smart. Launch Fast. Grow Digital. Websites, mobile apps, AI video ads, and commercial posters tailored for your business.',
    tagline: 'WEBSITES • APPS • AI ADS • POSTERS',
    range: [0, 0.25],
    targetFrame: 0,
  },
  {
    id: 'motion',
    name: '02 / MOTION',
    label: 'AI Ads & Motion',
    title: 'AI Ads That Make Your Brand',
    emphasis: 'Impossible to Ignore.',
    subtitle: 'From product promotions to viral social campaigns, create high-converting commercial video ads.',
    tagline: 'AI ADS • 3D MOTION • BRAND REELS',
    range: [0.25, 0.52],
    targetFrame: 110,
  },
  {
    id: 'ai',
    name: '03 / CARTOON',
    label: 'Cartoon & Mascots',
    title: 'Custom Cartoon & Character',
    emphasis: 'Animations That Connect.',
    subtitle: 'Bring your brand to life with custom 3D animated mascots, explainer stories, and children storytelling.',
    tagline: '3D MASCOTS • EXPLAINER STORIES • KIDS BRANDS',
    range: [0.52, 0.78],
    targetFrame: 190,
  },
  {
    id: 'launch',
    name: '04 / BUILD',
    label: 'Launch Fast',
    title: 'Tell Us What You Need',
    emphasis: 'We Create It.',
    subtitle: 'Ready to launch your website, app, video ad, or poster campaign? Let’s create something amazing today.',
    tagline: 'CONCEPT TO LAUNCH • MINIMUM TIME • LOW COST',
    range: [0.78, 1.0],
    targetFrame: 299,
  },
]

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ onOpenContact }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagePool = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null))
  
  // Responsive mode detection
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768
  })

  // Progress and rendering loop refs
  const targetProgress = useRef<number>(0)
  const currentProgress = useRef<number>(0)
  const rafId = useRef<number>(0)
  const isRunning = useRef<boolean>(true)
  const lastRenderedIndex = useRef<number>(-1)

  // React UI states
  const [loadedCount, setLoadedCount] = useState<number>(0)
  const [initialReady, setInitialReady] = useState<boolean>(false)
  const [allReady, setAllReady] = useState<boolean>(false)
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0)
  const [currentDisplayFrame, setCurrentDisplayFrame] = useState<number>(1)
  const [hudProgress, setHudProgress] = useState<number>(0)
  const [hologramTilt, setHologramTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Keep track of viewport breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      if (mobile !== isMobile) {
        setIsMobile(mobile)
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [isMobile])

  // Find nearest loaded frame to completely avoid blank flashes
  const getRenderableImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const pool = imagePool.current
    if (pool[targetIndex]?.complete && (pool[targetIndex]?.naturalWidth ?? 0) > 0) {
      return pool[targetIndex]
    }

    let closest: HTMLImageElement | null = null
    let minDistance = Infinity

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = pool[i]
      if (img?.complete && (img?.naturalWidth ?? 0) > 0) {
        const dist = Math.abs(i - targetIndex)
        if (dist < minDistance) {
          minDistance = dist
          closest = img
        }
      }
    }
    return closest
  }, [])

  // Draw image to canvas with cover math, DPR clamping, and cinematic blending
  const drawFrame = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return

    // Clamp devicePixelRatio to max 2 for optimal balance of sharpness and GPU memory
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const displayWidth = canvas.clientWidth || window.innerWidth
    const displayHeight = canvas.clientHeight || window.innerHeight

    const targetBufferWidth = Math.round(displayWidth * dpr)
    const targetBufferHeight = Math.round(displayHeight * dpr)

    // Only resize canvas backing buffer when physical dimensions actually change
    if (canvas.width !== targetBufferWidth || canvas.height !== targetBufferHeight) {
      canvas.width = targetBufferWidth
      canvas.height = targetBufferHeight
    }

    ctx.save()
    ctx.scale(dpr, dpr)

    // Solid base layer
    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // Calculate aspect ratio cover framing
    const imgWidth = img.naturalWidth || img.width || (isMobile ? 960 : 1280)
    const imgHeight = img.naturalHeight || img.height || (isMobile ? 540 : 720)
    const scale = Math.max(displayWidth / imgWidth, displayHeight / imgHeight)
    const renderW = imgWidth * scale
    const renderH = imgHeight * scale
    const renderX = (displayWidth - renderW) / 2
    const renderY = (displayHeight - renderH) / 2

    // Enable high-fidelity smoothing for sharp rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.filter = 'contrast(1.05) saturate(1.06) brightness(1.01)'
    ctx.drawImage(img, renderX, renderY, renderW, renderH)
    ctx.filter = 'none'

    // Left cinematic fade to seamlessly integrate real typography and mask letterboxing
    const leftGradient = ctx.createLinearGradient(0, 0, Math.min(displayWidth * 0.58, 640), 0)
    leftGradient.addColorStop(0, 'rgba(3, 7, 18, 0.96)')
    leftGradient.addColorStop(0.35, 'rgba(3, 7, 18, 0.88)')
    leftGradient.addColorStop(0.7, 'rgba(3, 7, 18, 0.45)')
    leftGradient.addColorStop(1, 'rgba(3, 7, 18, 0)')
    ctx.fillStyle = leftGradient
    ctx.fillRect(0, 0, Math.min(displayWidth * 0.58, 640), displayHeight)

    // Subtle edge gradients for seamless header and HUD integration
    const topGlow = ctx.createLinearGradient(0, 0, 0, 140)
    topGlow.addColorStop(0, 'rgba(3, 7, 18, 0.85)')
    topGlow.addColorStop(1, 'rgba(3, 7, 18, 0)')
    ctx.fillStyle = topGlow
    ctx.fillRect(0, 0, displayWidth, 140)

    const bottomGlow = ctx.createLinearGradient(0, displayHeight - 160, 0, displayHeight)
    bottomGlow.addColorStop(0, 'rgba(3, 7, 18, 0)')
    bottomGlow.addColorStop(1, 'rgba(3, 7, 18, 0.9)')
    ctx.fillStyle = bottomGlow
    ctx.fillRect(0, displayHeight - 160, displayWidth, 160)

    ctx.restore()
  }, [isMobile])

  // Intelligent 3-phase responsive preloading engine
  useEffect(() => {
    let active = true
    let loaded = 0
    let isInitialReady = false
    imagePool.current = new Array(TOTAL_FRAMES).fill(null)
    lastRenderedIndex.current = -1

    const registerLoaded = (index: number, img: HTMLImageElement) => {
      if (!active) return
      imagePool.current[index] = img
      loaded++
      setLoadedCount(loaded)

      if (index === 0) {
        isInitialReady = true
        setInitialReady(true)
        drawFrame(img)
      }
      if (loaded >= 12 && !isInitialReady) {
        isInitialReady = true
        setInitialReady(true)
      }
      if (loaded === TOTAL_FRAMES) {
        setAllReady(true)
      }
    }

    const loadSingleFrame = (index: number, priority: 'high' | 'auto' | 'low' = 'auto'): Promise<void> => {
      return new Promise((resolve) => {
        if (imagePool.current[index]?.complete) {
          resolve()
          return
        }
        const img = new Image()
        if (priority === 'high') {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high'
        }
        img.onload = () => {
          registerLoaded(index, img)
          resolve()
        }
        img.onerror = () => {
          resolve()
        }
        img.src = getFrameUrl(index, isMobile)
      })
    }

    const runPreload = async () => {
      // Phase 1: Load Frame 0 immediately with high priority
      await loadSingleFrame(0, 'high')

      // Phase 2: Load keyframe milestones across the entire animation (instant scrub preview skeleton)
      const milestones: number[] = []
      const step = 15
      for (let i = step; i < TOTAL_FRAMES; i += step) {
        milestones.push(i)
      }
      await Promise.all(milestones.map((idx) => loadSingleFrame(idx, 'high')))

      // Phase 3: Stream in all remaining frames in manageable batches
      const remaining: number[] = []
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!imagePool.current[i]) {
          remaining.push(i)
        }
      }

      const BATCH_SIZE = 8
      for (let i = 0; i < remaining.length; i += BATCH_SIZE) {
        if (!active) break
        const batch = remaining.slice(i, i + BATCH_SIZE)
        await Promise.all(batch.map((idx) => loadSingleFrame(idx, 'low')))
      }
    }

    runPreload()

    return () => {
      active = false
    }
  }, [isMobile, drawFrame])

  // Scroll listener to update target progress
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const totalDistance = container.offsetHeight - window.innerHeight
      if (totalDistance <= 0) return

      const progress = Math.max(0, Math.min(1, -rect.top / totalDistance))
      targetProgress.current = progress
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  // Continuous animation loop with lerped progress for silky 60 FPS scrubbing
  useEffect(() => {
    isRunning.current = true

    let lastWidth = 0
    let lastHeight = 0

    const tick = () => {
      if (!isRunning.current) return

      // Smooth exponential damping lerp for velvety cinematic scrubbing
      const diff = targetProgress.current - currentProgress.current
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * 0.085
      } else {
        currentProgress.current = targetProgress.current
      }

      const progress = currentProgress.current
      const frameIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(progress * (TOTAL_FRAMES - 1))))

      const canvas = canvasRef.current
      const curWidth = canvas?.clientWidth || 0
      const curHeight = canvas?.clientHeight || 0
      const sizeChanged = curWidth !== lastWidth || curHeight !== lastHeight

      if (frameIndex !== lastRenderedIndex.current || sizeChanged) {
        const img = getRenderableImage(frameIndex)
        if (img) {
          drawFrame(img)
          lastRenderedIndex.current = frameIndex
          lastWidth = curWidth
          lastHeight = curHeight
        }

        setCurrentDisplayFrame(frameIndex + 1)
        setHudProgress(Math.round(progress * 100))

        // Update active chapter
        const chapterIdx = CHAPTERS.findIndex((c) => progress >= c.range[0] && progress <= c.range[1])
        if (chapterIdx !== -1) {
          setActiveChapterIndex(chapterIdx)
        }
      }

      rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)

    return () => {
      isRunning.current = false
      cancelAnimationFrame(rafId.current)
    }
  }, [drawFrame, getRenderableImage])

  // Clickable Chapter Navigation
  const jumpToChapter = (chapterIndex: number) => {
    const container = containerRef.current
    if (!container) return

    const totalDistance = container.offsetHeight - window.innerHeight
    const chapter = CHAPTERS[chapterIndex]
    const targetRatio = chapter.targetFrame / (TOTAL_FRAMES - 1)
    const targetScrollY = container.offsetTop + targetRatio * totalDistance

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  // Clickable progress bar scrubber
  const handleProgressTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current
    if (!container) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const totalDistance = container.offsetHeight - window.innerHeight
    const targetScrollY = container.offsetTop + clickRatio * totalDistance

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    })
  }

  // Interactive 3D mouse tilt on holographic card
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
    setHologramTilt({ x: x * 12, y: -y * 12 })
  }

  const handleMouseLeave = () => {
    setHologramTilt({ x: 0, y: 0 })
  }

  const activeChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0]
  const loadPercentage = Math.round((loadedCount / TOTAL_FRAMES) * 100)

  return (
    <div className="hero-3d-track" ref={containerRef} id="top">
      <div className="hero-3d-sticky">
        {/* HTML5 GPU Canvas */}
        <canvas className="hero-3d-canvas" ref={canvasRef} />

        {/* Ambient Atmosphere and Vignette */}
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />

        {/* Initial Loading Screen */}
        <div className={`hero-loader-overlay ${initialReady ? 'is-hidden' : ''}`} aria-live="polite">
          <div className="hero-loader-visual">
            <BrandEmblem size={72} className="hero-loader-emblem" />
          </div>
          <div className="hero-loader-content">
            <span className="hero-loader-title">MAANVI CREATION • 3D EXPERIENCE</span>
            <div className="hero-loader-bar">
              <div className="hero-loader-bar-fill" style={{ width: `${Math.max(5, loadPercentage)}%` }} />
            </div>
            <span className="hero-loader-stats">
              {loadedCount} / {TOTAL_FRAMES} frames ({isMobile ? 'Mobile WebP 960px' : 'Desktop WebP 1280px'})
            </span>
          </div>
        </div>

        {/* Top HUD Bar */}
        <div className="hero-top-bar">
          <div className="hero-chapter-pill">
            <span className="live-indicator" />
            <span>{activeChapter.name}</span>
            <span className="hero-status-tag">{activeChapter.label}</span>
          </div>

          {/* Holographic 3D Floating Asset Widget */}
          <div
            className="hero-hologram-card"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(600px) rotateX(${hologramTilt.y}deg) rotateY(${hologramTilt.x}deg)`,
            }}
            title="Santhosh AI Lab • Click to view"
            onClick={() => {
              const el = document.getElementById('ai')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <img src={santhoshLabImg} alt="Santhosh AI Lab" className="hero-hologram-thumb lab-avatar" />
            <div className="hero-hologram-info">
              <strong>SANTHOSH AI LAB</strong>
              <span>AI ARCHITECT • VIEW ↗</span>
            </div>
          </div>
        </div>

        {/* Mid Center Narrative Storytelling Overlay */}
        <div className="hero-narrative-overlay" key={activeChapter.id}>
          <div className="hero-narrative-eyebrow">
            <span className="live-dot" />
            {activeChapter.tagline}
          </div>
          <h1 className="hero-narrative-title">
            <span>{activeChapter.title}</span><br />
            <em>{activeChapter.emphasis}</em>
          </h1>
          <p className="hero-narrative-sub">{activeChapter.subtitle}</p>
          <div className="hero-actions">
            <button
              className="button button-canvas-cta magnetic"
              data-cursor="CHAT"
              onClick={() => onOpenContact?.(`Hi Maanvi Creation, I'm interested in ${activeChapter.label}.`)}
            >
              Start a project <span>→</span>
            </button>
          </div>
          {activeChapterIndex === 0 && (
            <div className="hero-canvas-metrics">
              <span><b>200+</b>Projects</span>
              <span><b>50+</b>Happy clients</span>
              <span><b>3+</b>Years experience</span>
              <span><b>100%</b>Client satisfaction</span>
            </div>
          )}
        </div>

        {/* Streaming Buffer Pill (fades away when 100% cached) */}
        {!allReady && initialReady && (
          <div className="hero-stream-badge">
            STREAMING 3D ASSETS • {loadPercentage}% ({loadedCount}/{TOTAL_FRAMES} {isMobile ? 'Mobile' : 'HD'})
          </div>
        )}

        {/* Bottom Timeline HUD */}
        <div className="hero-timeline-hud">
          <div className="hero-timeline-row">
            {/* Clickable Chapter Navigation Marks */}
            <div className="hero-chapters-nav" role="tablist" aria-label="3D Storyline Chapters">
              {CHAPTERS.map((ch, idx) => (
                <button
                  key={ch.id}
                  className={`hero-chapter-btn ${activeChapterIndex === idx ? 'active' : ''}`}
                  onClick={() => jumpToChapter(idx)}
                  role="tab"
                  aria-selected={activeChapterIndex === idx}
                >
                  {ch.name}
                </button>
              ))}
            </div>

            {/* Current Frame Counter & Scroll Cue */}
            <div className="hero-frame-counter">
              <span className="hero-scroll-cue">
                Scroll to scrub 3D
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                FRAME <b>{String(currentDisplayFrame).padStart(3, '0')}</b> / {TOTAL_FRAMES}
              </span>
              <span><b>{hudProgress}%</b></span>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div
            className="hero-timeline-progress-track"
            onClick={handleProgressTrackClick}
            title="Click to jump timeline"
          >
            <div
              className="hero-timeline-progress-fill"
              style={{ width: `${hudProgress}%` }}
            />
            <div className="hero-timeline-ticks">
              {CHAPTERS.map((ch) => (
                <span
                  key={ch.id}
                  className="hero-timeline-tick"
                  style={{ left: `${(ch.targetFrame / (TOTAL_FRAMES - 1)) * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero3DCanvas
