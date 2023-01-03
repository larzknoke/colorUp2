import { createContext, useContext, useEffect, useState } from "react";
import { auth, firebaseErrors } from "../lib/firebase";
import nookies from "nookies";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const AuthContext = createContext({});
const provider = new GoogleAuthProvider();

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

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
    <AuthContext.Provider value={{ user, providerLogin, authLoading }}>
      {authLoading ? null : children}
    </AuthContext.Provider>
  );
};
