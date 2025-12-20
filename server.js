
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());
app.use(express.static('public'));

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    levelId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
});

const User = mongoose.model('User', userSchema);

/* -------------------- ROUTES -------------------- */

// Get users by category (optionally by level)
app.get('/users/:category', async (req, res) => {
    try {
        const filter = { category: req.params.category };

        if (req.query.levelId) {
            filter.levelId = req.query.levelId;
        }

        const users = await User.find(filter);
        res.json(users);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get school levels
app.get('/levels', async (req, res) => {
    const levels = await User.find({ category: 'school_levels' });
    res.json(levels);
});

// Add user / level / teacher / student
app.post('/users', async (req, res) => {
    const { name, category, levelId = null } = req.body;

    if (!name || !category)
        return res.status(400).json({ error: 'Name and category are required' });

    const newUser = new User({ name, category, levelId });
    await newUser.save();

    res.status(201).json(newUser);
});

// Update
app.put('/users/:id', async (req, res) => {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(user);
});

// Delete
app.delete('/users/:id', async (req, res) => {
    const level = await User.findById(req.params.id);

    if (!level) return res.status(404).json({ error: 'Not found' });

    if (level.category === 'school_levels') {
        await User.deleteMany({ levelId: level._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
});


app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
