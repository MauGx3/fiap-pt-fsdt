# Simple Blog API

A simplified blog API without authentication, focusing on basic CRUD operations for posts and comments with UUID identification.

## Features

- ✅ Create, read, update, delete posts
- ✅ Add and delete comments on posts
- ✅ Search posts by title and content
- ✅ UUID-based identification for posts, comments, and users
- ✅ No authentication required
- ✅ MongoDB with Mongoose
- ✅ Express.js framework
- ✅ CORS enabled
- ✅ Error handling and validation
- ❌ No user authentication/authorization
- ❌ No password handling
- ❌ No JWT tokens
- ❌ No role-based access control

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)

### Installation

```bash
cd backend-simple
npm install
```

### Environment Setup

Create a `.env` file (optional):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/simple-blog
NODE_ENV=development
```

### Run the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints Overview

Visit `http://localhost:3001/api` for interactive API documentation.

### Posts

#### Get All Posts
```http
GET /api/posts
```

#### Get Post by ID
```http
GET /api/posts/:id
```

#### Create Post
```http
POST /api/posts
Content-Type: application/json

{
  "title": "Post Title",
  "content": "Post content here...",
  "author": "uuid-here",
  "authorName": "Author Name (optional)"
}
```

#### Update Post
```http
PUT /api/posts/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### Delete Post
```http
DELETE /api/posts/:id
```

#### Search Posts
```http
GET /api/posts/search?query=search-term
```

### Comments

#### Add Comment to Post
```http
POST /api/posts/:id/comments
Content-Type: application/json

{
  "text": "Comment text here...",
  "author": "uuid-here",
  "authorName": "Commenter Name (optional)"
}
```

#### Delete Comment
```http
DELETE /api/posts/:postId/comments/:commentId
```

### Users

#### Get All Users
```http
GET /api/users
```

#### Get User by UUID
```http
GET /api/users/:uuid
```

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com"
}
```

#### Update User
```http
PUT /api/users/:uuid
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Delete User
```http
DELETE /api/users/:uuid
```

## Data Models

### Post Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  author: String (UUID, required),
  authorName: String (default: "Anonymous"),
  comments: [Comment],
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Model (embedded in Post)
```javascript
{
  id: String (UUID, auto-generated),
  author: String (UUID, required),
  authorName: String (default: "Anonymous"),
  text: String (required),
  createdAt: Date
}
```

### User Model
```javascript
{
  _id: ObjectId,
  uuid: String (auto-generated, unique),
  name: String (required),
  email: String (required, unique),
  createdAt: Date,
  updatedAt: Date
}
```

## Example Usage

### 1. Create a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### 2. Create a Post
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author": "user-uuid-here",
    "authorName": "John Doe"
  }'
```

### 3. Add a Comment
```bash
curl -X POST http://localhost:3001/api/posts/POST_ID_HERE/comments \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Great post!",
    "author": "commenter-uuid-here",
    "authorName": "Jane Smith"
  }'
```

### 4. Search Posts
```bash
curl "http://localhost:3001/api/posts/search?query=first"
```

## Health Check

Check if the API is running:
```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "version": "1.0.0-simple",
  "environment": "development"
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message here",
  "details": "Additional details when available"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Differences from Full Version

This simplified version removes:
- Authentication middleware
- JWT token handling
- Password encryption
- Role-based access control
- User login/logout
- Protected routes
- Authorization checks

## Development Notes

- All operations are public (no authentication required)
- UUIDs are used for user and comment identification
- MongoDB ObjectIds are used for post identification
- Validation is handled at the model level
- CORS is enabled for all routes
- Request logging is included for debugging

## Next Steps

To add authentication back:
1. Install `jsonwebtoken` and `bcrypt`
2. Add password field to User model
3. Create authentication middleware
4. Add protected routes
5. Implement login/register endpoints
