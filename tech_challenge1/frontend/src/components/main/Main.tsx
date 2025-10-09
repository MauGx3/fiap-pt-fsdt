import React, { useState } from 'react'
import styles from './Main.module.css'

export default function Main() {
  const [count, setCount] = useState(0)

  return (
    <main className={styles.main}>
      <p>Bem-vindo! Este é o conteúdo principal.</p>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </main>
  )
}
