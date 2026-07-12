
# 🚆 IntelliAlert

> **Every Announcement. Only When It Matters.**

IntelliAlert is an AI-powered assistive platform designed to make railway public announcements accessible, meaningful, and actionable for Deaf and Hard-of-Hearing commuters. Instead of displaying every announcement as plain text, IntelliAlert understands the content of each announcement, determines whether it is relevant to a user's journey, and delivers personalized action cards with clear recommendations. By filtering out irrelevant information and highlighting only what matters, IntelliAlert makes public transportation more inclusive, efficient, and user-friendly.

---

# 👥 Team TriNova

- **Fathima P Ajvad**
- **Krishnapriya V R**
- **Nahana Fathima**

---

# 📌 Problem Statement

Railway stations rely heavily on public announcements to communicate important travel updates such as platform changes, delays, boarding information, and emergency notifications. Deaf and Hard-of-Hearing commuters often miss these announcements, making travel challenging and stressful.

While existing speech-to-text solutions display every announcement as text, they do not understand the context or determine whether the information is actually relevant to a particular passenger.

---

# 💡 Solution

IntelliAlert bridges this accessibility gap by combining Speech Recognition, Artificial Intelligence, and Personalized Journey Matching.

The platform:

- 🎤 Listens to railway announcements
- 📝 Converts speech into text using OpenAI Whisper
- 🧠 Uses Google Gemini 2.5 Flash to understand the announcement
- 🚆 Matches the announcement against the user's journey
- 🔔 Generates personalized action cards instead of continuous captions

This ensures that commuters receive only the announcements that matter to them.

---

# 🚀 Features

- 🎤 Speech-to-text transcription
- 🤖 AI-powered announcement understanding
- 🚆 Personalized journey matching
- 🔔 Intelligent action-based alerts
- 🔐 Firebase Authentication
- ☁️ Firestore database integration
- 📱 Responsive web interface
- ⚡ Real-time announcement processing

---

# 🏗️ System Architecture

```text
Railway Announcement
          │
          ▼
OpenAI Whisper
(Speech-to-Text)
          │
          ▼
Google Gemini 2.5 Flash
(Context & Information Extraction)
          │
          ▼
Journey Matching Engine
          │
          ▼
Personalized Alert Generation
          │
          ▼
React Web Application
```

---

# ⚙️ Project Workflow

1. User logs in using Firebase Authentication.
2. User enters journey details such as train number, source, destination, and platform.
3. Railway announcement audio is uploaded to the backend.
4. OpenAI Whisper converts the announcement into text.
5. Google Gemini extracts structured information such as train number, destination, platform changes, delays, boarding status, and emergencies.
6. The extracted information is compared with the user's journey stored in Firestore.
7. If the announcement is relevant, IntelliAlert generates a personalized alert.
8. The announcement and alert are stored in Firestore and displayed on the dashboard.

---

# 🛠️ Tech Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router DOM
- Axios
- Firebase Authentication

## Backend

- Node.js
- Express.js
- TypeScript
- Multer
- dotenv

## Artificial Intelligence

- OpenAI Whisper
- Google Gemini 2.5 Flash
- Prompt Engineering

## Database

- Firebase Firestore

## Development Tools

- Git
- GitHub
- Visual Studio Code
- GitHub Copilot
- Claude AI

---

# 📂 Project Structure

```text
server/
│
├── database/
│     firebase.ts
│
├── routes/
│     announcement.ts
│     auth.ts
│     users.ts
│
├── services/
│     whisper_service.ts
│     gemini_service.ts
│     matching_service.ts
│     alert_service.ts
│
├── utils/
│     prompts.ts
│
└── server.ts

src/
│
├── api/
│     axios.ts
│
├── components/
│     AlertCard.tsx
│     JourneyForm.tsx
│     Header.tsx
│
├── context/
│     AuthContext.tsx
│
├── pages/
│     Login.tsx
│     JourneySetup.tsx
│     Listening.tsx
│     Alert.tsx
│     Dashboard.tsx
│
├── App.tsx
└── main.tsx
```

---

# 🗄️ Firestore Collections

The application stores data using the following Firestore collections:

### Users

Stores user profile information.

```text
userId
name
email
```

### Journeys

Stores the user's active travel details.

```text
userId
trainNumber
source
destination
platform
```

### Announcements

Stores processed announcements.

```text
transcript
structuredAnnouncement
timestamp
```

### Alerts

Stores generated personalized alerts.

```text
userId
priority
title
message
timestamp
```

---

# 🔌 API Endpoints

## Health Check

```http
GET /api/health
```

---

## Authentication

```http
POST /api/auth/verify
```

---

## Users

```http
POST /api/users

GET /api/users/:uid
```

---

## Announcement Processing

```http
POST /api/announcement/process
```

### Request

```text
multipart/form-data

audio
user_id
```

### Response

```json
{
  "relevant": true,
  "priority": "HIGH",
  "title": "Platform Changed",
  "message": "Your train has moved to Platform 5.",
  "timeRemaining": "8 minutes",
  "recommendedAction": "Proceed to Platform 5",
  "routeRequired": true
}
```

---

# 🔐 Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Configure Firebase using your Firebase project credentials.

---

# ▶️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/intellialert.git
```

---

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

---

## Build Project

```bash
npm run build
```

---

## Start Production Server

```bash
npm start
```

---

## Lint

```bash
npm run lint
```

---

# 🌟 Future Enhancements

- 🎙️ Automatic microphone activation using ambient sound threshold detection
- 📡 Continuous announcement monitoring
- 🌍 Multi-language announcement support
- 📲 Push notifications
- 📍 Indoor station navigation assistance
- 🚉 Support for airports, bus terminals, and metro stations

---

# ❤️ Impact

IntelliAlert goes beyond traditional speech-to-text solutions by understanding announcements and personalizing them for every commuter. By combining AI-powered speech recognition, natural language understanding, and journey-aware filtering, the platform ensures that Deaf and Hard-of-Hearing passengers receive only the information that is relevant to them. This reduces information overload, improves travel confidence, and promotes a more inclusive public transportation experience.

---

# 📜 License

This project was developed as part of a Hackathon by **Team TriNova** for educational and demonstration purposes.

---

# ⭐ Team TriNova

### **IntelliAlert — Every Announcement. Only When It Matters.**
