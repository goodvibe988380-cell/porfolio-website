import { PersonalAvatarModel } from './PersonalAvatarModel'

export type VisemeType =
  | 'AA'
  | 'AE'
  | 'AH'
  | 'AO'
  | 'AW'
  | 'EH'
  | 'ER'
  | 'IH'
  | 'IY'
  | 'UH'
  | 'UW'
  | 'M'
  | 'B'
  | 'P'
  | 'F'
  | 'V'
  | 'TH'
  | 'D'
  | 'T'
  | 'N'
  | 'L'
  | 'S'
  | 'Z'
  | 'SH'
  | 'CH'
  | 'K'
  | 'G'
  | 'R'
  | 'SILENCE'

interface VisemeMorphWeights {
  jawOpen: number
  mouthFunnel: number
  mouthPucker: number
  mouthSmileLeft: number
  mouthSmileRight: number
  mouthClose: number
  browInnerUp: number
}

const VISEME_WEIGHTS_MAP: Record<VisemeType, VisemeMorphWeights> = {
  AA: { jawOpen: 0.85, mouthFunnel: 0.25, mouthPucker: 0.0, mouthSmileLeft: 0.1, mouthSmileRight: 0.1, mouthClose: 0.0, browInnerUp: 0.1 },
  AE: { jawOpen: 0.70, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.45, mouthSmileRight: 0.45, mouthClose: 0.0, browInnerUp: 0.15 },
  AH: { jawOpen: 0.65, mouthFunnel: 0.2, mouthPucker: 0.0, mouthSmileLeft: 0.15, mouthSmileRight: 0.15, mouthClose: 0.0, browInnerUp: 0.05 },
  AO: { jawOpen: 0.75, mouthFunnel: 0.65, mouthPucker: 0.2, mouthSmileLeft: 0.0, mouthSmileRight: 0.0, mouthClose: 0.0, browInnerUp: 0.1 },
  AW: { jawOpen: 0.80, mouthFunnel: 0.50, mouthPucker: 0.3, mouthSmileLeft: 0.05, mouthSmileRight: 0.05, mouthClose: 0.0, browInnerUp: 0.1 },
  EH: { jawOpen: 0.55, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.35, mouthSmileRight: 0.35, mouthClose: 0.0, browInnerUp: 0.1 },
  ER: { jawOpen: 0.40, mouthFunnel: 0.2, mouthPucker: 0.2, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthClose: 0.0, browInnerUp: 0.05 },
  IH: { jawOpen: 0.35, mouthFunnel: 0.05, mouthPucker: 0.0, mouthSmileLeft: 0.55, mouthSmileRight: 0.55, mouthClose: 0.0, browInnerUp: 0.1 },
  IY: { jawOpen: 0.30, mouthFunnel: 0.0, mouthPucker: 0.0, mouthSmileLeft: 0.75, mouthSmileRight: 0.75, mouthClose: 0.0, browInnerUp: 0.15 },
  UH: { jawOpen: 0.40, mouthFunnel: 0.45, mouthPucker: 0.55, mouthSmileLeft: 0.0, mouthSmileRight: 0.0, mouthClose: 0.0, browInnerUp: 0.05 },
  UW: { jawOpen: 0.35, mouthFunnel: 0.50, mouthPucker: 0.85, mouthSmileLeft: 0.0, mouthSmileRight: 0.0, mouthClose: 0.0, browInnerUp: 0.1 },
  M: { jawOpen: 0.0, mouthFunnel: 0.0, mouthPucker: 0.0, mouthSmileLeft: 0.0, mouthSmileRight: 0.0, mouthClose: 0.95, browInnerUp: 0.0 },
  B: { jawOpen: 0.05, mouthFunnel: 0.0, mouthPucker: 0.0, mouthSmileLeft: 0.05, mouthSmileRight: 0.05, mouthClose: 0.90, browInnerUp: 0.05 },
  P: { jawOpen: 0.05, mouthFunnel: 0.0, mouthPucker: 0.0, mouthSmileLeft: 0.05, mouthSmileRight: 0.05, mouthClose: 0.90, browInnerUp: 0.05 },
  F: { jawOpen: 0.20, mouthFunnel: 0.1, mouthPucker: 0.25, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthClose: 0.4, browInnerUp: 0.05 },
  V: { jawOpen: 0.20, mouthFunnel: 0.1, mouthPucker: 0.25, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthClose: 0.4, browInnerUp: 0.05 },
  TH: { jawOpen: 0.25, mouthFunnel: 0.15, mouthPucker: 0.1, mouthSmileLeft: 0.25, mouthSmileRight: 0.25, mouthClose: 0.1, browInnerUp: 0.1 },
  D: { jawOpen: 0.30, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.3, mouthSmileRight: 0.3, mouthClose: 0.0, browInnerUp: 0.05 },
  T: { jawOpen: 0.30, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.3, mouthSmileRight: 0.3, mouthClose: 0.0, browInnerUp: 0.05 },
  N: { jawOpen: 0.25, mouthFunnel: 0.05, mouthPucker: 0.0, mouthSmileLeft: 0.35, mouthSmileRight: 0.35, mouthClose: 0.0, browInnerUp: 0.05 },
  L: { jawOpen: 0.40, mouthFunnel: 0.15, mouthPucker: 0.0, mouthSmileLeft: 0.3, mouthSmileRight: 0.3, mouthClose: 0.0, browInnerUp: 0.1 },
  S: { jawOpen: 0.20, mouthFunnel: 0.05, mouthPucker: 0.0, mouthSmileLeft: 0.5, mouthSmileRight: 0.5, mouthClose: 0.0, browInnerUp: 0.05 },
  Z: { jawOpen: 0.20, mouthFunnel: 0.05, mouthPucker: 0.0, mouthSmileLeft: 0.5, mouthSmileRight: 0.5, mouthClose: 0.0, browInnerUp: 0.05 },
  SH: { jawOpen: 0.30, mouthFunnel: 0.4, mouthPucker: 0.35, mouthSmileLeft: 0.15, mouthSmileRight: 0.15, mouthClose: 0.0, browInnerUp: 0.1 },
  CH: { jawOpen: 0.35, mouthFunnel: 0.35, mouthPucker: 0.3, mouthSmileLeft: 0.2, mouthSmileRight: 0.2, mouthClose: 0.0, browInnerUp: 0.1 },
  K: { jawOpen: 0.45, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.25, mouthSmileRight: 0.25, mouthClose: 0.0, browInnerUp: 0.05 },
  G: { jawOpen: 0.45, mouthFunnel: 0.1, mouthPucker: 0.0, mouthSmileLeft: 0.25, mouthSmileRight: 0.25, mouthClose: 0.0, browInnerUp: 0.05 },
  R: { jawOpen: 0.35, mouthFunnel: 0.3, mouthPucker: 0.4, mouthSmileLeft: 0.15, mouthSmileRight: 0.15, mouthClose: 0.0, browInnerUp: 0.05 },
  SILENCE: { jawOpen: 0.0, mouthFunnel: 0.0, mouthPucker: 0.0, mouthSmileLeft: 0.05, mouthSmileRight: 0.05, mouthClose: 0.0, browInnerUp: 0.0 },
}

export class LipSyncController {
  private isSpeakingActive = false
  private currentText = ''
  private speechUtterance: SpeechSynthesisUtterance | null = null

  // Procedural viseme stream
  private visemeQueue: { viseme: VisemeType; duration: number }[] = []
  private currentVisemeIndex = 0
  private visemeTimer = 0

  // Current interpolated morph targets (for silk-smooth coarticulation)
  private currentWeights: VisemeMorphWeights = {
    jawOpen: 0,
    mouthFunnel: 0,
    mouthPucker: 0,
    mouthSmileLeft: 0,
    mouthSmileRight: 0,
    mouthClose: 0,
    browInnerUp: 0,
  }

  // Communicative speech head motion
  public speechHeadNod = 0
  public speechEyebrowLift = 0

  private onSpeechStartCallback?: () => void
  private onSpeechEndCallback?: () => void

  constructor() {
    // Check speech synthesis support
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel() // Reset any pending audio
    }
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    this.stopSpeaking()

    this.currentText = text
    this.isSpeakingActive = true
    this.onSpeechStartCallback = onStart
    this.onSpeechEndCallback = onEnd

    // Generate viseme phoneme sequence based on text syllables
    this.visemeQueue = this.generateVisemeSequence(text)
    this.currentVisemeIndex = 0
    this.visemeTimer = 0

    if (this.onSpeechStartCallback) {
      this.onSpeechStartCallback()
    }

    // Trigger browser Text-to-Speech
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.02
        utterance.pitch = 0.95 // Natural confident architect resonance

        // Pick preferred English voice if available
        const voices = window.speechSynthesis.getVoices()
        const naturalVoice = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Daniel'))
        )
        if (naturalVoice) {
          utterance.voice = naturalVoice
        }

        utterance.onend = () => {
          this.finishSpeaking()
        }

        utterance.onerror = () => {
          // If audio fails or is blocked, continue procedural mouth animation until queue completes
        }

        this.speechUtterance = utterance
        window.speechSynthesis.speak(utterance)
      } catch (err) {
        console.warn('SpeechSynthesis error, falling back to procedural audio visemes:', err)
      }
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    this.speechUtterance = null
    this.isSpeakingActive = false
    this.visemeQueue = []
  }

  public isSpeaking(): boolean {
    return this.isSpeakingActive
  }

  public getCurrentText(): string {
    return this.currentText
  }

  private finishSpeaking(): void {
    this.isSpeakingActive = false
    this.speechUtterance = null
    if (this.onSpeechEndCallback) {
      this.onSpeechEndCallback()
    }
  }

  /**
   * Convert plain text words into an expressive sequence of viseme phonemes and durations
   */
  private generateVisemeSequence(text: string): { viseme: VisemeType; duration: number }[] {
    const words = text.toUpperCase().replace(/[^A-Z\s]/g, '').split(/\s+/).filter(Boolean)
    const seq: { viseme: VisemeType; duration: number }[] = []

    for (const word of words) {
      // Analyze phonetic clusters in word
      let i = 0
      while (i < word.length) {
        const twoChar = word.slice(i, i + 2)
        const char = word[i]

        if (twoChar === 'TH') {
          seq.push({ viseme: 'TH', duration: 0.12 })
          i += 2
        } else if (twoChar === 'SH' || twoChar === 'CH') {
          seq.push({ viseme: 'SH', duration: 0.13 })
          i += 2
        } else if (twoChar === 'EE' || twoChar === 'EA') {
          seq.push({ viseme: 'IY', duration: 0.16 })
          i += 2
        } else if (twoChar === 'OO') {
          seq.push({ viseme: 'UW', duration: 0.15 })
          i += 2
        } else if (twoChar === 'OU' || twoChar === 'OW') {
          seq.push({ viseme: 'AW', duration: 0.16 })
          i += 2
        } else if (char === 'A') {
          seq.push({ viseme: 'AA', duration: 0.14 })
          i++
        } else if (char === 'E') {
          seq.push({ viseme: 'EH', duration: 0.12 })
          i++
        } else if (char === 'I' || char === 'Y') {
          seq.push({ viseme: 'IH', duration: 0.13 })
          i++
        } else if (char === 'O') {
          seq.push({ viseme: 'AO', duration: 0.15 })
          i++
        } else if (char === 'U') {
          seq.push({ viseme: 'UH', duration: 0.13 })
          i++
        } else if (char === 'M' || char === 'B' || char === 'P') {
          seq.push({ viseme: 'M', duration: 0.10 })
          i++
        } else if (char === 'F' || char === 'V') {
          seq.push({ viseme: 'F', duration: 0.11 })
          i++
        } else if (char === 'S' || char === 'Z') {
          seq.push({ viseme: 'S', duration: 0.12 })
          i++
        } else if (char === 'D' || char === 'T' || char === 'N' || char === 'L') {
          seq.push({ viseme: 'T', duration: 0.11 })
          i++
        } else if (char === 'R') {
          seq.push({ viseme: 'R', duration: 0.12 })
          i++
        } else {
          seq.push({ viseme: 'AH', duration: 0.10 })
          i++
        }
      }

      // Micro pause between words
      seq.push({ viseme: 'SILENCE', duration: 0.08 })
    }

    return seq
  }

  /**
   * Called every frame in the Three.js render loop.
   * Smoothly interpolates ARKit morph targets on the avatar model.
   */
  public update(delta: number, model: PersonalAvatarModel): void {
    if (!model.isLoaded) return

    let targetWeights = VISEME_WEIGHTS_MAP.SILENCE

    if (this.isSpeakingActive && this.visemeQueue.length > 0) {
      this.visemeTimer += delta
      const currentItem = this.visemeQueue[this.currentVisemeIndex]

      if (currentItem) {
        targetWeights = VISEME_WEIGHTS_MAP[currentItem.viseme] || VISEME_WEIGHTS_MAP.SILENCE

        if (this.visemeTimer >= currentItem.duration) {
          this.visemeTimer = 0
          this.currentVisemeIndex++

          if (this.currentVisemeIndex >= this.visemeQueue.length) {
            // Reached end of viseme stream
            if (!this.speechUtterance) {
              this.finishSpeaking()
            } else {
              // Loop subtle communicative mouth movement if speech synthesis audio is still trailing
              this.currentVisemeIndex = 0
            }
          }
        }
      }

      // Communicative speech micro-gestures
      this.speechHeadNod = Math.sin(performance.now() * 0.006) * 0.022 + Math.cos(performance.now() * 0.0035) * 0.012
      this.speechEyebrowLift = targetWeights.browInnerUp * 0.8
    } else {
      this.speechHeadNod *= 0.88
      this.speechEyebrowLift *= 0.88
    }

    // Coarticulation smoothing (smooth damp towards target weights)
    const lerpRate = Math.min(1, delta * 22)
    this.currentWeights.jawOpen += (targetWeights.jawOpen - this.currentWeights.jawOpen) * lerpRate
    this.currentWeights.mouthFunnel += (targetWeights.mouthFunnel - this.currentWeights.mouthFunnel) * lerpRate
    this.currentWeights.mouthPucker += (targetWeights.mouthPucker - this.currentWeights.mouthPucker) * lerpRate
    this.currentWeights.mouthSmileLeft += (targetWeights.mouthSmileLeft - this.currentWeights.mouthSmileLeft) * lerpRate
    this.currentWeights.mouthSmileRight += (targetWeights.mouthSmileRight - this.currentWeights.mouthSmileRight) * lerpRate
    this.currentWeights.mouthClose += (targetWeights.mouthClose - this.currentWeights.mouthClose) * lerpRate
    this.currentWeights.browInnerUp += (targetWeights.browInnerUp - this.currentWeights.browInnerUp) * lerpRate

    // Apply directly to ARKit blendshapes on the 3D model
    model.setMorphTarget('jawOpen', this.currentWeights.jawOpen)
    model.setMorphTarget('mouthFunnel', this.currentWeights.mouthFunnel)
    model.setMorphTarget('mouthPucker', this.currentWeights.mouthPucker)
    model.setMorphTarget('mouthSmileLeft', this.currentWeights.mouthSmileLeft)
    model.setMorphTarget('mouthSmileRight', this.currentWeights.mouthSmileRight)
    model.setMorphTarget('mouthClose', this.currentWeights.mouthClose)
    model.setMorphTarget('browInnerUp', this.currentWeights.browInnerUp)
  }
}
