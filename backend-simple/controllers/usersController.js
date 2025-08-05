import User from '../models/User.js';

// Get all users
export async function getAllUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user by UUID
export async function getUserById(req, res) {
  try {
    const user = await User.findOne({ uuid: req.params.uuid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user by UUID error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Create new user
export async function createUser(req, res) {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase()
    });

    await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (err) {
    console.error('Create user error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update user
export async function updateUser(req, res) {
  try {
    const uuid = req.params.uuid;
    const { name, email } = req.body;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        uuid: { $ne: uuid }
      });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email is already taken by another user'
        });
      }
      updateData.email = email.toLowerCase();
    }

    const updatedUser = await User.findOneAndUpdate(
      { uuid },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update user error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed: ' + err.message
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete user
export async function deleteUser(req, res) {
  try {
    const uuid = req.params.uuid;

    const deletedUser = await User.findOneAndDelete({ uuid });
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
