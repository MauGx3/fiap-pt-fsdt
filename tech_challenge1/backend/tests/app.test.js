import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import { createTestApp } from './testApp.js';

const app = createTestApp();

describe('Application Health and Routes', () => {
    describe('Health Endpoint', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body.timestamp).toBeDefined();
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });
    });

    describe('404 Handler', () => {
        test('should return 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/non-existent-route')
                .expect(404);

            expect(response.body.error).toBe('Route not found');
        });

        test('should return 404 for non-existent API routes', async () => {
            const response = await request(app)
                .get('/api/non-existent')
                .expect(404);

            expect(response.body.error).toBe('Route not found');
        });
    });

    describe('Route Mounting', () => {
        test('should mount auth routes correctly', async () => {
            // Test that auth routes are mounted at /api/auth
            const response = await request(app)
                .post('/api/auth/register')
                .send({}) // Invalid data to trigger validation
                .expect(400);

            expect(response.body.error).toBeDefined();
        });

        test('should mount posts routes correctly', async () => {
            // Test that posts routes are mounted at /api/posts
            const response = await request(app)
                .get('/api/posts')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('should mount users routes correctly', async () => {
            // Test that users routes are mounted at /api/users
            const response = await request(app)
                .get('/api/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('Middleware', () => {
        test('should handle JSON requests', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
        });

        test('should handle large JSON payloads (within limit)', async () => {
            const largeContent = 'x'.repeat(1000); // 1KB content
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...userData, bio: largeContent })
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed JSON', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);

            // Express will handle JSON parsing errors
            expect(response.status).toBe(400);
        });
    });
});
