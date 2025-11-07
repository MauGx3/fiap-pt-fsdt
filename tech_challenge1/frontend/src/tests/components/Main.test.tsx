import { describe, beforeEach, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Main from '../../components/main/Main'
import { renderWithProviders } from '../utils'
import toast from 'react-hot-toast'
import { postsAPI, authAPI } from '../../api'
import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Mock useAuth before importing the component
vi.mock('../../contexts/AuthContext', () => ({
    useAuth: vi.fn()
}))

const mockUseAuth = vi.mocked(useAuth)

vi.mock('../../api', () => ({
    postsAPI: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
    },
    authAPI: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        verify: vi.fn(),
        isAuthenticated: vi.fn()
    },
    isAuthenticated: vi.fn(() => true)
}))

const postsAPIMock = postsAPI as unknown as {
    getAll: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
};

const authAPIMock = authAPI as unknown as {
    verify: ReturnType<typeof vi.fn>
    isAuthenticated: ReturnType<typeof vi.fn>
};

// Helper function to create auth context values
const createAuthContext = (overrides: Partial<{ user: any; isAuthenticated: boolean; isLoading: boolean }>) => ({
    user: overrides.user || null,
    isAuthenticated: overrides.isAuthenticated ?? false,
    isLoading: overrides.isLoading ?? false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
});

// Custom render function with auth context
const renderWithAuth = (ui: React.ReactElement) => {
    return renderWithProviders(ui)
}

describe('Main component', () => {
    beforeEach(() => {
        // Set default mock return value
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { uuid: 'author-uuid', name: 'Test User', email: 'test@example.com', role: 'user' },
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn()
        })

        // Reset mocks
        postsAPIMock.getAll.mockClear()
        postsAPIMock.create.mockClear()
        postsAPIMock.update.mockClear()
        postsAPIMock.delete.mockClear()
    })
    beforeEach(() => {
        ; (toast as unknown as ReturnType<typeof vi.fn>).mockClear()
            ; (toast.success as unknown as ReturnType<typeof vi.fn>).mockClear()
            ; (toast.error as unknown as ReturnType<typeof vi.fn>).mockClear()
        postsAPIMock.getAll.mockReset()
        postsAPIMock.create.mockReset()
        authAPIMock.verify.mockReset()
        authAPIMock.isAuthenticated.mockReset()
        // Set default mocks
        authAPIMock.verify.mockResolvedValue({ user: { uuid: 'author-uuid', name: 'Test User', email: 'test@example.com', role: 'user' } })
        authAPIMock.isAuthenticated.mockReturnValue(true)
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

        await waitFor(() => expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument())

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

    it('shows edit and delete buttons for post author', async () => {
        const posts = [
            {
                _id: '1',
                title: 'My Post',
                content: 'Content',
                author: 'author-uuid', // matches user.uuid
                tags: [],
                createdAt: new Date().toISOString()
            }
        ]
        postsAPIMock.getAll.mockResolvedValue(posts)

        renderWithAuth(<Main />)

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())

        expect(screen.getByText('My Post')).toBeInTheDocument()
        await waitFor(() => expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument())
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('shows edit and delete buttons for admin user', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { uuid: 'admin-uuid', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn()
        })

        const posts = [
            {
                _id: '1',
                title: 'Someone Else Post',
                content: 'Content',
                author: 'other-uuid', // different from user.uuid
                tags: [],
                createdAt: new Date().toISOString()
            }
        ]
        postsAPIMock.getAll.mockResolvedValue(posts)

        renderWithAuth(<Main />)

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())

        expect(screen.getByText('Someone Else Post')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    })

    it('hides edit and delete buttons for non-owner non-admin user', async () => {
        const posts = [
            {
                _id: '1',
                title: 'Someone Else Post',
                content: 'Content',
                author: 'other-uuid', // different from user.uuid
                tags: [],
                createdAt: new Date().toISOString()
            }
        ]
        postsAPIMock.getAll.mockResolvedValue(posts)

        renderWithAuth(<Main />)

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())

        // Wait for auth to complete - create button should appear for authenticated user
        await waitFor(() => expect(screen.getByRole('button', { name: /create post/i })).toBeInTheDocument())

        expect(screen.getByText('Someone Else Post')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })

    it('hides edit and delete buttons for unauthenticated user', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            login: vi.fn(),
            register: vi.fn(),
            logout: vi.fn()
        })

        const posts = [
            {
                _id: '1',
                title: 'Post',
                content: 'Content',
                author: 'author-uuid',
                tags: [],
                createdAt: new Date().toISOString()
            }
        ]
        postsAPIMock.getAll.mockResolvedValue(posts)

        renderWithAuth(<Main />)

        await waitFor(() => expect(postsAPIMock.getAll).toHaveBeenCalled())

        expect(screen.getByText('Post')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /create post/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })
})
