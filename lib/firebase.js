import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseErrors = {
  "auth/user-not-found": "Der Benutzer wurde nicht gefunden.",
  "auth/email-already-in-use": "Diese Email wir bereits verwendet.",
  "auth/weak-password": "Passwort zu schwach. Bitte mind. 6 Zeichen benutzen.",
  "auth/wrong-password": "Passwort oder Benutzer ist falsch.",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth();

export const login = (email, password) => {
  try {
    return signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw firebaseErrors[error.code] || error.code;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const signup = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password).then(
      async (cred) => {
        const uid = cred.user.uid;
        console.log("cred: ", cred);
        return fetch("api/users/setUserRole", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        }).then((res) => res.json().then((data) => data));
      }
    );
  } catch (error) {
    console.log("signup error: ", error);
    throw firebaseErrors[error.code] || error.code;
  }
};

export const uploadFromBlobAsync = async ({ blobUrl, name }) => {
  if (!blobUrl || !name) return null;

  try {
    const storageRef = ref(storage, name);
    const blob = await fetch(blobUrl).then((r) => r.blob());
    const snapshot = await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(snapshot.ref);
    return { url, filePath: name };
  } catch (error) {
    throw error;
  }
};
