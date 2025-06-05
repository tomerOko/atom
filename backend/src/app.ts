import cors from 'cors';
import express from 'express';
import { exampleFlowRouter } from './flows/example-flow/routes';
import { errorHandler } from './middleware/error-handler';
import { logHttpRequestsExpress } from './packages/logger';

export const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'authorization'],
  })
);
app.use(express.json());
app.use(logHttpRequestsExpress);
app.get('/health', (req, res) => {
  res.send('OK');
});

app.use('/api/example-flow', exampleFlowRouter);

app.use(errorHandler);
