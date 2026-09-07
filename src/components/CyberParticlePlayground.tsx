import React, { useEffect, useRef, useState, useCallback } from 'react'
import './CyberParticlePlayground.css'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  alpha: number
  baseX: number
  baseY: number
}

interface TargetNode {
  id: number
  x: number
  y: number
  radius: number
  color: string
  life: number
  maxLife: number
}

interface CyberParticlePlaygroundProps {
  onOpenContact?: (message?: string) => void
}

export const CyberParticlePlayground: React.FC<CyberParticlePlaygroundProps> = ({ onOpenContact }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mode, setMode] = useState<'vortex' | 'catcher'>('vortex')
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [showReward, setShowReward] = useState<boolean>(false)
  const [combo, setCombo] = useState<number>(0)

  const mousePos = useRef<{ x: number; y: number; isDown: boolean }>({ x: -1000, y: -1000, isDown: false })
  const shockwaves = useRef<{ x: number; y: number; radius: number; maxRadius: number; color: string }[]>([])
  const particles = useRef<Particle[]>([])
  const targetNodes = useRef<TargetNode[]>([])
  const nextTargetId = useRef<number>(1)
  const animFrameId = useRef<number>(0)

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f59e0b']
    const count = 55
    const pts: Particle[] = []

    for (let i = 0; i < count; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      pts.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3
      })
    }
    particles.current = pts
  }, [])

  // Spawn new target in catcher mode
  const spawnTarget = useCallback((width: number, height: number) => {
    const padding = 30
    const colors = ['#38bdf8', '#34d399', '#f59e0b', '#ec4899']
    targetNodes.current.push({
      id: nextTargetId.current++,
      x: padding + Math.random() * (width - padding * 2),
      y: padding + Math.random() * (height - padding * 2),
      radius: Math.random() * 6 + 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 220
    })
  }, [])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    initParticles(rect.width, rect.height)

    let lastSpawn = Date.now()

    const render = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      // Clear with trail effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.28)'
      ctx.fillRect(0, 0, w, h)

      // Draw Shockwaves
      for (let i = shockwaves.current.length - 1; i >= 0; i--) {
        const sw = shockwaves.current[i]
        sw.radius += 4
        const alpha = Math.max(0, 1 - sw.radius / sw.maxRadius)

        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
        ctx.strokeStyle = sw.color
        ctx.lineWidth = 2.5 * alpha
        ctx.stroke()

        if (sw.radius >= sw.maxRadius) {
          shockwaves.current.splice(i, 1)
        }
      }

      // Draw & Connect Particles
      const pts = particles.current
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]

        // Gravity vortex attraction to cursor
        if (mousePos.current.x > 0) {
          const dx = mousePos.current.x - p.x
          const dy = mousePos.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 140

          if (dist < maxDist && dist > 1) {
            const force = (1 - dist / maxDist) * (mousePos.current.isDown ? 0.35 : 0.08)
            p.vx += (dx / dist) * force
            p.vy += (dy / dist) * force
          }
        }

        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96

        // Bounce on boundaries
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        // Draw particle node
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0

        // Neural connections between nearby particles
        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 65) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - dist / 65) * 0.35})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Mode: Catcher Targets
      if (mode === 'catcher') {
        if (Date.now() - lastSpawn > 1100 && targetNodes.current.length < 5) {
          spawnTarget(w, h)
          lastSpawn = Date.now()
        }

        for (let i = targetNodes.current.length - 1; i >= 0; i--) {
          const target = targetNodes.current[i]
          target.life++

          const progress = target.life / target.maxLife
          const pulse = Math.sin(progress * Math.PI * 6) * 3
          const currentRadius = Math.max(2, target.radius + pulse)
          const alpha = Math.max(0, 1 - progress)

          // Glowing Outer ring
          ctx.beginPath()
          ctx.arc(target.x, target.y, currentRadius + 6, 0, Math.PI * 2)
          ctx.strokeStyle = target.color
          ctx.lineWidth = 1.5 * alpha
          ctx.stroke()

          // Core Node
          ctx.beginPath()
          ctx.arc(target.x, target.y, currentRadius, 0, Math.PI * 2)
          ctx.fillStyle = target.color
          ctx.shadowColor = target.color
          ctx.shadowBlur = 12
          ctx.fill()
          ctx.shadowBlur = 0

          // Center indicator
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 9px monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('+10', target.x, target.y)

          if (target.life >= target.maxLife) {
            targetNodes.current.splice(i, 1)
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render)
    }

    render()

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      initParticles(rect.width, rect.height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameId.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [mode, initParticles, spawnTarget])

  // Mouse & Touch interactions
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePos.current.x = e.clientX - rect.left
    mousePos.current.y = e.clientY - rect.top
  }

  const handlePointerLeave = () => {
    mousePos.current.x = -1000
    mousePos.current.y = -1000
    mousePos.current.isDown = false
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    mousePos.current.isDown = true

    // Add shockwave
    shockwaves.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 75,
      color: mode === 'catcher' ? '#f59e0b' : '#38bdf8'
    })

    // Mode: Catcher Hit Test
    if (mode === 'catcher') {
      let hit = false
      for (let i = targetNodes.current.length - 1; i >= 0; i--) {
        const target = targetNodes.current[i]
        const dx = x - target.x
        const dy = y - target.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist <= target.radius + 12) {
          hit = true
          targetNodes.current.splice(i, 1)
          
          setScore((prev) => {
            const next = prev + 10
            if (next > highScore) setHighScore(next)
            if (next >= 100 && !showReward) {
              setShowReward(true)
            }
            return next
          })
          setCombo((c) => c + 1)
          break
        }
      }

      if (!hit) {
        setCombo(0)
      }
    } else {
      // Vortex burst: push particles outward
      particles.current.forEach((p) => {
        const dx = p.x - x
        const dy = p.y - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 1) {
          p.vx += (dx / dist) * 7
          p.vy += (dy / dist) * 7
        }
      })
      setScore((s) => s + 1)
    }
  }

  const handlePointerUp = () => {
    mousePos.current.isDown = false
  }

  const handleClaimDiscount = () => {
    onOpenContact?.('Hi Maanvi Creation, I scored 100+ points on your Cyber Playground and unlocked the 10% discount code MAANVI10!')
  }

  return (
    <div className="cyber-playground-card reveal-on-scroll" data-cursor="PLAY">
      <div className="playground-header">
        <div className="playground-badge">
          <span className="live-dot"></span>
          <span>⚡ Quantum Neural Sandbox</span>
        </div>

        <div className="playground-stats">
          <div className="stat-pill">
            SCORE: <b>{score}</b>
          </div>
          {combo > 1 && (
            <div className="stat-pill" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
              COMBO: <b>x{combo}</b>
            </div>
          )}
        </div>
      </div>

      <div className="playground-canvas-box">
        <canvas
          ref={canvasRef}
          className="playground-canvas"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />
        <div className="playground-cue">
          <span>{mode === 'vortex' ? '⚡ Click & Drag to Warp Gravity' : '🎯 Tap Glowing Nodes to Score'}</span>
          <span className="cue-pulse">{score >= 100 ? '🎉 10% UNLOCKED' : '🎯 Score 100 for 10% OFF'}</span>
        </div>
      </div>

      <div className="playground-footer">
        <div className="mode-selector">
          <button
            className={`mode-btn ${mode === 'vortex' ? 'is-active' : ''}`}
            onClick={() => setMode('vortex')}
          >
            Gravity Vortex
          </button>
          <button
            className={`mode-btn ${mode === 'catcher' ? 'is-active' : ''}`}
            onClick={() => setMode('catcher')}
          >
            Node Catcher
          </button>
        </div>

        <button className="claim-btn" onClick={() => setShowReward(true)}>
          Claim 10% Discount <span>🎁</span>
        </button>
      </div>

      {/* Reward Unlock Overlay Modal */}
      {showReward && (
        <div className="reward-banner">
          <div className="reward-icon">🏆</div>
          <h4>10% Project Discount Unlocked!</h4>
          <p>
            Congratulations! You engaged with our interactive AI sandbox. Use this code on your next website, app, or video ad.
          </p>
          <div className="reward-code-box">CODE: MAANVI10</div>
          <div className="reward-actions">
            <button className="claim-btn" onClick={handleClaimDiscount}>
              Redeem on WhatsApp <span>↗</span>
            </button>
            <button className="reward-close" onClick={() => setShowReward(false)}>
              Keep Playing
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
