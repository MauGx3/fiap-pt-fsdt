import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Header from '../../components/header/Header'
import { renderWithProviders } from '../utils'
import { MemoryRouter } from 'react-router-dom'

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => vi.fn()
    }
})

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        user: null,
        logout: vi.fn()
    })
}))

describe('Header', () => {
    it('renders title and navigation links', () => {
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
    })
})
