# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a new Firebase Project
   To run this app with your own backend, you need to create a Firebase project and use your own Firebase configuration keys.
   1. Go to the Firebase Console: https://console.firebase.google.com/
   2. Click Add project.
   3. Enter a project name, for example: fitquest-yourname
   4. Ensure the Enable Gemini in Firebase is set to yes

Once the project is created, you should see a dashboard with an option at the top to Add App. After clicking this you can

1.  Select web
2.  Give the app a nickname, for example: fitquest-app (you do not need to select hosting)
3.  Click Register App

Go to the project folder terminal and ensure firebase is installed using

```bash
npm firebase -v
```

It should be installed as it is a dependency, but if it is not installed, make sure it is installed using

```bash
npm install firebase
```

You should now be able to see all your needed keys to use Firebase.
Please copy the keys into the .env file under in the following order:

EXPO_PUBLIC_FIREBASE_API_KEY=apiKey

EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=authDomain

EXPO_PUBLIC_FIREBASE_PROJECT_ID=projectId

EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=storageBucket

EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=messagingSenderId

EXPO_PUBLIC_FIREBASE_APP_ID=appId

3. Go to the console and click on Security, then Authentication, then click on Email/Password and ensure it is enabled.

4. Go to Databases and Storage on the left, click on Firestore, create a new database, ensuring it is in Test Mode

5. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

For the duration of this project, Expo Go was used, with early development sometimes using web. The Expo Go app must be downloaded the mobile device intending to be used in order to run it.

Sometimes the development server can give an npm error, in which case pressing r in the terminal can fix the error by reloading the server.
If this does not work, you can try

```bash
  npx expo start -c
```

This command clears the bundler cache, and is worth trying if reloading is not working.

Unfortunately, since the images require the assets to be uploaded to the backend, there is no way to view them using a personal new firebase ptoject without extra setup, although the main task functionality should still work
