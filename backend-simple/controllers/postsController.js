import Post from '../models/Post.js';

// Get all posts
export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Get all posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get single post by ID
export async function getPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.error('Get post by ID error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new post
export async function createPost(req, res) {
  try {
    const { title, content, author, authorName } = req.body;

    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({
        error: 'Title, content, and author UUID are required'
      });
    }

    const newPost = new Post({
      title,
      content,
      author,
      authorName: authorName || 'Anonymous'
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (err) {
    console.error('Create post error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update post
export async function updatePost(req, res) {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    // Find the post first
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
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
    console.error('Update post error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete post
export async function deletePost(req, res) {
  try {
    const postId = req.params.id;

    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({
      message: 'Post deleted successfully',
      post: deletedPost
    });
  } catch (err) {
    console.error('Delete post error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Search posts
export async function searchPosts(req, res) {
  try {
    const query = req.query.query?.toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Search posts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Add comment to post
export async function addComment(req, res) {
  try {
    const postId = req.params.id;
    const { text, author, authorName } = req.body;

    if (!text || !author) {
      return res.status(400).json({
        error: 'Comment text and author UUID are required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = {
      author,
      authorName: authorName || 'Anonymous',
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (err) {
    console.error('Add comment error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid post ID format' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete comment from post
export async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const deletedComment = post.comments[commentIndex];
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({
      message: 'Comment deleted successfully',
      comment: deletedComment
    });
  } catch (err) {
    console.error('Delete comment error:', err);
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
