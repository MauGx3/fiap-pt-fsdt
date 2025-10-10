import { describe, beforeEach, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Main from '../../components/main/Main'
import { renderWithProviders } from '../utils'
import toast from 'react-hot-toast'
import { postsAPI } from '../../api'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../theme/ThemeContext'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'

vi.mock('../../api', () => ({
    postsAPI: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    },
    isAuthenticated: vi.fn(() => true)
}))

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' }
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}))

const postsAPIMock = postsAPI as unknown as {
    getAll: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
}

const renderWithAuth = (ui: React.ReactElement) => {
    return renderWithProviders(
        <AuthProvider>
            {ui}
        </AuthProvider>
    )
}

describe('Main component', () => {
    beforeEach(() => {
        ; (toast as unknown as ReturnType<typeof vi.fn>).mockClear()
            ; (toast.success as unknown as ReturnType<typeof vi.fn>).mockClear()
            ; (toast.error as unknown as ReturnType<typeof vi.fn>).mockClear()
        postsAPIMock.getAll.mockReset()
        postsAPIMock.create.mockReset()
    })

    it('renders posts returned by the API', async () => {
        const posts = [
            {
                _id: '1',
                title: 'First Post',
                content: 'Hello from Vitest',
                author: 'Author',
                tags: ['vite'],
                createdAt: new Date().toISOString()
            }
        ]
        postsAPIMock.getAll.mockResolvedValue(posts)

        renderWithAuth(<Main />)

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
        expect(await screen.findByText('First Post')).toBeInTheDocument()
        expect(screen.getByText(/hello from vitest/i)).toBeVisible()
        expect(toast.success).toHaveBeenCalledWith('Posts loaded successfully!')
    })

    it('shows error page when API is unreachable', async () => {
        const error = new Error('Network Error') as Error & { code?: string }
        error.code = 'ECONNREFUSED'
        postsAPIMock.getAll.mockRejectedValue(error)

        renderWithAuth(<Main />)

        expect(await screen.findByText(/failed to load posts/i)).toBeInTheDocument()
        expect(toast.error).toHaveBeenCalledWith('Failed to load posts. Please try again.')
    })

    it('shows error page on unexpected failure', async () => {
        postsAPIMock.getAll.mockRejectedValue(new Error('Boom'))

        renderWithAuth(<Main />)

        expect(await screen.findByText(/failed to load posts/i)).toBeInTheDocument()
        expect(toast.error).toHaveBeenCalledWith('Failed to load posts. Please try again.')
    })

    it('creates a new post through the form', async () => {
        postsAPIMock.getAll.mockResolvedValue([])
        const createdPost = {
            _id: '99',
            title: 'Brand New',
            content: 'Created from the form',
            author: 'Tester',
            tags: ['react'],
            createdAt: new Date().toISOString()
        }
        postsAPIMock.create.mockResolvedValue(createdPost)

        renderWithAuth(<Main />)
        const user = userEvent.setup()

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())

        await user.click(screen.getByRole('button', { name: /create post/i }))
        const titleInput = screen.getByPlaceholderText(/post title/i)
        const contentTextarea = screen.getByPlaceholderText(/post content/i)
        const tagsInput = screen.getByPlaceholderText(/tags/i)

        await user.type(titleInput, 'Brand New')
        await user.type(contentTextarea, 'Created from the form')
        await user.type(tagsInput, 'react')

        await user.click(screen.getByRole('button', { name: /create post/i }))

        expect(postsAPIMock.create).toHaveBeenCalledWith({
            title: 'Brand New',
            content: 'Created from the form',
            tags: ['react']
        })

        expect(await screen.findByText('Brand New')).toBeInTheDocument()
        expect(screen.getByText(/created from the form/i)).toBeVisible()
        expect(toast.success).toHaveBeenCalledWith('Post created successfully!')
    })
})
