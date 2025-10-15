import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme/ThemeContext'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isDarkTheme = theme.name === 'dark'
  const themeButtonLabel = isDarkTheme ? 'Alternar para tema claro' : 'Alternar para tema escuro'
  const welcomeName = useMemo(() => {
    if (!user?.name) return 'usuário'
    return user.name.trim()
  }, [user?.name])

  const roleSuffix = user?.role ? ` (${user.role})` : ''

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <h1>FIAP Frontend</h1>
      </div>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link to="/" aria-current="page">Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <span className={styles.userInfo} aria-live="polite">
              Welcome, <strong>{welcomeName}</strong>{roleSuffix}
            </span>
            <button type="button" onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        <button
          type="button"
          onClick={toggle}
          className={styles.themeButton}
          aria-label={themeButtonLabel}
        >
          {isDarkTheme ? 'Tema claro' : 'Tema escuro'}
        </button>
      </nav>
    </header>
  )
}
