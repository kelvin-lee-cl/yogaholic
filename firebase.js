// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCMEzLbgYHAf4_eBMvxPsg3_Xw2HvrAyO0",
    authDomain: "yogaholic-d96d8.firebaseapp.com",
    projectId: "yogaholic-d96d8",
    storageBucket: "yogaholic-d96d8.firebasestorage.app",
    messagingSenderId: "796550411432",
    appId: "1:796550411432:web:bbc39a58a48d8febadfe9d",
    measurementId: "G-4MB0NYYC13"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();