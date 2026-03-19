const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"));

// Save photos to database folder
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../database'),
  filename: (req, file, cb) => cb(null, `${req.body.caseId}.jpg`)
});
const upload = multer({ storage });

// Schemas
const MissingSchema = new mongoose.Schema({
  name: String, caseId: String, age: Number, description: String,
  lastLocation: String, photoFilename: String, status: { type: String, default: 'missing' }
});
const Missing = mongoose.model('Missing', MissingSchema);

const DetectionSchema = new mongoose.Schema({
  caseId: String, cameraId: String, timestamp: Date, confidence: Number, location: String
});
const Detection = mongoose.model('Detection', DetectionSchema);

// ==================== ROUTES ====================

// Upload Missing Person
app.post('/api/missing', upload.single('photo'), async (req, res) => {
  try {
    const missing = new Missing({ ...req.body, photoFilename: `${req.body.caseId}.jpg` });
    await missing.save();
    res.json({ success: true, message: "Missing person registered!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Detect from camera frame
app.post('/api/detect', async (req, res) => {
  const { image, cameraId } = req.body;
  try {
    const pythonRes = await axios.post(`${process.env.PYTHON_AI_URL}/find-matches`, { frame: image });
    const matches = pythonRes.data.matches || [];

    if (matches.length > 0) {
      const match = matches[0];
      const detection = new Detection({
        caseId: match.caseId,
        cameraId,
        timestamp: new Date(),
        confidence: match.confidence,
        location: 'Live Camera'
      });
      await detection.save();

      io.emit('new-alert', {
        confidence: match.confidence,
        cameraId,
        timestamp: new Date().toLocaleTimeString(),
        caseId: match.caseId,
        name: match.name || 'Unknown'
      });
    }
    res.json({ matches });
  } catch (e) {
    res.json({ matches: [] });
  }
});

// Get all data
app.get('/api/missing', async (req, res) => res.json(await Missing.find()));
app.get('/api/detections', async (req, res) => res.json(await Detection.find().sort({ timestamp: -1 })));

server.listen(3000, () => console.log('✅ Backend running on http://localhost:3000'));