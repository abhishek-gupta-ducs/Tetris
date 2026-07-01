import { useState } from 'react'
import { isFirebaseConfigured } from '../lib/firebase'

type LoginPageProps = {
  onSignInWithGoogle: () => Promise<void>
  error: string | null
  onClearError: () => void
}

export function LoginPage({
  onSignInWithGoogle,
  error,
  onClearError,
}: LoginPageProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleGoogleSignIn = async () => {
    onClearError()
    setSubmitting(true)
    try {
      await onSignInWithGoogle()
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  if (!isFirebaseConfigured()) {
    return (
      <div className="landing">
        <div className="landing-card">
          <h1 className="landing-title">TETRIS</h1>
          <p className="login-error">
            Firebase is not configured. Add your Firebase credentials to{' '}
            <code>.env</code> to enable login.
          </p>
          <p className="settings-hint">
            Copy <code>.env.example</code> to <code>.env</code> and fill in your
            Firebase project values.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="landing">
      <div className="landing-card login-card">
        <h1 className="landing-title">TETRIS</h1>
        <p className="landing-subtitle">Sign in to start playing</p>

        <div className="landing-preview">
          <div className="landing-block i" />
          <div className="landing-block o" />
          <div className="landing-block t" />
          <div className="landing-block s" />
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleSignIn}
          disabled={submitting}
        >
          <span className="google-icon" aria-hidden="true">G</span>
          {submitting ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  )
}
