import React from 'react'
import { type AvatarState } from './scene/AvatarController'

interface AvatarHUDProps {
  currentState: AvatarState
  isSpeaking: boolean
  onSelectState: (state: AvatarState) => void
  onToggleSpeech: () => void
  onOpenContact?: () => void
}

const AVAILABLE_STATES: AvatarState[] = ['AWARE', 'CURIOUS', 'ENGAGED', 'THINKING', 'RESPONDING']

export const AvatarHUD: React.FC<AvatarHUDProps> = ({
  currentState,
  isSpeaking,
  onSelectState,
  onToggleSpeech,
  onOpenContact,
}) => {
  return (
    <div className="avatar-hud-overlay" aria-label="Santhosh AI Architect Entity HUD">
      {/* Top Left Branding */}
      <div className="hud-edge-top-left">
        <div className="hud-brand-header">
          <span className="hud-brand-emblem">M</span>
          <div>
            <div className="hud-brand-title">MAANVI CREATION</div>
            <div className="hud-brand-sub">IDEAS × AI × MOTION</div>
          </div>
        </div>
      </div>

      {/* Top Right: Exact Telemetry HUD Card from Reference */}
      <div className="hud-edge-top-right">
        <div className="hud-telemetry-box">
          <div className="hud-telemetry-header">
            <span className="telemetry-label">AI ENTITY</span>
            <span className="hud-live-tag">
              <span className="hud-status-dot" />
              ONLINE
            </span>
          </div>

          <div className="hud-telemetry-table">
            <div className="hud-telemetry-row">
              <span className="row-key">MODE</span>
              <span className="row-val">CREATIVE</span>
            </div>
            <div className="hud-telemetry-row">
              <span className="row-key">STATE</span>
              <span className="row-val highlight">{currentState}</span>
            </div>
            <div className="hud-telemetry-row">
              <span className="row-key">ENV</span>
              <span className="row-val">3D REALTIME</span>
            </div>
            <div className="hud-telemetry-row">
              <span className="row-key">IMPACT</span>
              <span className="row-val active">ACTIVE</span>
            </div>
          </div>

          <div className="hud-signature-block">
            <div className="hud-signature-text">Santhosh</div>
            <div className="hud-signature-role">AI ARCHITECT</div>
            <div className="hud-signature-tagline">HUMAN IDEAS. AI POSSIBILITIES.</div>
          </div>
        </div>
      </div>

      {/* Left-Side Vertical Capability Badges */}
      <div className="hud-edge-left-badges" aria-hidden="true">
        <div className="hud-cap-badge">
          <span className="cap-icon">⚡</span>
          <span className="cap-text">AI / ML</span>
        </div>
        <div className="hud-cap-badge">
          <span className="cap-icon">💻</span>
          <span className="cap-text">CREATIVE TECH</span>
        </div>
        <div className="hud-cap-badge">
          <span className="cap-icon">🧊</span>
          <span className="cap-text">3D DIGITAL HUMAN</span>
        </div>
        <div className="hud-cap-badge">
          <span className="cap-icon">☁️</span>
          <span className="cap-text">CLOUD &amp; AGENTS</span>
        </div>
        <div className="hud-cap-badge">
          <span className="cap-icon">💡</span>
          <span className="cap-text">IDEA TO IMPACT</span>
        </div>
      </div>

      {/* Bottom Center: Interactive State Switcher Chips + Live Speech Trigger */}
      <div className="hud-edge-bottom">
        <div className="hud-speech-trigger-container">
          <button
            type="button"
            className={`hud-speech-btn ${isSpeaking ? 'is-speaking' : ''}`}
            onClick={onToggleSpeech}
            title={isSpeaking ? 'Mute speech' : 'Hear Santhosh AI speak in real-time'}
            aria-pressed={isSpeaking}
          >
            <span className="speech-icon">
              {isSpeaking ? (
                <span className="audio-bars">
                  <span className="bar bar-1" />
                  <span className="bar bar-2" />
                  <span className="bar bar-3" />
                  <span className="bar bar-4" />
                </span>
              ) : (
                '🎙️'
              )}
            </span>
            <span className="speech-label">
              {isSpeaking ? 'SANTHOSH SPEAKING...' : 'TALK WITH SANTHOSH AI'}
            </span>
            <span className="speech-badge">LIVE 3D</span>
          </button>
        </div>

        <div className="hud-mode-chips" role="tablist" aria-label="Avatar Neural Modes">
          {AVAILABLE_STATES.map((state) => {
            const isActive = currentState === state
            return (
              <button
                key={state}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`hud-mode-chip ${isActive ? 'active' : ''}`}
                onClick={() => onSelectState(state)}
              >
                <span className="chip-dot" />
                {state}
              </button>
            )
          })}
        </div>

        {onOpenContact && (
          <button
            type="button"
            className="hud-collaborate-link"
            onClick={onOpenContact}
          >
            Initiate Architecture Discussion <span>↗</span>
          </button>
        )}
      </div>
    </div>
  )
}
