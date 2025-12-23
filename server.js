const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // <--- needed for serving static files
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://<username>:<password>@cluster0.fyabign.mongodb.net/user_management')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    category: String,   // 'school_levels', 'teacher', 'student', 'church_of_christ'
    levelId: String,
});
const User = mongoose.model('User', userSchema);

// ----------------- API ROUTES -----------------

// Get all users or filtered
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

// ----------------- CATCH-ALL ROUTE -----------------
// For any route not matched above, serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
