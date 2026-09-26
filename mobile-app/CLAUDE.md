# Claude Assistant Reference - Samvad-Setu Mobile App

See comprehensive guidelines in [AGENTS.md](./AGENTS.md) and full architecture in [Docs.md](./Docs.md).

## Quick Commands
```bash
# Start local Metro bundler with cache cleared
npx expo start -c

# Type-check TypeScript codebase
npx tsc --noEmit

# Run Expo health diagnostics (21/21 checks passing)
npx expo-doctor

# Build standalone Android APK on EAS
eas build --platform android --profile preview
```

## Key Files
- `plugins/withV1Signing.js`: Dual V1/V2 Android signing scheme + cleartext traffic hook.
- `store/problemStore.ts`: Incident reporting with W3C Blob multipart uploads & offline persistence.
- `store/authStore.ts`: Role-aware authentication with JWT in `expo-secure-store`.
- `components/WorkflowTracker.tsx`: Dynamic 5-stage civic-to-tech resolution pipeline.
- `components/LeafletMap.tsx`: OpenStreetMap component for incident mapping.
- `api/client.ts`: Axios client configured with local IP binding and auth interceptors.

## Latest Android Build
- **Direct APK Download**: [https://expo.dev/artifacts/eas/G13njFbeSx5kCvHsPPDTysveR1QPnMfa-vpytFY9QcA.apk](https://expo.dev/artifacts/eas/G13njFbeSx5kCvHsPPDTysveR1QPnMfa-vpytFY9QcA.apk)
- **EAS Build ID**: `74852825-761f-466d-bcb3-dc0eada9baee`
