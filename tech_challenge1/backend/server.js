import express, { json } from 'express';
import { connect } from 'mongoose';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

import postsRoutes from './routes/posts';
import usersRoutes from './routes/users';
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);

if (!process.env.MONGO_URI) {
    console.error('Error: MONGO_URI environment variable is not set.');
    process.exit(1);
}

connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));