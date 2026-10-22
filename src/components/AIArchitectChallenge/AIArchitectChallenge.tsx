import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  type GameState,
  type GameStats,
  type AIArchitectChallengeProps,
  type LaneIndex,
} from './types'
import { NeonCoreRunScene } from './scene/NeonCoreRunScene'
import './AIArchitectChallenge.css'

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
  const sceneRef = useRef<NeonCoreRunScene | null>(null)

  // Game UI States
  const [gameState, setGameState] = useState<GameState>('READY')
  const [countdownNum, setCountdownNum] = useState<number | string>(3)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [webGLSupported] = useState<boolean>(checkWebGLSupport)
  const [currentLane, setCurrentLane] = useState<LaneIndex>(0)

  // In-game live statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    distance: 0,
    coresCollected: 0,
    multiplier: 1,
    speed: 28,
    energy: 100,
    highScore: 0,
  })

  // Core pickup floating notification
  const [comboPopup, setComboPopup] = useState<{ text: string; id: number } | null>(null)
  const popupTimeoutRef = useRef<number | null>(null)

  // Fullscreen Mode State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement
      setIsFullscreen(active)
      setTimeout(() => {
        sceneRef.current?.handleResize()
      }, 70)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 1. Core Handlers
  const toggleSound = useCallback(() => {
    if (!sceneRef.current) return
    const nextMuted = sceneRef.current.sound.toggleMute()
    setIsMuted(nextMuted)
  }, [])

  const handleStartCountdown = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.sound.playButton()
    setGameState('COUNTDOWN')
    setCountdownNum(3)
    sceneRef.current.sound.playCountdown(false)

    let current = 3
    const interval = setInterval(() => {
      current -= 1
      if (current > 0) {
        setCountdownNum(current)
        sceneRef.current?.sound.playCountdown(false)
      } else if (current === 0) {
        setCountdownNum('GO!')
        sceneRef.current?.sound.playCountdown(true)
      } else {
        clearInterval(interval)
        setGameState('PLAYING')
        sceneRef.current?.startRun()
      }
    }, 650)
  }, [])

  const handlePause = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.pauseRun()
    setGameState('PAUSED')
  }, [])

  const handleResume = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.sound.playButton()
    sceneRef.current.resumeRun()
    setGameState('PLAYING')
  }, [])

  const handleRestart = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.sound.playButton()
    handleStartCountdown()
  }, [handleStartCountdown])

  // 2. Touch / Swipe Controls for Mobile
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (touch) {
      touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current || gameState !== 'PLAYING' || !sceneRef.current) return
    const touch = e.changedTouches[0]
    if (!touch) return

    const diffX = touch.clientX - touchStartPos.current.x
    const diffY = touch.clientY - touchStartPos.current.y
    const absX = Math.abs(diffX)
    const absY = Math.abs(diffY)

    // Swipe sensitivity threshold
    if (Math.max(absX, absY) > 28) {
      if (absX > absY) {
        // Horizontal swipe
        if (diffX > 0) {
          sceneRef.current.shiftLane(1)
        } else {
          sceneRef.current.shiftLane(-1)
        }
      } else {
        // Vertical swipe up: Jump
        if (diffY < 0) {
          sceneRef.current.jump()
        }
      }
    }
    touchStartPos.current = null
  }

  // 3. Initialize Scene & Three.js Canvas
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || !webGLSupported) return

    const scene = new NeonCoreRunScene({
      container: containerRef.current,
      canvas: canvasRef.current,
      onStatsUpdate: (newStats) => {
        setStats(newStats)
      },
      onGameOver: (finalStats) => {
        setStats(finalStats)
        setGameState('GAMEOVER')
      },
      onCoreCollected: (points, combo) => {
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
        setComboPopup({
          text: `+${points} ${combo > 1 ? `(${combo}x)` : ''}`,
          id: Date.now(),
        })
        popupTimeoutRef.current = window.setTimeout(() => {
          setComboPopup(null)
        }, 850)
      },
      onLaneChange: (lane) => {
        setCurrentLane(lane)
      },
    })

    sceneRef.current = scene

    // Initial High Score sync
    setStats((prev) => ({
      ...prev,
      highScore: (scene as unknown as { highScore: number }).highScore || 0,
    }))

    // Resize Handler
    const handleResize = () => scene.handleResize()
    window.addEventListener('resize', handleResize)

    // Visibility Change: Auto-pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden && scene.isRunning && !scene.isPaused) {
        scene.pauseRun()
        setGameState('PAUSED')
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // IntersectionObserver: Pause rendering when game card is off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && scene.isRunning && !scene.isPaused) {
            scene.pauseRun()
            setGameState('PAUSED')
          }
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
      scene.dispose()
      sceneRef.current = null
    }
  }, [webGLSupported])

  // 4. Keyboard Controls Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const scene = sceneRef.current
      if (!scene) return

      // When game is actively running, prevent page scrolling on game controls
      if (
        gameState === 'PLAYING' &&
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyA', 'KeyD', 'KeyW', 'Space'].includes(e.code)
      ) {
        e.preventDefault()
      }

      if (gameState === 'PLAYING') {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          scene.shiftLane(-1)
        } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          scene.shiftLane(1)
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
          scene.jump()
        } else if (e.code === 'KeyP' || e.code === 'Escape') {
          scene.pauseRun()
          setGameState('PAUSED')
        }
      } else if (gameState === 'PAUSED') {
        if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Space') {
          scene.resumeRun()
          setGameState('PLAYING')
        }
      } else if (gameState === 'READY' || gameState === 'GAMEOVER') {
        if (e.code === 'Space' || e.code === 'Enter') {
          handleStartCountdown()
        }
      }

      // Quick Mute toggle with 'M'
      if (e.code === 'KeyM') {
        toggleSound()
      }

      // Fullscreen toggle with 'F'
      if (e.code === 'KeyF' && !e.repeat) {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameState, handleStartCountdown, toggleSound, toggleFullscreen])

  return (
    <div
      className={`neon-game-card ${isFullscreen ? 'is-fullscreen' : ''}`}
      ref={containerRef}
      role="region"
      aria-label="NEON CORE RUN: AI Challenge 3D Arcade Game"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. TOP ARCADE HEADER HUD */}
      <div className="neon-hud-header">
        <div className="neon-title-badge">
          <span className="live-dot" />
          <span className="neon-badge-text">NEON CORE RUN</span>
          <span className="neon-badge-sub">AI CHALLENGE</span>
        </div>

        <div className="neon-header-stats">
          <div className="neon-stat-pill">
            <span className="pill-label">BEST</span>
            <span className="pill-val">{stats.highScore.toLocaleString()}</span>
          </div>

          {gameState === 'PLAYING' && (
            <div className={`neon-stat-pill multiplier-pill ${stats.multiplier > 1 ? 'is-active' : ''}`}>
              <span className="pill-label">COMBO</span>
              <span className="pill-val">{stats.multiplier}x</span>
            </div>
          )}

          <button
            type="button"
            className="neon-icon-btn"
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            type="button"
            className="neon-icon-btn neon-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? '⤦' : '⛶'}
          </button>
        </div>
      </div>

      {/* 2. 3D WEBGL VIEWPORT */}
      <div className="neon-viewport">
        {webGLSupported ? (
          <canvas ref={canvasRef} className="neon-canvas" />
        ) : (
          <div className="neon-fallback-card">
            <h3>WEBGL ACCELERATION REQUIRED</h3>
            <p>Please enable hardware acceleration in your browser to pilot the 3D hover-drone.</p>
          </div>
        )}

        {/* ACTIVE GAMEPLAY HUD (Scores & Distance) */}
        {gameState === 'PLAYING' && (
          <div className="neon-in-game-hud">
            <div className="hud-metric score-metric">
              <span className="hud-metric-label">SCORE</span>
              <span className="hud-metric-val">{stats.score.toLocaleString()}</span>
            </div>

            <div className="hud-metric distance-metric">
              <span className="hud-metric-label">DISTANCE</span>
              <span className="hud-metric-val">{stats.distance}m</span>
            </div>

            <div className="hud-metric cores-metric">
              <span className="hud-metric-label">CORES</span>
              <span className="hud-metric-val">⬡ {stats.coresCollected}</span>
            </div>

            {/* Energy Meter Bar */}
            <div className="hud-energy-bar-wrap" title={`Shield Energy: ${stats.energy}%`}>
              <div className="hud-energy-fill" style={{ width: `${stats.energy}%` }} />
            </div>

            {/* Floating Combo Collect Popups */}
            {comboPopup && (
              <div key={comboPopup.id} className="hud-combo-popup" aria-live="polite">
                {comboPopup.text}
              </div>
            )}

            {/* Pause Button for Touch/Desktop */}
            <button
              type="button"
              className="hud-pause-btn"
              onClick={handlePause}
              title="Pause Game (Esc or P)"
              aria-label="Pause game"
            >
              ❚❚
            </button>
          </div>
        )}

        {/* MOBILE ON-SCREEN CONTROLS (Only visible during active gameplay on touch devices) */}
        {gameState === 'PLAYING' && (
          <div className="neon-mobile-controls" aria-label="On-screen touch controls">
            <div className="mobile-touch-cluster left-cluster">
              <button
                type="button"
                className="mobile-btn btn-left"
                onPointerDown={(e) => {
                  e.preventDefault()
                  sceneRef.current?.shiftLane(-1)
                }}
                aria-label="Steer Left"
              >
                ◀
              </button>
              <button
                type="button"
                className="mobile-btn btn-right"
                onPointerDown={(e) => {
                  e.preventDefault()
                  sceneRef.current?.shiftLane(1)
                }}
                aria-label="Steer Right"
              >
                ▶
              </button>
            </div>

            <div className="mobile-touch-cluster right-cluster">
              <button
                type="button"
                className="mobile-btn btn-jump"
                onPointerDown={(e) => {
                  e.preventDefault()
                  sceneRef.current?.jump()
                }}
                aria-label="Hover Jump"
              >
                ▲ JUMP
              </button>
            </div>
          </div>
        )}

        {/* 3. READY STATE SCREEN (Start Screen) */}
        {gameState === 'READY' && (
          <div className="neon-modal-overlay start-modal" aria-live="polite">
            <div className="neon-modal-content">
              <div className="neon-modal-badge">
                <span className="live-dot" />
                <span>CYBER ARCADE • ARCHITECT CHALLENGE</span>
              </div>

              <h2 className="neon-modal-title">
                NEON CORE RUN<br />
                <em>AI DRIFT</em>
              </h2>

              <p className="neon-modal-lead">
                Pilot the quantum hover-drone through the high-velocity data tunnel. Dodge laser gates,
                leap over hurdles, and capture energy cores to architect your highest score.
              </p>

              <div className="neon-controls-guide">
                <div className="guide-row">
                  <span className="guide-key">A / ◀</span>
                  <span className="guide-key">D / ▶</span>
                  <span className="guide-desc">Steer Lanes</span>
                </div>
                <div className="guide-row">
                  <span className="guide-key">SPACE / ▲</span>
                  <span className="guide-desc">Jump Laser Hurdles</span>
                </div>
                <div className="guide-row">
                  <span className="guide-key">P / ESC</span>
                  <span className="guide-desc">Pause</span>
                </div>
                <div className="guide-row">
                  <span className="guide-key">F / ⛶</span>
                  <span className="guide-desc">Fullscreen Mode</span>
                </div>
              </div>

              <div className="neon-modal-actions">
                <button
                  type="button"
                  className="button button-canvas-cta neon-launch-cta"
                  onClick={handleStartCountdown}
                >
                  LAUNCH RUN <span>⚡</span>
                </button>
              </div>

              {stats.highScore > 0 && (
                <div className="neon-record-tag">
                  CURRENT BEST RUN: <strong>{stats.highScore.toLocaleString()} PTS</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. COUNTDOWN OVERLAY */}
        {gameState === 'COUNTDOWN' && (
          <div className="neon-countdown-overlay" aria-live="assertive">
            <div className="countdown-number">{countdownNum}</div>
            <div className="countdown-label">PREPARING THRUSTERS...</div>
          </div>
        )}

        {/* 5. PAUSE MODAL OVERLAY */}
        {gameState === 'PAUSED' && (
          <div className="neon-modal-overlay pause-modal" role="dialog" aria-modal="true">
            <div className="neon-modal-content">
              <div className="neon-modal-badge">SYSTEM PAUSED</div>
              <h2 className="neon-modal-title">RUN SUSPENDED</h2>

              <div className="neon-pause-stats">
                <div>
                  <small>CURRENT SCORE</small>
                  <strong>{stats.score.toLocaleString()}</strong>
                </div>
                <div>
                  <small>DISTANCE</small>
                  <strong>{stats.distance}m</strong>
                </div>
              </div>

              <div className="neon-modal-actions">
                <button
                  type="button"
                  className="button button-canvas-cta"
                  onClick={handleResume}
                >
                  RESUME RUN <span>▶</span>
                </button>
                <button
                  type="button"
                  className="button button-replay"
                  onClick={handleRestart}
                >
                  RESTART <span>↻</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. GAME OVER MODAL OVERLAY */}
        {gameState === 'GAMEOVER' && (
          <div className="neon-modal-overlay gameover-modal" aria-live="assertive">
            <div className="neon-modal-content">
              <div className="neon-modal-badge is-alert">
                <span className="alert-dot" />
                SYSTEM COLLISION
              </div>

              <h2 className="neon-modal-title">RUN TERMINATED</h2>

              {stats.score >= stats.highScore && stats.score > 0 && (
                <div className="neon-new-record-pill">★ NEW ALL-TIME BEST RECORD! ★</div>
              )}

              <div className="neon-gameover-stats-grid">
                <div className="stat-card">
                  <span className="card-label">FINAL SCORE</span>
                  <span className="card-value highlight-cyan">{stats.score.toLocaleString()}</span>
                </div>
                <div className="stat-card">
                  <span className="card-label">DISTANCE REACHED</span>
                  <span className="card-value">{stats.distance}m</span>
                </div>
                <div className="stat-card">
                  <span className="card-label">CORES CAPTURED</span>
                  <span className="card-value highlight-magenta">⬡ {stats.coresCollected}</span>
                </div>
                <div className="stat-card">
                  <span className="card-label">ALL-TIME BEST</span>
                  <span className="card-value">{stats.highScore.toLocaleString()}</span>
                </div>
              </div>

              <div className="neon-modal-actions">
                <button
                  type="button"
                  className="button button-canvas-cta"
                  onClick={handleRestart}
                >
                  PILOT AGAIN <span>↻</span>
                </button>

                <button
                  type="button"
                  className="button button-replay"
                  onClick={() =>
                    onOpenContact?.(
                      `Hi Santhosh, I scored ${stats.score.toLocaleString()} points (${stats.distance}m) in NEON CORE RUN! Let's engineer a high-velocity 3D system or AI web application.`
                    )
                  }
                >
                  DISPATCH SYSTEM BRIEF <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. FOOTER CONTROLS & QUICK LANE INDICATORS */}
      <div className="neon-footer-bar">
        <div className="neon-lanes-indicator" role="tablist" aria-label="Tunnel Lanes">
          {([-1, 0, 1] as LaneIndex[]).map((lane) => (
            <button
              key={lane}
              type="button"
              className={`neon-lane-tab ${currentLane === lane ? 'is-active' : ''}`}
              onClick={() => {
                sceneRef.current?.setLane(lane)
                setCurrentLane(lane)
              }}
              title={`Switch to ${lane === -1 ? 'Left' : lane === 0 ? 'Center' : 'Right'} Lane`}
              aria-label={`${lane === -1 ? 'Left' : lane === 0 ? 'Center' : 'Right'} Lane`}
            >
              {lane === -1 ? 'LEFT' : lane === 0 ? 'CENTER' : 'RIGHT'}
            </button>
          ))}
        </div>

        <div className="neon-footer-tagline">
          <span>HIGH-VELOCITY 3D WEBGL • SANTHOSH AI LAB</span>
        </div>
      </div>
    </div>
  )
}

export default AIArchitectChallenge
