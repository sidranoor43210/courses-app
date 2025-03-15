// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import getAnalytics only if you're using analytics
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDukIgM3TFzb0mwvPGOhfLdYhyHigwqSLg",
    authDomain: "coursesapp-c0061.firebaseapp.com",
    projectId: "coursesapp-c0061",
    storageBucket: "coursesapp-c0061.firebasestorage.app",
    messagingSenderId: "249119404109",
    appId: "1:249119404109:web:a7c43365371277dc416c04",
    measurementId: "G-JHWPYJT8R3"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize Analytics if you're using it
// const analytics = getAnalytics(app);

export { auth };
export default app;