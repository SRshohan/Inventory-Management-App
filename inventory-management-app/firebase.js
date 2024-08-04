import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDk-SDib_tL-IaU85nPJ14_wzAKYO2nV24",
    authDomain: "inventory-management-app-5d3bd.firebaseapp.com",
    projectId: "inventory-management-app-5d3bd",
    storageBucket: "inventory-management-app-5d3bd.appspot.com",
    messagingSenderId: "1060682005915",
    appId: "1:1060682005915:web:94e2c72c499ee71cc8353e",
    measurementId: "G-GKF6K45230"
  };

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };