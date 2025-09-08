// FIX: Switched to firebase compat libraries to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// IMPORTANT: Replace this with your own Firebase project's configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "APIKEY",
  authDomain: "AUTHDOMAIN",
  projectId: "PROJECTID",
  storageBucket: "STORAGEBUCKET",
  messagingSenderId: "MESSAGINGSENDERID",
  appId: "APPID",
  measurementId: "MEASUREMENTID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the database service and auth service
const auth = firebase.auth();
const db = firebase.firestore();

// FIX: Switched to compat version of firebase. onAuthStateChanged is no longer exported
// as a standalone function but is a method on the auth object.
export { auth, db };
