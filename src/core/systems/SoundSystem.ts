// ═══ 音效系统 ═══
// AS3 原始: iGlobal.Global.playSound() / soundOut()
//
// 使用 HTML5 Audio 播放 MP3 文件 + Web Audio API 合成音效
// 支持音效开关 (sound_toggle) 和淡出控制 (soundOut)

const SOUND_BASE = '/sounds/'

interface ActiveSound {
  audio: HTMLAudioElement
  fadeInterval?: ReturnType<typeof setInterval>
}

let audioCtx: AudioContext | null = null
let soundEnabled = true
const activeSounds: Map<string, ActiveSound> = new Map()

function getAudioContext(): AudioContext | null {
  if (audioCtx) return audioCtx
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    return audioCtx
  } catch {
    return null
  }
}

/**
 * 设置音效开关
 * AS3 原始: Global.sound_toggle
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

/**
 * 查询音效是否启用
 */
export function isSoundEnabled(): boolean {
  return soundEnabled
}

/**
 * 播放 MP3 音效文件
 * AS3 原始: Global.playSound() — soundChannel = sound.play()
 *
 * @param fileName 音效文件名 (不含路径，如 '2_blow_sound.mp3')
 * @param volume 音量 0-1，默认 1
 * @param loop 是否循环播放
 * @returns HTMLAudioElement 用于后续控制（如淡出）
 */
export function playSound(fileName: string, volume: number = 1, loop: boolean = false): HTMLAudioElement | null {
  if (!soundEnabled) return null

  try {
    const audio = new Audio(SOUND_BASE + fileName)
    audio.volume = volume
    audio.loop = loop

    audio.play().catch(() => {
      // 浏览器可能阻止自动播放，静默忽略
    })

    const key = fileName + '_' + Date.now()
    activeSounds.set(key, { audio })
    audio.addEventListener('ended', () => {
      activeSounds.delete(key)
    })

    return audio
  } catch {
    return null
  }
}

/**
 * 播放受击音效
 * AS3 原始: blow_sound
 */
export function playBlowSound(): void {
  playSound('2_blow_sound.mp3', 0.6)
}

/**
 * 播放吼叫音效
 * AS3 原始: yell_sound
 */
export function playYellSound(): void {
  playSound('3_yell_sound.mp3', 0.5)
}

/**
 * 音效淡出控制
 * AS3 原始: Global.soundOut() — Timer(100ms, 21次) 逐帧降低 SoundTransform.volume
 *
 * @param audio 要执行淡出的 Audio 元素
 * @param duration 淡出持续时间 (ms)，默认 2000
 */
export function soundOut(audio: HTMLAudioElement | null, duration: number = 2000): void {
  if (!audio) return

  const steps = 20
  const interval = duration / steps
  const startVolume = audio.volume
  let step = 0

  const timer = setInterval(() => {
    step++
    const newVol = startVolume * (1 - step / steps)
    audio.volume = Math.max(0, newVol)

    if (step >= steps) {
      clearInterval(timer)
      audio.pause()
      audio.currentTime = 0
    }
  }, interval)
}

/**
 * 停止所有正在播放的音效
 */
export function stopAllSounds(): void {
  activeSounds.forEach(({ audio, fadeInterval }) => {
    if (fadeInterval) clearInterval(fadeInterval)
    audio.pause()
    audio.currentTime = 0
  })
  activeSounds.clear()
}

// ═══ Web Audio API 合成音效 (无外部依赖) ═══

export type ForgeSoundType = 'success' | 'fail' | 'destroy'

/**
 * 播放锻造成功音效 — 上行琶音 C5→E5→G5
 */
function playSuccessSound(ctx: AudioContext): void {
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99]

  for (let i = 0; i < notes.length; i++) {
    const start = i * 0.15
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = notes[i]
    gain.gain.setValueAtTime(0, now + start)
    gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02)
    gain.gain.setValueAtTime(0.3, now + start + 0.1)
    gain.gain.linearRampToValueAtTime(0, now + start + 0.15)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + start)
    osc.stop(now + start + 0.15)
  }
}

/**
 * 播放锻造失败音效 — 下行双音 E4→C4
 */
function playFailSound(ctx: AudioContext): void {
  const now = ctx.currentTime
  const notes = [329.63, 261.63]

  for (let i = 0; i < notes.length; i++) {
    const start = i * 0.2
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = notes[i]
    osc.detune.value = 5
    gain.gain.setValueAtTime(0, now + start)
    gain.gain.linearRampToValueAtTime(0.12, now + start + 0.03)
    gain.gain.setValueAtTime(0.12, now + start + 0.12)
    gain.gain.linearRampToValueAtTime(0, now + start + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now + start)
    osc.stop(now + start + 0.2)
  }
}

/**
 * 播放装备销毁音效 — 白噪声 + 低频轰鸣
 */
function playDestroySound(ctx: AudioContext): void {
  const now = ctx.currentTime
  const duration = 0.4
  const sampleRate = ctx.sampleRate
  const bufferSize = sampleRate * duration
  const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate)
  const output = noiseBuffer.getChannelData(0)

  for (let i = 0; i < bufferSize; i++) {
    output[i] = (Math.random() * 2 - 1) * 0.3
  }

  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuffer

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.15, now)
  noiseGain.gain.linearRampToValueAtTime(0, now + duration)

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'highpass'
  noiseFilter.frequency.value = 1000

  noiseSource.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseSource.start(now)
  noiseSource.stop(now + duration)

  const rumbleOsc = ctx.createOscillator()
  const rumbleGain = ctx.createGain()
  rumbleOsc.type = 'sine'
  rumbleOsc.frequency.value = 60
  rumbleGain.gain.setValueAtTime(0.2, now)
  rumbleGain.gain.linearRampToValueAtTime(0, now + duration)
  rumbleOsc.connect(rumbleGain)
  rumbleGain.connect(ctx.destination)
  rumbleOsc.start(now)
  rumbleOsc.stop(now + duration)
}

/**
 * 播放锻造音效 (Web Audio API 合成)
 *
 * @param type 'success' | 'fail' | 'destroy'
 */
export function playForgeSound(type: ForgeSoundType): void {
  if (!soundEnabled) return

  const ctx = getAudioContext()
  if (!ctx) return

  try {
    switch (type) {
      case 'success': playSuccessSound(ctx); break
      case 'fail': playFailSound(ctx); break
      case 'destroy': playDestroySound(ctx); break
    }
  } catch {
    // 静默忽略音频播放错误
  }
}
