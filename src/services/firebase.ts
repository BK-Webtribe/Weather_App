// Import Firebase services
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyC08p-fwqnTRdT7dMdqM56LyG13kA7GBDM",
    authDomain: "wt-weather-app.firebaseapp.com",
    projectId: "wt-weather-app",
    storageBucket: "wt-weather-app.firebasestorage.app",
    messagingSenderId: "376656073699",
    appId: "1:376656073699:web:976e448f6896b507e106d6",
    measurementId: "G-E158PGC48D"
  };

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Export the necessary Firebase services
export { firebaseApp, auth, db };
