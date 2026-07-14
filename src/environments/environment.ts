export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  fileUrl: 'http://localhost:5000',

  // Firebase Cloud Messaging (free push). Fill these from the Firebase console:
  //   Project settings -> General -> Your apps -> Web app -> SDK setup.
  // The VAPID key comes from: Project settings -> Cloud Messaging ->
  //   Web configuration -> Web Push certificates -> Key pair.
  // NOTE: The same values must be copied into src/firebase-messaging-sw.js.
  firebase: {
    apiKey: 'AIzaSyAH66YLCE23W4YGNDEql6XkxDOXoarx364',
    authDomain: 'ajs-woman-pg.firebaseapp.com',
    projectId: 'ajs-woman-pg',
    storageBucket: 'ajs-woman-pg.firebasestorage.app',
    messagingSenderId: '794124150393',
    appId: '1:794124150393:web:22ae2e4f9af54585a496a8',
    measurementId: 'G-4MB9D62S56',
  },
  firebaseVapidKey: 'BBBoT6UwX4hscoPGzByiq3K5-eVYsKTRESg8aaAplAdOyptN09M44J17W84_W-2LUYafcWT1buVX9BEFA5fLHRo',
};
