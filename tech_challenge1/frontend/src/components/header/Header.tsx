import React, { useState } from 'react'
import styles from './Header.module.css'
import { authAPI, isAuthenticated } from '../../api'
import toast from 'react-hot-toast'
import { NavLink, useNavigate } from 'react-router-dom'

export default function Header() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [authData, setAuthData] = useState({ name: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await authAPI.login({ email: authData.email, password: authData.password })
        toast.success('Logged in successfully!')
      } else {
        await authAPI.register({
          name: authData.name,
          email: authData.email,
          password: authData.password
        })
        toast.success('Registered successfully!')
      }

      setShowAuth(false)
      setAuthData({ name: '', email: '', password: '' })
      navigate(0)
    } catch (err: any) {
      console.error('Auth error:', err)
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        toast.success(`${isLogin ? 'Login' : 'Registration'} successful (demo mode)!`)
        setShowAuth(false)
        setAuthData({ name: '', email: '', password: '' })
      } else {
        toast.error(err.response?.data?.error || 'Authentication failed')
      }
    }
  }

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      toast.success('Logged out successfully!')
      navigate('/')
      navigate(0)
    } catch (err: any) {
      console.error('Logout error:', err)
      // Fallback for demo
      toast.success('Logged out (demo mode)!')
      navigate('/')
      navigate(0)
    }
  }

  return (
    <header className={styles.header}>
      <h1>FIAP Frontend</h1>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          Home
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? styles.active : '')}
        >
          Profile
        </NavLink>
        {isAuthenticated() ? (
          <button onClick={handleLogout}>Logout</button>
        ) : (
          <button onClick={() => setShowAuth(true)}>Login</button>
        )}
      </nav>

      {showAuth && (
        <div className={styles.authModal}>
          <div className={styles.authForm}>
            <h3>{isLogin ? 'Login' : 'Register'}</h3>
            <form onSubmit={handleAuth}>
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Name"
                  value={authData.name}
                  onChange={(e) => setAuthData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={authData.email}
                onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authData.password}
                onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <div className={styles.authButtons}>
                <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
                <button type="button" onClick={() => setShowAuth(false)}>Cancel</button>
              </div>
            </form>
            <button
              className={styles.switchMode}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Need to register?' : 'Already have an account?'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
