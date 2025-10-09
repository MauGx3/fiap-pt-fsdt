import React, { PropsWithChildren } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../theme/ThemeContext'

type Options = {
    route?: string
    withRouter?: boolean
} & Omit<RenderOptions, 'wrapper'>

export function renderWithProviders(
    ui: React.ReactElement,
    { route = '/', withRouter = true, ...renderOptions }: Options = {}
) {
    const Wrapper = ({ children }: PropsWithChildren) => (
        <ThemeProvider>
            {withRouter ? (
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            ) : (
                children
            )}
        </ThemeProvider>
    )

    if (!withRouter) {
        window.history.pushState({}, 'Test Page', route)
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions })
}
