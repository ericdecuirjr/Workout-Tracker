Workout Tracker Phase 3 — flexible weekly training plan

NEW
- Set 1–7 training days per week.
- Pick which weekdays you train, and assign workout types (Push, Pull, Legs,
  Upper, Lower, Full Body, Conditioning, Mobility, or Custom).
- Edit the exercises and prescribed sets/reps for each day.
- See your weekly schedule on the Dashboard.
- Backups now include your workout schedule as well as logged sets.

HOW TO UPDATE ON YOUR GALAXY USING GITHUB
1. In the current tracker, open History > Backup JSON, and save a backup.
2. Unzip this package. From your GitHub repository on your phone, upload
   index.html, app.js, and style.css to the ROOT of the same repository,
   replacing the old versions. The included README.txt is optional.
   Do not upload only the ZIP.
3. Wait until GitHub Pages completes deployment. Reopen your existing app.
   If you still see the old version, refresh it or close and reopen your
   installed shortcut.
4. Open Plan. Choose how many training days you want, set the weekdays and
   workout types, optionally expand 'Edit workout exercises', then tap
   'Save weekly plan'. The Dashboard displays the saved weekly schedule.
5. For Custom workouts, enter your own name and list each exercise on a
   separate line. Add a vertical bar followed by sets/reps if you want:
   Dumbbell Bench Press | 4 x 8-12
   Pull-up | 3 x 6-10

DATA SAFETY
- Workout history uses the same workout-tracker-v1 storage key as Phase 2.
  The update does not intentionally delete or change workout history.
- Schedule settings are stored under workout-tracker-plan-v3.
- Existing Phase 2 JSON backups can still restore workout history.
- Data lives in the browser on the same device and site. It can be lost
  when browser data is cleared, or if a different site URL/browser is used.
  Export JSON backups regularly.
- Exercise form videos require internet access.
