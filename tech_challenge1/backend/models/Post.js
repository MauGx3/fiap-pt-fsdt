const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
        type: String, // Store the user's UUID
        required: true,
        validate: {
            validator: function(v) {
                // Validate UUID format
                return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
            },
            message: 'Author must be a valid UUID'
        }
    },
    comments: [{
        user: { type: String, required: false },
        text: { type: String, required: false },
        createdAt: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);