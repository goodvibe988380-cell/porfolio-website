import React, { useEffect, useRef, useState, useCallback } from 'react'
import { ARCHITECTURE_STEPS, type ArchitectureStepId } from './types'
import { AIArchitectScene } from './scene/AIArchitectScene'
import './AIArchitectChallenge.css'

export interface AIArchitectChallengeProps {
  onOpenContact?: (message?: string) => void
}

const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return true
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export const AIArchitectChallenge: React.FC<AIArchitectChallengeProps> = ({ onOpenContact }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<AIArchitectScene | null>(null)

  // Gameplay state
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<Set<ArchitectureStepId>>(new Set())
  const [wrongMessage, setWrongMessage] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)
  const [webGLSupported] = useState<boolean>(checkWebGLSupport)
  const [hoveredNodeId, setHoveredNodeId] = useState<ArchitectureStepId | null>(null)

  const currentStep = ARCHITECTURE_STEPS[currentStepIndex] || ARCHITECTURE_STEPS[0]
  const progressPercent = Math.round((completedSteps.size / ARCHITECTURE_STEPS.length) * 100)

  // Node selection handler
  const handleNodeSelect = useCallback(
    (selectedId: ArchitectureStepId) => {
      if (isCompleted) return

      const targetStep = ARCHITECTURE_STEPS[currentStepIndex]
      if (!targetStep) return

      // Correct selection
      if (selectedId === targetStep.id) {
        setWrongMessage(null)

        const nextCompleted = new Set(completedSteps)
        nextCompleted.add(selectedId)
        setCompletedSteps(nextCompleted)

        // 3D Scene updates
        const scene = sceneRef.current
        if (scene) {
          scene.nodes.setNodeStatus(selectedId, 'active')
          scene.aiCore.triggerSurge()
          scene.focusNode(targetStep.position)
          scene.setProgress(nextCompleted.size, ARCHITECTURE_STEPS.length)

          // Activate incoming conduits from previous dependencies
          ARCHITECTURE_STEPS.forEach((step) => {
            if (step.connectionsTo.includes(selectedId) && nextCompleted.has(step.id)) {
              scene.conduits.setConduitActive(step.id, selectedId, true)
            }
          })
        }

        const nextIndex = currentStepIndex + 1

        if (nextIndex >= ARCHITECTURE_STEPS.length) {
          // All 7 steps complete! Trigger completion sequence
          setIsCompleted(true)
          if (scene) {
            scene.aiCore.setSupernova(true)
            scene.conduits.activateAll()
            scene.setCompletionCamera()
          }
        } else {
          setCurrentStepIndex(nextIndex)
          const nextTarget = ARCHITECTURE_STEPS[nextIndex]
          if (scene) {
            scene.nodes.setNodeStatus(nextTarget.id, 'next')
          }
        }
      } else {
        // Wrong node selected: gentle non-punitive wobble feedback
        const scene = sceneRef.current
        if (scene) {
          scene.nodes.triggerWrongWobble(selectedId)
        }

        if (completedSteps.has(selectedId)) {
          setWrongMessage(`${selectedId} is already connected. Connect ${targetStep.id} next.`)
        } else {
          setWrongMessage(`Not yet. Connect ${targetStep.id} first to establish the architecture.`)
        }

        setTimeout(() => {
          setWrongMessage(null)
        }, 3200)
      }
    },
    [currentStepIndex, completedSteps, isCompleted]
  )

  // Reset simulation
  const handleReset = useCallback(() => {
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setIsCompleted(false)
    setWrongMessage(null)

    const scene = sceneRef.current
    if (scene) {
      scene.aiCore.setSupernova(false)
      scene.resetCamera()
      scene.setProgress(0, ARCHITECTURE_STEPS.length)
      ARCHITECTURE_STEPS.forEach((step, idx) => {
        scene.nodes.setNodeStatus(step.id, idx === 0 ? 'next' : 'inactive')
        step.connectionsTo.forEach((toId) => {
          scene.conduits.setConduitActive(step.id, toId, false)
        })
      })
    }
  }, [])

  // Initialize Three.js scene & Viewport Observer
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    if (!webGLSupported) return

    const scene = new AIArchitectScene(container, canvas, {
      onNodeClick: (id) => handleNodeSelect(id),
      onNodeHover: (id) => setHoveredNodeId(id),
    })
    sceneRef.current = scene

    // Reduced motion check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    scene.reducedMotion = mediaQuery.matches

    const handleMotionChange = (e: MediaQueryListEvent) => {
      scene.reducedMotion = e.matches
    }
    mediaQuery.addEventListener('change', handleMotionChange)

    // IntersectionObserver: Pause Three.js loop when off-screen to preserve battery/GPU
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scene.start()
          } else {
            scene.stop()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleMotionChange)
      scene.dispose()
      sceneRef.current = null
    }
  }, [handleNodeSelect, webGLSupported])

  return (
    <div className="ai-architect-card" ref={containerRef} aria-label="AI Architect Challenge 3D Simulation">
      {/* 1. TOP STATUS HUD */}
      <div className="ai-architect-hud-top">
        <div className="ai-architect-badge">
          <span className="live-dot" />
          <span>AI ARCHITECT CHALLENGE</span>
        </div>

        <div className="ai-architect-stats">
          <span className="ai-architect-progress-label">SYSTEM BUILD</span>
          <div className="ai-architect-progress-track">
            <div
              className="ai-architect-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="ai-architect-progress-val">{progressPercent}%</span>
          <button
            type="button"
            className="ai-architect-reset-btn"
            onClick={handleReset}
            title="Reset Architecture"
            aria-label="Reset simulation"
          >
            ↻
          </button>
        </div>
      </div>

      {/* 2. 3D WEBGL CANVAS VIEWPORT */}
      <div className="ai-architect-viewport">
        {webGLSupported ? (
          <canvas ref={canvasRef} className="ai-architect-canvas" />
        ) : (
          /* Lightweight SVG / CSS Fallback if WebGL is unavailable */
          <div className="ai-architect-fallback">
            <div className="ai-fallback-core">AI CORE</div>
            <div className="ai-fallback-grid">
              {ARCHITECTURE_STEPS.map((s) => (
                <button
                  key={s.id}
                  className={`ai-fallback-node ${completedSteps.has(s.id) ? 'active' : ''}`}
                  onClick={() => handleNodeSelect(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Floating Mission Pill */}
        {!isCompleted && (
          <div className="ai-architect-mission-overlay" aria-live="polite">
            <div className="ai-architect-step-indicator">
              STEP {currentStep.stepNumber} OF {ARCHITECTURE_STEPS.length}
            </div>
            <div className="ai-architect-mission-action">
              CONNECT <span className="highlight">{currentStep.label}</span>
            </div>
            <div className="ai-architect-mission-insight">
              "{currentStep.insight}"
            </div>
          </div>
        )}

        {/* Wrong Action Alert Banner */}
        {wrongMessage && (
          <div className="ai-architect-alert-pill" role="alert">
            <span className="alert-icon">⚠</span>
            <span>{wrongMessage}</span>
          </div>
        )}

        {/* 3D Completion Victory Overlay */}
        {isCompleted && (
          <div className="ai-architect-completion-overlay" aria-live="polite">
            <div className="completion-badge">
              <span className="live-dot" />
              SYSTEM ONLINE
            </div>
            <h2 className="completion-title">YOU BUILT IT.</h2>
            <div className="completion-rank">AI ARCHITECT LEVEL: UNLOCKED</div>
            <p className="completion-subtext">
              "Great systems are built one intelligent layer at a time."
            </p>

            <div className="completion-actions">
              <button
                type="button"
                className="button button-canvas-cta completion-primary-cta"
                onClick={() =>
                  onOpenContact?.(
                    "Hi Santhosh, I completed the AI Architect Challenge and unlocked AI Architect Level! I'd like to architect a real AI system for my business."
                  )
                }
              >
                BUILD A REAL SYSTEM <span>→</span>
              </button>

              <button
                type="button"
                className="button button-replay"
                onClick={handleReset}
              >
                PLAY AGAIN <span>↻</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM ARCHITECTURE PROGRESS CHECKLIST (Accessible keyboard controls) */}
      <div className="ai-architect-checklist" role="tablist" aria-label="AI Architecture Steps">
        {ARCHITECTURE_STEPS.map((step) => {
          const isDone = completedSteps.has(step.id)
          const isNext = step.id === currentStep.id && !isCompleted
          const isHover = step.id === hoveredNodeId

          return (
            <button
              key={step.id}
              type="button"
              className={`ai-architect-node-pill ${isDone ? 'is-done' : ''} ${isNext ? 'is-next' : ''} ${isHover ? 'is-hovered' : ''}`}
              style={{ '--node-accent': step.activeColor } as React.CSSProperties}
              onClick={() => handleNodeSelect(step.id)}
              role="tab"
              aria-selected={isNext}
              title={`Connect ${step.label}: ${step.sublabel}`}
            >
              <span className="pill-dot">{isDone ? '✓' : isNext ? '●' : '○'}</span>
              <span className="pill-label">{step.label}</span>
            </button>
          )
        })}
      </div>

      {/* Subtle Tagline Footnote */}
      <div className="ai-architect-footnote">
        <span>DON'T JUST USE AI. BUILD IT. • SANTHOSH AI LAB</span>
      </div>
    </div>
  )
}

export default AIArchitectChallenge
