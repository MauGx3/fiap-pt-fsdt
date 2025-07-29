const Post = require('./models/Post');
const User = require('./models/User');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Validate required fields
        if (!title || !content) {
            return res.status(400).json({
                error: 'Title and content are required'
            });
        }

        // Get author UUID from authenticated user (if using middleware)
        // Or from request body (if not using authentication middleware)
        let author = req.user?.uuid || req.body.author;

        if (!author) {
            return res.status(400).json({
                error: 'Author UUID is required'
            });
        }

        // If author comes from request body, validate/convert it
        if (!req.user) {
            // Check if author is a UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            if (uuidRegex.test(author)) {
                // It's a UUID, validate it exists
                const user = await User.findOne({ uuid: author });
                if (!user) {
                    return res.status(400).json({
                        error: 'Invalid author UUID - user not found'
                    });
                }
            } else {
                // It's not a UUID, try to find user by name
                const user = await User.findOne({ name: author });
                if (!user) {
                    return res.status(400).json({
                        error: `User with name "${author}" not found. Please provide a valid UUID or ensure the user exists.`
                    });
                }
                // Use the user's UUID
                author = user.uuid;
            }
        }

        const newPost = new Post({ title, content, author });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation failed: ' + err.message
            });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID or data format' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deleted = await Post.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Post not found' });
        res.json(deleted);
    } catch (err) {
        res.status(400).json({ error: 'Invalid ID format' });
    }
};

exports.searchPosts = async (req, res) => {
    const query = req.query.query?.toLowerCase();
    if (!query) return res.status(400).json({ error: 'Missing query parameter' });

    const posts = await Post.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
        ]
    });

    res.json(posts);
};