# HealthChat - AI-Powered Multilingual Telemedicine Platform

> **Google Solution Challenge / Hack2Skill submission**
> **Team:** `404_Error_notfound` · **Team Leader:** Abhay Madan
> **Problem statement:** Lack of access to healthcare in underserved communities

HealthChat bridges the rural healthcare gap by connecting patients with verified
doctors through a lightweight, voice-first platform. Patients describe their symptoms
**by speaking in their own regional language**, an AI does a preliminary triage,
suggests home remedies for minor issues, and routes serious cases to a real doctor
for a video/audio consultation — with digital records, lab-test booking, prescription
OCR, and government-scheme suggestions.

This repository is a **monorepo** containing the three services that make up the project.

---

## 1. Project structure

```
healthchat/
├── frontend/      # React + Vite + TypeScript + Tailwind / shadcn-ui  (web app)
├── backend/       # Node.js + Express + Mongoose  (auth, doctors, patients, appointments)
└── ml-service/    # Python + FastAPI + TensorFlow + Gemini  (AI/ML: symptom model, chat, STT/TTS, OCR)
```

| Folder | Role | Stack |
|--------|------|-------|
| [`frontend/`](./frontend) | Web application | React 18, Vite, TypeScript, Tailwind, shadcn-ui |
| [`backend/`](./backend) | REST API — auth, doctors, patients, appointments | Node.js, Express, Mongoose |
| [`ml-service/`](./ml-service) | AI/ML service — symptom intent model, Gemini chat, translation, TTS/STT, prescription OCR | Python, FastAPI, TensorFlow, Gemini |

Useful links from the original submission:
- 🎥 Demo video: https://youtu.be/suFwnyQQ2w8
- 🌐 Live frontend: https://health-chat-nexus.vercel.app

---

## 2. Architecture

```
                 Voice / text (regional language)
   ┌─────────┐   ───────────────────────────────►   ┌──────────────────────────┐
   │ Patient │                                       │  frontend (React/Vite)   │
   └─────────┘                                       │  port 8080               │
                                                     └─────────┬────────────────┘
                                    /api proxy                 │
                ┌────────────────────────────────────┬─────────┴───────────────┐
                ▼                                     ▼                         ▼
   ┌──────────────────────────┐        ┌──────────────────────────┐   ┌──────────────────┐
   │ backend (Express)        │        │ ml-service (FastAPI)     │   │ Google Gemini API│
   │ port 5000                │        │ port 8000                │   │ (chat + OCR)     │
   │ • auth (doctor/patient)  │        │ • /detect_intent (TF NN) │   └──────────────────┘
   │ • appointments           │        │ • /gemini chat triage    │
   │ • WhatsApp notify        │        │ • /english /hindi ... STT│
   └───────────┬──────────────┘        │ • /tts  /record (voice)  │
               │                       │ • /extract-text (OCR)    │
               ▼                       │ • /test /test/book (labs)│
        ┌────────────┐                 └───────────┬──────────────┘
        │  MongoDB   │ ◄───────────────────────────┘
        │ health_chat│   (shared database)
        └────────────┘
```

Both backends talk to the **same MongoDB** database (`health_chat`). The frontend
source currently points at the deployed backend URLs, so it works against the live
backends out of the box (see [§7 Running locally](#7-running-locally) to switch to
local backends).

---

## 3. Tech stack

- **frontend:** Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui (Radix), React Router, TanStack Query, Jitsi (video), `react-speech-recognition`, `@google/genai`.
- **backend:** Express, Mongoose, express-session, express-validator, bcryptjs, multer, CallMeBot (WhatsApp).
- **ml-service:** FastAPI, Uvicorn, TensorFlow/Keras (intent model), NLTK, `googletrans`, gTTS (text-to-speech), SpeechRecognition + pydub (speech-to-text), `google-genai` (Gemini), OpenCV + Pillow (image pre-processing for OCR), PyMongo/GridFS.
- **Database:** MongoDB (Atlas in production).
- **AI:** Google Gemini (`gemini-2.0-flash`) for conversational triage + prescription OCR; a self-trained TensorFlow NLP model for intent detection.
- **Hosting:** frontend → Vercel · backends → Render.

---

## 4. The ML model — verified ✅

The "self-made NLP" model lives in `ml-service/`:

| File | What it is |
|------|------------|
| `chatbot_model.h5` | Trained Keras model (a small dense neural net) |
| `words.pkl` | 124-word bag-of-words vocabulary |
| `classes.pkl` | 3 intent labels: `booking`, `diagnosis`, `test` |

**How it works:** an incoming sentence is tokenized + lemmatized (NLTK), turned into a
124-dim bag-of-words vector, and the network outputs a probability over 3 intents.
If confidence < 0.5 it defaults to `diagnosis`. The `/detect_intent/` endpoint uses
this to decide whether the patient wants to **book an appointment**, **book a lab
test**, or get a **symptom diagnosis**.

**Verification run (`ml-service/verify_model.py`):** the model loads cleanly under
TensorFlow 2.20 (27,203 parameters, input `(None,124)` → output `(None,3)`) and
classifies correctly:

| Input | Predicted intent | Confidence |
|-------|------------------|-----------|
| "I have a headache and fever since two days" | `diagnosis` | 0.98 |
| "I want to book an appointment with a doctor" | `booking` | 1.00 |
| "I need to schedule a blood test / MRI scan" | `test` | 1.00 |
| "my stomach hurts and I feel sick" | `diagnosis` | 0.99 |

➡️ **Verdict: the model is fine and working.** Run `python verify_model.py` inside
`ml-service/` (with the venv) to reproduce.

---

## 5. Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** 3.11 and **pip**
- **Git**
- A **MongoDB** connection string (MongoDB Atlas free tier is fine), shared by both backends.
- A **Google Gemini API key** — get one at https://aistudio.google.com/app/apikey
- **ffmpeg** on your PATH — required by the `ml-service` `/record` voice-transcription
  endpoint (`pydub` shells out to ffmpeg). Install on Windows with
  `winget install Gyan.FFmpeg`.

---

## 6. Installation

### 6a. frontend
```powershell
cd frontend
npm install
npm run build        # production build — verified OK (1789 modules)
```

### 6b. backend (Node/Express)
```powershell
cd backend
npm install
```

### 6c. ml-service (FastAPI / ML) — use a virtual environment
```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 7. Environment variables

Each service reads its secrets from a local `.env` file. Template `.env.example`
files are included in each folder — **copy them to `.env` and fill in real values.**

**`frontend/.env`**
```
VITE_GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

**`backend/.env`**
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_secret        # generate with: node generate-secret.js
PORT=5000
NODE_ENV=development
CALLMEBOT_API_KEY=                        # optional, for WhatsApp notifications
```

**`ml-service/.env`** (note: it intentionally reuses the `VITE_` prefixed names)
```
VITE_MONGO_URI=your_mongodb_connection_string
VITE_GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

---

## 8. Running locally

Open **three terminals**:

```powershell
# Terminal 1 — FastAPI / ML service  (http://localhost:8000, docs at /docs)
cd ml-service
.\venv\Scripts\uvicorn.exe main:app --reload

# Terminal 2 — Node/Express API  (http://localhost:5000)
cd backend
npm run dev

# Terminal 3 — frontend  (http://localhost:8080)
cd frontend
npm run dev
```

> **Pointing the frontend at local backends:** the frontend currently has the
> deployed backend URLs hardcoded in its source (e.g. `src/services/api.js`,
> `src/components/patient/*.tsx`, `src/utils/translation.ts`) and the `/api` proxy
> in `vite.config.ts`. To run fully local, replace `https://database-tval.onrender.com`
> → `http://localhost:8000` and `https://backendnode-j51t.onrender.com`
> → `http://localhost:5000`, and update the proxy target in `vite.config.ts`. As-is,
> `npm run dev` serves the UI locally while using the **live** deployed backends.

---

## 9. Key API endpoints

**ml-service (FastAPI, 28 routes):**
`/` · `/health` · `/detect_intent/` (ML intent) · `/gemini` (AI triage chat) ·
`/record` (speech→text) · `/tts`, `/tts/{id}` (text→speech) ·
`/english/ /hindi/ /punjabi/ /gujarati/ /bengali/ /tamil/ /telugu/` (translation) ·
`/extract-text` (prescription OCR) · `/test`, `/test/book`, `/test/booked`, `/test/book/{id}` (lab tests) ·
`/chat_history`, `/chat_history/{user_id}`

**backend (Express):**
`/api/health` · `/api/auth/{doctor,patient}/{register,login}`, `/api/auth/logout`, `/api/auth/me` ·
`/api/doctors`, `/api/doctors/:id`, `/api/doctors/profile`, `/api/doctors/dashboard` ·
`/api/patients/profile`, `/api/patients/dashboard`, `/api/patients/doctors/search` ·
`/api/appointments` (book/get/update/cancel/rate), `/api/appointments/:id/video`

---

## 10. Verification summary

| Service | Check | Result |
|---------|-------|--------|
| frontend | `npm install` | ✅ 563 packages |
| frontend | `npm run build` | ✅ Builds (1789 modules, ~5s) |
| backend | `npm install` | ✅ 137 packages |
| backend | Syntax check + full `require()` graph | ✅ All resolve |
| ml-service | `pip install -r requirements.txt` | ✅ All deps incl. TensorFlow 2.20 |
| ml-service | FastAPI app import | ✅ Boots, 28 routes registered |
| ml-service | ML model load + predictions | ✅ Loads & classifies correctly |

---

## 11. Known issues & notes

1. **Prescription OCR / `/test-gemini` use a deprecated Gemini API.**
   `ml-service/main.py` calls `genai.GenerativeModel('gemini-2.0-flash-exp')` in
   `extract_text_with_gemini()` and `/test-gemini`. The installed `google-genai` SDK
   exposes `genai.Client(...)` (used correctly by the working `/gemini` endpoint) but
   **not** `genai.GenerativeModel`, so those two endpoints raise `AttributeError` at
   runtime. **Fix:** rewrite them to use
   `googleclient.models.generate_content(model="gemini-2.0-flash", contents=[prompt, image])`
   like `/gemini` already does.

2. **ffmpeg is required for voice transcription.** The `/record` endpoint converts
   uploaded `webm` audio to `wav` via `pydub`, which needs ffmpeg on PATH (see §5).

3. **Real secrets needed to serve data.** Without a valid `MONGODB_URI` the Node
   server logs a connection error and exits; the FastAPI service starts but DB
   reads/writes fail until `VITE_MONGO_URI` is set.

4. **Dead file:** `frontend/auth/connection.js` contains a typo
   (`import {moongoose} from "moongoose"`). It is not referenced anywhere in `src/`
   and is excluded from the build — safe to ignore or delete.

---

## 12. Feature checklist

- ✅ Multilingual speech-based symptom detection (no typing required)
- ✅ AI-driven preliminary diagnosis + home remedies (Gemini)
- ✅ AI-driven doctor matching & appointment scheduling
- ✅ Verified doctor portal (IMA credentials)
- ✅ Video/audio consultations (Jitsi)
- ✅ Lab-test booking + digital medical records
- ✅ Prescription OCR (handwriting → text) — *see issue #1*
- ✅ Government-scheme suggestions
- ✅ SMS / WhatsApp notifications (CallMeBot)
