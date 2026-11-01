# Phase 9 — Smart progression, muscle-group analytics & ChatGPT coaching

## Features
1. **Progressive overload suggestions (Log tab):** Suggestions are based on the most recent completed exercise days, a user-selected goal, and 2.5/5/10 lb increments. Weight increases are suggested only after at least two completed sessions at the top of the goal's rep range with two or more sets at consistent load per session. Explosive lifts receive technique/speed guidance rather than automatic weight increases; bodyweight sets never receive added-load suggestions. User can put the suggested weight and reps into the form but must explicitly save the set.
2. **Muscle-group analytics (Trends tab):** Compare 4, 8 or 12 weeks of logged set counts and weighted volume for Chest, Back, Shoulders, Legs, Arms, Core, Conditioning, Mobility and Unmapped. Each exercise counts once toward its *primary* muscle group, not every recruited muscle. Automatically derived classifications can be corrected for logged exercises. Unmapped items are called out; these are approximate exercise-category summaries and cannot diagnose an imbalance.
3. **Goal-aware ChatGPT coaching (Plan tab):** Build a coaching-review prompt from the existing goal, experience, days, session duration and equipment. Workout history is **not** included by default. Two explicit opt-in choices add aggregates/exercise names, then optional exercise-level progression notes. The user can review/copy the prompt, open ChatGPT, and paste the resulting JSON plan into the existing Phase 8 validation/preview/import flow. There is no embedded API key, remote workout-history sync, or automatic submission.

## Preservation and privacy
- Existing keys: `workout-tracker-v1`, `workout-tracker-plan-v3`, and `workout-tracker-power-v4` are unchanged. New optional preferences are stored in `district-flatwater-phase9-settings-v1`.
- Existing saved sets, set format, exported JSON schema and restore behavior are unchanged. New settings are nonessential and are not included in the existing backup file.
- Android package ID, signing key handling, versionCode workflow, release build steps, and Phase 8 branding are preserved.
- All analytics run locally; no workout history is transmitted by the new code.
- ChatGPT-assisted coaching is a deliberate copy/paste workflow, not an autonomous in-app ChatGPT chat. A future direct AI integration requires a secure authenticated backend.

## Verification checklist
- [ ] `node --check` succeeds for Phase 8 and Phase 9 JavaScript; `node phase9.test.cjs` passes.
- [ ] Android signed release builds from `main` after merge.
- [ ] Back up Phase 8 history from History → Backup JSON **before installing**.
- [ ] Install **signed release** over existing APK (never uninstall it) and confirm saved sets, workout plan and power cycle survive.
- [ ] In Log, select an exercise with completed prior workouts; inspect smart progression. Tap “Use suggested weight & reps” and ensure this **does not** record a set until Save set.
- [ ] Confirm explosive/bodyweight movements do not receive automatic additional weight.
- [ ] In Trends, inspect muscle-group counts, 4/8/12-week selection, and custom exercise mapping.
- [ ] Log and undo a set and confirm analytics refresh.
- [ ] In Plan, verify no history included by default; opt in, refresh, copy the prompt and inspect the manual ChatGPT JSON import flow.

**Interpretation:** Training recommendations are suggestions only, not measured bar speed, fatigue, or medical clearance. Weights assume consistent logging units in pounds.
