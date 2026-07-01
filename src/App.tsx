import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Board } from './components/Board'
import { ConfirmDialog } from './components/ConfirmDialog'
import { GameOver } from './components/GameOver'
import { HighScoreModal } from './components/HighScoreModal'
import { LeaderboardModal } from './components/LeaderboardModal'
import { LandingPage } from './components/LandingPage'
import { LoginPage } from './components/LoginPage'
import { GameSidebar } from './components/GameSidebar'
import { SettingsModal } from './components/SettingsModal'
import { BoardGestures } from './components/BoardGestures'
import { useAuth } from './hooks/useAuth'
import { useTetris } from './hooks/useTetris'
import { useSettings } from './hooks/useSettings'
import { useSound } from './hooks/useSound'
import { useViewportLayout } from './hooks/useViewportLayout'
import { DIFFICULTY_CONFIG } from './constants'
import { getFallSpeed } from './utils/scoring'
import type { AppScreen } from './types'

type ModalView = 'highscore' | 'leaderboard' | 'settings' | null

function getAuthErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('auth/popup-blocked')) {
      return 'Popup was blocked. Please allow popups and try again.'
    }
    if (err.message.includes('auth/network-request-failed')) {
      return 'Network error. Check your connection and try again.'
    }
    return 'Google sign-in failed. Please try again.'
  }
  return 'Something went wrong. Please try again.'
}

function App() {
  const auth = useAuth()
  const [screen, setScreen] = useState<AppScreen>('menu')
  const [modal, setModal] = useState<ModalView>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const submittedDailyScoreRef = useRef<number | null>(null)
  const layoutRef = useViewportLayout(screen === 'game')

  const { settings, setDifficulty, setSoundEnabled } = useSettings()
  const sound = useSound(settings.soundEnabled)

  const soundCallbacks = useMemo(
    () => ({
      onMove: sound.playMove,
      onRotate: sound.playRotate,
      onLock: sound.playLock,
      onLineClear: sound.playLineClear,
      onGameOver: () => {
        sound.playGameOver()
        sound.stopMusic()
      },
    }),
    [sound],
  )

  const game = useTetris(settings.difficulty, {
    sounds: soundCallbacks,
    initialHighScore: auth.user?.highScore ?? 0,
    onHighScoreSave: auth.saveHighScore,
  })

  const getCurrentFallSpeed = useCallback(
    () => getFallSpeed(game.level, settings.difficulty),
    [game.level, settings.difficulty],
  )

  const handleStartGame = useCallback(() => {
    setScreen('game')
    game.start()
    sound.startMusic(getFallSpeed(1, settings.difficulty))
  }, [game, sound, settings.difficulty])

  const handleRestart = useCallback(() => {
    game.restart()
    sound.startMusic(getFallSpeed(1, settings.difficulty))
  }, [game, sound, settings.difficulty])

  const handleMainMenu = useCallback(() => {
    game.returnToIdle()
    sound.stopMusic()
    void auth.refreshProfile()
    setScreen('menu')
  }, [game, sound, auth])

  const handleEndGame = useCallback(() => {
    setShowEndConfirm(false)
    game.endGame()
    sound.stopMusic()
  }, [game, sound])

  const handleLogout = useCallback(async () => {
    await auth.logout()
    game.returnToIdle()
    sound.stopMusic()
    setScreen('menu')
  }, [auth, game, sound])

  const handleSignInWithGoogle = useCallback(async () => {
    try {
      await auth.signInWithGoogle()
    } catch (err) {
      auth.setError(getAuthErrorMessage(err))
      throw err
    }
  }, [auth])

  useEffect(() => {
    if (screen !== 'game') return

    const fallSpeed = getCurrentFallSpeed()

    if (game.status === 'playing') {
      sound.resumeMusic(fallSpeed)
    } else if (game.status === 'paused') {
      sound.pauseMusic()
    } else if (game.status === 'gameover') {
      sound.stopMusic()
    }
  }, [screen, game.status, getCurrentFallSpeed, sound])

  useEffect(() => {
    if (!settings.soundEnabled) {
      sound.stopMusic()
    } else if (screen === 'game' && game.status === 'playing') {
      sound.resumeMusic(getCurrentFallSpeed())
    }
  }, [settings.soundEnabled, screen, game.status, getCurrentFallSpeed, sound])

  useEffect(() => {
    if (screen !== 'game' || game.status !== 'playing') return
    sound.setMusicTempo(getCurrentFallSpeed())
  }, [screen, game.status, game.level, settings.difficulty, getCurrentFallSpeed, sound])

  useEffect(() => {
    if (screen !== 'game' || game.status !== 'playing' || game.score !== 0) return
    submittedDailyScoreRef.current = null
  }, [screen, game.status, game.score])

  useEffect(() => {
    if (screen !== 'game' || game.status !== 'gameover' || game.score <= 0) return
    if (submittedDailyScoreRef.current === game.score) return
    submittedDailyScoreRef.current = game.score
    void auth.submitDailyScore(game.score)
  }, [screen, game.status, game.score, auth])

  if (auth.loading) {
    return (
      <div className="landing">
        <div className="landing-card">
          <p className="landing-subtitle">Loading...</p>
        </div>
      </div>
    )
  }

  if (!auth.user) {
    return (
      <LoginPage
        onSignInWithGoogle={handleSignInWithGoogle}
        error={auth.error}
        onClearError={() => auth.setError(null)}
      />
    )
  }

  if (screen === 'menu') {
    return (
      <>
        <LandingPage
          displayName={auth.user.displayName}
          highScore={auth.user.highScore}
          difficulty={settings.difficulty}
          soundEnabled={settings.soundEnabled}
          onStartGame={handleStartGame}
          onShowHighScore={() => setModal('highscore')}
          onShowLeaderboard={() => setModal('leaderboard')}
          onShowSettings={() => setModal('settings')}
          onLogout={handleLogout}
        />
        {modal === 'highscore' && (
          <HighScoreModal
            highScore={auth.user.highScore}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'leaderboard' && (
          <LeaderboardModal
            currentUserId={auth.user.uid}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'settings' && (
          <SettingsModal
            difficulty={settings.difficulty}
            soundEnabled={settings.soundEnabled}
            onDifficultyChange={setDifficulty}
            onSoundChange={setSoundEnabled}
            onClose={() => setModal(null)}
          />
        )}
      </>
    )
  }

  const isPaused = game.status === 'paused'

  return (
    <div className="app game-screen" ref={layoutRef}>
      <header className="game-header">
        <h1>TETRIS</h1>
        <p className="game-meta">
          {auth.user.displayName}
          <span className="meta-sep">·</span>
          {DIFFICULTY_CONFIG[settings.difficulty].label}
          {isPaused && (
            <>
              <span className="meta-sep">·</span>
              <span className="meta-paused">Paused</span>
            </>
          )}
        </p>
      </header>

      <div className="game-shell">
        <div className="game-body">
          <div className="game-main">
            <div className="board-wrapper">
              <Board
                board={game.board}
                active={game.active}
                ghostY={game.ghostY}
              />
              <BoardGestures
                enabled={game.status === 'playing'}
                onMoveLeft={() => game.move(-1)}
                onMoveRight={() => game.move(1)}
                onSoftDrop={() => game.softDrop()}
                onRotate={() => game.rotate(1)}
              />
              <GameOver
                score={game.score}
                highScore={game.highScore}
                visible={game.status === 'gameover'}
                onRestart={handleRestart}
                onMainMenu={handleMainMenu}
              />
            </div>
          </div>

          <GameSidebar
            next={game.next}
            score={game.score}
            lines={game.lines}
            level={game.level}
            highScore={game.highScore}
            isPaused={isPaused}
            onEndGame={() => setShowEndConfirm(true)}
            onTogglePause={() => (isPaused ? game.resume() : game.pause())}
            actionsDisabled={game.status !== 'playing' && game.status !== 'paused'}
          />
        </div>
      </div>

      {showEndConfirm && (
        <ConfirmDialog
          title="End Game"
          message="End current game? Your score will be saved."
          confirmLabel="End Game"
          onConfirm={handleEndGame}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}
    </div>
  )
}

export default App
