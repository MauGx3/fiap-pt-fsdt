# Blog API Test Suite

This document describes the comprehensive test suite for the Blog API application.

## Test Structure

```
tests/
├── setup.js                    # Test configuration and utilities
├── testApp.js                  # Test application factory
├── app.test.js                 # Application-level tests
├── models/
│   ├── User.test.js            # User model tests
│   └── Post.test.js            # Post model tests
├── middleware/
│   └── auth.test.js            # Authentication middleware tests
├── controllers/
│   └── posts.test.js           # Posts controller tests
├── routes/
│   ├── auth.test.js            # Authentication routes tests
│   ├── users.test.js           # User routes tests
│   └── posts.test.js           # Posts routes tests
└── integration/
    └── blog.test.js            # End-to-end integration tests
```

## Test Categories

### Unit Tests

Test individual components in isolation:

- **Models**: User and Post model validation, methods, and schemas
- **Middleware**: Authentication, authorization, and error handling
- **Controllers**: Business logic and data processing

### Integration Tests

Test API endpoints and workflows:

- **Routes**: HTTP endpoints, request/response handling
- **Authentication**: Login, registration, token management
- **Authorization**: Role-based access control

### End-to-End Tests

Test complete user journeys:

- **User Registration → Login → Create Post → Update Post → Delete Post**
- **User Profile Management**
- **Multi-user Scenarios**
- **Error Handling and Edge Cases**

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose

# Run tests silently
npm run test:silent
```

### Specific Test Suites

```bash
# Unit tests only (models, middleware, controllers)
npm run test:unit

# Integration tests only (routes, workflows)
npm run test:integration

# Authentication-related tests
npm run test:auth

# Post-related tests
npm run test:posts

# User-related tests
npm run test:users
```

### Using the Test Runner Script

```bash
# Run specific test categories
npm run test:script unit
npm run test:script integration
npm run test:script auth
npm run test:script posts
npm run test:script users

# Run with coverage
npm run test:script coverage

# Run in watch mode
npm run test:script watch

# Run all tests
npm run test:script all
```

## Test Environment

### Database

- Uses **MongoDB Memory Server** for isolated testing
- Each test gets a fresh database instance
- Automatic cleanup between tests

### Authentication

- Test JWT secret: `test-jwt-secret-key-for-testing-only`
- Token expiration: 1 hour (configurable)
- Automatic token generation for authenticated tests

### Test Utilities

The `setup.js` file provides global utilities:

```javascript
// Create test user
const user = await global.testUtils.createTestUser(User, {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  role: "author",
});

// Create test post
const post = await global.testUtils.createTestPost(Post, user, {
  title: "Test Post",
  content: "Test content",
});
```

## Test Coverage

Current coverage targets:

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Test Data Patterns

### User Test Data

```javascript
const userData = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  role: "author", // or 'admin', 'reader'
};
```

### Post Test Data

```javascript
const postData = {
  title: "Test Post Title",
  content: "Test post content",
  author: user.uuid,
};
```

### Authentication Headers

```javascript
const response = await request(app)
  .get("/api/posts")
  .set("Authorization", `Bearer ${token}`)
  .expect(200);
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` for setup
- Clean database between tests

### 2. Descriptive Test Names

```javascript
test("should reject login with invalid password", async () => {
  // Test implementation
});
```

### 3. Test Edge Cases

- Invalid input data
- Authorization failures
- Network errors
- Database validation errors

### 4. Mock External Dependencies

- Database operations in unit tests
- HTTP requests to external services
- File system operations

### 5. Test Error Conditions

```javascript
test("should return 404 for non-existent post", async () => {
  const response = await request(app)
    .get("/api/posts/nonexistent-id")
    .expect(404);

  expect(response.body.error).toBe("Post not found");
});
```

## Common Test Patterns

### Authentication Test

```javascript
describe("Protected Route", () => {
  let authToken;

  beforeEach(async () => {
    const user = await global.testUtils.createTestUser(User);
    authToken = generateToken(user);
  });

  test("should allow access with valid token", async () => {
    await request(app)
      .get("/protected-endpoint")
      .set("Authorization", `Bearer ${authToken}`)
      .expect(200);
  });
});
```

### Database Validation Test

```javascript
test("should validate required fields", async () => {
  const response = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${token}`)
    .send({ title: "Missing content" })
    .expect(400);

  expect(response.body.error).toContain("required");
});
```

### Authorization Test

```javascript
test("should enforce ownership for updates", async () => {
  const otherUserPost = await createPostByOtherUser();

  const response = await request(app)
    .put(`/api/posts/${otherUserPost._id}`)
    .set("Authorization", `Bearer ${currentUserToken}`)
    .send({ title: "Hacked!" })
    .expect(403);

  expect(response.body.error).toContain("Access denied");
});
```

## Debugging Tests

### Run Single Test File

```bash
npm test -- tests/routes/auth.test.js
```

### Run Single Test Case

```bash
npm test -- --testNamePattern="should login with valid credentials"
```

### Debug Mode

```bash
npm test -- --runInBand --detectOpenHandles
```

## Continuous Integration

The test suite is designed to run in CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm ci
    npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v1
```

## Performance Testing

### Load Testing

```javascript
test("should handle multiple concurrent requests", async () => {
  const promises = Array(10)
    .fill()
    .map(() => request(app).get("/api/posts").expect(200));

  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    expect(response.body).toBeDefined();
  });
});
```

### Response Time Testing

```javascript
test("should respond within acceptable time", async () => {
  const start = Date.now();
  await request(app).get("/api/posts").expect(200);
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(1000); // 1 second
});
```

## Adding New Tests

When adding new features:

1. **Write tests first** (TDD approach)
2. **Test both success and failure cases**
3. **Include edge cases and boundary conditions**
4. **Update coverage thresholds if needed**
5. **Document new test patterns**

### Example: Adding New Route Test

```javascript
describe("POST /api/new-feature", () => {
  test("should create new feature successfully", async () => {
    const featureData = { name: "Test Feature" };

    const response = await request(app)
      .post("/api/new-feature")
      .set("Authorization", `Bearer ${authToken}`)
      .send(featureData)
      .expect(201);

    expect(response.body.message).toBe("Feature created successfully");
    expect(response.body.feature.name).toBe(featureData.name);
  });

  test("should require authentication", async () => {
    await request(app)
      .post("/api/new-feature")
      .send({ name: "Test" })
      .expect(401);
  });
});
```
