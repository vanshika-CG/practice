const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { Server } = require('socket.io');
const http = require('http');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve photos from database folder
app.use('/database', express.static(path.join(__dirname, '../database')));
app.use('/reports_db', express.static(path.join(__dirname, '../reports_db')));

// Ensure directories exist
const dbPath = path.join(__dirname, '../database');
const reportsDbPath = path.join(__dirname, '../reports_db');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
if (!fs.existsSync(reportsDbPath)) fs.mkdirSync(reportsDbPath, { recursive: true });

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/findmeai';
mongoose.connect(mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => {
    console.error("❌ MongoDB failed:", err.message);
  });

// Multer - save photos temporarily, rename gracefully in routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../database')); // Default to DB, will be moved later if report
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `temp-${uniqueSuffix}.jpg`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Schemas
const MissingSchema = new mongoose.Schema({
  name: String,
  caseId: { type: String, unique: true },
  age: Number,
  description: String,
  lastLocation: String,
  photoFilename: String,
  status: { type: String, default: 'missing' },
  createdAt: { type: Date, default: Date.now }
});

const DetectionSchema = new mongoose.Schema({
  caseId: String,
  cameraId: String,
  timestamp: { type: Date, default: Date.now },
  confidence: Number,
  location: String
});

const ReportSchema = new mongoose.Schema({
  submitterName: String,
  location: String,
  description: String,
  photoFilename: String,
  matchedCaseId: String,
  confidence: Number,
  createdAt: { type: Date, default: Date.now }
});

const Missing = mongoose.model('Missing', MissingSchema);
const Detection = mongoose.model('Detection', DetectionSchema);
const Report = mongoose.model('Report', ReportSchema);

// ─── ROUTES ──────────────────────────────────────────────

app.post('/api/missing', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Photo required" });

    // Successfully parsed form now, renaming temp file
    const oldPath = req.file.path;
    const finalFilename = `${req.body.caseId}.jpg`;
    const newPath = path.join(__dirname, '../database', finalFilename);
    fs.renameSync(oldPath, newPath);

    const missing = new Missing({
      ...req.body,
      photoFilename: finalFilename
    });

    await missing.save();
    console.log(`[REGISTER] ${req.body.caseId} - ${req.body.name}`);

    // Delete DeepFace cache so new photos are indexed
    const dbPath = path.join(__dirname, '../database');
    if (fs.existsSync(dbPath)) {
      const files = fs.readdirSync(dbPath);
      files.forEach(file => {
        if (file.endsWith('.pkl')) {
          try {
            fs.unlinkSync(path.join(dbPath, file));
            console.log(`[CACHE CLEARED] ${file}`);
          } catch(e) {}
        }
      });
    }

    res.json({ success: true, message: "Registered", caseId: req.body.caseId });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    if (err.code === 11000) return res.status(400).json({ error: "Case ID exists" });
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/detect', async (req, res) => {
  const { image, cameraId = 'Webcam-1', location = 'Live Camera' } = req.body;
  if (!image || !image.startsWith('data:image')) {
    return res.status(400).json({ error: "Invalid image" });
  }

  // console.log(`[DETECT] Frame from ${cameraId} (${image.length} chars)`);

  try {
    const pythonRes = await axios.post(
      `${process.env.PYTHON_AI_URL || 'http://127.0.0.1:5000'}/find-matches`,
      { frame: image },
      { timeout: 20000 }
    );

    const matches = pythonRes.data.matches || [];

    if (matches.length > 0) {
      const best = matches.reduce((a, b) => a.confidence > b.confidence ? a : b);

      console.log(`[MATCH] ${best.caseId} @ ${best.confidence}%`);

      const detection = new Detection({
        caseId: best.caseId,
        cameraId,
        confidence: best.confidence,
        location
      });
      await detection.save();

      io.emit('new-alert', {
        caseId: best.caseId,
        confidence: best.confidence,
        cameraId,
        location,
        timestamp: new Date().toISOString()
      });
      res.json({ matches, alert: true });
    } else {
      res.json({ matches });
    }
  } catch (err) {
    console.error("[DETECT ERROR]", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Photo required" });
    
    // Move from database/temp to reports_db/
    const oldPath = req.file.path;
    const finalFilename = `report-${Date.now()}.jpg`;
    const newPath = path.join(__dirname, '../reports_db', finalFilename);
    fs.renameSync(oldPath, newPath);
    
    // The image base64 logic should read from newPath
    const imageBase64 = fs.readFileSync(newPath, { encoding: 'base64' });

    let matchedCaseId = null;
    let confidence = 0;
    
    try {
      const pythonRes = await axios.post(
        `${process.env.PYTHON_AI_URL || 'http://127.0.0.1:5000'}/find-matches`,
        { frame: `data:image/jpeg;base64,${imageBase64}` },
        { timeout: 20000 }
      );
      
      const matches = pythonRes.data.matches || [];
      if (matches.length > 0) {
        const best = matches.reduce((a, b) => a.confidence > b.confidence ? a : b);
        matchedCaseId = best.caseId;
        confidence = best.confidence;
        
        // Also log as a detection since it matched
        const detection = new Detection({
          caseId: best.caseId,
          cameraId: 'Citizen Report',
          confidence: best.confidence,
          location: req.body.location || 'Unknown'
        });
        await detection.save();
        
        io.emit('new-alert', {
          caseId: best.caseId,
          confidence: best.confidence,
          cameraId: 'Citizen Report',
          location: req.body.location || 'Unknown',
          timestamp: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("[AI ERROR in Report]", e.message);
    }
    
    const report = new Report({
      submitterName: req.body.submitterName || 'Anonymous',
      location: req.body.location || 'Unknown',
      description: req.body.description || '',
      photoFilename: finalFilename,
      matchedCaseId,
      confidence
    });
    
    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/missing', async (req, res) => {
  const people = await Missing.find().sort({ createdAt: -1 });
  res.json(people);
});

app.get('/api/detections', async (req, res) => {
  const dets = await Detection.find().sort({ timestamp: -1 }).limit(100);
  res.json(dets);
});

app.get('/api/reports', async (req, res) => {
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

// Age progression stub route
app.post('/api/age-progress', async (req, res) => {
  const { caseId, targetAge } = req.body;
  // This is a stub for advanced modeling. In a real system you'd call a GAN API.
  // For demo, we just simulate a short delay and pass back the existing image logic
  // or a placeholder saying it's processed.
  try {
    const missing = await Missing.findOne({ caseId });
    if (!missing) return res.status(404).json({ error: "Not found" });
    
    setTimeout(() => {
      res.json({
        success: true,
        message: "Age progression generated",
        originalPhoto: missing.photoFilename,
        predictedPhoto: missing.photoFilename, // Placeholder: same photo
        targetAge
      });
    }, 2000);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}); 

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running → http://localhost:${PORT}`);
});