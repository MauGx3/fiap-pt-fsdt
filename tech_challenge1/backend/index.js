// index.js
import express, { json } from 'express';
import { connect } from 'mongoose';
import postsRoutes from './routes/posts';
import usersRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware must be defined BEFORE routes
app.use(json());

// Routes
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('❌ MONGO_URI environment variable not set.');
    process.exit(1);
}

connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));