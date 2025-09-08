// FIX: Switched to firebase compat libraries to resolve module export errors.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// IMPORTANT: Replace this with your own Firebase project's configuration.
// You can find this in your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyAItzEsdqp4twqjLeUpouXj_7lzWeo5Srw",
  authDomain: "expense-tracking-app-1d503.firebaseapp.com",
  projectId: "expense-tracking-app-1d503",
  storageBucket: "expense-tracking-app-1d503.firebasestorage.app",
  messagingSenderId: "254572784778",
  appId: "1:254572784778:web:5ff06ff06c4ba46bfcd173",
  measurementId: "G-4NW7GQ2R4K"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Get a reference to the database service and auth service
const auth = firebase.auth();
const db = firebase.firestore();

// FIX: Switched to compat version of firebase. onAuthStateChanged is no longer exported
// as a standalone function but is a method on the auth object.
export { auth, db };