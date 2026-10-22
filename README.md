# LearnNest recreated

This rebuild keeps the public site's core sections and the eight subject areas visible on the current LearnNest page, with working subject navigation, sample notes, quick practice questions, WhatsApp enquiry links, copy-account action, and Firebase sign-in/status integration.

## Files
- `index.html` — page and sections
- `styles.css` — responsive layout and styling
- `js/config.js` — Firebase and subscription configuration
- `js/main.js` — subject lessons, practice, sign-in, subscription status, WhatsApp and copy buttons

## Publish
Upload the contents of this folder to the root of the `main` branch of the `officialbabeltech/learnnest` repository, preserving the folder structure. GitHub Pages should publish from `main` / root.

## Firebase
Google sign-in requires Google provider enabled in Firebase Authentication and `officialbabeltech.github.io` added to Authorized domains. Subscription status expects a Firestore document at `subscriptions/{Firebase Auth UID}` with `status: "approved"` and optional `expiresAt` timestamp. Keep restrictive Firestore rules; do not allow learners to approve themselves.

## Note
This is a recreation based on the currently visible public page and repository's documented structure, not a byte-for-byte restoration of any uncommitted/private prior content. The lesson text and quiz items are starter material, not a complete SS1–SS3 curriculum. Test Google sign-in and Firestore access after publishing.
