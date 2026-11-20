import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

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
  "auth/invalid-credential": "Das aktuelle Passwort ist falsch.",
  "auth/requires-recent-login":
    "Bitte melden Sie sich erneut an und versuchen Sie es noch einmal.",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
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

export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    const error = new Error("auth/user-not-found");
    error.code = "auth/user-not-found";
    throw error;
  }

  const passwordProvider = user.providerData.find(
    (provider) => provider.providerId === "password",
  );
  if (!passwordProvider) {
    const error = new Error("auth/operation-not-supported");
    error.code = "auth/operation-not-supported";
    throw error;
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
