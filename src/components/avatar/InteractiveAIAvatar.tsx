import React, { useEffect, useRef, useState, useCallback } from 'react'
import { AIAvatarScene } from './scene/AIAvatarScene'
import { type AvatarState } from './scene/AvatarController'
import { AvatarHUD } from './AvatarHUD'
import './InteractiveAIAvatar.css'

interface InteractiveAIAvatarProps {
  onOpenContact?: () => void
}

const SPEECH_SCRIPTS = [
  "Hello! I am Santhosh, AI Architect and Creative Technologist. I design intelligent agent workflows, multimodal systems, and high-performance WebGL digital experiences. Welcome to MAANVI CREATION.",
  "At MAANVI CREATION, we turn human ideas into production-grade systems. From custom enterprise AI models to real-time 3D simulation, we build the future today.",
  "Looking to architect next-generation AI platforms or cinematic interactive web applications? Let's connect and engineer something extraordinary.",
]

export const InteractiveAIAvatar: React.FC<InteractiveAIAvatarProps> = ({ onOpenContact }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<AIAvatarScene | null>(null)
  const [currentState, setCurrentState] = useState<AvatarState>('IDLE')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const scriptIndexRef = useRef(0)

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    const scene = new AIAvatarScene({
      container: containerRef.current,
      onStateChange: (state) => setCurrentState(state),
    })

    sceneRef.current = scene

    return () => {
      scene.destroy()
      sceneRef.current = null
    }
  }, [])

  // Pointer tracking helpers
  const updatePointer = useCallback((clientX: number, clientY: number, isInside: boolean, isTouch = false) => {
    if (!containerRef.current || !sceneRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1)

    sceneRef.current.setPointer(
      Math.max(-1, Math.min(1, x)),
      Math.max(-1, Math.min(1, y)),
      isInside,
      isTouch
    )
  }, [])

  // Mouse / Pointer handlers
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return
      updatePointer(e.clientX, e.clientY, true, false)
    },
    [updatePointer]
  )

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'touch') return
      updatePointer(e.clientX, e.clientY, true, false)
    },
    [updatePointer]
  )

  const handlePointerLeave = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.setPointer(0, 0, false, false)
  }, [])

  // Touch handlers (First-class mobile responsiveness)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch || !sceneRef.current) return
      sceneRef.current.handleTouchStart()
      updatePointer(touch.clientX, touch.clientY, true, true)
    },
    [updatePointer]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touch = e.touches[0]
      if (!touch) return
      updatePointer(touch.clientX, touch.clientY, true, true)
    },
    [updatePointer]
  )

  const handleTouchEnd = useCallback(() => {
    if (!sceneRef.current) return
    sceneRef.current.setPointer(0, 0, false, true)
  }, [])

  const handleSelectState = useCallback((state: AvatarState) => {
    setCurrentState(state)
    if (sceneRef.current) {
      sceneRef.current.setState(state)
    }
  }, [])

  const handleToggleSpeech = useCallback(() => {
    if (!sceneRef.current) return

    if (isSpeaking) {
      sceneRef.current.stopSpeaking()
      setIsSpeaking(false)
    } else {
      const script = SPEECH_SCRIPTS[scriptIndexRef.current % SPEECH_SCRIPTS.length]
      scriptIndexRef.current++

      sceneRef.current.speak(
        script,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      )
    }
  }, [isSpeaking])

  return (
    <div
      className="ai-avatar-chamber"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      role="region"
      aria-label="MAANVI CREATION Real 3D Digital Human AI Avatar"
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="ai-avatar-canvas-host" />

      {/* Minimal Edge-Pinned Cybernetic HUD (No face obstruction) */}
      <AvatarHUD
        currentState={currentState}
        isSpeaking={isSpeaking}
        onSelectState={handleSelectState}
        onToggleSpeech={handleToggleSpeech}
        onOpenContact={onOpenContact}
      />
    </div>
  )
}
