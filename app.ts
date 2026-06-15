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
import express, { Request, Response } from 'express';
import { pinoHttp, logger } from './utils/logging.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swaggerconfig.js'

const app = express();

// Always trust proxy because it will be deployed using Google Cloud Run
app.set('trust proxy', true);

// Use request-based logger for log correlation
app.use(pinoHttp);

// Decide whether to enable Swagger /api-docs endpoint
if (process.env.SWAGGER !== '' && !!process.env.SWAGGER) {
  console.log('Swagger /api-docs endpoint enabled.');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

// Example endpoint
app.get('/', async (req: Request, res: Response) => {
  // Use basic logger without HTTP request info
  logger.info({ logField: 'custom-entry', arbitraryField: 'custom-entry' }); // Example of structured logging
  // Use request-based logger with log correlation
  (req as any).log.info('Child logger with trace Id.'); // https://cloud.google.com/run/docs/logging#correlate-logs
  res.send('Hello World!');
});

export default app;
