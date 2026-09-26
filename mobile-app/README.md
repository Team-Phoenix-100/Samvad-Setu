# 🌉 Samvad-Setu Mobile App (Android & React Native)

> **Decentralized AI-Governed Civic Grievance & University R&D Escalation Platform**  
> *Bridging Citizens, Municipal Corporations, Academic Institutions (HEIs), and Industry CSR.*

---

## 📱 Quick Download (Installable Android APK)

You can download and test the latest build of the Samvad-Setu mobile app directly on any Android device (Android 8.0+):

| Detail | Value |
| :--- | :--- |
| **Direct APK Download** | [📥 Download Samvad-Setu APK](https://expo.dev/artifacts/eas/G13njFbeSx5kCvHsPPDTysveR1QPnMfa-vpytFY9QcA.apk) |
| **EAS Build ID** | `74852825-761f-466d-bcb3-dc0eada9baee` |
| **Build Profile** | `preview` (Standalone APK, No Expo Go needed) |
| **EAS Build Page** | [View Expo Dashboard](https://expo.dev/accounts/rishav_dev10/projects/samvad-setu/builds/74852825-761f-466d-bcb3-dc0eada9baee) |
| **Package Name** | `com.rishav.samvadsetu` |
| **Download QR Code** | Scan `samvad_setu_download_qr.png` in project root |

### 📲 How to Install the APK on Android
1. Open the [Direct APK Download Link](https://expo.dev/artifacts/eas/G13njFbeSx5kCvHsPPDTysveR1QPnMfa-vpytFY9QcA.apk) on your Android phone's browser or scan the QR code.
2. Tap **Download anyway** if prompted by Chrome/browser.
3. Open the downloaded `.apk` file.
4. When prompted, enable **"Install unknown apps"** for your browser / file manager in Android Settings.
5. If Google Play Protect warns you (*"Unrecognized developer"*), tap **"More details"** ➔ **"Install anyway"** (standard for sideloaded development builds).
6. Launch **Samvad Setu**!

---

## 🌟 Key Features

### 1. 👥 Multi-Stakeholder Role Portals
The app provides tailor-made mobile experiences for all four societal pillars:
- **Citizen Portal** (`app/(citizen)/`): Report civic hazards with GPS geolocation, photographic evidence, and voice notes. Track real-time SLA timers, upvote neighborhood complaints, and edit/delete personal submissions.
- **Municipal Authority Portal** (`app/(government)/`): Real-time triage of incoming civic issues, inspection scheduling, contractor dispatching, and SLA breach resolution.
- **HEI Academic Portal** (`app/(hei)/`): Higher Education Institutions (BIT Sindri, Ranchi University, IIT ISM Dhanbad) browse unresolved civic challenges escalated by AI and adopt them as student Capstone / R&D projects.
- **Industry CSR Portal** (`app/(industry)/`): Corporate partners (e.g., Tata Steel CSR, PSU foundations) review academic blueprints, release grant capital into lab escrow, and monitor field deployment impact.

### 2. ⚡ Dynamic 5-Stage Civic-to-Tech Workflow Tracker
- Seamless visual progress pipeline: `Intake & AI Verify` ➔ `Municipal SLA Window` ➔ `HEI Lab Adoption` ➔ `Industry CSR Escrow` ➔ `Field Prototype Deployment`.
- Live SLA countdown timer calculating dynamic deadlines based on severity (Critical: 48h, Urgent: 72h, Medium: 7 days, Low: 14 days).

### 3. 🎙️ Voice Input & Smart Grievance Dictation
- Integrated voice recording with pulsing audio wave animation and recording timer.
- Simulated speech-to-text intelligence that auto-populates title, description, category, and urgency tags.
- Voice note binary audio payload attached directly to the submission.

### 4. 🗺️ Embedded Leaflet OpenStreetMap
- High-performance webview-backed OpenStreetMap with custom incident category pins and reverse geocoding without requiring commercial Google Maps API keys.

### 5. 🛡️ Offline-First Fault Tolerance
- Automatic offline caching in `AsyncStorage` (`@citizen_tickets`). If the phone loses connectivity or backend is unavailable, submissions are preserved with full AI metadata and synchronized seamlessly when connection is restored.

---

## 🏗️ Technical Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 57 `~57.0.25`)
- **Runtime**: [React Native](https://reactnative.dev/) (0.86.3)
- **Language**: TypeScript 5.8+ (Strict Mode)
- **Navigation**: Expo Router `~57.0.23` (File-based group routing)
- **State Management**: Zustand `^5.0.15` (Modular stores with async persistence)
- **Secure Storage**: `expo-secure-store` (Device-level encrypted JWT management)
- **HTTP Client**: Axios `^1.20.0` with dynamic JWT interceptors
- **Icons & UI**: `lucide-react-native`, `@expo/vector-icons`, Custom Animated Toasts
- **Build System**: EAS Build (Expo Application Services) with Custom Android Config Plugins

---

## 📂 Project Directory Structure

```
mobile-app/
├── api/
│   └── client.ts              # Central Axios instance with JWT interceptor & local IP binding
├── app/
│   ├── (auth)/                # Citizen & institutional login / registration flows
│   ├── (citizen)/             # Citizen dashboard, 5-step wizard, & personal tickets
│   ├── (government)/          # Municipal official portal & triage workflows
│   ├── (hei)/                 # Academic portal (browse, adopt, track student R&D)
│   ├── (industry)/            # CSR portal (fund prototypes, escrow, impact telemetry)
│   ├── problem/[id].tsx       # Detailed problem view with 5-stage tracker & edit/delete
│   ├── _layout.tsx            # Global root layout, toast provider, & auth gate
│   └── index.tsx              # Role-aware routing & landing redirection
├── assets/images/             # Icons, splash screens, and adaptive Android icons
├── components/
│   ├── LeafletMap.tsx         # Interactive OpenStreetMap geo-component
│   ├── VoiceInputRecorder.tsx # Voice dictation modal with pulsing wave UI
│   ├── WorkflowTracker.tsx    # 5-stage civic-to-tech dynamic resolution tracker
│   └── ui/                    # Reusable button, card, input, and toast components
├── plugins/
│   └── withV1Signing.js       # Android Gradle plugin for dual V1/V2 APK signing & cleartext traffic
├── store/
│   ├── authStore.ts           # Global user authentication & role credentials
│   ├── problemStore.ts        # Grievance CRUD, offline fallback, & W3C Blob multipart uploads
│   └── toastStore.ts          # Custom global animated notifications
├── utils/
│   └── geocoding.ts           # Reverse geocoding & coordinate calculations
├── app.json                   # Expo configuration & permission declarations
├── eas.json                   # Cloud EAS build profiles (preview APK & production AAB)
└── package.json               # Dependencies & scripts
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app installed on your physical phone (or Android Studio emulator)

### 2. Install Dependencies
```bash
cd mobile-app
npm install
```

### 3. Configure Backend Connection
Open [`api/client.ts`](./api/client.ts) and ensure `BASE_URL` points to your development machine's local Wi-Fi IP address (since `localhost` inside a mobile phone resolves to the phone itself):
```typescript
const BASE_URL = 'http://192.168.43.12:5001/api'; // Replace with your computer's local IP
```

### 4. Start Metro Development Server
```bash
npx expo start -c
```
- Press `a` to run on a connected Android device / emulator.
- Or scan the terminal QR code using **Expo Go** on your physical phone.

---

## 🧪 Quality Assurance & Diagnostics

Ensure 100% type safety and zero Expo SDK incompatibilities before committing or building:

```bash
# 1. Type check all TypeScript files
npx tsc --noEmit

# 2. Validate Expo SDK configuration (Passed 21/21 checks)
npx expo-doctor
```

---

## 📦 Building Standalone APK with EAS

To generate an installable Android APK via Expo Cloud:

```bash
# 1. Install EAS CLI globally if not present
npm install -g eas-cli

# 2. Log in to Expo account
eas login

# 3. Trigger preview APK build
eas build --platform android --profile preview
```

The APK will be generated with dual **V1 (JAR Signature)** and **V2 (Full APK Signature)** schemes via [`plugins/withV1Signing.js`](./plugins/withV1Signing.js) for universal Android compatibility.

---

## 👥 Contributors & Acknowledgements

- **Team Phoenix** — Smart India Hackathon (SIH)
- Built with ❤️ for civic empowerment, university technological innovation, and corporate CSR collaboration.
