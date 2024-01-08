import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
const firebaseConfig = {
    apiKey: "AIzaSyAlmh3KKT5MU3XIHq41W5XR1w6m_tSJyrI",
    authDomain: "webapp-47698.firebaseapp.com",
    projectId: "webapp-47698",
    storageBucket: "webapp-47698.appspot.com",
    messagingSenderId: "388370554645",
    appId: "1:388370554645:web:a8bb172d3d0d6b0050131c",
    measurementId: "G-716P4TNKB3",
};
firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();