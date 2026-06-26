import { logger } from '../utils/logging.js';
import { firebaseSession } from '../utils/firebase.js'

const db = firebaseSession.db;

type GetOrCreateUserResult = {
  uid: string,
  email: string,
  roles: string[],
  created: boolean
}

/**
 * Get the user info for uid from Firestore database. Create an user record in database for the uid if there is no data for it. 
 * @param {String} uid must NOT be empty 
 * @param {String} email only used when creating an user record. ignored otherwise.
 * @returns {Promise<GetOrCreateUserResult>} user info
 */
export const getOrCreateUser = async (uid: string, email: string | undefined) : Promise<GetOrCreateUserResult> => {
  if (!uid) {
    throw new Error('falsy uid');
  }

  const docRef = db.collection('users').doc(uid);
  const ret = await db.runTransaction(async (transaction) => {
    const record = await transaction.get(docRef);

    if (record.exists) {
      const data = record.data();
      return { uid: data?.uid, email: data?.email, roles: data?.roles, created: false } as GetOrCreateUserResult;
    }

    const defaultData = { uid: uid, email: email, roles: [] }
    transaction.set(docRef, defaultData);
    return { created: true, ...defaultData } as GetOrCreateUserResult;
  });
  return ret;
}