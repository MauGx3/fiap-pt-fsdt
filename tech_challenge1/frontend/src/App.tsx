import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useTheme } from './theme/ThemeContext'
import Header from './components/header/Header'
import Main from './components/main/Main'
import Footer from './components/footer/Footer'
import './App.css'

const Global = createGlobalStyle<{ theme: any }>`
  body { margin:0; font-family: system-ui, sans-serif; background: ${({ theme }) => theme.bg}; color: ${({ theme }) => theme.fg}; }
`

export default function App(): JSX.Element {
  const { theme, toggle } = useTheme()
  return (
    <>
      <Global theme={theme} />
      <div className="app">
        <Header />
        <div className="toolbar">
          <button onClick={toggle}>Toggle theme</button>
        </div>
        <Main />
        <Footer />
      </div>
    </>
  )
}
