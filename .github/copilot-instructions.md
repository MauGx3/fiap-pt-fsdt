# AI Coding Assistant Instructions

## Architecture Overview

This is a full-stack blog application with:
- **Backend**: Node.js/Express.js API with MongoDB, JWT authentication, role-based access control
- **Frontend**: React/TypeScript with Vite, styled-components theming, axios API client
- **Database**: MongoDB with Mongoose ODM
- **Deployment**: Docker Compose with health checks and multi-stage builds

## Key Patterns & Conventions

### Frontend Requirements (Required Throughout Application)
- **React**: Use functional components with hooks exclusively (no class components)
- **Styling**: Prefer styled-components for all component styling. Small utility or legacy components may use CSS Modules when migration is impractical; avoid new global/plain CSS files.
- **Responsive Design**: All components must be responsive for desktop and mobile
- **API Integration**: REST API calls using axios throughout the application
- **State Management**: React Context API for global state (no Redux or other state libraries)

### Authentication & Authorization
- JWT tokens stored in localStorage with automatic header injection via axios interceptors
- Role-based access: `user` (default) and `admin` roles
- Backend uses `authenticateUser` middleware + `requireRole()` for protected routes
- Token expiration handled via response interceptor (401 → logout)

### API Response Patterns
```javascript
// Success responses
{ message: "Success message", post: {...} }  // Create/update operations
{ ...data }  // Read operations

// Error responses
{ error: "Error message" }
```

### Database Relationships
- Posts reference users by `uuid` (string), not ObjectId
- Author names resolved via joins in controllers (not populated in schemas)
- Use `$eq` operator for secure UUID lookups: `{ uuid: { $eq: decoded.uuid } }`

### Testing Patterns
- **Backend**: Jest with mongodb-memory-server, test utilities in `global.testUtils`
- **Frontend**: Vitest with React Testing Library, axios-mock-adapter
- Mock data created via test utilities: `global.testUtils.createTestUser()`, `createTestPost()`
- API mocks return `{ message, post }` format for create/update operations

### Component Architecture
- **React Patterns**: Functional components with hooks (useState, useEffect, useContext, etc.)
- **Styling**: Prefer styled-components for component styling and theme-aware CSS variables. CSS Modules are permitted for small or legacy components (see existing `*.module.css` files under `frontend/src/components/`); avoid introducing new global plain CSS files.
- **Responsive Design**: Mobile-first approach with responsive breakpoints throughout
- **API Integration**: REST calls using axios with proper error handling and loading states
- **State Management**: React Context API for authentication, theme, and global app state
- **Theme System**: Context-based light/dark mode switching affecting all components
- **Error Boundaries**: Error boundaries and loading states throughout the application

### Development Workflow
```bash
# Full stack development
docker compose up --build

# Backend only development
cd tech_challenge1/backend && npm run dev

# Frontend only development
cd tech_challenge1/frontend && npm run dev

# Testing
npm test  # Root runs all tests
npm run test:ci  # CI mode with coverage
```

### Environment Configuration
- Backend: `.env` with `JWT_SECRET`, `MONGO_URI`, `PORT`
- Frontend: Vite env vars prefixed with `VITE_`
- Docker: Environment variables injected via compose.yaml

### Security Patterns
- bcrypt for password hashing (cost factor 12)
- Rate limiting on all routes (100 requests/15min)
- CORS configured for cross-origin requests
- Input validation and sanitization
- JWT with issuer/subject claims for additional security

### File Structure Conventions
```
backend/
├── models/          # Mongoose schemas
├── routes/          # Express route handlers
├── middleware/      # Auth, rate limiting, validation
├── controllers/     # Business logic
└── tests/           # Jest test suites

frontend/src/
frontend/src/
├── api/            # Axios client and API methods
├── components/     # React components (styled-components preferred; some CSS Modules exist)
├── contexts/       # React context providers
├── theme/          # Theme context and utilities
└── tests/          # Vitest test suites
```

### Common Gotchas
- **React Patterns**: Always use functional components with hooks - no class components allowed
- **Styling**: Prefer styled-components; CSS Modules are allowed for small/legacy components when migration isn't practical. Avoid adding new global/plain CSS files.
- **Responsive Design**: All components must be mobile-responsive - test on both desktop and mobile
- **API Integration**: All data fetching uses axios with REST API calls - no fetch API or other HTTP clients
- **State Management**: Use React Context API for global state - no Redux or other state libraries
- Backend uses ES modules (`import`/`export`), not CommonJS
- MongoDB connections require health checks in Docker
- Frontend API client returns `response.data.post` for create/update (not full response)
- Theme CSS variables must be updated in both `App.tsx` and component stylesheets
- Test mocks must match actual API response formats exactly</content>
<parameter name="filePath">/Users/mgioachini/Documents/GitHub/fiap-pt-fsdt/.github/copilot-instructions.md
