import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// export const firebaseErrors = {
//   "auth/user-not-found": "Der Benutzer wurde nicht gefunden.",
//   "auth/email-already-in-use": "Diese Email wir bereits verwendet.",
//   "auth/weak-password": "Passwort zu schwach. Bitte mind. 6 Zeichen benutzen.",
// };

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth();

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
