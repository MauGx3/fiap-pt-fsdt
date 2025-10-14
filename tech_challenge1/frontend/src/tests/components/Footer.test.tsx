import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Footer from '../../components/footer/Footer'
import { renderWithProviders } from '../utils'

describe('Footer', () => {
    it('displays current year, copy text and swagger link', () => {
        renderWithProviders(<Footer />, { withRouter: false })

        const currentYear = new Date().getFullYear().toString()
        const footer = screen.getByRole('contentinfo')
        expect(footer).toBeInTheDocument()
        expect(footer.textContent).toContain(currentYear)
        expect(footer.textContent).toMatch(/fiap/i)

        const swaggerLink = screen.getByRole('link', { name: /documentação da api/i })
        expect(swaggerLink).toBeInTheDocument()
        expect(swaggerLink).toHaveAttribute('href', '/docs')
        expect(swaggerLink).toHaveAttribute('target', '_blank')
        expect(swaggerLink).toHaveAttribute('rel', expect.stringMatching(/noopener/))
    })
})
