# Samvad Setu Mobile App Documentation

## 1. Architecture Overview
The mobile app is built with **React Native** and uses **Expo Router** for file-based routing. It communicates natively with the Express Node.js backend. State management is handled globally by **Zustand**.

### Route Groups
The app leverages Expo Router's Group syntax (parentheses) to strictly separate user flows without exposing them in the URL schema:
- `(auth)`: Contains `login.tsx` and `signup.tsx`.
- `(citizen)`: Citizen dashboard and report submission flows.
- `(hei)` / `(industry)` / `(government)`: Specialized role-based dashboards.

## 2. Authentication Flow

### Global Auth Store (`store/authStore.ts`)
We use Zustand to manage the global authentication state (`user`, `token`, `isLoading`, `error`). 
- **`login(payload)`**: Posts credentials to the backend. On success, it securely saves the JWT and user profile to `SecureStore`.
- **`signup(payload)`**: Posts a new user payload (including complex institutional fields if applicable) to the backend. Saves tokens upon auto-login.
- **`logout()`**: Wipes tokens from `SecureStore` and clears the Zustand state, instantly locking the user out.

### Secure Token Storage
We utilize `expo-secure-store` to safely encrypt the JWT on the native device level. 

### Axios Interceptor (`api/client.ts`)
All backend requests flow through a central Axios instance. An interceptor automatically looks up the token in `SecureStore` and attaches it as a `Bearer` token in the `Authorization` header for every outgoing HTTP request.

## 3. Custom UI Components

### Animated Toast System
We built a custom global Toast messaging system to mirror the premium web UI exactly.
- **`store/toastStore.ts`**: Manages visibility, message string, and type (`success`, `error`, `info`).
- **`components/ui/Toast.tsx`**: Uses React Native's `Animated` API for smooth slide-down and fade-in physics. It dynamically inherits color borders (`#E8A33D`, `#2F9E8F`, `#e74c3c`) and Lucide icons depending on the toast type. It is mounted globally at the root in `app/_layout.tsx`.

### Premium Bottom Navigation (`_layout.tsx`)
Rebuilt the default tabs into a highly customized, floating style bottom tab navigator:
- Custom SVG icons via `lucide-react-native`
- Native dropshadowing & active tint transitions (`#E8A33D` for active citizen state)
- Seamless system-level padding integration via `react-native-safe-area-context`

## 4. Citizen Portal Implementation

### Global Problem Store (`store/problemStore.ts`)
Replicates the functionality of the web dashboard.
- Uses `FormData` formatted appropriately for React Native (`{ uri, name, type }`) to support binary image uploads to the Node server.
- Intercepts and parses backend data for both dashboard presentation and individual ticketing.

### Multi-Step Wizard Flow (`submit-problem/index.tsx`)
Ported the complex 5-step React UI directly into React Native to achieve a seamless multi-phase form using `expo-image-picker` and `expo-location`:
1. **Details**: Title and description inputs.
2. **Location**: Auto-locates coordinates using GPS.
3. **Media Upload**: Utilizes `expo-image-picker` to natively open the phone's gallery, select photos, and render high-quality previews inline.
4. **AI Auto-Routing**: Extracts data and simulates categorization models before submission.
5. **Review & Submit**: Uses standard HTTP Multipart upload to finalize the request to the `api/client.ts`.

## 5. Local Network Testing
For testing on physical Android or iOS devices via Expo Go, the Axios Base URL is bound to the local network IP of the host machine (e.g., `192.168.1.4:5001/api`). Note that `localhost` cannot be used on mobile clients since it resolves to the mobile device itself, not the backend server machine.
