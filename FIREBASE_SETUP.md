# Firebase setup and deployment

## 1. Create the Firebase project
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Register a Web app and copy its configuration.
3. Enable **Google** in Authentication → Sign-in method.
4. Add the deployed GitHub Pages hostname to Authentication → Settings → Authorized domains.
5. Create a Cloud Firestore database.
6. Enable billing on the Firebase project if required for Cloud Functions deployment and Gemini usage.

## 2. Configure the web app
Copy `.env.example` to `.env.local` and fill in:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

For GitHub Pages, add `VITE_FIREBASE_API_KEY` as a repository Actions secret and the remaining `VITE_FIREBASE_*` values as Actions variables. The Pages workflow injects these values at build time. Re-run the Pages workflow after configuring them.

Firebase Web configuration is visible in the client bundle by design; it is not an authorization secret. Protect user data with Authentication and Firestore Security Rules.

## 3. Configure the Gemini server secret
The Gemini API key is no longer collected or stored by the browser. The authenticated callable Cloud Function reads it from Firebase Secret Manager.

Install the Firebase CLI, authenticate, and select the project:
```sh
npm install -g firebase-tools
firebase login
firebase use --add
```

Set the secret (the CLI prompts for its value; do not commit it):
```sh
firebase functions:secrets:set GEMINI_API_KEY
```

The callable function requires an authenticated Firebase user, limits text input to 8,000 characters, caps results at 50 tasks, and rate-limits each UID to 12 requests per minute. Gemini content is sent to Google's API for processing; do not submit sensitive personal information.

## 4. Deploy Firestore rules and Cloud Functions
From the repository root:
```sh
firebase deploy --only firestore:rules,functions
```

The deployment configuration is in `firebase.json`. The Cloud Function is deployed in `us-central1`; the web client calls that same region.

## 5. Verify end-to-end
- Confirm the Google provider is enabled and the deployed hostname is authorized.
- Sign in with Google; verify the user appears in Firebase Authentication.
- Add, edit, complete, and delete tasks; verify documents are under `users/{uid}/tasks/{taskId}`.
- Sign out, sign in as a second Google account, and confirm the first account's tasks are not visible.
- Submit a short task brain dump and confirm the `parseTasks` callable succeeds.
- Exceed the parsing rate limit in a controlled test and verify the function returns a rate-limit error.
- Test with network disabled: cloud task loading must fail closed and offer a retry rather than replacing the account's task list with an empty list.

## 6. Cost and operations
Cloud Functions, Firestore reads/writes, and Gemini API requests may incur charges. Configure budget alerts and review Firebase/Gemini quotas before public release. The rate limit is a per-user guardrail, not a billing guarantee or abuse-proof global quota.
