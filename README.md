# LearnNest — complete starter website

## Files
- `index.html` — website page
- `styles.css` — responsive professional styling
- `logo.svg` — LearnNest logo
- `js/config.js` — Firebase and payment configuration
- `js/main.js` — subject lessons, sample quizzes, Google sign-in, subscription status and WhatsApp links
- `firestore.rules` — Firestore rules

## Publish with GitHub Pages
Keep this exact structure in the repository root. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. The published URL appears on the Pages screen.

## Firebase setup
1. In Firebase Console, open **Authentication → Sign-in method** and enable Google.
2. In **Authentication → Settings → Authorized domains**, add your GitHub Pages domain (for example, `yourname.github.io`).
3. Create a **Cloud Firestore** database.
4. Open Firestore **Rules** and publish the contents of `firestore.rules`.
5. `js/config.js` is prefilled with the Firebase web app config supplied for this project. If Firebase shows different values, update them there.

## Subscription approval
The site reads `subscriptions/{Firebase Auth UID}` and expects `status: "approved"`. The record can include `expiresAt` as a Firestore timestamp. The rules intentionally prevent public/client writes to subscriptions. An administrator must create/update records using Firebase Console or a trusted server/admin tool after checking payment receipts. Do not loosen client write rules to let learners approve themselves.

## Important limitations
- This is a starter site; the included lesson and quiz content is sample material.
- Payment verification and live lesson scheduling are manual. WhatsApp links prepare a message; the learner still needs to send it.
- Client-side checks alone cannot securely protect content shipped in JavaScript. For production paid content, serve premium materials through a trusted backend that verifies subscription status.
- Firebase web config values identify the project; protect data with Security Rules and authorized-domain settings. Never put service-account private keys in this repository.
