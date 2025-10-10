import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import styles from './Header.module.css'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <h1>FIAP Frontend</h1>
      <nav className={styles.nav} aria-label="Main navigation">
        <Link to="/" aria-current="page">Home</Link>
        {isAuthenticated ? (
          <>
            <Link to="/profile">Profile</Link>
            <span className={styles.userInfo}>
              Welcome, {user?.name} ({user?.role})
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  )
}
