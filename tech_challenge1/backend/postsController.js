import Post from './models/Post.js';
import User from './models/User.js';

export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });

    // Get all unique author UUIDs
    const authorUuids = [...new Set(posts.map(post => post.author))];

    // Fetch user data for these UUIDs
    const users = await User.find({ uuid: { $in: authorUuids } }, 'uuid name');

    // Create a map of UUID to name
    const userMap = users.reduce((map, user) => {
      map[user.uuid] = user.name;
      return map;
    }, {});

    // Add author name to each post
    const postsWithAuthors = posts.map(post => ({
      ...post.toObject(),
      author: userMap[post.author] || 'Unknown Author'
    }));

    res.json(postsWithAuthors);
  } catch (err) {
    console.error('Get all posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPostById(req, res) {
  try {
    // Validate that id is a string to prevent NoSQL injection
    if (typeof req.params.id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Get author name
    const user = await User.findOne({ uuid: post.author }, 'name');
    const postWithAuthor = {
      ...post.toObject(),
      author: user ? user.name : 'Unknown Author'
    };

    res.json(postWithAuthor);
  } catch {
    res.status(400).json({ error: 'Invalid ID format' });
  }
}

export async function createPost(req, res) {
  try {
    const { title, content, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }

    // Use authenticated user's UUID as author
    const author = req.user.uuid;

    const newPost = new Post({
      title,
      content,
      author,
      tags: tags || []
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePost(req, res) {
  try {
    const postId = req.params.id;
    const { title, content, tags } = req.body;

    // Validate that postId is a string to prevent NoSQL injection
    if (typeof postId !== 'string') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    // Validate input types to prevent NoSQL injection
    if (title && typeof title !== 'string') {
      return res.status(400).json({
        error: 'Invalid title format'
      });
    }
    if (content && typeof content !== 'string') {
      return res.status(400).json({
        error: 'Invalid content format'
      });
    }
    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        error: 'Invalid tags format'
      });
    }

    // Find the post first to check ownership
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (existingPost.author !== req.user.uuid && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. You can only update your own posts.'
      });
    }

    // Prepare update data with only validated, whitelisted fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    updateData.updatedAt = new Date();

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    console.error('Update post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePost(req, res) {
  try {
    const postId = req.params.id;

    // Validate that postId is a string to prevent NoSQL injection
    if (typeof postId !== 'string') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }

    // Find the post first to check ownership
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user owns the post or is admin
    if (existingPost.author !== req.user.uuid && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own posts.'
      });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);

    res.json({
      message: 'Post deleted successfully',
      post: deletedPost
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function searchPosts(req, res) {
  try {
    const query = req.query.query;
    
    // Validate query parameter
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });
    
    // Validate input type to prevent injection
    if (typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query format' });
    }
    
    // Sanitize query - remove regex special characters to prevent ReDoS
    const sanitizedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').toLowerCase();
    
    // Limit query length to prevent excessive processing
    if (sanitizedQuery.length > 100) {
      return res.status(400).json({ error: 'Query too long' });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: sanitizedQuery, $options: 'i' } },
        { content: { $regex: sanitizedQuery, $options: 'i' } }
      ]
    });

    // Get all unique author UUIDs
    const authorUuids = [...new Set(posts.map(post => post.author))];

    // Fetch user data for these UUIDs
    const users = await User.find({ uuid: { $in: authorUuids } }, 'uuid name');

    // Create a map of UUID to name
    const userMap = users.reduce((map, user) => {
      map[user.uuid] = user.name;
      return map;
    }, {});

    // Add author name to each post
    const postsWithAuthors = posts.map(post => ({
      ...post.toObject(),
      author: userMap[post.author] || 'Unknown Author'
    }));

    res.json(postsWithAuthors);
  } catch (err) {
    console.error('Search posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}