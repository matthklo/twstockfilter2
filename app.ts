// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import 'dotenv/config'
import { AppContext } from './utils/shared_types.js';
import express from 'express';
import { pinoHttp } from './utils/logging.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerconfig.js'
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

import { useTestApi } from './api/test.js'

let appCtx : AppContext = new AppContext();

const expressApp = express();
appCtx.expressApp = expressApp;

// Always trust proxy because it will be deployed using Google Cloud Run
expressApp.set('trust proxy', true);

// Use request-based logger for log correlation
expressApp.use(pinoHttp);

// Use body-parsing middlewares
expressApp.use(express.json()); // for parsing application/json
expressApp.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Decide whether to enable Swagger /api-docs endpoint
if (process.env.SWAGGER !== '' && !!process.env.SWAGGER) {
  console.log('Swagger /api-docs endpoint enabled.');
  expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

// Initialize Firebase SDK, either with a service account key (local dev, 
// when the GOOGLE_APPLICATION_CREDENTIALS environment variable is set) 
// or ADC (Cloud Run, https://docs.cloud.google.com/docs/authentication#adc)
appCtx.firebaseApp = initializeApp({credential: applicationDefault()});
appCtx.db = getFirestore();
appCtx.auth = getAuth();

// Register all APIs
useTestApi(appCtx);

export default appCtx;
