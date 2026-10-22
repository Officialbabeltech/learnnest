# LearnNest — upgraded starter repository

Responsive learning website with eight clickable subject lesson pages, starter notes and quizzes, WhatsApp subscription requests, payment instructions, Google sign-in integration, and subscription-status checking.

## Subscription settings
- Price: **₦2,500/month for all subjects**
- WhatsApp: **09163250794** (WhatsApp URL format: `2349163250794`)
- Bank: **Opay**
- Account name: **Babel Tech**
- Account number: **9163250794**
- Email: `lordlugard10@gmail.com`

The website does not automatically verify bank transfers. A human must confirm each transfer in the bank app before approving the learner. Do not approve based on a screenshot alone.

## Preview locally
Because this site uses JavaScript modules, run it through a local web server rather than opening `index.html` directly. For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in the browser from this folder. You can also deploy the files to GitHub Pages; keep `index.html` in the published root.

## Configure Google sign-in and subscription status
1. Open [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Add a Web App and verify the values in `js/config.js`; they are prefilled with the project configuration you supplied. Replace them if your Firebase project changes.
3. In **Authentication → Sign-in method**, enable Google.
4. In **Authentication → Settings → Authorized domains**, add your GitHub Pages domain (for example, `officialbabeltech.github.io`, if that is the repository owner/domain you use).
5. Create a Firestore database.
6. Publish the rules in `firestore.rules` using the Firestore Rules tab.
7. Have the student sign in and send their name, Google email, and receipt through WhatsApp.
8. Verify the payment in Opay. In Firestore, create `subscriptions/{student UID}` with fields such as:
   - `status`: string `approved`
   - `expiresAt`: a Firestore Timestamp for the end of the paid month (recommended)

To find the UID, open Firebase Console → Authentication → Users and locate the learner. Only a trusted administrator should edit subscription records. The website rules intentionally prevent users from approving themselves.

## Important limitations
- The subject cards open their own lesson/quiz view. The included notes and quiz items are starter examples, not a complete curriculum for all grades.
- WhatsApp opens a prepared message; the user must press Send and attach the receipt themselves.
- Google Meet links and lesson times must be arranged and sent by the teacher. This website does not create meetings or send Gmail messages automatically.
- Subscription status checking needs Firebase configured as above.
- This is a static website. Client-side checks are not sufficient protection for confidential paid content; lesson text included in client JavaScript can be inspected. For robust paid-content protection, serve premium lessons from a backend that checks authenticated subscription status on every request.
- Bank details are displayed publicly. Confirm they are correct and that you intend them to be public before publishing.

## Upload this complete replacement to GitHub from a phone
1. Download and extract the ZIP.
2. Open the repository, choose **Add file → Upload files**, and upload the contents of the `learnnest-upgraded` folder (not the outer folder).
3. Keep `index.html` at the repository root. The `css`, `js`, and `logo.svg` paths must remain as shown.
4. Commit the upload. If asked about replacing existing files, review the list and confirm.
5. In **Settings → Pages**, publish from the `main` branch and `/ (root)` if Pages is not already enabled.

The logo is an original SVG included as `logo.svg`. Firebase configuration is browser-side configuration, not a secret; Firestore rules and authorized domains still need to be configured correctly.
