# WordWeave: Future Development & Release Roadmap

> **Status:** Saved for Future Implementation (Standby mode - to be triggered upon user request).

---

## 1. App Update Release Protocol
When ready to push new updates to Google Play Store:

1. **Version Bump in `version.json`:**
   - Increment `versionCode` (e.g., `4` -> `5`).
   - Increment `versionName` (e.g., `"1.0.3"` -> `"1.0.4"` or `"1.1.0"`).
2. **Build Release AAB:**
   ```powershell
   cd android
   .\gradlew.bat bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`
3. **Play Console Release:**
   - Go to Play Console -> Production (or Closed testing) -> Create new release.
   - Upload new `.aab`.
   - Add release notes highlighting new features/levels.
   - Submit for Google review (typically 4-12 hours for existing apps).
4. **User Experience:**
   - Existing users get a direct **Update** button on Play Store or automatic background updates.
   - User game progression (`AsyncStorage` stars, unlocked levels, timer records) is **100% preserved**.

---

## 2. Level Expansion & Endgame Strategy (Beyond Level 200)

### Current Architecture
- Completing Level 200 keeps all 200 levels unlocked.
- Home screen switches to **"Play Again"** mode.
- All completed boards remain replayable with 3-star ratings and fastest time leaderboards.

### Planned Expansion Modules (Implement on User Command)
1. **Level Expansion Packs (Levels 201–300+):**
   - Add batches of 50 handcrafted boards to `src/data/levelData.json`.
   - New Chapter categories (e.g., *Mythology, Fantasy, Cosmic Odyssey, Ancient Civilizations*).
2. **Daily Challenge Mode (Infinite Retention):**
   - 1 unique daily puzzle corresponding to the calendar date.
   - Streak tracking (e.g., 🔥 7-day streak) to drive daily active users (DAU).
3. **Zen / Endless Procedural Shuffle Mode:**
   - Procedural 5x5 board generator selecting 3 to 6 dictionary words for infinite puzzle replayability without fixed level caps.
4. **Mastery Badges & Confetti Celebration:**
   - "Grand Word Master" trophy awarded upon completing Level 200.
   - Social shareable achievement card for WhatsApp / Instagram Stories.

---

## 3. Advanced Features Pipeline
- **Google Play In-App Updates:** Integrated popup inside the game prompting users to update seamlessly without navigating away.
- **Remote / Cloud Levels:** Dynamic level streaming to add new puzzles on the fly without mandatory Play Store binary updates.
