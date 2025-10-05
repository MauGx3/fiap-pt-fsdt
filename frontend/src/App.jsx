import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useTheme } from './theme/ThemeContext'

const Global = createGlobalStyle`
  body { margin:0; font-family: system-ui, sans-serif; background: ${({ theme }) => theme.bg}; color: ${({ theme }) => theme.fg}; }
`

const Container = styled.main`
  display:flex; min-height:100vh; align-items:center; justify-content:center;
`
const Card = styled.div`
  padding:24px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.08);
  background: ${({ theme }) => theme.card};
`

export default function App() {
    const { theme, toggle } = useTheme()
    return (
        <>
            <Global theme={theme} />
            <Container>
                <Card theme={theme}>
                    <h1>FIAP Frontend</h1>
                    <p>Theme: {theme.name}</p>
                    <button onClick={toggle}>Toggle theme</button>
                </Card>
            </Container>
        </>
    )
}
