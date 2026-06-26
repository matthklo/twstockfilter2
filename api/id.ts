import { Request, Response, Router } from 'express';
import { logger } from '../utils/logging.js';
import { firebaseSession } from '../utils/firebase.js'
import { getOrCreateUser } from '../svc/identity.js';
import { type DecodedIdToken } from 'firebase-admin/auth';

const router = Router();
const auth = firebaseSession.auth;

/**
 * @swagger
 * tags:
 *   name: Identity
 *   description: Identity-related APIs
 */

/**
 * @swagger
 * /id/verifyToken:
 *   post:
 *     tags: [Identity]
 *     description: Create or verify users' identity base on Firebase auth-token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Valid ID token
 *         scheme:
 *           type: object
 *           properties:
 *             uid:
 *               type: string
 *             email:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *             created:
 *               type: boolean
 *       400:
 *         description: Bad ID token
 */
router.post('/verifyToken', async (req: Request, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) {
    res.status(400).send('Empty token');
    return;
  }

  let decodedToken : DecodedIdToken | undefined = undefined;
  try {
    decodedToken = await auth.verifyIdToken(token);
    console.log(JSON.stringify(decodedToken)); // to be removed
  } catch (ex) {
    res.status(400).send(`Invalid token: ${ex}`);
    return;
  }

  if (decodedToken === undefined || !decodedToken.uid) {
    res.status(400).send('Corrupted decoded result');
    return;
  }

  try {
    const result = await getOrCreateUser(decodedToken.uid, decodedToken.email);
    res.json(result);
  } catch (e) {
    const err = e as Error;
    res.status(400).send(`Error: ${err.message}`);
  }
});

export default router;