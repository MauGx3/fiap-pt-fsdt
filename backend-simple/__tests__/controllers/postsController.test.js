const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  addComment,
  deleteComment
} = require('../../controllers/postsController.js');

// Mock the Post model
jest.mock('../../models/Post.js', () => jest.fn());

const Post = require('../../models/Post.js');

// Setup Post mock methods
Post.find = jest.fn();
Post.findById = jest.fn();
Post.findByIdAndUpdate = jest.fn();
Post.findByIdAndDelete = jest.fn();

describe('Posts Controller', () => {
  let req, res, mockPostData, mockCommentData;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      params: {},
      body: {},
      query: {}
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };

    // Mock post data
    mockPostData = {
      _id: '507f1f77bcf86cd799439011',
      title: 'Test Post',
      content: 'This is a test post content',
      author: '123e4567-e89b-12d3-a456-426614174000',
      authorName: 'Test Author',
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock comment data
    mockCommentData = {
      id: 'comment-123',
      author: '123e4567-e89b-12d3-a456-426614174000',
      authorName: 'Test Commenter',
      text: 'This is a test comment',
      createdAt: new Date()
    };

    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  describe('getAllPosts', () => {
    it('should return all posts successfully', async () => {
      const mockPosts = [mockPostData, { ...mockPostData, _id: 'different-id' }];
      
      Post.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPosts)
      });

      await getAllPosts(req, res);

      expect(Post.find).toHaveBeenCalledWith();
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockPosts);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const errorMessage = 'Database connection failed';
      Post.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      await getAllPosts(req, res);

      expect(console.error).toHaveBeenCalledWith('Get all posts error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getPostById', () => {
    beforeEach(() => {
      req.params.id = mockPostData._id;
    });

    it('should return post by ID successfully', async () => {
      Post.findById.mockResolvedValue(mockPostData);

      await getPostById(req, res);

      expect(Post.findById).toHaveBeenCalledWith(mockPostData._id);
      expect(res.json).toHaveBeenCalledWith(mockPostData);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 when post not found', async () => {
      Post.findById.mockResolvedValue(null);

      await getPostById(req, res);

      expect(Post.findById).toHaveBeenCalledWith(mockPostData._id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle CastError for invalid ID format', async () => {
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      Post.findById.mockRejectedValue(castError);

      await getPostById(req, res);

      expect(console.error).toHaveBeenCalledWith('Get post by ID error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid post ID format' });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Post.findById.mockRejectedValue(dbError);

      await getPostById(req, res);

      expect(console.error).toHaveBeenCalledWith('Get post by ID error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createPost', () => {
    beforeEach(() => {
      req.body = {
        title: 'Test Post',
        content: 'This is a test post content',
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Test Author'
      };
    });

    it('should create post successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue(mockPostData);
      const mockPostInstance = {
        save: mockSave
      };
      Post.mockImplementation(() => mockPostInstance);

      await createPost(req, res);

      expect(Post).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'This is a test post content',
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Test Author'
      });
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post created successfully',
        post: mockPostInstance
      });
    });

    it('should create post with default authorName when not provided', async () => {
      req.body.authorName = undefined;
      
      const mockSave = jest.fn().mockResolvedValue(mockPostData);
      const mockPostInstance = {
        save: mockSave
      };
      Post.mockImplementation(() => mockPostInstance);

      await createPost(req, res);

      expect(Post).toHaveBeenCalledWith({
        title: 'Test Post',
        content: 'This is a test post content',
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Anonymous'
      });
    });

    it('should return 400 when title is missing', async () => {
      req.body.title = '';

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title, content, and author UUID are required'
      });
      expect(Post).not.toHaveBeenCalled();
    });

    it('should return 400 when content is missing', async () => {
      req.body.content = '';

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title, content, and author UUID are required'
      });
      expect(Post).not.toHaveBeenCalled();
    });

    it('should return 400 when author is missing', async () => {
      req.body.author = '';

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Title, content, and author UUID are required'
      });
      expect(Post).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.message = 'Author must be a valid UUID';
      
      const mockSave = jest.fn().mockRejectedValue(validationError);
      Post.mockImplementation(() => ({
        save: mockSave
      }));

      await createPost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed: Author must be a valid UUID'
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      
      const mockSave = jest.fn().mockRejectedValue(dbError);
      Post.mockImplementation(() => ({
        save: mockSave
      }));

      await createPost(req, res);

      expect(console.error).toHaveBeenCalledWith('Create post error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('updatePost', () => {
    beforeEach(() => {
      req.params.id = mockPostData._id;
      req.body = {
        title: 'Updated Post Title',
        content: 'Updated post content'
      };
    });

    it('should update post successfully', async () => {
      const updatedPost = { 
        ...mockPostData, 
        title: 'Updated Post Title', 
        content: 'Updated post content',
        updatedAt: expect.any(Date)
      };
      
      Post.findById.mockResolvedValue(mockPostData);
      Post.findByIdAndUpdate.mockResolvedValue(updatedPost);

      await updatePost(req, res);

      expect(Post.findById).toHaveBeenCalledWith(mockPostData._id);
      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostData._id,
        { 
          $set: { 
            title: 'Updated Post Title', 
            content: 'Updated post content',
            updatedAt: expect.any(Date)
          } 
        },
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully',
        post: updatedPost
      });
    });

    it('should update only title when content is not provided', async () => {
      req.body = { title: 'Updated Title Only' };
      const updatedPost = { 
        ...mockPostData, 
        title: 'Updated Title Only',
        updatedAt: expect.any(Date)
      };
      
      Post.findById.mockResolvedValue(mockPostData);
      Post.findByIdAndUpdate.mockResolvedValue(updatedPost);

      await updatePost(req, res);

      expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostData._id,
        { 
          $set: { 
            title: 'Updated Title Only',
            updatedAt: expect.any(Date)
          } 
        },
        { new: true, runValidators: true }
      );
    });

    it('should return 404 when post not found', async () => {
      Post.findById.mockResolvedValue(null);

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
      expect(Post.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should handle CastError for invalid ID format', async () => {
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      Post.findById.mockRejectedValue(castError);

      await updatePost(req, res);

      expect(console.error).toHaveBeenCalledWith('Update post error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid post ID format' });
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.message = 'Title is required';
      
      Post.findById.mockResolvedValue(mockPostData);
      Post.findByIdAndUpdate.mockRejectedValue(validationError);

      await updatePost(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed: Title is required'
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      
      Post.findById.mockResolvedValue(mockPostData);
      Post.findByIdAndUpdate.mockRejectedValue(dbError);

      await updatePost(req, res);

      expect(console.error).toHaveBeenCalledWith('Update post error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deletePost', () => {
    beforeEach(() => {
      req.params.id = mockPostData._id;
    });

    it('should delete post successfully', async () => {
      Post.findByIdAndDelete.mockResolvedValue(mockPostData);

      await deletePost(req, res);

      expect(Post.findByIdAndDelete).toHaveBeenCalledWith(mockPostData._id);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post deleted successfully',
        post: mockPostData
      });
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 when post not found', async () => {
      Post.findByIdAndDelete.mockResolvedValue(null);

      await deletePost(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle CastError for invalid ID format', async () => {
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      Post.findByIdAndDelete.mockRejectedValue(castError);

      await deletePost(req, res);

      expect(console.error).toHaveBeenCalledWith('Delete post error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid post ID format' });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Post.findByIdAndDelete.mockRejectedValue(dbError);

      await deletePost(req, res);

      expect(console.error).toHaveBeenCalledWith('Delete post error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('searchPosts', () => {
    beforeEach(() => {
      req.query.query = 'test';
    });

    it('should search posts successfully', async () => {
      const mockSearchResults = [mockPostData];
      
      Post.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSearchResults)
      });

      await searchPosts(req, res);

      expect(Post.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'test', $options: 'i' } },
          { content: { $regex: 'test', $options: 'i' } }
        ]
      });
      expect(Post.find().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.json).toHaveBeenCalledWith(mockSearchResults);
    });

    it('should return 400 when query parameter is missing', async () => {
      req.query.query = undefined;

      await searchPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing query parameter' });
      expect(Post.find).not.toHaveBeenCalled();
    });

    it('should handle empty query parameter', async () => {
      req.query.query = '';

      await searchPosts(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing query parameter' });
      expect(Post.find).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Post.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(dbError)
      });

      await searchPosts(req, res);

      expect(console.error).toHaveBeenCalledWith('Search posts error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('addComment', () => {
    beforeEach(() => {
      req.params.id = mockPostData._id;
      req.body = {
        text: 'This is a test comment',
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Test Commenter'
      };
    });

    it('should add comment successfully', async () => {
      const mockPost = {
        ...mockPostData,
        comments: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock the push method and simulate adding comment
      const pushMock = jest.fn();
      mockPost.comments.push = pushMock;
      mockPost.comments.push.mockImplementation((comment) => {
        mockPost.comments = [comment];
        return mockPost.comments.length;
      });
      
      Post.findById.mockResolvedValue(mockPost);

      await addComment(req, res);

      expect(Post.findById).toHaveBeenCalledWith(mockPostData._id);
      expect(pushMock).toHaveBeenCalledWith({
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Test Commenter',
        text: 'This is a test comment',
        createdAt: expect.any(Date)
      });
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment added successfully',
        comment: mockPost.comments[0]
      });
    });

    it('should add comment with default authorName when not provided', async () => {
      req.body.authorName = undefined;
      
      const mockPost = {
        ...mockPostData,
        comments: [],
        save: jest.fn().mockResolvedValue(true)
      };
      
      const pushMock = jest.fn();
      mockPost.comments.push = pushMock;
      mockPost.comments.push.mockImplementation((comment) => {
        mockPost.comments = [comment];
        return mockPost.comments.length;
      });
      
      Post.findById.mockResolvedValue(mockPost);

      await addComment(req, res);

      expect(pushMock).toHaveBeenCalledWith({
        author: '123e4567-e89b-12d3-a456-426614174000',
        authorName: 'Anonymous',
        text: 'This is a test comment',
        createdAt: expect.any(Date)
      });
    });

    it('should return 400 when text is missing', async () => {
      req.body.text = '';

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Comment text and author UUID are required'
      });
      expect(Post.findById).not.toHaveBeenCalled();
    });

    it('should return 400 when author is missing', async () => {
      req.body.author = '';

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Comment text and author UUID are required'
      });
      expect(Post.findById).not.toHaveBeenCalled();
    });

    it('should return 404 when post not found', async () => {
      Post.findById.mockResolvedValue(null);

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should handle CastError for invalid post ID format', async () => {
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      Post.findById.mockRejectedValue(castError);

      await addComment(req, res);

      expect(console.error).toHaveBeenCalledWith('Add comment error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid post ID format' });
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      validationError.message = 'Comment author must be a valid UUID';
      
      const mockPost = {
        ...mockPostData,
        comments: [],
        save: jest.fn().mockRejectedValue(validationError)
      };
      
      const pushMock = jest.fn();
      mockPost.comments.push = pushMock;
      Post.findById.mockResolvedValue(mockPost);

      await addComment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed: Comment author must be a valid UUID'
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Post.findById.mockRejectedValue(dbError);

      await addComment(req, res);

      expect(console.error).toHaveBeenCalledWith('Add comment error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('deleteComment', () => {
    beforeEach(() => {
      req.params.postId = mockPostData._id;
      req.params.commentId = 'comment-123';
    });

    it('should delete comment successfully', async () => {
      const mockPost = {
        ...mockPostData,
        comments: [mockCommentData],
        save: jest.fn().mockResolvedValue(true)
      };
      
      // Mock findIndex and splice methods
      mockPost.comments.findIndex = jest.fn().mockReturnValue(0);
      mockPost.comments.splice = jest.fn().mockReturnValue([mockCommentData]);
      
      Post.findById.mockResolvedValue(mockPost);

      await deleteComment(req, res);

      expect(Post.findById).toHaveBeenCalledWith(mockPostData._id);
      expect(mockPost.comments.findIndex).toHaveBeenCalledWith(expect.any(Function));
      expect(mockPost.comments.splice).toHaveBeenCalledWith(0, 1);
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Comment deleted successfully',
        comment: mockCommentData
      });
    });

    it('should return 404 when post not found', async () => {
      Post.findById.mockResolvedValue(null);

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 404 when comment not found', async () => {
      const mockPost = {
        ...mockPostData,
        comments: []
      };
      
      mockPost.comments.findIndex = jest.fn().mockReturnValue(-1);
      Post.findById.mockResolvedValue(mockPost);

      await deleteComment(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Comment not found' });
    });

    it('should handle CastError for invalid ID format', async () => {
      const castError = new Error('Cast error');
      castError.name = 'CastError';
      Post.findById.mockRejectedValue(castError);

      await deleteComment(req, res);

      expect(console.error).toHaveBeenCalledWith('Delete comment error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid ID format' });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      Post.findById.mockRejectedValue(dbError);

      await deleteComment(req, res);

      expect(console.error).toHaveBeenCalledWith('Delete comment error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
