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
import './utils/firebase.js'
import express from 'express';
import cors from 'cors';
import { pinoHttp } from './utils/logging.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerconfig.js'

import idRouter from './api/id.js';
import testRouter from './api/test.js';

const app = express();

// Always trust proxy because it will be deployed using Google Cloud Run
app.set('trust proxy', true);

// Use request-based logger for log correlation
app.use(pinoHttp);

// CORS: Adds headers: Access-Control-Allow-Origin: *
app.use(cors());

// Use body-parsing middlewares
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Decide whether to enable Swagger /api-docs endpoint
if (process.env.SWAGGER !== '' && !!process.env.SWAGGER) {
  console.log('Swagger /api-docs endpoint enabled.');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

app.use('/id', idRouter);
app.use('/test', testRouter);

export default app;
