import React, { useMemo } from 'react'
import styles from './Footer.module.css'

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className={styles.footer}>
      <small>© {year} FIAP. Todos os direitos reservados.</small>
    </footer>
  )
}
