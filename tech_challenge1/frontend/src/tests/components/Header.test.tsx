import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import Header from '../../components/header/Header'
import { renderWithProviders } from '../utils'

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn()
    }
})

const mockUseAuth = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}))

beforeEach(() => {
    mockUseAuth.mockReset()
})

describe('Header', () => {
    it('renders title and navigation links', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            user: null,
            logout: vi.fn()
        })

        renderWithProviders(<Header />)

        expect(screen.getByRole('banner')).toBeInTheDocument()
        expect(screen.getByRole('heading', { level: 1, name: /fiap frontend/i })).toBeVisible()
        const nav = screen.getByRole('navigation', { name: /main navigation/i })
        expect(nav).toBeInTheDocument()
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(3)
        expect(links[0]).toHaveAttribute('href', '/')
        expect(links[1]).toHaveAttribute('href', '/login')
        expect(links[2]).toHaveAttribute('href', '/register')
        const themeButton = screen.getByRole('button', { name: /alternar para tema escuro/i })
        expect(themeButton).toBeInTheDocument()
        expect(themeButton).toHaveTextContent(/tema escuro/i)
    })

    it('displays user information when logged in', () => {
        const mockLogout = vi.fn()
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: {
                uuid: '123',
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: 'admin'
            },
            logout: mockLogout
        })

        renderWithProviders(<Header />)

        expect(screen.getByText('Jane Doe')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
        const themeButton = screen.getByRole('button', { name: /alternar para tema escuro/i })
        expect(themeButton).toHaveTextContent(/tema escuro/i)
    })
})
