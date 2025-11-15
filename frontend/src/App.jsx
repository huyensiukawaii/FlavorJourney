import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function Home({ onReturnToLogin }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return (
    <div style={{ padding: 24 }}>
      <h1>ようこそ、{user.username || user.email || 'ユーザー'}</h1>
      <p>ログイン済みです。ここにダッシュボードの内容を追加できます。</p>
      <div style={{ marginTop: 16 }}>
        <button className="btn-secondary" onClick={() => onReturnToLogin && onReturnToLogin()}>
          戻る（ログイン画面）
        </button>
      </div>
    </div>
  )
}

function App() {
  const [mode, setMode] = useState(() => (localStorage.getItem('access_token') ? 'home' : 'login'))

  useEffect(() => {
    // If user logs in (access_token set), switch to home
    const onStorage = () => {
      if (localStorage.getItem('access_token')) setMode('home')
      else setMode('login')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Logout removed per request: Home no longer shows logout and app will keep token until user clears it

  const handleReturnToLogin = () => {
    // client-only: clear token/user from localStorage and show login
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setMode('login')
  }

  return (
    <>
      {mode === 'login' && <Login onSwitchToRegister={() => setMode('register')} onLoginSuccess={() => setMode('home')} />}
      {mode === 'register' && <Register onSwitchToLogin={() => setMode('login')} />}
      {mode === 'home' && <Home onReturnToLogin={handleReturnToLogin} />}
    </>
  )
}

export default App
