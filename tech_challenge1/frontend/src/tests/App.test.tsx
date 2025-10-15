import { describe, beforeEach, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { renderWithProviders } from './utils'
import { postsAPI } from '../api'
import { useTheme } from '../theme/ThemeContext'

vi.mock('../api', async () => {
    const actual = await vi.importActual<typeof import('../api')>('../api')
    return {
        ...actual,
        postsAPI: {
            ...actual.postsAPI,
            getAll: vi.fn().mockResolvedValue([])
        }
    }
})

const postsAPIMock = postsAPI as unknown as {
    getAll: ReturnType<typeof vi.fn>
}

describe('App integration', () => {
    beforeEach(() => {
        window.localStorage.clear()
        postsAPIMock.getAll.mockReset()
        postsAPIMock.getAll.mockResolvedValue([])
    })

    it('renders core layout on the home route', async () => {
        renderWithProviders(<App />, { withRouter: false, route: '/' })

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())
        expect(screen.getByRole('heading', { level: 1, name: /fiap frontend/i })).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 2, name: /posts/i })).toBeVisible()
        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('toggles theme colours when requested', async () => {
        const ThemeProbe = () => {
            const { theme } = useTheme()
            return <div data-testid="theme-name">{theme.name}</div>
        }

        renderWithProviders(
            <>
                <ThemeProbe />
                <App />
            </>,
            { withRouter: false, route: '/' }
        )

        const user = userEvent.setup()

        await waitFor(() => expect(screen.getByTestId('theme-name')).toHaveTextContent(/light/i))

        await user.click(screen.getByRole('button', { name: /alternar para tema/i }))

        await waitFor(() => expect(screen.getByTestId('theme-name')).toHaveTextContent(/dark/i))
    })

    it('renders fallback page for an unknown route', async () => {
        postsAPIMock.getAll.mockResolvedValue([])

        renderWithProviders(<App />, { withRouter: false, route: '/unknown' })

        expect(await screen.findByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument()
    })
})
