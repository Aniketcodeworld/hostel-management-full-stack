// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbRttpO6EaTtLw6WVbm119PzeuLRue_nw",
  authDomain: "hostel-management-system-e6007.firebaseapp.com",
  projectId: "hostel-management-system-e6007",
  storageBucket: "hostel-management-system-e6007.firebasestorage.app",
  messagingSenderId: "167372158698",
  appId: "1:167372158698:web:9284a3b21c9cc105928993",
  measurementId: "G-9GEFMD99F7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);