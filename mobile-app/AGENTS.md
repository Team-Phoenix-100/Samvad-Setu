# Agent Guidelines for Samvad-Setu Mobile App

> **CRITICAL CONTEXT FOR AI CODING AGENTS WORKING ON THIS REPOSITORY**

## 1. Expo & React Native Versions
- **Expo SDK**: `57.0.25` (Versioned docs: https://docs.expo.dev/versions/v57.0.0/)
- **React Native**: `0.86.3`
- **React**: `19.2.3`
- **Routing**: Expo Router `57.0.23` (File-based group routing)

---

## 2. Hard Architectural Rules & Guardrails

### ❌ Never Re-Introduce Incompatible Native Libraries
- **DO NOT install `react-native-reanimated: 4.x`** or `react-native-worklets`. Version 4.x worklet C++ runtime causes fatal startup ANR ("App Not Responding / Wait or Close App") crashes on React Native 0.86 / Android.
- **DO NOT install `expo-av`**. Audio feedback and dictation are implemented using simulated speech assistance and native React Native `Animated` primitives.
- All animations must use standard React Native `Animated` or CSS-like styling transforms.

### 📤 Binary Multipart Uploads (`FormData`)
- **NEVER** append raw `{ uri, name, type }` objects directly to `FormData` for binary uploads in `problemStore.ts`. In React Native 0.86, this causes an unhandled `Unsupported FormDataPart implementation` runtime error.
- **ALWAYS** convert local `file://` URIs to genuine W3C `Blob` instances via `await fetch(uri).then(r => r.blob())` before appending to `FormData`.

### 🛡️ Android Custom Config Plugin
- Keep [`plugins/withV1Signing.js`](./plugins/withV1Signing.js) intact.
- It is required for Android APK builds to enable dual **V1 (JAR)** and **V2 (Full APK)** signing, preventing `"App not installed as package appears to be invalid"` on physical Android devices.
- It also injects `android:usesCleartextTraffic="true"` via `withAndroidManifest` so that `npx expo-doctor` passes without schema errors.

### 🧭 Navigation & Role Structure
- Citizen portal: `app/(citizen)/`
- Municipal / ULB official portal: `app/(government)/`
- Higher Education Institution (HEI) portal: `app/(hei)/`
- Industry CSR portal: `app/(industry)/`
- Auth screens: `app/(auth)/`
- Dynamic problem detail: `app/problem/[id].tsx`

---

## 3. Mandatory Verification Checklist
Before completing any task or committing changes:
```bash
# 1. Strict TypeScript type check (must be 0 errors)
npx tsc --noEmit

# 2. Expo Doctor configuration check (must pass 21/21 checks)
npx expo-doctor
```
