# End-to-End Tests with Playwright

This directory contains end-to-end tests for the FIAP Blog application using Playwright.

## Prerequisites

- Node.js >= 20.0.0
- Docker (for running the full stack)
- All dependencies installed (`npm install` in the root directory)

## Setup

1. Ensure the application is running:
   ```bash
   # Option 1: Using Docker Compose (recommended)
   docker compose up --build
   
   # Option 2: Running services locally
   # Terminal 1: Start MongoDB
   docker run --rm -d --name fiap-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=fiap-blog mongo:7.0
   
   # Terminal 2: Start Backend
   cd tech_challenge1/backend
   npm install
   MONGO_URI=mongodb://localhost:27017/fiap-blog JWT_SECRET=your-secret-key PORT=3000 npm start
   
   # Terminal 3: Start Frontend
   cd tech_challenge1/frontend
   npm install
   npm run build
   npm run preview
   ```

2. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install chromium
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Coverage

The E2E tests cover the following scenarios:

1. **Create Post**: Tests the ability to create a new blog post from the home page
   - Click "Create Post" button
   - Fill in title, content, and tags
   - Submit the form
   - Verify the post appears in the list

2. **View Post**: Tests that created posts are visible on the home page
   - Verify post title is displayed
   - Verify post content is visible
   - Verify tags are shown

3. **Edit Post**: Tests the ability to edit an existing post
   - Click "Edit" button on a post
   - Modify the title, content, and tags
   - Save the changes
   - Verify the updated content is displayed

## Test Files

- `posts.spec.ts` - Main test suite for post management operations

## Configuration

The Playwright configuration is defined in `playwright.config.ts` at the root level. Key settings:

- Base URL: `http://localhost:8080`
- Browser: Chromium (desktop)
- Test directory: `./e2e`
- Automatic server startup via `docker compose up` (when running tests)

## Notes

- Tests require authentication. A test user is created via the API before running post creation/editing tests.
- The application must be running before executing tests (unless using the built-in webServer configuration).
- Screenshots are captured on test failures for debugging.
- Test results and reports are generated in the `playwright-report/` directory.
