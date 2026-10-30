# Firebase setup

## 1. Create and configure a Firebase project
1. Create a Firebase project in the Firebase Console and register a Web app.
2. In **Authentication → Sign-in method**, enable **Google**.
3. In **Authentication → Settings → Authorized domains**, add the deployed application hostname.
4. Create a Cloud Firestore database.

## 2. Configure the app
Copy `.env.example` to `.env.local` and fill in the Web app configuration values:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Restart the Vite dev server after changing environment variables. For GitHub Pages, add the same variables as repository Actions secrets/variables and expose them to the build step in the deployment workflow before deploying.

Firebase Web configuration is not a server secret. Authorization must be enforced by Firebase Authentication and Firestore Security Rules.

## 3. Deploy Firestore rules
Review and deploy the repository's `firestore.rules` file. It allows a signed-in user to read and write only documents under `users/{their UID}/tasks`.

Example with Firebase CLI:
```sh
firebase deploy --only firestore:rules
```

## 4. Verify
- Sign in with Google and confirm a user is created in Firebase Authentication.
- Add, edit, complete, and delete a task.
- Sign out and sign in as another account; the first account's tasks must not appear.
- Confirm Firestore documents are stored under `users/{uid}/tasks/{taskId}`.

## Gemini API key warning
The current Gemini SDK call is browser-side. A key entered in Settings is not persisted in localStorage, but it remains inspectable in the browser runtime and network requests. Do not use a production key until Gemini requests are routed through a server-side proxy with authentication, rate limiting, and appropriate input minimization.
