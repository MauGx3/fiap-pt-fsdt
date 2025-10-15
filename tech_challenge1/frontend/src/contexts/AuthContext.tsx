import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI, isAuthenticated, getToken, setToken, removeToken } from '../api'

interface User {
    uuid: string
    name: string
    email: string
    role: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if user is already authenticated on app start
        const checkAuth = async () => {
            if (isAuthenticated()) {
                try {
                    const response = await authAPI.verify()
                    if (response?.user) {
                        setUser(response.user)
                    } else {
                        setUser(null)
                    }
                } catch (error) {
                    // Token is invalid, remove it
                    removeToken()
                    setUser(null)
                }
            }
            setIsLoading(false)
        }

        checkAuth()
    }, [])

    const login = async (email: string, password: string) => {
        const response = await authAPI.login({ email, password })
        setUser(response.user)
    }

    const register = async (name: string, email: string, password: string) => {
        const response = await authAPI.register({ name, email, password })
        // Don't set user here as registration doesn't automatically log in
    }

    const logout = () => {
        authAPI.logout()
        setUser(null)
        removeToken()
    }

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
