import { type Express } from 'express';
import { type App } from 'firebase-admin';
import { type Firestore } from "firebase-admin/firestore";
import { type Auth } from 'firebase-admin/auth';

export class AppContext {
  expressApp : Express | undefined;
  firebaseApp : App | undefined;
  db : Firestore | undefined;
  auth : Auth | undefined;

  constructor() {
    return {
      expressApp: undefined,
      firebaseApp: undefined,
      db: undefined,
      auth: undefined
    }
  }
};
