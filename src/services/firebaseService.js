// src/services/firebaseService.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

// 🔑 Configuration Firebase depuis .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialise Firebase
export const app = initializeApp(firebaseConfig); // ⚠️ exporté pour Auth
export const db = getFirestore(app);

// --- Firestore CRUD (users) ---
export async function getAllUsersFromDB() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate()
        : data.updatedAt,
    };
  });
}

export async function addUserToDB(user) {
  const ref = collection(db, "users");
  const docRef = await addDoc(ref, {
    ...user,
    createdAt: new Date(),
    updatedAt: null,
  });
  return docRef.id;
}

export async function deleteUserFromDB(userId) {
  const userRef = doc(db, "users", String(userId));
  await deleteDoc(userRef);
}

export async function updateUserInDB(userId, updatedData) {
  const userRef = doc(db, "users", String(userId));
  await updateDoc(userRef, { ...updatedData, updatedAt: new Date() });
}

export async function getUserById(userId) {
  const userRef = doc(db, "users", String(userId));
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate()
      : data.createdAt,
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : data.updatedAt,
  };
}

export function listenToUsers(callback) {
  const usersRef = collection(db, "users");
  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.createdAt,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate()
          : data.updatedAt,
      };
    });
    callback(users);
  });
}
