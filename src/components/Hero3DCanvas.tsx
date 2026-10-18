import React, { useEffect, useRef, useState, useCallback } from 'react'
import santhoshLabImg from '../assets/santhosh-ai-lab.jpg'
import { BrandEmblem } from './BrandLogo'
import './Hero3DCanvas.css'

// Use ImageBitmap for GPU-optimized off-thread decoding when available
type FrameImage = HTMLImageElement | ImageBitmap
const supportsImageBitmap = typeof createImageBitmap === 'function'

export interface Hero3DCanvasProps {
  onOpenContact?: (message?: string) => void
}

const TOTAL_FRAMES = 300

// Native source resolution of frames (used for smart DPR clamping)
const SOURCE_WIDTH_DESKTOP = 1280
const SOURCE_HEIGHT_DESKTOP = 720
const SOURCE_WIDTH_MOBILE = 960
const SOURCE_HEIGHT_MOBILE = 540

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
    id: 'architect',
    name: '01 / ARCHITECT',
    label: 'AI & Systems Architecture',
    title: 'Santhosh K',
    emphasis: 'AI/ML Architect & Systems Engineer.',
    subtitle: 'Building intelligent autonomous agents, RAG knowledge pipelines, 3D WebGL platforms, and scalable digital architectures that create real business value.',
    tagline: 'AI ARCHITECT • AUTONOMOUS AGENTS • RAG • 3D WEBGL',
    range: [0, 0.25],
    targetFrame: 0,
  },
  {
    id: 'spatial',
    name: '02 / SPATIAL & 3D',
    label: 'Interactive Web & 3D',
    title: 'High-Performance Web',
    emphasis: 'With Real 3D Depth & Velocity.',
    subtitle: 'Engineering flagship digital experiences, interactive WebGL worlds, and responsive web applications with sub-second load times.',
    tagline: 'THREE.JS • REACT 19 • FULL STACK • ULTRA FAST',
    range: [0.25, 0.52],
    targetFrame: 110,
  },
  {
    id: 'creative',
    name: '03 / CREATIVE AI',
    label: 'AI Video Ads & Mascots',
    title: 'AI Commercial Campaigns',
    emphasis: '& 3D Animated Mascots.',
    subtitle: 'From viral commercial product ads to custom 3D character mascots and brand explainers, turning ideas into unforgettable visual stories.',
    tagline: 'AI ADS • 3D MASCOTS • MOTION STUDIO • VIRAL REELS',
    range: [0.52, 0.78],
    targetFrame: 190,
  },
  {
    id: 'launch',
    name: '04 / PRODUCTION',
    label: 'Launch To Scale',
    title: 'From Architectural Concept',
    emphasis: 'To Production Deployment.',
    subtitle: 'Ready to build your next AI solution, flagship web application, or commercial launch? Let’s architect and ship it with minimum time and enterprise quality.',
    tagline: 'CONCEPT TO PRODUCTION • ZERO TO SCALE • RELIABLE',
    range: [0.78, 1.0],
    targetFrame: 299,
  },
]

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ onOpenContact }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagePool = useRef<(FrameImage | null)[]>(new Array(TOTAL_FRAMES).fill(null))
  
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
  const isIdle = useRef<boolean>(false)
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
  // Supports both HTMLImageElement and ImageBitmap
  const getRenderableImage = useCallback((targetIndex: number): FrameImage | null => {
    const pool = imagePool.current
    const entry = pool[targetIndex]
    if (entry) {
      // ImageBitmap is always ready; HTMLImageElement needs .complete check
      if (entry instanceof ImageBitmap || (entry as HTMLImageElement).complete) {
        return entry
      }
    }

    let closest: FrameImage | null = null
    let minDistance = Infinity

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = pool[i]
      if (!img) continue
      const ready = img instanceof ImageBitmap || (img as HTMLImageElement).complete
      if (ready) {
        const dist = Math.abs(i - targetIndex)
        if (dist < minDistance) {
          minDistance = dist
          closest = img
        }
      }
    }
    return closest
  }, [])

  // Draw image to canvas with cover math, smart DPR clamping, and cinematic blending
  // Supports both HTMLImageElement and ImageBitmap for GPU-optimized rendering
  const drawFrame = useCallback((img: FrameImage) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
    if (!ctx) return

    // Smart DPR clamping: Never scale canvas beyond source resolution
    // This prevents blurry upscaling of 720p frames on hi-DPI screens
    const rawDpr = window.devicePixelRatio || 1
    const displayWidth = canvas.clientWidth || window.innerWidth
    const displayHeight = canvas.clientHeight || window.innerHeight
    const sourceW = isMobile ? SOURCE_WIDTH_MOBILE : SOURCE_WIDTH_DESKTOP
    const sourceH = isMobile ? SOURCE_HEIGHT_MOBILE : SOURCE_HEIGHT_DESKTOP

    // Calculate the maximum useful DPR — beyond this we're just upscaling pixels
    const maxUsefulDprX = sourceW / displayWidth
    const maxUsefulDprY = sourceH / displayHeight
    const maxUsefulDpr = Math.max(maxUsefulDprX, maxUsefulDprY)
    const dpr = Math.min(rawDpr, maxUsefulDpr, 2)

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
    const imgWidth = (img instanceof ImageBitmap) ? img.width : (img.naturalWidth || img.width || sourceW)
    const imgHeight = (img instanceof ImageBitmap) ? img.height : (img.naturalHeight || img.height || sourceH)
    const scale = Math.max(displayWidth / imgWidth, displayHeight / imgHeight)
    const renderW = imgWidth * scale
    const renderH = imgHeight * scale
    const renderX = (displayWidth - renderW) / 2
    const renderY = isMobile ? (displayHeight - renderH) * 0.40 + 35 : (displayHeight - renderH) / 2

    // Enable high-fidelity smoothing for sharp rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw the frame without expensive CSS filters — saves 2-4ms per frame
    // The contrast/saturation boost is now baked into the WebP conversion pipeline instead
    ctx.drawImage(img, renderX, renderY, renderW, renderH)

    if (isMobile) {
      // Mobile: Top-down cinematic fade covering the upper narrative zone so the lower 3D visual remains crisp & unobstructed
      const topNarrativeHeight = Math.min(displayHeight * 0.52, 440)
      const topGradient = ctx.createLinearGradient(0, 0, 0, topNarrativeHeight)
      topGradient.addColorStop(0, 'rgba(3, 7, 18, 0.96)')
      topGradient.addColorStop(0.35, 'rgba(3, 7, 18, 0.86)')
      topGradient.addColorStop(0.7, 'rgba(3, 7, 18, 0.45)')
      topGradient.addColorStop(1, 'rgba(3, 7, 18, 0)')
      ctx.fillStyle = topGradient
      ctx.fillRect(0, 0, displayWidth, topNarrativeHeight)

      // Mobile bottom vignette for timeline HUD
      const bottomGlow = ctx.createLinearGradient(0, displayHeight - 110, 0, displayHeight)
      bottomGlow.addColorStop(0, 'rgba(3, 7, 18, 0)')
      bottomGlow.addColorStop(1, 'rgba(3, 7, 18, 0.92)')
      ctx.fillStyle = bottomGlow
      ctx.fillRect(0, displayHeight - 110, displayWidth, 110)
    } else {
      // Desktop: Left cinematic fade to seamlessly integrate real typography and mask letterboxing
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
    }

    ctx.restore()
  }, [isMobile])

  // Intelligent 3-phase responsive preloading engine
  useEffect(() => {
    let active = true
    let loaded = 0
    let isInitialReady = false
    imagePool.current = new Array(TOTAL_FRAMES).fill(null)
    lastRenderedIndex.current = -1

    const registerLoaded = (index: number, img: FrameImage) => {
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
      if (index < 0 || index >= TOTAL_FRAMES) return Promise.resolve()
      if (imagePool.current[index]) return Promise.resolve()

      return new Promise((resolve) => {
        const img = new Image()
        if (priority === 'high') {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = 'high'
        }
        img.onload = () => {
          // Use createImageBitmap for GPU-optimized off-thread decoding when available
          if (supportsImageBitmap) {
            createImageBitmap(img, { imageOrientation: 'from-image', premultiplyAlpha: 'premultiply' })
              .then((bitmap) => {
                registerLoaded(index, bitmap)
                resolve()
              })
              .catch(() => {
                // Fallback to raw HTMLImageElement if bitmap creation fails
                registerLoaded(index, img)
                resolve()
              })
          } else {
            registerLoaded(index, img)
            resolve()
          }
        }
        img.onerror = () => {
          resolve()
        }
        img.src = getFrameUrl(index, isMobile)
      })
    }

    const runPreload = async () => {
      // Phase 1: Load Frame 0 with ultra-high priority for instant first paint
      await loadSingleFrame(0, 'high')
      if (!active) return

      // Phase 2: Load immediate scroll buffer (frames 1-15) for buttery first scroll
      const initialBuffer = Array.from({ length: 15 }, (_, i) => i + 1)
      await Promise.all(initialBuffer.map((idx) => loadSingleFrame(idx, 'high')))
      if (!active) return

      // Phase 3: Preload chapter milestone anchor frames (instant chapter jumps)
      const anchors = [30, 60, 80, 110, 140, 170, 190, 220, 240, 270, 299]
      await Promise.all(anchors.map((idx) => loadSingleFrame(idx, 'auto')))
      if (!active) return

      // Phase 4: Non-blocking background streaming (stream 5 frames at a time with shorter gaps)
      const remaining: number[] = []
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!imagePool.current[i]) remaining.push(i)
      }

      let currentIndex = 0
      const streamNext = () => {
        if (!active || currentIndex >= remaining.length) return
        const batch = remaining.slice(currentIndex, currentIndex + 5)
        currentIndex += 5
        Promise.all(batch.map((idx) => loadSingleFrame(idx, 'low'))).then(() => {
          if (active) {
            // Give main thread 20ms idle time between batches — fast enough for smooth loading
            setTimeout(streamNext, 20)
          }
        })
      }

      // Start non-blocking stream after initial render settles
      setTimeout(streamNext, 150)
    }

    runPreload()

    return () => {
      active = false
    }
  }, [isMobile, drawFrame])

  // Scroll listener to update target progress
  // Also wakes up idle animation loop when scroll resumes
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const totalDistance = container.offsetHeight - window.innerHeight
      if (totalDistance <= 0) return

      const progress = Math.max(0, Math.min(1, -rect.top / totalDistance))
      targetProgress.current = progress

      // Wake up idle animation loop when user scrolls
      if (isIdle.current && isRunning.current) {
        isIdle.current = false
        const tick = () => {
          if (!isRunning.current) return
          const diff = targetProgress.current - currentProgress.current
          if (Math.abs(diff) > 0.0001) {
            currentProgress.current += diff * 0.085
          } else {
            currentProgress.current = targetProgress.current
          }
          const prog = currentProgress.current
          const fi = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(prog * (TOTAL_FRAMES - 1))))
          if (fi !== lastRenderedIndex.current) {
            const img = getRenderableImage(fi)
            if (img) {
              drawFrame(img)
              lastRenderedIndex.current = fi
            }
            setCurrentDisplayFrame(fi + 1)
            setHudProgress(Math.round(prog * 100))
            const ci = CHAPTERS.findIndex((c) => prog >= c.range[0] && prog <= c.range[1])
            if (ci !== -1) setActiveChapterIndex(ci)
          }
          rafId.current = requestAnimationFrame(tick)
        }
        rafId.current = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [drawFrame, getRenderableImage])

  // Continuous animation loop with lerped progress for silky 60 FPS scrubbing
  // Includes idle detection: stops requesting frames when scroll is stationary to save CPU/battery
  useEffect(() => {
    isRunning.current = true
    isIdle.current = false

    let lastWidth = 0
    let lastHeight = 0
    let idleFrameCount = 0
    let lastHudFrame = 1
    let lastHudProgress = 0
    let lastChapterIdx = 0

    const tick = () => {
      if (!isRunning.current) return

      // Smooth exponential damping lerp for velvety cinematic scrubbing
      const diff = targetProgress.current - currentProgress.current
      if (Math.abs(diff) > 0.0001) {
        currentProgress.current += diff * 0.085
        idleFrameCount = 0
        isIdle.current = false
      } else {
        currentProgress.current = targetProgress.current
        idleFrameCount++
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

        // Debounce React state updates — only update when values actually change
        const newHudFrame = frameIndex + 1
        const newHudProgress = Math.round(progress * 100)
        const newChapterIdx = CHAPTERS.findIndex((c) => progress >= c.range[0] && progress <= c.range[1])

        if (newHudFrame !== lastHudFrame) {
          setCurrentDisplayFrame(newHudFrame)
          lastHudFrame = newHudFrame
        }
        if (newHudProgress !== lastHudProgress) {
          setHudProgress(newHudProgress)
          lastHudProgress = newHudProgress
        }
        if (newChapterIdx !== -1 && newChapterIdx !== lastChapterIdx) {
          setActiveChapterIndex(newChapterIdx)
          lastChapterIdx = newChapterIdx
        }

        idleFrameCount = 0
      }

      // After 60 idle frames (~1 second), stop the loop to save CPU/battery
      // The scroll listener will restart it when user scrolls again
      if (idleFrameCount > 60) {
        isIdle.current = true
        return // Don't schedule another frame
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
              <span><b>99.9%</b>Uptime &amp; Reliability</span>
              <span><b>50+</b>AI &amp; Web Systems</span>
              <span><b>&lt; 500ms</b>API &amp; Load Latency</span>
              <span><b>100%</b>Code Ownership</span>
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
