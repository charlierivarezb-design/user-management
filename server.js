const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// ----------------- MIDDLEWARE -----------------
app.use(cors());
app.use(express.json());

// Serve frontend from public folder
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- MONGODB -----------------
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('Error: MONGO_URI environment variable not set.');
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// ----------------- SCHEMA -----------------
const userSchema = new mongoose.Schema({
    name: String,
    category: String,   // 'school_levels', 'teacher', 'student', 'church_of_christ'
    levelId: String,    // for teacher/student
});

const User = mongoose.model('User', userSchema);

// ----------------- API ROUTES -----------------

// GET all users (with optional filtering)
app.get('/users', async (req, res) => {
    try {
        const { category, levelId } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (levelId) filter.levelId = levelId;
        const users = await User.find(filter);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST add user
app.post('/users', async (req, res) => {
    try {
        const { name, category, levelId } = req.body;
        if (!name || !category) return res.status(400).json({ error: 'Name and category required' });
        const user = new User({ name, category, levelId });
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name }, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------- CATCH-ALL ROUTE -----------------
// Serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
