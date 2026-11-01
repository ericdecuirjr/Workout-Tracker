# Phase 8 — District Flatwater Fitness

## What changed
- App page title, app launcher label, PWA manifest and an in-app startup screen now read **District Flatwater Fitness**.
- The Trends tab includes configurable 4-, 8- and 12-week windows, training days, logged sets, total weighted lifting volume, prior-period comparisons, weekly breakdown, and a selected-exercise estimated 1RM trend.
- The weekly analytics use device-local calendar weeks. Volume is calculated from logged `weight × reps`, and estimated 1RM is the Epley formula on weighted sets of 1–12 reps. These estimates are not tested maxima.
- The Plan tab offers a ChatGPT-assisted custom workout generator. Choose goal, experience, days, minutes, equipment and preferences. Copy the prompt to ChatGPT, paste returned JSON, preview, and explicitly apply it.

## How the ChatGPT flow works
This version **does not directly call the OpenAI API**. It does not put an API key inside the APK or send saved workout history to any service automatically. Opening ChatGPT requires a network connection and possibly a ChatGPT sign-in. The prompt is manually copied; the response is manually pasted. JSON is validated using the app's existing `parsePlan` function and shown to the user before saving. Applying a plan replaces only the custom weekly plan and does not automatically activate it when the power cycle is running.

## Data and Android compatibility
The following keys remain unchanged:
- `workout-tracker-v1` (sets)
- `workout-tracker-plan-v3` (custom weekly plan)
- `workout-tracker-power-v4` (power cycle)

The original set record schema, JSON backup/restore format, Android application ID `com.galaxyworkout.tracker`, signing secrets and versionCode increment workflow are unchanged.

## Installation checks
1. From **History**, make a JSON backup before installing the updated release.
2. Confirm the build passes JavaScript syntax checks and produces the **signed release** APK.
3. Merge the pull request, then install the signed APK from the **main** branch build as an update, not a debug build.
4. Confirm saved sets, custom plans and power-cycle settings still appear.
5. Log a set, open **Trends**, and verify that weekly volume and exercise strength reflect the added entry; undo it and check that Trends refreshes.
6. Build a goal-based ChatGPT prompt, copy it, paste a valid generated plan, preview it, and apply it. Confirm previously saved sets remain intact.
7. Try malformed JSON and confirm it cannot be applied.
8. Verify the Android launcher title and startup display use the new brand.

**Android 12+ note:** The operating-system splash screen is an icon on a solid background; Android controls its appearance. The in-app startup screen displays the full name immediately after the system splash.

If a fully embedded ChatGPT conversation is desired in a future phase, it requires an authenticated server-side API proxy to protect API credentials, with consent around data sharing and an explicit usage-cost model.
