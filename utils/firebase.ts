import { initializeApp, applicationDefault, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from 'firebase-admin/auth';

type FirebaseSessionContext = {
  app : App,
  db : Firestore,
  auth : Auth
};

// Initialize Firebase SDK, either with a service account key (local dev, 
// when the GOOGLE_APPLICATION_CREDENTIALS environment variable is set) 
// or ADC (Cloud Run, https://docs.cloud.google.com/docs/authentication#adc)
const firebaseApp = initializeApp({credential: applicationDefault()});
const firestore = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);

export const firebaseSession : FirebaseSessionContext = {
  app: firebaseApp,
  db : firestore,
  auth: firebaseAuth
};