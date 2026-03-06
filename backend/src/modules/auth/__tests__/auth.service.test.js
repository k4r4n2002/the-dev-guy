/**
 * backend/src/modules/auth/__tests__/auth.service.test.js
 *
 * Unit tests for AuthService.
 *
 * Pattern: we mock the repository so these tests never touch a real database.
 * This is WHY the Repository Pattern exists — the service logic is testable
 * in complete isolation.
 *
 * Run: npm test  (from the backend/ directory)
 */

'use strict';

// ── Mock the repository BEFORE importing the service ──────────────────────
// Jest hoists jest.mock() calls, so this is safe.
jest.mock('../auth.repository');
jest.mock('../../../config/env', () => ({
    jwtSecret: 'test-secret-for-jest',
    jwtExpiresIn: '1d',
    isDevelopment: true,
    isProduction: false,
    nodeEnv: 'test',
}));

const authRepository = require('../auth.repository');
const authService = require('../auth.service');
const ApiError = require('../../../utils/ApiError');

// ── Helpers ────────────────────────────────────────────────────────────────
function makeFakeUser(overrides = {}) {
    return {
        _id: '64abc123000000000000abcd',
        username: 'testuser',
        email: 'test@example.com',
        bio: '',
        createdAt: new Date().toISOString(),
        // comparePassword is an instance method on the Mongoose doc
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
            _id: '64abc123000000000000abcd',
            username: 'testuser',
            email: 'test@example.com',
            bio: '',
        }),
        ...overrides,
    };
}

// ── Test suite ─────────────────────────────────────────────────────────────
describe('AuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ── register ─────────────────────────────────────────────────────────
    describe('register', () => {
        it('creates a user and returns a token when email and username are free', async () => {
            authRepository.findByEmail.mockResolvedValue(null);
            authRepository.findByUsername.mockResolvedValue(null);
            authRepository.create.mockResolvedValue(makeFakeUser());

            const result = await authService.register({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
                bio: '',
            });

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('passwordHash');
        });

        it('throws 409 when email is already registered', async () => {
            authRepository.findByEmail.mockResolvedValue(makeFakeUser());

            await expect(
                authService.register({
                    username: 'newuser',
                    email: 'taken@example.com',
                    password: 'password123',
                })
            ).rejects.toThrow(ApiError);

            await expect(
                authService.register({
                    username: 'newuser',
                    email: 'taken@example.com',
                    password: 'password123',
                })
            ).rejects.toMatchObject({ statusCode: 409 });
        });

        it('throws 409 when username is already taken', async () => {
            authRepository.findByEmail.mockResolvedValue(null);
            authRepository.findByUsername.mockResolvedValue(makeFakeUser());

            await expect(
                authService.register({
                    username: 'takenuser',
                    email: 'new@example.com',
                    password: 'password123',
                })
            ).rejects.toMatchObject({ statusCode: 409 });
        });
    });

    // ── login ─────────────────────────────────────────────────────────────
    describe('login', () => {
        it('returns user and token on valid credentials', async () => {
            const fakeUser = makeFakeUser();
            authRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);

            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('test@example.com');
            expect(fakeUser.comparePassword).toHaveBeenCalledWith('password123');
        });

        it('throws 401 when user is not found', async () => {
            authRepository.findByEmailWithPassword.mockResolvedValue(null);

            await expect(
                authService.login({ email: 'ghost@example.com', password: 'any' })
            ).rejects.toMatchObject({ statusCode: 401 });
        });

        it('throws 401 when password does not match', async () => {
            const fakeUser = makeFakeUser({
                comparePassword: jest.fn().mockResolvedValue(false),
            });
            authRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);

            await expect(
                authService.login({ email: 'test@example.com', password: 'wrong' })
            ).rejects.toMatchObject({ statusCode: 401 });
        });

        it('uses the same error message for wrong email and wrong password', async () => {
            // Security: don't reveal which field was wrong
            authRepository.findByEmailWithPassword.mockResolvedValue(null);
            let error1;
            try {
                await authService.login({ email: 'ghost@example.com', password: 'any' });
            } catch (e) { error1 = e; }

            const fakeUser = makeFakeUser({
                comparePassword: jest.fn().mockResolvedValue(false),
            });
            authRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
            let error2;
            try {
                await authService.login({ email: 'test@example.com', password: 'wrong' });
            } catch (e) { error2 = e; }

            expect(error1.message).toBe(error2.message);
        });
    });

    // ── getMe ─────────────────────────────────────────────────────────────
    describe('getMe', () => {
        it('returns the user when found', async () => {
            const fakeUser = { _id: 'abc', username: 'alice', email: 'a@b.com' };
            authRepository.findById.mockResolvedValue(fakeUser);

            const result = await authService.getMe('abc');
            expect(result.username).toBe('alice');
        });

        it('throws 404 when user does not exist', async () => {
            authRepository.findById.mockResolvedValue(null);

            await expect(authService.getMe('nonexistent')).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });
});