# FindMe AI – Intelligent Missing Person Detection System

FindMe AI is an AI-powered platform that helps authorities locate missing persons faster using **facial recognition, computer vision, and real-time alerts**.

The system scans camera feeds and images to detect possible matches with missing persons and notifies authorities when a potential match is found.

---

# Core Features

## 1. Missing Person Registration

Authorities can upload details of a missing person.

**Includes:**

* Photo upload
* Name and case ID
* Last known location
* Age and description

The system extracts **facial embeddings** from the uploaded photo and stores them in the database for comparison.

---

## 2. AI Facial Recognition Detection

The system continuously scans camera feeds and images to detect faces.

**Process:**

1. Detect faces from camera frames using OpenCV
2. Convert detected faces into embeddings
3. Compare embeddings with missing persons database
4. Calculate similarity score

If the similarity exceeds a defined threshold, the system marks it as a **potential match**.

---

## 3. Match Confidence Scoring

Each detected face is assigned a **confidence score**.

Example thresholds:

* **95%+** → Strong match
* **85–95%** → Likely match
* **70–85%** → Possible match

Alerts are triggered only above a defined threshold to reduce false positives.

---

## 4. Real-Time Alert System

When the system detects a possible match, it generates an alert.

Alert includes:

* Match confidence percentage
* Camera ID
* Timestamp
* Location

Example:

```
MATCH FOUND
Confidence: 91%
Camera: Gate 3
Time: 14:32
```

Authorities can view alerts instantly on the dashboard.

---

## 5. Multi-Camera Monitoring

The system can monitor multiple camera feeds simultaneously.

In the hackathon demo, **mobile phones will act as cameras**, simulating CCTV feeds.

Each camera feed is processed independently, allowing the system to detect matches from multiple locations.

---

## 6. Investigation Timeline

All detections and reports are stored in a **timeline view** for investigation tracking.

Example timeline:

```
12:10 PM – Match detected (Camera 2) – Bus Stand
12:42 PM – Citizen report submitted – Market Area
01:05 PM – Match detected (Camera 4) – Railway Station
```

This helps authorities track **movement patterns**.

---

## 7. Location Heatmap

The system tracks where matches are detected most frequently.

If multiple detections occur in the same area, the system highlights it as a **high-probability location**.

Example:

```
High Activity Zone:
Railway Station Area
3 detections in last hour
```

This helps investigators focus search efforts.

---

## 8. Citizen Sighting Reports

Citizens can submit reports if they believe they have spotted a missing person.

Reports include:

* Photo upload
* Location
* Description

The system analyzes the uploaded photo and compares it with missing persons.

---

## 9. Age Progression AI (Advanced Feature)

For long-term missing cases, the system can generate a **predicted future appearance** of a person.

Example:

```
Original Photo: Age 10
Predicted Photo: Age 20
```

This helps detect individuals who have aged significantly since they went missing.

---

# System Workflow

```
Missing Person Uploaded
        ↓
Face Embedding Generated
        ↓
Camera Feeds Monitored
        ↓
Faces Detected
        ↓
Similarity Comparison
        ↓
Match Confidence Calculated
        ↓
Real-Time Alert Generated
        ↓
Match Logged in Timeline + Map
```

---

# Roadmap

## Phase 1 – Core System

Goal: Build the core detection pipeline.

Tasks:

* Missing person upload system
* Face embedding generation
* Facial recognition comparison
* Basic alert system

---

## Phase 2 – Live Camera Detection

Goal: Detect matches from camera feeds.

Tasks:

* Camera stream integration
* Real-time face detection
* Multi-camera monitoring
* Alert notifications

---

## Phase 3 – Investigation Tools

Goal: Improve search intelligence.

Tasks:

* Timeline tracking
* Location tracking
* Match history
* Basic dashboard

---

## Phase 4 – Advanced Features

Goal: Expand system capabilities.

Tasks:

* Citizen reporting portal
* Heatmap visualization
* Age progression AI
* Improved match filtering

---

# Demo Plan

During the demo:

1. Upload a missing person photo
2. Start camera monitoring
3. A person walks past one of the cameras
4. The system detects the face
5. A real-time alert appears on the dashboard
6. The detection is logged in the investigation timeline

---

# Tech Stack

Frontend
React.js

Backend
Node.js + Express

AI / Computer Vision
Python + OpenCV + DeepFace / FaceNet

Database
MongoDB

---

