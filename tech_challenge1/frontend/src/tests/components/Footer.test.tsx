import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Footer from '../../components/footer/Footer'
import { renderWithProviders } from '../utils'

describe('Footer', () => {
    it('displays current year and copy text', () => {
        renderWithProviders(<Footer />, { withRouter: false })

        const currentYear = new Date().getFullYear().toString()
        const footer = screen.getByRole('contentinfo')
        expect(footer).toBeInTheDocument()
        expect(footer.textContent).toContain(currentYear)
        expect(footer.textContent).toMatch(/fiap/i)
    })
})
