# 🌉 Samvad-Setu Mobile App Technical Documentation

> **Complete architectural reference, API flows, native configuration plugins, and state management specifications for the Samvad-Setu mobile application.**

---

## 1. Architecture Overview

The mobile application is engineered with **React Native (0.86.3)**, **React 19.2.3**, and **Expo SDK 57 (`~57.0.25`)**. It leverages **Expo Router (`~57.0.23`)** for typed, file-based navigation, and interacts with the Node.js / Express backend via a centralized Axios HTTP client.

State management is cleanly organized using **Zustand 5**, combining in-memory reactivity with persistent storage (`AsyncStorage` and `expo-secure-store`).

### File-Based Route Groups (`app/`)
Expo Router group syntax (parenthetical directory names) isolates distinct user flows without exposing URL pollution:
- `(auth)`: Contains `login.tsx` and `signup.tsx` with role-aware registration.
- `(citizen)`: Citizen dashboard, active tickets, and the 5-step problem submission wizard.
- `(government)`: Municipal / ULB official audit logs, triage queues, and SLA management.
- `(hei)`: Academic portal for Higher Education Institutions (BIT Sindri, Ranchi University, etc.) to browse AI-escalated challenges, adopt Capstone projects, and track lab R&D.
- `(industry)`: Corporate CSR portal for discovering university prototypes, releasing grant escrow, and reviewing field deployment telemetry.
- `problem/[id].tsx`: Detailed problem dynamic screen containing the 5-stage dynamic workflow tracker and author controls.

---

## 2. Authentication & Secure Storage Flow

### Global Auth Store (`store/authStore.ts`)
Zustand manages the global authentication lifecycle (`user`, `token`, `isLoading`, `error`):
- **`login(payload)`**: Dispatches user credentials to `/auth/login`. On HTTP 200, persists JWT into `SecureStore` and saves the serialized user profile to `AsyncStorage`.
- **`signup(payload)`**: Transmits registration payload (including institutional identifiers for HEI and CSR roles).
- **`logout()`**: Wipes sensitive tokens from `SecureStore`, purges cached credentials, and resets Zustand state.

### Native Token Encryption (`expo-secure-store`)
Session tokens are encrypted natively using Android Keystore / iOS Keychain via `expo-secure-store` under the key `auth_token`.

### Axios Client & Interceptor (`api/client.ts`)
All network interactions pass through a unified Axios instance:
- **Base URL Binding**: Set to the local network IP of the development host (e.g., `http://192.168.43.12:5001/api`).
- **Request Interceptor**: Automatically pulls the encrypted JWT from `SecureStore` and injects `Authorization: Bearer <token>` into outgoing request headers.
- **Cleartext Traffic**: Enabled via custom Android configuration plugin for local HTTP communication.

---

## 3. Binary Media & Multipart Upload Architecture

In React Native 0.86 / Expo 57, traditional React Native multipart dictionaries `{ uri, name, type }` can trigger `Unsupported FormDataPart implementation` crashes when parsed by the modern networking bridge.

### W3C Blob Conversion Pipeline (`store/problemStore.ts`)
To ensure bulletproof media uploads across all Android and iOS devices:
1. When a user picks photos via `expo-image-picker`, a local file URI (`file://...`) is produced.
2. An asynchronous file conversion utility fetches the local URI into an array buffer and wraps it into a W3C-compliant `Blob` or `File` instance:
   ```typescript
   const response = await fetch(photoUri);
   const blob = await response.blob();
   formData.append('images', blob, filename);
   ```
3. Axios serializes the genuine `Blob` directly into standard `multipart/form-data` with automatic boundary calculation.
4. If binary packing encounters a platform edge-case, a graceful fallback safely preserves the submission payload.

---

## 4. Custom Android Config Plugin (`plugins/withV1Signing.js`)

To guarantee smooth sideloading and local network connectivity on physical Android devices, a custom Expo Config Plugin was authored:

```javascript
const { withAppBuildGradle, withAndroidManifest } = require('expo/config-plugins');

module.exports = function withV1Signing(config) {
  // 1. Inject dual V1 (JAR) & V2 (APK Signature Block) schemes into release build config
  config = withAppBuildGradle(config, (modConfig) => {
    modConfig.modResults.contents += `
android {
    signingConfigs {
        release {
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }
}
`;
    return modConfig;
  });

  // 2. Inject cleartext traffic permission into AndroidManifest for local dev
  config = withAndroidManifest(config, (modConfig) => {
    const mainApplication = modConfig.modResults.manifest.application[0];
    mainApplication.$['android:usesCleartextTraffic'] = 'true';
    return modConfig;
  });

  return config;
};
```

### Why This Is Essential:
- **Package Signature Scheme**: EAS Build defaults to V2-only signing. Devices running Android 8 through 11 or custom OEM ROMs fail with `"App not installed as package appears to be invalid"` without V1 signing enabled.
- **Expo Doctor Compliance**: Adding `usesCleartextTraffic` directly to `app.json` violates the Expo schema. Injecting it cleanly via `withAndroidManifest` allows **`npx expo-doctor`** to pass with **21/21 checks passing**.

---

## 5. UI Components & Hardware Integration

### Dynamic 5-Stage Workflow Tracker (`components/WorkflowTracker.tsx`)
A self-contained state machine that visualizes the civic-to-tech pipeline:
1. **Intake & AI Verification**: Citizen submission, GPS capture, AI confidence scoring.
2. **Municipal SLA Window**: Live countdown timer based on severity (48h / 72h / 7d / 14d) with `Within SLA` or `SLA Breached` tags.
3. **HEI Lab Adoption**: Autonomous AI escalation to university engineering labs (BIT Sindri, Ranchi University) when SLA is breached or tech innovation is required.
4. **Industry CSR Escrow**: Corporate funding allocation, grant release, and lab prototype sponsorship.
5. **Field Deployment**: Community installation, IoT sensor integration, and civic sign-off.

### Embedded Leaflet OpenStreetMap (`components/LeafletMap.tsx`)
- Renders an interactive OpenStreetMap view using `react-native-webview`.
- Plots color-coded markers for incident categories (Pothole, Water, Garbage, Electricity).
- Provides coordinate reverse geocoding via [`utils/geocoding.ts`](./utils/geocoding.ts) without incurring paid Google Maps API billing.

### Voice Grievance Dictation (`components/VoiceInputRecorder.tsx`)
- Built using native React Native `Animated` primitives.
- Features pulsing visual feedback and elapsed time indicator.
- Automatically synthesizes audio input into structured text fields (title, category, description).

### Global Animated Toasts (`store/toastStore.ts` & `components/ui/Toast.tsx`)
- Lightweight, hardware-accelerated toast notification system.
- Slide-down and fade animations with dynamic color coding for `success`, `error`, and `info` alerts.

---

## 6. Offline-First Resilience

The application features built-in network fault tolerance:
- If a citizen submits an incident while in an area with poor network coverage or if the backend is down, the report is saved directly to local storage (`@citizen_tickets`).
- Complete AI classification, mock SLA timestamps, and coordinates are preserved.
- When network connectivity is re-established, the user can synchronize their tickets without data loss.

---

## 7. Build & Distribution Reference

### Build Profiles (`eas.json`)
- **`preview`**: Generates a standalone, universally installable `.apk` file for testing on any physical Android device.
- **`production`**: Produces an optimized Android App Bundle (`.aab`) ready for Google Play Store publication.

### Verified Production Artifacts
- **EAS Build ID**: `74852825-761f-466d-bcb3-dc0eada9baee`
- **Direct Download URL**: `https://expo.dev/artifacts/eas/G13njFbeSx5kCvHsPPDTysveR1QPnMfa-vpytFY9QcA.apk`
- **QR Code Asset**: `samvad_setu_download_qr.png` in root directory.

---

*Samvad-Setu Technical Documentation • Team Phoenix • 2026*
