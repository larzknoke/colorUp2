import * as firebaseAdmin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { getApps, getApp } from "firebase-admin/app";

const privateKey = process.env["PRIVATE_KEY"];
const clientEmail = process.env["CLIENT_EMAIL"];
const projectId = process.env["PROJECT_ID"];

if (!privateKey || !clientEmail || !projectId) {
  console.log(
    `Failed to load Firebase credentials. Follow the instructions in the README to set your Firebase credentials inside environment variables.`
  );
}

if (!getApps().length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      privateKey: privateKey,
      clientEmail,
      projectId,
    }),
    databaseURL: `https://${projectId}.firebaseio.com`,
    storageBucket: "colorup-4fe8b.appspot.com",
  });
} else {
  getApp();
}

const adminAuth = firebaseAdmin.auth();
const storage = firebaseAdmin.storage();
const bucket = storage.bucket();
const firestore = getFirestore();

export { adminAuth, firestore, storage, bucket };
