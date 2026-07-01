import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { submitDailyScore as writeDailyScore } from '../lib/dailyScores'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import type { UserProfile } from '../types'

const USERS_COLLECTION = 'users'
const googleProvider = new GoogleAuthProvider()

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

async function fetchUserProfile(user: User): Promise<UserProfile> {
  if (!db) {
    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: user.displayName ?? 'Player',
      highScore: 0,
    }
  }

  const ref = doc(db, USERS_COLLECTION, user.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const data = snap.data()
    return {
      uid: user.uid,
      email: user.email ?? '',
      displayName: data.displayName ?? user.displayName ?? 'Player',
      highScore: data.highScore ?? 0,
    }
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? 'Player',
    highScore: 0,
  }

  await setDoc(ref, {
    displayName: profile.displayName,
    highScore: 0,
    updatedAt: Date.now(),
  })

  return profile
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setLoading(false)
      return
    }

    let mounted = true

    async function initAuth() {
      try {
        const redirectResult = await getRedirectResult(auth!)
        if (redirectResult?.user && mounted) {
          const profile = await fetchUserProfile(redirectResult.user)
          setUser(profile)
        }
      } catch {
        if (mounted) setError('Google sign-in failed. Please try again.')
      }
    }

    void initAuth()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await fetchUserProfile(firebaseUser)
          if (mounted) setUser(profile)
        } else if (mounted) {
          setUser(null)
        }
      } catch {
        if (mounted) {
          setError('Failed to load user profile')
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase is not configured')
    setError(null)

    try {
      if (isMobileDevice()) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        const credential = await signInWithPopup(auth, googleProvider)
        const profile = await fetchUserProfile(credential.user)
        setUser(profile)
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('auth/popup-closed-by-user')) {
        return
      }
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    if (!auth) return
    setError(null)
    await signOut(auth)
    setUser(null)
  }, [])

  const saveHighScore = useCallback(
    async (score: number) => {
      if (!user || !db || score <= user.highScore) return
      const ref = doc(db, USERS_COLLECTION, user.uid)
      await updateDoc(ref, { highScore: score, updatedAt: Date.now() })
      setUser((prev) => (prev ? { ...prev, highScore: score } : prev))
    },
    [user],
  )

  const submitDailyScore = useCallback(
    async (score: number) => {
      if (!user || !isFirebaseConfigured()) return
      await writeDailyScore(user.uid, user.displayName, score)
    },
    [user],
  )

  const refreshProfile = useCallback(async () => {
    if (!auth?.currentUser) return
    const profile = await fetchUserProfile(auth.currentUser)
    setUser(profile)
  }, [])

  return {
    user,
    loading,
    error,
    setError,
    signInWithGoogle,
    logout,
    saveHighScore,
    submitDailyScore,
    refreshProfile,
    isConfigured: isFirebaseConfigured(),
  }
}
