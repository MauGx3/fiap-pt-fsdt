import React from 'react'
import styles from './ErrorPage.module.css'

interface ErrorPageProps {
    title?: string
    message?: string
    onRetry?: () => void
    showHomeButton?: boolean
}

export default function ErrorPage({
    title = 'Oops! Something went wrong',
    message = 'We encountered an error while loading this page.',
    onRetry,
    showHomeButton = true
}: ErrorPageProps) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>⚠️</div>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {onRetry && (
                        <button className={styles.retryButton} onClick={onRetry}>
                            Try Again
                        </button>
                    )}
                    {showHomeButton && (
                        <button
                            className={styles.homeButton}
                            onClick={() => window.location.href = '/'}
                        >
                            Go Home
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
