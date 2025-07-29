import Post from './models/Post.js';
import User from './models/User.js';

export async function getAllPosts(req, res) {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getPostById(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
    }
}

export async function createPost(req, res) {
    try {
        const { title, content } = req.body;

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
            author
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
        const { title, content } = req.body;

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

        // Prepare update data
        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
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
    const query = req.query.query?.toLowerCase();
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    const posts = await Post.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ]
    });

    res.json(posts);
}