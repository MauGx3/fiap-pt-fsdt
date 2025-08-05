
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require('../../controllers/usersController.js');

// mock user
jest.mock('../../models/User.js', () => jest.fn());

const User = require('../../models/User.js');

User.find = jest.fn();
User.findOne = jest.fn();
User.findOneAndUpdate = jest.fn();
User.findOneAndDelete = jest.fn();

// setup
describe('Users Controller', () => {
    let req, res, mockUserData;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            params: {},
            body: {},
            query: {}
        };

        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };

        mockUserData = {
            uuid: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test User',
            email: 'test@example.com',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    // tests
    describe('getAllUsers', () => {
        it('should return all users successfully', async () => {
            const mockUsers = [mockUserData, { ...mockUserData, uuid: 'different-uuid' }];

            User.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockUsers)
            });

            await getAllUsers(req, res);

            expect(User.find).toHaveBeenCalledWith();
            expect(User.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(res.json).toHaveBeenCalledWith(mockUsers);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should handle database errors', async () => {
            const errorMessage = 'Database connection failed';
            User.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error(errorMessage))
            });

            await getAllUsers(req, res);

            expect(console.error).toHaveBeenCalledWith('Get all users error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('getUserById', () => {
        beforeEach(() => {
            req.params.uuid = mockUserData.uuid;
        });

        it('should return user by UUID successfully', async () => {
            User.findOne.mockResolvedValue(mockUserData);

            await getUserById(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ uuid: mockUserData.uuid });
            expect(res.json).toHaveBeenCalledWith(mockUserData);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when user not found', async () => {
            User.findOne.mockResolvedValue(null);

            await getUserById(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ uuid: mockUserData.uuid });
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle database errors', async () => {
            const errorMessage = 'Database connection failed';
            User.findOne.mockRejectedValue(new Error(errorMessage));

            await getUserById(req, res);

            expect(console.error).toHaveBeenCalledWith('Get user by UUID error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('createUser', () => {
        beforeEach(() => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com'
            };
        });

        it('should create user successfully', async () => {
            User.findOne.mockResolvedValue(null); // No existing user

            // Mock User constructor
            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            const mockUserInstance = {
                save: mockSave
            };
            User.mockImplementation(() => mockUserInstance);

            await createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com'
            });
            expect(mockSave).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User created successfully',
                user: mockUserInstance
            });
        });

        it('should return 400 when name is missing', async () => {
            req.body.name = '';

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Name and email are required'
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        it('should return 400 when email is missing', async () => {
            req.body.email = '';

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Name and email are required'
            });
            expect(User.findOne).not.toHaveBeenCalled();
        });

        it('should return 400 when user already exists', async () => {
            User.findOne.mockResolvedValue(mockUserData); // Existing user found

            await createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'User with this email already exists'
            });
            expect(User).not.toHaveBeenCalled();
        });

        it('should handle email case insensitivity', async () => {
            req.body.email = 'TEST@EXAMPLE.COM';
            User.findOne.mockResolvedValue(null);

            const mockSave = jest.fn().mockResolvedValue(mockUserData);
            User.mockImplementation(() => ({
                save: mockSave
            }));

            await createUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
            expect(User).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com'
            });
        });

        it('should handle validation errors', async () => {
            User.findOne.mockResolvedValue(null);
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.message = 'Email format is invalid';

            const mockSave = jest.fn().mockRejectedValue(validationError);
            User.mockImplementation(() => ({
                save: mockSave
            }));

            await createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed: Email format is invalid'
            });
        });

        it('should handle database errors', async () => {
            User.findOne.mockResolvedValue(null);
            const dbError = new Error('Database connection failed');

            const mockSave = jest.fn().mockRejectedValue(dbError);
            User.mockImplementation(() => ({
                save: mockSave
            }));

            await createUser(req, res);

            expect(console.error).toHaveBeenCalledWith('Create user error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('updateUser', () => {
        beforeEach(() => {
            req.params.uuid = mockUserData.uuid;
            req.body = {
                name: 'Updated User',
                email: 'updated@example.com'
            };
        });

        it('should update user successfully', async () => {
            const updatedUser = { ...mockUserData, name: 'Updated User', email: 'updated@example.com' };

            User.findOne.mockResolvedValue(null); // No email conflict
            User.findOneAndUpdate.mockResolvedValue(updatedUser);

            await updateUser(req, res);

            expect(User.findOne).toHaveBeenCalledWith({
                email: 'updated@example.com',
                uuid: { $ne: mockUserData.uuid }
            });
            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { uuid: mockUserData.uuid },
                { $set: { name: 'Updated User', email: 'updated@example.com' } },
                { new: true, runValidators: true }
            );
            expect(res.json).toHaveBeenCalledWith({
                message: 'User updated successfully',
                user: updatedUser
            });
        });

        it('should update only name when email is not provided', async () => {
            req.body = { name: 'Updated Name Only' };
            const updatedUser = { ...mockUserData, name: 'Updated Name Only' };

            User.findOneAndUpdate.mockResolvedValue(updatedUser);

            await updateUser(req, res);

            expect(User.findOne).not.toHaveBeenCalled(); // No email check needed
            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { uuid: mockUserData.uuid },
                { $set: { name: 'Updated Name Only' } },
                { new: true, runValidators: true }
            );
        });

        it('should return 400 when email is already taken', async () => {
            User.findOne.mockResolvedValue(mockUserData); // Email conflict found

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Email is already taken by another user'
            });
            expect(User.findOneAndUpdate).not.toHaveBeenCalled();
        });

        it('should return 404 when user not found', async () => {
            User.findOne.mockResolvedValue(null);
            User.findOneAndUpdate.mockResolvedValue(null);

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle validation errors', async () => {
            const validationError = new Error('Validation failed');
            validationError.name = 'ValidationError';
            validationError.message = 'Email format is invalid';

            User.findOne.mockResolvedValue(null);
            User.findOneAndUpdate.mockRejectedValue(validationError);

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Validation failed: Email format is invalid'
            });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database connection failed');

            User.findOne.mockResolvedValue(null);
            User.findOneAndUpdate.mockRejectedValue(dbError);

            await updateUser(req, res);

            expect(console.error).toHaveBeenCalledWith('Update user error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('deleteUser', () => {
        beforeEach(() => {
            req.params.uuid = mockUserData.uuid;
        });

        it('should delete user successfully', async () => {
            User.findOneAndDelete.mockResolvedValue(mockUserData);

            await deleteUser(req, res);

            expect(User.findOneAndDelete).toHaveBeenCalledWith({ uuid: mockUserData.uuid });
            expect(res.json).toHaveBeenCalledWith({
                message: 'User deleted successfully',
                user: mockUserData
            });
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 404 when user not found', async () => {
            User.findOneAndDelete.mockResolvedValue(null);

            await deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
        });

        it('should handle database errors', async () => {
            const dbError = new Error('Database connection failed');
            User.findOneAndDelete.mockRejectedValue(dbError);

            await deleteUser(req, res);

            expect(console.error).toHaveBeenCalledWith('Delete user error:', expect.any(Error));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });
});
