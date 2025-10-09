import React, { useEffect } from 'react'
import { createGlobalStyle } from 'styled-components'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from './theme/ThemeContext'
import Header from './components/header/Header'
import Main from './components/main/Main'
import UserProfile from './components/userProfile/UserProfile'
import Footer from './components/footer/Footer'
import ErrorPage from './components/ErrorPage'
import './App.css'

const Global = createGlobalStyle<{ theme: any }>`
  body { margin:0; font-family: system-ui, sans-serif; background: ${({ theme }) => theme.bg}; color: ${({ theme }) => theme.fg}; }
`

export default function App(): JSX.Element {
  const { theme, toggle } = useTheme()

  useEffect(() => {
    console.log('App mounted')
  }, [])

  return (
    <BrowserRouter>
      <Global theme={theme} />
      <div className="app">
        <Header />
        <div className="toolbar">
          <button onClick={toggle}>Toggle theme</button>
        </div>
        <Routes>
          <Route path="/" element={<Main />} />
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
  )
}
