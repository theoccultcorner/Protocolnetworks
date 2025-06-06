import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail // ✅ Added
} from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRP1u6cI84nc5xatI3SSZ96xD1V0l7Jrs",
  authDomain: "drew-64b8e.firebaseapp.com",
  databaseURL: "https://drew-64b8e-default-rtdb.firebaseio.com",
  projectId: "drew-64b8e",
  storageBucket: "drew-64b8e.appspot.com",
  messagingSenderId: "643474576074",
  appId: "1:643474576074:web:db32bfcda1f0fcf1b95a33",
  measurementId: "G-VCH880PFGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Google sign-in setup
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// Save user profile
export const saveUserProfile = async (uid, profileData) => {
  try {
    await setDoc(doc(db, "users", uid), profileData, { merge: true });
    console.log("✅ User profile saved for UID:", uid);
  } catch (error) {
    console.error("❌ Error saving user profile:", error);
  }
};

// Get user profile
export const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error("❌ Error getting user profile:", error);
    return null;
  }
};

// Add appointment
export const addAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, "appointments"), appointmentData);
    console.log("✅ Appointment added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error adding appointment:", error);
    throw error;
  }
};

// Get all appointments
export const getAppointments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "appointments"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error getting appointments:", error);
    return [];
  }
};

// Export all
export {
  db,
  auth,
  signOut,
  signInWithGoogle,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail, // ✅ Exported here
  collection,
  addDoc,
  getDocs,
  setDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc
};
