# Remaining Frontend Work

This file captures the full set of frontend-related work still missing in `mobile-app/` based on the current branch contents, the FastAPI backend currently checked into `app/`, and the product flow described in `TEAM_README.md`.

It is intentionally exhaustive. Items are grouped by priority and area so nothing gets lost while refining the app.

## 1. Hard Blockers: App Does Not Compile or Run Cleanly Yet

- Implement `src/components/FormControls.tsx`.
  - It is imported by:
    - `src/screens/RegisterScreen.tsx`
    - `src/screens/PremiumScreen.tsx`
    - `src/screens/ClaimsScreen.tsx`
  - Missing exports currently required:
    - `Field`
    - `PrimaryButton`

- Implement `src/components/Layout.tsx`.
  - It is imported by:
    - `src/screens/RegisterScreen.tsx`
    - `src/screens/PremiumScreen.tsx`
    - `src/screens/PolicyScreen.tsx`
    - `src/screens/ClaimsScreen.tsx`
  - Missing exports currently required:
    - `ScreenLayout`
    - `cardStyles`

- Add `mobile-app/.env.example`.
  - `src/api/client.ts` expects `EXPO_PUBLIC_API_BASE_URL`.
  - There is currently no example env file for local/mobile setup.

- Install and verify frontend dependencies locally.
  - `node_modules/` is not present.
  - The app has not been validated with a successful `npm install`.
  - The app has not been validated with a successful Expo boot.

- Validate TypeScript with the project compiler after dependencies are installed.
  - Current static validation has not been completed against installed project dependencies.

## 2. Backend Contract Mismatches That Must Be Fixed

- Fix login request format mismatch.
  - `src/api/client.ts` sends `application/x-www-form-urlencoded` to `/auth/login`.
  - The real backend in `app/main.py` expects JSON matching `LoginRequest`.
  - One of these must happen:
    - update frontend login to send JSON, or
    - change backend login to support OAuth2 form login properly.

- Reconcile README/API assumptions with actual backend routes.
  - Frontend-related docs currently mention endpoints that do not exist in the backend:
    - `/dashboard/worker/{id}`
    - `/dashboard/admin`
  - Frontend work should not depend on these until they are implemented server-side.

- Reconcile weather trigger behavior.
  - `src/api/client.ts` hardcodes `force_mock: true` for `/weather/check-trigger`.
  - Decide whether the frontend should:
    - stay demo-only, or
    - support real weather checks when an API key is configured.

- Normalize backend error parsing in `src/api/client.ts`.
  - Current error handling uses `response.text()`.
  - FastAPI often returns structured JSON errors.
  - The client should parse and surface backend messages cleanly.

## 3. Mobile Networking: Required for Real React Native Use

- Replace unsafe default backend URL strategy.
  - `src/api/client.ts` falls back to `http://localhost:8000`.
  - This is not reliable for:
    - Android emulators
    - iOS simulators in all setups
    - physical devices on LAN

- Implement environment-based base URL setup for mobile.
  - Minimum expected support:
    - Android emulator: `http://10.0.2.2:8000`
    - iOS simulator: local machine URL if applicable
    - physical device: `http://<LAN-IP>:8000`

- Document mobile API base URL usage clearly.
  - How to create `.env`
  - How to set `EXPO_PUBLIC_API_BASE_URL`
  - Examples for emulator vs device

- Verify backend CORS behavior against Expo web and native fetch usage.
  - Web and native networking need to be tested separately.

## 4. Navigation Architecture Is Incomplete

- Replace the current auth flow structure.
  - `src/navigation/AppNavigator.tsx` uses a tab navigator for both authentication and the main app.
  - This is not the right structure for a mobile app.

- Implement proper navigation separation:
  - Auth stack for:
    - Login
    - Register
  - Main tab navigator for authenticated users

- Remove the current misuse of `RegisterScreen` as the authenticated `Account` tab.
  - This is mixing authentication and profile/account concerns into one screen.

- Add proper screen titles, tab labels, and icons for the main user flow.

- Decide whether the Home dashboard screen is required in this branch.
  - Earlier UI work included a Home screen.
  - Current branch does not.
  - If kept out intentionally, the information architecture should be adjusted accordingly.

## 5. Missing Screens / Missing Product Surface

The current branch is functionally narrower than the earlier redesign and narrower than the intended mobile experience.

- Implement a dedicated `LoginScreen`.
  - Current auth UX is embedded inside `RegisterScreen`.
  - This is workable for a quick prototype, but not correct for a polished mobile flow.

- Implement a dedicated `AccountScreen`.
  - Current authenticated "Account" tab points to `RegisterScreen`.
  - Profile display and account actions should live separately from onboarding/auth.

- Implement a dedicated `HomeScreen` if the product will keep a dashboard-first experience.
  - Earlier frontend work included:
    - welcome banner
    - quick actions
    - worker stats
  - That experience is missing in the current branch.

- Decide whether the final app should include:
  - Home
  - Policy
  - Premium
  - Claims
  - Account
  - Login
  - Register

## 6. Shared Design System Work Still Missing

- Implement reusable UI primitives in `src/components/`.
  - Buttons
  - Fields
  - Layout wrappers
  - Cards
  - Section headers
  - Status pills/chips
  - Empty state blocks

- Decide final visual direction.
  - `TEAM_README.md` says dark navy + orange redesign.
  - Current `src/theme.ts` is a light beige/green palette.
  - This inconsistency must be resolved.

- Expand theme coverage if keeping a componentized frontend.
  - Current theme only includes:
    - `background`
    - `card`
    - `surface`
    - `primary`
    - `secondary`
    - `accent`
    - `text`
    - `muted`
    - `border`
    - `danger`
    - `success`
  - Missing likely theme primitives:
    - spacing scale
    - radius scale
    - disabled colors
    - warning colors
    - input colors
    - typography tokens

- Standardize copy and formatting style across screens.
  - Current branch mixes:
    - `Rs`
    - raw backend strings
    - mixed sentence styles

## 7. Screen-Level Refinements Still Required

### Register / Login

- Split demo login and real registration into cleaner dedicated flows.

- Add proper frontend form validation for:
  - email
  - phone number
  - password minimum length
  - pincode format
  - numeric earnings

- Prevent repeated seeded-email collisions in registration defaults.
  - Current default registration email is fixed and will fail after first successful registration.

- Normalize platform values.
  - Current default sends `Zepto`.
  - Confirm casing expectations and keep the UI/backend consistent.

- Improve auth error messages.
  - Parse backend validation errors instead of surfacing raw `Error` string values.

### Premium

- Add loading skeleton or better loading state while quotes are fetched.

- Disable purchase button while a purchase is in flight.

- Reflect active policy state after purchase.
  - The screen currently shows an alert, but does not maintain purchased/active state locally.

- Handle the "already has active policy" case with a clear UX.

- Decide whether forecast multiplier should be user-visible or hidden.
  - It is currently displayed as raw pricing factors.

- Improve plan comparison UX.
  - Current screen is functional but still plain compared with the earlier redesigned cards.

### Policy

- Improve empty-state handling when no policy exists.
  - Current screen renders raw error text from the backend.

- Add explicit coverage breakdown UI.
  - The earlier redesign showed covered vs excluded items.
  - Current branch only shows headline policy metadata.

- Add CTA from empty policy state to Premium screen.

- Improve date formatting for mobile readability.
  - Current implementation uses full locale string output.

### Claims

- Add empty-state UX when there are no claims yet.

- Add claim status styling.
  - paid
  - approved
  - flagged
  - rejected

- Display fraud score if that is still part of the Phase 2 goal.

- Improve claim item formatting.
  - disruption name formatting
  - payout formatting
  - timestamp formatting
  - payout reference prominence

- Expand simulator options if needed.
  - Current manual simulation only triggers `platform_downtime`.
  - Earlier UI work supported multiple disruption types.

- Clarify to the user when weather simulation is mock mode versus real mode.

## 8. State Management Gaps

- Add a reliable way to refresh policy state after:
  - login
  - registration
  - policy purchase
  - claim creation if policy-dependent metrics are shown later

- Decide whether policy data should live in screen-local state or shared app state.

- Decide whether dashboard/summary state will be introduced later.

- Add a startup/auth bootstrap state that handles:
  - token present but expired
  - backend unavailable
  - network timeout

- Normalize sign-out behavior.
  - Ensure the app returns to the proper auth flow after logout.

## 9. API Client Improvements Still Needed

- Add timeout handling.

- Add safer error extraction from backend responses.

- Add typed helper methods for all backend payloads and responses.

- Add support for optional real weather checks without forcing mock mode.

- Decide whether to keep plain `fetch` or wrap it with a small API helper abstraction for retries/error normalization.

- Ensure every client method matches the real backend schema exactly.

## 10. React Native / Expo Project Hygiene Still Needed

- Add `mobile-app/.gitignore` if frontend-specific ignores are needed.
  - At minimum verify whether project root ignores are sufficient for Expo artifacts.

- Add `.env.example` for frontend.

- Add mobile-app specific README/run instructions if the root docs are not enough.

- Verify Babel config is sufficient for the chosen navigation/dependency set.

- Verify Expo configuration for:
  - app name
  - slug
  - Android package
  - splash/icon if needed for demo polish

- Confirm whether web support is still required.
  - `package.json` includes `web`.
  - The product decision is mobile-first React Native.
  - If web is not needed, keep it only if it materially helps demoing.

## 11. Documentation Gaps That Affect Frontend Work

- Update `TEAM_README.md` to match the real state of the branch.
  - Current document overstates what exists.

- Update setup instructions to explain the actual frontend run path.

- Document exact backend/frontend integration steps:
  - start backend
  - set mobile API base URL
  - install frontend deps
  - run Expo

- Document the true login contract if the backend remains JSON-based.

## 12. Testing and Verification Still Missing

- Verify app boots successfully in Expo after missing component files are added.

- Verify end-to-end auth flow:
  - register
  - login
  - token persistence
  - logout

- Verify policy flow:
  - fetch quote
  - purchase policy
  - reload policy screen

- Verify claim flow:
  - simulate manual trigger
  - simulate weather trigger
  - claim list refresh

- Verify mobile networking on:
  - Android emulator
  - iOS simulator if applicable
  - physical device on local network

- Verify no screen crashes when backend is down or unreachable.

- Verify no screen crashes when user has:
  - no policy
  - no claims
  - failed login
  - duplicate registration

## 13. Optional But Strongly Recommended Refinements Before Demo

- Restore the richer screen set from the redesign branch if desired:
  - Home
  - separate Login
  - separate Account
  - more polished plan cards
  - stronger claim history visuals

- Add better demo affordances:
  - seeded demo login button
  - clearer success banners
  - visible policy activation state
  - claim payout confirmation styling

- Improve currency formatting to Indian style where appropriate.

- Add polished empty states and loading states throughout.

- Remove raw backend error strings from the visible UI.

- Make the app feel intentionally mobile-first rather than a quick API console.

## 14. Concrete Worklist Summary

If this needs to be executed in the right order, the frontend implementation sequence should be:

1. Add missing `src/components/` files so the app compiles.
2. Fix login contract mismatch between frontend and backend.
3. Add `.env.example` and proper mobile API base URL handling.
4. Install dependencies and verify Expo boot.
5. Refactor navigation into auth flow + main app flow.
6. Split `RegisterScreen` into proper auth/account responsibilities.
7. Decide and implement final screen set: Home/Login/Account if required.
8. Improve screen-level UX for Premium, Policy, and Claims.
9. Normalize API errors, loading, and empty states.
10. Validate the entire app on emulator/device against the real backend.

