export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export type Cell = PieceType | null

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameover'

export type AppScreen = 'menu' | 'game'

export type Difficulty = 'beginner' | 'easy' | 'intermediate' | 'hard'

export type Settings = {
  difficulty: Difficulty
  soundEnabled: boolean
}

export type ActivePiece = {
  type: PieceType
  rotation: number
  x: number
  y: number
}

export type GameState = {
  board: Cell[][]
  active: ActivePiece | null
  next: PieceType
  score: number
  lines: number
  level: number
  highScore: number
  status: GameStatus
}

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  highScore: number
}
