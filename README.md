# CityLens AI: Public Infrastructure Incident Reporting & AI Analysis Pipeline

CityLens AI is a full-stack civic reporting and municipal dispatch platform that connects citizens directly to local government departments. By using the power of multimodal AI reasoning, CityLens AI converts citizen-submitted incident reports (containing descriptions and photographic evidence) into fully structured, prioritized municipal work orders.

The platform utilizes a real-time full-stack architecture powered by Google Cloud, Firebase Firestore, Firebase Storage, and the Gemini Pro / Gemini Flash AI models to analyze, categorize, assign, and track the resolution of infrastructure issues.

---

## 🌟 Motivation

Modern civic management faces significant overhead when processing citizen-submitted complaints. Text descriptions are often vague, photographs are unindexed, and geocoding information is unstructured. This leads to duplicate reports, misassigned tickets, delayed responses, and wasted taxpayer funds.

**CityLens AI solves this by introducing an autonomous AI triaging and pipeline:**
1. **Intelligent Geocoding**: Automatically reverse geocodes coordinates into standard civic addresses.
2. **Multimodal AI Analysis**: Uses Gemini to visually analyze structural damage (potholes, water leaks, broken light poles) and match it against descriptive text.
3. **Structured Dispatching**: Automatically assigns incident severity, estimates category confidence, allocates tasks to the correct municipal department, and designs a multi-step action-item checklist.
4. **Real-time Synchronization**: Streams updates instantly to city administrative panels, enabling real-time dispatch and status updates without reloading.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (for responsive UI and smooth flow animations)
- **Backend**: Node.js, Express, TypeScript, tsx (for local execution)
- **Database**: Google Cloud Firestore (Primary persistent document store)
- **File Storage**: Google Cloud Storage (Secure binary media upload for citizens' evidence)
- **AI Orchestration**: @google/genai SDK (Gemini AI multimodal models for structural analysis)
- **Maps Integration**: Google Maps Platform (Maps Javascript API and reverse geocoding services)

---

## 📂 Folder Structure

```
├── .env.example                # Blueprint for local environment variables
├── .gitignore                  # Ignore rules for node_modules, IDE settings, and secrets
├── package.json                # Project dependencies and operational scripts
├── tsconfig.json               # TypeScript compiler options
├── vite.config.ts              # Vite configuration
├── server.ts                   # Entry point for production backend and static hosting
├── firebase-blueprint.json     # Declarative schema blueprints for Firestore database design
├── firestore.rules             # Secure rules isolating public datasets
├── server/
│   ├── config.ts               # Configuration loader and environment sanitizer
│   ├── firebaseAdmin.ts        # Modular Firebase Admin SDK initialization
│   ├── controllers/
│   │   └── ReportController.ts # REST API handlers for CRUD and geocoding operations
│   ├── routes/
│   │   └── api.ts              # API routes mapping REST requests
│   └── services/
│       ├── AiOrchestrator.ts   # Multimodal reasoning pipeline using Gemini
│       ├── DatabaseService.ts  # Firestore data mapper and seeding client
│       ├── MapsService.ts      # Reverse geocoding adapter
│       └── StorageService.ts   # Secure Cloud Storage integration with local fallback
└── src/
    ├── main.tsx                # Frontend application mounting point
    ├── App.tsx                 # Core React entry point managing active layouts
    ├── firebase.ts             # Dynamic Client SDK connection and real-time subscription
    ├── types.ts                # Strong contracts sharing data formats across front and back
    ├── components/             # Reusable UI modules (Citizen, Dashboard, Maps, upload, etc.)
    └── utils/                  # Geocoding utilities and helper libraries
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **npm** or **bun** (preferred for fast installs)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/citylens-ai.git
cd citylens-ai
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Copy the environment variables blueprint to `.env` and fill in your keys:
```bash
cp .env.example .env
```

Ensure you configure:
- `GEMINI_API_KEY`: Your Google AI Studio API key.
- `GOOGLE_MAPS_API_KEY`: A Google Maps API key with Geocoding API enabled.
- `FIREBASE_PROJECT_ID` & related variables: (Optional, only if running outside Google Cloud Run or bypassing Default Application Credentials).

---

## ⚡ Running the Project Locally

To run the full-stack development environment (backend server on port 3000 + frontend via Vite middleware integration):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to test both the citizen interface and the municipal administration panel.

---

## 🔒 Security & IAM Best Practices

CityLens AI strictly separates public-facing data from private workflows:
1. **Public Submissions**: Anyone can read existing report listings or submit new infrastructure tickets.
2. **Access Controls**: The administrative mutation of status fields, toggling actions, or viewing underlying system analytics logs is controlled.
3. **No Hardcoded Keys**: Private credentials, service account certificates, and API secrets are never stored in the source files. They are fetched exclusively from Google Cloud Secret Manager or locally via `.env`.
4. **Cloud Storage Protections**: Media objects are structured in isolated directory buckets and public URLs are generated without exposing system directories.

---

## 🌐 Deployment to Google Cloud Run

To build and package the application for Cloud Run deployment:

### 1. Build Compilation
```bash
npm run build
```
This command compiles the frontend static assets into `dist/` and compiles the backend code into a single bundled `dist/server.cjs` file using `esbuild`.

### 2. Launch Server
```bash
npm start
```
This boots the server from the bundled bundle, perfect for serverless Cloud Run container environments.

---

## 🛣️ Future Roadmap

- **Multi-media Evidence Support**: Extend `StorageService` to support citizen video and voice reports.
- **Offline Mode**: Enable report drafts to be saved offline when network connectivity is lost.
- **Predictive Asset Maintenance**: Use AI trend logs to predict asphalt or lighting failure before they occur.
- **Mobile Native Application**: Port the Citizen reporting client using React Native or Capacitor.

