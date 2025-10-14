import React, { useMemo } from 'react'
import styled from 'styled-components'

const FooterRoot = styled.footer`
  width: 100%;
  padding: 16px 24px;
  background: var(--card-bg);
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
`

const FooterContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;

  @media (min-width: 600px) {
    flex-direction: row;
    justify-content: center;
  }
`

const FooterNote = styled.small`
  display: block;
`

const DocsLink = styled.a`
  color: var(--button-primary);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;

  &:hover,
  &:focus {
    color: var(--button-primary-hover);
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--button-primary-hover);
    outline-offset: 2px;
  }
`

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <FooterRoot>
      <FooterContent>
        <FooterNote>© {year} FIAP. Todos os direitos reservados.</FooterNote>
        <DocsLink href="/docs" target="_blank" rel="noopener noreferrer">
          Documentação da API (Swagger)
        </DocsLink>
      </FooterContent>
    </FooterRoot>
  )
}
