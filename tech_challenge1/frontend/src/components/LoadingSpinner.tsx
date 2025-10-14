import React from 'react'
import styled, { keyframes } from 'styled-components'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Spinner = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  border: 4px solid var(--card-bg, #f3f3f3);
  border-top: 4px solid var(--button-primary, #007bff);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  width: ${(p) => (p.$size === 'small' ? '20px' : p.$size === 'large' ? '60px' : '40px')};
  height: ${(p) => (p.$size === 'small' ? '20px' : p.$size === 'large' ? '60px' : '40px')};
`

const Message = styled.p`
  margin-top: 10px;
  color: var(--text-muted, #666);
  font-size: 14px;
`

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Container>
      <Spinner $size={size} role="status" aria-label="loading" />
      {message && <Message>{message}</Message>}
    </Container>
  )
}
