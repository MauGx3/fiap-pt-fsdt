import React, { createContext, useContext, useState } from 'react'

const light = { name: 'light', bg: '#f6f8fa', fg: '#0f172a', card: '#ffffff' }
const dark = { name: 'dark', bg: '#0b1220', fg: '#e6eef8', card: '#071028' }

const Ctx = createContext()

export function ThemeProvider({ children }) {
    const [isDark, setDark] = useState(false)
    const theme = isDark ? dark : light
    const toggle = () => setDark(v => !v)
    return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export const useTheme = () => {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
    return ctx
}
