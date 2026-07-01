import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import {
  getTodayKeyUTC,
  type DailyLeaderboardEntry,
} from '../utils/dailyLeaderboard'

const DAILY_SCORES_COLLECTION = 'dailyScores'
const ENTRIES_SUBCOLLECTION = 'entries'
const LEADERBOARD_LIMIT = 20

export async function submitDailyScore(
  uid: string,
  displayName: string,
  score: number,
): Promise<void> {
  if (!db || score <= 0) return

  const dateKey = getTodayKeyUTC()
  const ref = doc(db, DAILY_SCORES_COLLECTION, dateKey, ENTRIES_SUBCOLLECTION, uid)
  const existing = await getDoc(ref)

  if (existing.exists() && (existing.data().score ?? 0) >= score) {
    return
  }

  await setDoc(ref, {
    displayName,
    score,
    updatedAt: Date.now(),
  })
}

export async function fetchDailyLeaderboard(
  dateKey = getTodayKeyUTC(),
): Promise<DailyLeaderboardEntry[]> {
  if (!db) return []

  const entriesRef = collection(
    db,
    DAILY_SCORES_COLLECTION,
    dateKey,
    ENTRIES_SUBCOLLECTION,
  )
  const leaderboardQuery = query(
    entriesRef,
    orderBy('score', 'desc'),
    limit(LEADERBOARD_LIMIT),
  )
  const snapshot = await getDocs(leaderboardQuery)

  return snapshot.docs.map((entry, index) => {
    const data = entry.data()
    return {
      rank: index + 1,
      uid: entry.id,
      displayName: typeof data.displayName === 'string' ? data.displayName : 'Player',
      score: typeof data.score === 'number' ? data.score : 0,
    }
  })
}
