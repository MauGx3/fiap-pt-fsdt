import React, { useMemo } from 'react'
import styled from 'styled-components'

const FooterRoot = styled.footer`
  width: 100%;
  padding: 16px 24px;
  background: var(--card-bg);
  color: var(--text-muted);
  text-align: center;
  border-top: 1px solid var(--border-color);
`

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <FooterRoot>
      <small>© {year} FIAP. Todos os direitos reservados.</small>
    </FooterRoot>
  )
}
