import { useCallback, useEffect, useRef } from 'react'
import { getMusicIntervalFromFallSpeed } from '../utils/scoring'

type SoundApi = {
  playMove: () => void
  playRotate: () => void
  playLock: () => void
  playLineClear: (lines: number) => void
  playHardDrop: () => void
  playGameOver: () => void
  startMusic: (fallSpeedMs: number) => void
  stopMusic: () => void
  pauseMusic: () => void
  resumeMusic: (fallSpeedMs: number) => void
  setMusicTempo: (fallSpeedMs: number) => void
}

function createTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.08,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export function useSound(enabled: boolean): SoundApi {
  const ctxRef = useRef<AudioContext | null>(null)
  const musicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const musicStepRef = useRef(0)
  const musicIntervalRef = useRef(getMusicIntervalFromFallSpeed(1000))
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  const playMove = useCallback(() => {
    if (!enabledRef.current) return
    createTone(getCtx(), 180, 0.04, 'square', 0.04)
  }, [getCtx])

  const playRotate = useCallback(() => {
    if (!enabledRef.current) return
    createTone(getCtx(), 260, 0.05, 'square', 0.05)
  }, [getCtx])

  const playLock = useCallback(() => {
    if (!enabledRef.current) return
    createTone(getCtx(), 120, 0.06, 'triangle', 0.06)
  }, [getCtx])

  const playLineClear = useCallback(
    (lines: number) => {
      if (!enabledRef.current) return
      const ctx = getCtx()
      const freqs = lines >= 4 ? [523, 659, 784, 1047] : [440, 554, 659].slice(0, lines)
      freqs.forEach((freq, i) => {
        setTimeout(() => createTone(ctx, freq, 0.12, 'square', 0.07), i * 80)
      })
    },
    [getCtx],
  )

  const playHardDrop = useCallback(() => {
    if (!enabledRef.current) return
    createTone(getCtx(), 90, 0.1, 'sawtooth', 0.06)
  }, [getCtx])

  const playGameOver = useCallback(() => {
    if (!enabledRef.current) return
    const ctx = getCtx()
    ;[392, 349, 311, 262].forEach((freq, i) => {
      setTimeout(() => createTone(ctx, freq, 0.2, 'triangle', 0.08), i * 150)
    })
  }, [getCtx])

  const stopMusic = useCallback(() => {
    if (musicTimerRef.current) {
      clearInterval(musicTimerRef.current)
      musicTimerRef.current = null
    }
    musicStepRef.current = 0
  }, [])

  const playMusicStep = useCallback(() => {
    if (!enabledRef.current) return
    const ctx = getCtx()
    const melody = [262, 294, 330, 349, 392, 349, 330, 294]
    const bass = [131, 131, 147, 147, 165, 165, 147, 147]
    const step = musicStepRef.current % melody.length
    createTone(ctx, melody[step], 0.18, 'square', 0.035)
    createTone(ctx, bass[step], 0.18, 'triangle', 0.025)
    musicStepRef.current++
  }, [getCtx])

  const applyMusicTimer = useCallback(() => {
    if (!musicTimerRef.current) return
    clearInterval(musicTimerRef.current)
    musicTimerRef.current = setInterval(
      playMusicStep,
      musicIntervalRef.current,
    )
  }, [playMusicStep])

  const setMusicTempo = useCallback(
    (fallSpeedMs: number) => {
      musicIntervalRef.current = getMusicIntervalFromFallSpeed(fallSpeedMs)
      applyMusicTimer()
    },
    [applyMusicTimer],
  )

  const startMusic = useCallback(
    (fallSpeedMs: number) => {
      stopMusic()
      if (!enabledRef.current) return
      musicIntervalRef.current = getMusicIntervalFromFallSpeed(fallSpeedMs)
      playMusicStep()
      musicTimerRef.current = setInterval(
        playMusicStep,
        musicIntervalRef.current,
      )
    },
    [stopMusic, playMusicStep],
  )

  const pauseMusic = useCallback(() => {
    if (musicTimerRef.current) {
      clearInterval(musicTimerRef.current)
      musicTimerRef.current = null
    }
  }, [])

  const resumeMusic = useCallback(
    (fallSpeedMs: number) => {
      if (!enabledRef.current || musicTimerRef.current) return
      musicIntervalRef.current = getMusicIntervalFromFallSpeed(fallSpeedMs)
      musicTimerRef.current = setInterval(
        playMusicStep,
        musicIntervalRef.current,
      )
    },
    [playMusicStep],
  )

  useEffect(() => {
    return () => {
      stopMusic()
      void ctxRef.current?.close()
    }
  }, [stopMusic])

  return {
    playMove,
    playRotate,
    playLock,
    playLineClear,
    playHardDrop,
    playGameOver,
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    setMusicTempo,
  }
}
