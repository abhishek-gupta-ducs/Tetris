import { useRef } from 'react'

type BoardGesturesProps = {
  enabled: boolean
  onMoveLeft: () => void
  onMoveRight: () => void
  onSoftDrop: () => void
  onRotate: () => void
}

const SWIPE_THRESHOLD = 36
const TAP_MAX_DISTANCE = 14
const TAP_MAX_DURATION_MS = 280

type PointerStart = {
  x: number
  y: number
  time: number
}

export function BoardGestures({
  enabled,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onRotate,
}: BoardGesturesProps) {
  const startRef = useRef<PointerStart | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.button !== 0) return
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !startRef.current) return

    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    const distance = Math.hypot(dx, dy)
    const duration = Date.now() - startRef.current.time
    startRef.current = null

    if (distance <= TAP_MAX_DISTANCE && duration <= TAP_MAX_DURATION_MS) {
      onRotate()
      return
    }

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx < 0) onMoveLeft()
      else onMoveRight()
      return
    }

    if (dy >= SWIPE_THRESHOLD && Math.abs(dy) >= Math.abs(dx)) {
      onSoftDrop()
    }
  }

  const handlePointerCancel = () => {
    startRef.current = null
  }

  return (
    <div
      className="board-gestures"
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    />
  )
}
