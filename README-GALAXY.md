# Workout Tracker Phase 5 — Android APK build

This ZIP contains a **build-ready Capacitor project**, not a precompiled APK. It preserves the Phase 4 tracker, your five-day custom planner and the eight-week power cycle.

## Fastest way to build with your Samsung Galaxy

1. **Back up your current data**: Open your current Chrome/PWA tracker → **History → Backup JSON**. Save the JSON privately. An Android APK uses separate storage, so your existing workout history **will not migrate automatically**.
2. Open your existing GitHub repo in **Chrome on your Galaxy**. If the GitHub layout hides options, use Chrome's **Desktop site** setting.
3. Extract this ZIP with **My Files**. Upload or replace these files **in the repository root**:
   `index.html`, `app.js`, `style.css`, `sw.js`, `manifest.webmanifest`, `icon-source.png`, `icon-192.png`, `icon-512.png`, `native-bridge.js`, `native-bridge.mjs`, `build-web.mjs`, `package.json`, `capacitor.config.json`.
   Keep your existing website's GitHub Pages settings unchanged. Do not upload `www/`, `android/` or `node_modules/` folders.
4. **Add the workflow file to the correct path.** GitHub → **Add file → Create new file**, name it `.github/workflows/android-apk.yml`. Paste the entire contents of the supplied `android-apk.yml` into the editor; commit. (Merely uploading `android-apk.yml` to the repository root does **not** enable the workflow.) If the path already exists, edit/replace it instead.
5. Go to **Actions → Build Workout Tracker APK → Run workflow**, choose your main branch, and run it. If this is your first workflow, GitHub may ask you to enable Actions in the repo. Wait for the run to finish.
6. Open the successful run → **Artifacts → WorkoutTracker-Debug-APK** → download ZIP → extract it with **My Files** → tap `app-debug.apk` → allow your browser or file manager to install apps from this source when Android asks.
7. Open the new **Workout Tracker** Android app → **History → Restore JSON backup** → select the backup made in step 1. Confirm that workouts, custom plan, and cycle progress appear before deleting the browser/PWA version.

## Notes / caveats

- GitHub Actions needs to be enabled and must have access to npm and Android build downloads; the initial build may take several minutes.
- **The debug APK is meant for testing.** GitHub's generated debug-signing key may change between runs, so newer debug APKs may require uninstalling the old APK. Export a backup before reinstalling! For seamless upgrades, configure a persistent private release signing key using the four `APK_*` GitHub Actions secrets below, then install **WorkoutTracker-Signed-Release-APK**. Never commit your `.jks` private signing key or passwords.
- Required optional release secrets: `APK_KEYSTORE_BASE64` (base64 encoding of your keystore), `APK_STORE_PASSWORD`, `APK_KEY_ALIAS`, and `APK_KEY_PASSWORD`. They must stay unchanged for future APK updates.
- **Do not install the test debug APK and release APK expecting them to upgrade each other.** Android requires the **same signing certificate** for upgrades. Back up first and uninstall the test app before installing your first signed-release app.
- **Your old site and new APK have different local storage.** Use JSON backup/restore to migrate. The app's native **History → Backup JSON** and **Export CSV** features open Android's share sheet; choose a private destination to retain the exported file.
- Offline logging, existing charts, and the power cycle are bundled within the APK. Online exercise-form videos still require a connection.
- The `com.galaxyworkout.tracker` app ID is deliberately fixed; changing it later creates a separate app on the phone.
- This environment cannot download npm/Android SDK dependencies, so the workflow must complete on GitHub before an APK exists. We have validated the ZIP contents and JavaScript syntax, **not** a built Android APK.

## Developer notes (optional, on a computer)

```bash
npm install
npm run build:web
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

The GitHub workflow does these steps automatically. Keep a private backup of your personal workout history and any signing key.
