import { useEffect, useRef } from 'react'

const DESKTOP_SIDEBAR_WIDTH = 220
const DESKTOP_GAP = 18
const MOBILE_STACK_HEIGHT = 320
const MOBILE_TOUCH_HEIGHT = 0
const OUTER_PADDING = 24
const SHELL_PADDING = 20
const BOARD_CHROME = 26

export function useViewportLayout(isGameScreen: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isGameScreen) return

    const root = document.documentElement
    root.classList.add('game-active')

    const update = () => {
      const el = containerRef.current
      if (!el) return

      const mobile = window.innerWidth < 769
      const headerH =
        el.querySelector<HTMLElement>('.game-header')?.getBoundingClientRect()
          .height ?? 44

      const viewportW = window.innerWidth
      const viewportH = window.innerHeight
      const availableH =
        viewportH -
        headerH -
        OUTER_PADDING -
        SHELL_PADDING -
        (mobile ? MOBILE_TOUCH_HEIGHT : 0)

      el.style.setProperty('--sidebar-width', `${DESKTOP_SIDEBAR_WIDTH}px`)

      if (mobile) {
        const boardW = viewportW - OUTER_PADDING - SHELL_PADDING
        const boardH = availableH - MOBILE_STACK_HEIGHT
        const fromW = (boardW - BOARD_CHROME) / 10
        const fromH = (boardH - BOARD_CHROME) / 20
        const size = Math.floor(Math.min(fromW, fromH))
        el.style.setProperty('--cell-size', `${Math.max(10, size)}px`)
      } else {
        const boardW =
          viewportW -
          OUTER_PADDING -
          SHELL_PADDING -
          DESKTOP_SIDEBAR_WIDTH -
          DESKTOP_GAP
        const fromW = (boardW - BOARD_CHROME) / 10
        const fromH = (availableH - BOARD_CHROME) / 20
        const size = Math.floor(Math.min(fromW, fromH))
        el.style.setProperty('--cell-size', `${Math.max(14, size)}px`)
      }

      const cell = parseFloat(
        getComputedStyle(el).getPropertyValue('--cell-size') || '24',
      )
      const boardHeight = Math.ceil(20 * cell + 19 + 4)
      el.style.setProperty('--board-height', `${boardHeight}px`)
      el.style.setProperty(
        '--preview-cell-size',
        `${Math.max(16, Math.floor(cell * 0.43))}px`,
      )
    }

    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', update)

    return () => {
      root.classList.remove('game-active')
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [isGameScreen])

  return containerRef
}
