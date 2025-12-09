import { useState, useCallback } from 'react'

export interface UseTurnstileReturn {
    token: string | null
    error: string | null
    handleVerify: (token: string) => void
    handleError: () => void
    handleExpire: () => void
    setError: (error: string) => void
    clearError: () => void
}

export function useTurnstile(): UseTurnstileReturn {
    const [token, setToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleVerify = useCallback((newToken: string) => {
        setToken(newToken)
        setError(null)
    }, [])

    const handleError = useCallback(() => {
        setError('Verification failed. Please try again.')
        setToken(null)
    }, [])

    const handleExpire = useCallback(() => {
        setError('Verification expired. Please verify again.')
        setToken(null)
    }, [])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    return {
        token,
        error,
        handleVerify,
        handleError,
        handleExpire,
        setError,
        clearError,
    }
}
