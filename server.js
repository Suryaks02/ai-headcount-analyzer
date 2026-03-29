const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // For the Image Uploads
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./')); // Serves your index.html automatically

// Setup a folder for uploaded images
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const DB_FILE = './database.json';
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([]));

// 1. Get all logs for the table
app.get('/api/headcounts', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(data);
});

// 2. Save a new count (Webcam or Image)
app.post('/api/update-count', (req, res) => {
    const { count, mode } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE));
    const newEntry = {
        id: Date.now(),
        time: new Date().toLocaleString(),
        count: count,
        mode: mode
    };
    data.push(newEntry);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.json(newEntry);
});

// 3. Delete a log
app.delete('/api/headcounts/:id', (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_FILE));
    data = data.filter(item => item.id != req.params.id);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// 4. Handle actual Image Uploads
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ filename: req.file.filename });
});

app.listen(3000, () => console.log("🚀 AI Dashboard running at http://localhost:3000"));
