import React, { createContext, useContext, useState, PropsWithChildren } from 'react'

export type Theme = { name: string; bg: string; fg: string; card: string }

const light: Theme = { name: 'light', bg: '#f6f8fa', fg: '#0f172a', card: '#ffffff' }
const dark: Theme = { name: 'dark', bg: '#0b1220', fg: '#e6eef8', card: '#071028' }

type CtxType = { theme: Theme; toggle: () => void }
const Ctx = createContext<CtxType | undefined>(undefined)

export function ThemeProvider({ children }: PropsWithChildren) {
    const [isDark, setDark] = useState(false)
    const theme = isDark ? dark : light
    const toggle = () => setDark(v => !v)
    return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export const useTheme = (): CtxType => {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
    return ctx
}
