const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // <--- import cors
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@cluster0.fyabign.mongodb.net/user_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Simple User schema
const userSchema = new mongoose.Schema({
    name: String,
    category: String,   // 'school_levels', 'teacher', 'student', 'church_of_christ'
    levelId: String,    // optional for teachers/students
});

const User = mongoose.model('User', userSchema);

// ----------------- ROUTES -----------------

// Get all users or filtered by category/level
app.get('/users', async (req, res) => {
    const { category, levelId } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (levelId) filter.levelId = levelId;
    const users = await User.find(filter);
    res.json(users);
});

// Add user
app.post('/users', async (req, res) => {
    const { name, category, levelId } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
    const user = new User({ name, category, levelId });
    await user.save();
    res.json(user);
});

// Update user
app.put('/users/:id', async (req, res) => {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(user);
});

// Delete user
app.delete('/users/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
