import React, { useEffect } from 'react'
import { createGlobalStyle } from 'styled-components'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from './theme/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/header/Header'
import Main from './components/main/Main'
import UserProfile from './components/userProfile/UserProfile'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Footer from './components/footer/Footer'
import ErrorPage from './components/ErrorPage'
import './App.css'

const Global = createGlobalStyle<{ theme: any }>`
  :root {
    --bg-color: ${({ theme }) => theme.bg};
    --fg-color: ${({ theme }) => theme.fg};
    --card-bg: ${({ theme }) => theme.card};
    --border-color: ${({ theme }) => theme.name === 'dark' ? '#374151' : '#ddd'};
    --input-bg: ${({ theme }) => theme.name === 'dark' ? '#1f2937' : '#fff'};
    --input-border: ${({ theme }) => theme.name === 'dark' ? '#4b5563' : '#ccc'};
    --button-primary: #007bff;
    --button-primary-hover: #0056b3;
    --button-success: #28a745;
    --button-success-hover: #218838;
    --button-warning: #ffc107;
    --button-warning-hover: #e0a800;
    --button-danger: #dc3545;
    --button-danger-hover: #c82333;
    --button-secondary: #6c757d;
    --button-secondary-hover: #5a6268;
    --text-muted: ${({ theme }) => theme.name === 'dark' ? '#9ca3af' : '#666'};
    --text-strong: ${({ theme }) => theme.fg};
  }
  body { margin:0; font-family: system-ui, sans-serif; background: var(--bg-color); color: var(--fg-color); }
`

export default function App(): JSX.Element {
  const { theme } = useTheme()

  useEffect(() => {
    console.log('App mounted')
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Global theme={theme} />
        <div className="app">
          <Header />
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route
              path="*"
              element={
                <ErrorPage
                  title="404 - Page not found"
                  message="The page you requested does not exist."
                />
              }
            />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
