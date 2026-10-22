/**
 * SoundManager — Procedural Web Audio API Synthesizer
 * High-performance, zero-asset, zero-latency arcade audio synthesizer.
 * Operates purely through Web Audio oscillators, gain envelopes, and biquad filters.
 */
export class SoundManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private engineOsc: OscillatorNode | null = null
  private engineGain: GainNode | null = null
  public isMuted = false

  constructor() {
    // AudioContext will be initialized upon first user interaction
  }

  private initContext(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }
      return true
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return false

      this.ctx = new AudioCtx()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime)
      this.masterGain.connect(this.ctx.destination)
      return true
    } catch {
      return false
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.6, this.ctx.currentTime, 0.05)
    }
    if (muted) {
      this.stopEngine()
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted)
    return this.isMuted
  }

  public playLaneSwitch(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(420, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1600, now)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.11)
  }

  public playJump(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(240, now)
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.22)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.26)
  }

  public playCollectCore(combo = 1): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const baseFreq = 523.25 * Math.min(2.5, 1 + (combo - 1) * 0.15) // C5 note scaled by combo

    // Harmonized dual chime
    ;[baseFreq, baseFreq * 1.5].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.035)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.33, now + 0.18 + idx * 0.035)

      gain.gain.setValueAtTime(0.25, now + idx * 0.035)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22 + idx * 0.035)

      osc.connect(gain)
      gain.connect(this.masterGain)

      osc.start(now + idx * 0.035)
      osc.stop(now + 0.24 + idx * 0.035)
    })
  }

  public playCollectShard(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(987.77, now) // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08) // E6

    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.13)
  }

  public playCollision(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime

    // 1. Deep sub-bass boom
    const subOsc = this.ctx.createOscillator()
    const subGain = this.ctx.createGain()

    subOsc.type = 'sawtooth'
    subOsc.frequency.setValueAtTime(140, now)
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45)

    subGain.gain.setValueAtTime(0.6, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    subOsc.connect(subGain)
    subGain.connect(this.masterGain)

    subOsc.start(now)
    subOsc.stop(now + 0.52)

    // 2. White noise impact crunch
    const bufferSize = this.ctx.sampleRate * 0.3
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = this.ctx.createBufferSource()
    noise.buffer = buffer

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.3)

    const noiseGain = this.ctx.createGain()
    noiseGain.gain.setValueAtTime(0.4, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)

    noise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(this.masterGain)

    noise.start(now)
    noise.stop(now + 0.33)
  }

  public playCountdown(isGo = false): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = isGo ? 'triangle' : 'sine'
    const freq = isGo ? 880 : 440 // A5 for GO, A4 for 3-2-1
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.35 : 0.18))

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + (isGo ? 0.36 : 0.19))
  }

  public playButton(): void {
    if (this.isMuted || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, now)
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.04)

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.05)
  }

  public startEngine(): void {
    if (this.isMuted || this.engineOsc || !this.initContext() || !this.ctx || !this.masterGain) return

    const now = this.ctx.currentTime
    this.engineOsc = this.ctx.createOscillator()
    this.engineGain = this.ctx.createGain()

    this.engineOsc.type = 'sawtooth'
    this.engineOsc.frequency.setValueAtTime(75, now)

    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(260, now)

    this.engineGain.gain.setValueAtTime(0.08, now)

    this.engineOsc.connect(filter)
    filter.connect(this.engineGain)
    this.engineGain.connect(this.masterGain)

    this.engineOsc.start(now)
  }

  public updateEnginePitch(speedRatio: number): void {
    if (!this.engineOsc || !this.ctx) return
    const targetFreq = 75 + speedRatio * 85
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1)
  }

  public stopEngine(): void {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop()
        this.engineOsc.disconnect()
      } catch {
        // Ignored
      }
      this.engineOsc = null
      this.engineGain = null
    }
  }

  public dispose(): void {
    this.stopEngine()
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
  }
}
