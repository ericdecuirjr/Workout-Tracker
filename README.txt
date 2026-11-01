Workout Tracker — Phase 4: Eight-Week Strength + Power Cycle
Compatible with Phase 3 custom workout schedules and previously saved workout history.

WHAT IS NEW
* New "8-Week Power" tab, alongside your existing custom "Plan" tab.
* Eight-week cycle with four phases:
  - Weeks 1–2: Foundation and technique
  - Weeks 3–4: Maximum strength
  - Week 5: Deload (reduced volume)
  - Weeks 6–8: Explosive power
* Three primary sessions: Monday lower body, Wednesday upper body, Friday total body.
* Optional recovery / mobility on Tuesday and Thursday.
* Each week has specific exercise prescriptions, with quick links to form videos.
* Select a Week 1 start date. The app displays the current week automatically,
  and lets you preview any week and session.
* Mark primary sessions complete and track progress out of 24 sessions.
* Activate or leave the cycle without changing your saved custom weekly plan.
* Cycle settings and completed sessions are included in your JSON backups.
* Versioned assets and a new service worker help the installed app refresh after updates.

INSTALL ON YOUR GALAXY (SAME GITHUB PAGES ADDRESS)
1. IMPORTANT: Open current tracker > History > Backup JSON. Save that backup.
2. Download and extract this ZIP on your Galaxy.
3. In the ROOT of your existing GitHub Pages repository, update index.html,
   app.js, and style.css; add or replace sw.js from this ZIP too.
   Do NOT upload only the ZIP file. Leave your repository's existing
   manifest.webmanifest, images, and other files in place.
4. Commit the changes, then allow GitHub Pages to publish them.
5. Close the installed tracker and reopen it. If it still shows Phase 3,
   open the site once in Chrome, refresh, then relaunch the installed app.
   If necessary: Settings > Apps > Workout Tracker > Storage > Clear CACHE.
   DO NOT clear data; that could erase local workout history.
6. Open "8-Week Power", set the start date (week begins Monday), and select
   "Use this power cycle". The Dashboard will reflect that schedule.
7. To return to your own program, choose "Use custom plan" or visit Plan.

DATA SAFETY AND LIMITATIONS
* Your existing sets continue to use the Phase 2/3 storage key:
  workout-tracker-v1. They are not automatically deleted or replaced.
* Existing custom schedules continue to use workout-tracker-plan-v3.
* Cycle state uses a separate key: workout-tracker-power-v4.
* Data stays on the same browser/site/device, not in a cloud account.
* Clearing app data, changing browser, or changing website origin can lose
  data unless you restore a previously exported JSON backup.
* Phase 2 and Phase 3 backups remain compatible; they do not contain cycle progress.
* Form videos require an internet connection. Log/history works offline once
  app files are cached by the updated service worker.
* Modify exercise selections and loads based on current capacity. For pain,
  pause or choose a low-impact alternative; consult a qualified clinician
  before plyometrics if you have unresolved foot/ankle or joint issues.
