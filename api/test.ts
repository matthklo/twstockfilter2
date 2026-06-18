import { type AppContext } from '../utils/shared_types.js';
import { Request, Response } from 'express';
import { logger } from '../utils/logging.js';

export const useTestApi = (appCtx: AppContext) => {
  const app = appCtx.expressApp!;
  const db = appCtx.db!;
  const auth = appCtx.auth!;

  /**
   * @swagger
   * tags:
   *   name: Test
   *   description: APIs for testing purposes
   */

  /**
   * @swagger
   * /test/reflect:
   *   post:
   *     tags: [Test]
   *     description: Present the content of web request as a reflection
   *     responses:
   *       200:
   *         description: Ok
   *     
   */
  app.post('/test/reflect', (req: Request, res: Response) => {
    // Use basic logger without HTTP request info
    logger.info({ logField: 'custom-entry', arbitraryField: 'custom-entry' }); // Example of structured logging
    // Use request-based logger with log correlation
    (req as any).log.info('Child logger with trace Id.'); // https://cloud.google.com/run/docs/logging#correlate-logs
    res.json({
      baseUrl: req.baseUrl,
      body: req.body,
      cookies: req.cookies,
      host: req.host,
      hostname: req.hostname,
      ip: req.ip,
      method: req.method,
      originalUrl: req.originalUrl,
      params: req.params,
      path: req.path,
      protocol: req.protocol,
      query: req.query
    });
  });

  /**
   * @swagger
   * /test/verifyIdToken:
   *   post:
   *     tags: [Test]
   *     description: Verify provided ID token with Firebase Admin
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: Valid ID token
   *       400:
   *         description: Bad ID token
   */
  app.post('/test/verifyIdToken', async (req: Request, res: Response) => {
    const { token } = req.body as { token: string };
    if (!token) {
      res.status(400).send('Empty token was provided.');
    } else {
      try {
        const decodedToken = await auth.verifyIdToken(token);
        res.json(decodedToken);
      } catch (ex) {
        res.status(400).send(`verifyIdToken() failed. ${ex}`);
      }
    }
  });

  /**
   * @swagger
   * /test/fetchDoc:
   *   post:
   *     tags: [Test]
   *     description: Fetch a document record from Firestore
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               collection:
   *                 type: string
   *               refname:
   *                 type: string
   *     responses:
   *       200:
   *         description: Ok
   *       204:
   *         description: No content 
   *       400:
   *         description: Invalid parameter(s)
   */
  app.post('/test/fetchDoc', async (req: Request, res: Response) => {
    const { collection, refname } = req.body as { collection: string, refname: string };
    if (!collection || !refname) {
      res.status(400).send('Either collection or refname is invalid');
      return;
    }

    const docRef = db.collection(collection).doc(refname);
    const doc = await docRef.get();
    if (!doc.exists) {
      res.status(204).send('Document does not exist');
    } else {
      res.json(doc.data());
    }
  });

  /**
   * @swagger
   * /test/updateDoc:
   *   post:
   *     tags: [Test]
   *     description: Insert (or update, if exists) a document
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               collection:
   *                 type: string
   *               refname:
   *                 type: string
   *     responses:
   *       200:
   *         description: Ok
   *       400:
   *         description: Invalid parameter(s)
   */
  app.post('/test/updateDoc', async (req: Request, res: Response) => {
    const { collection, refname, ...data2add } = req.body as { collection: string, refname: string };
    if (!collection || !refname) {
      res.status(400).send('Either collection or refname is invalid');
      return;
    }

    const docRef = db.collection(collection).doc(refname);
    await docRef.set(data2add, { merge: true });
    res.json(data2add);
  });
}