import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'
import { renderWithProviders } from '../utils'

describe('LoadingSpinner', () => {
    it('renders default message', () => {
        renderWithProviders(<LoadingSpinner />, { withRouter: false })

        expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('accepts a custom message', () => {
        renderWithProviders(<LoadingSpinner message="Fetching posts" />, { withRouter: false })

        expect(screen.getByText(/fetching posts/i)).toBeVisible()
    })

    it('omits message area when message is empty', () => {
        renderWithProviders(<LoadingSpinner message="" />, { withRouter: false })

        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
})
