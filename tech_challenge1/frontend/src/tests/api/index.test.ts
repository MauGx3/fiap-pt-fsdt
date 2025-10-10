import AxiosMockAdapter from 'axios-mock-adapter'
import { AxiosRequestConfig } from 'axios'
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import {
    apiClient,
    authAPI,
    postsAPI,
    usersAPI,
    isAuthenticated,
    setToken,
    getToken,
    removeToken
} from '../../api'

let mock: AxiosMockAdapter

describe('API client', () => {
    beforeEach(() => {
        mock = new AxiosMockAdapter(apiClient)
        localStorage.clear()
    })

    afterEach(() => {
        mock.reset()
    })

    it('attaches auth token to outgoing requests', async () => {
        localStorage.setItem('token', 'test-token')

        mock.onGet('/posts').reply((config: AxiosRequestConfig) => {
            expect(config.headers?.Authorization).toBe('Bearer test-token')
            return [200, []]
        })

        await expect(postsAPI.getAll()).resolves.toEqual([])
    })

    it('stores and retrieves tokens correctly through auth API helpers', async () => {
        mock.onPost('/auth/login').reply(200, { token: 'abc-123', user: { name: 'Tester' } })

        const response = await authAPI.login({ email: 'tester@example.com', password: 'secret' })

        expect(response).toEqual({ token: 'abc-123', user: { name: 'Tester' } })
        expect(getToken()).toBe('abc-123')
        expect(isAuthenticated()).toBe(true)
    })

    it('removes tokens when a 401 response is intercepted', async () => {
        setToken('expired-token')
        mock.onGet('/users/me').reply(401, { error: 'Unauthorized' })

        await expect(usersAPI.getMe()).rejects.toMatchObject({ response: { status: 401 } })
        expect(localStorage.getItem('token')).toBeNull()
        expect(isAuthenticated()).toBe(false)
    })

    it('creates posts successfully', async () => {
        const payload = { title: 'New Post', content: 'Body', tags: ['vite'] }
        const expectedPost = { _id: '1', ...payload, author: 'test-author', createdAt: '2023-01-01T00:00:00.000Z' }
        mock.onPost('/posts', payload).reply(201, { message: 'Post created successfully', post: expectedPost })

        await expect(postsAPI.create(payload)).resolves.toMatchObject(expectedPost)
    })

    it('cleans up tokens on logout', async () => {
        setToken('logout-token')
        mock.onPost('/auth/logout').reply(200, { success: true })

        await expect(authAPI.logout()).resolves.toEqual({ success: true })
        expect(getToken()).toBeNull()
        expect(isAuthenticated()).toBe(false)
    })

    it('manually clears token helper', () => {
        setToken('manual-token')
        expect(getToken()).toBe('manual-token')
        removeToken()
        expect(getToken()).toBeNull()
    })
})
