import { createContext, useContext, useEffect, useState } from "react";
import { auth, firebaseErrors } from "../lib/firebase";
import nookies from "nookies";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const AuthContext = createContext({});
const provider = new GoogleAuthProvider();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        authUser.getIdToken(true).then(async (token) => {
          const userTokenResult = await authUser.getIdTokenResult(true);
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            admin: userTokenResult.claims.admin ? true : false,
          });
          nookies.set(undefined, "token", token, { path: "/" });
        });
      } else {
        setUser(null);
        nookies.set(undefined, "token", "", { path: "/" });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password).then(
        async (cred) => {
          const uid = cred.user.uid;
          console.log("cred: ", cred);
          return fetch("api/setUserRole", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid }),
          }).then((res) => res.json().then((data) => data));
        }
      );
    } catch (error) {
      console.log("signup error: ", error.code);
      throw firebaseErrors[error.code] || error.code;
    }
  };

  const login = (email, password) => {
    try {
      return signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw firebaseErrors[error.code] || error.code;
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  const providerLogin = async () => {
    await signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(error.message);
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, providerLogin }}
    >
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
