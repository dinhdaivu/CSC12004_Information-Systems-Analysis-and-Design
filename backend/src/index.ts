import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from '@routes/auth.routes';
import branchRoutes from '@routes/branch.routes';
import rentalRequestRoutes from './routes/rental-request.routes';
import myBookingRoutes from './routes/my-booking.routes';
import { ApiResponseBuilder } from '@models/api.model';
import { AppError } from '@utils/errors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/my-bookings', myBookingRoutes);
// Error handling middleware
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  void req;
  void next;

  if (err instanceof Error) {
    console.error(err.stack ?? err.message);
  } else {
    console.error(err);
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json(ApiResponseBuilder.error(err.code, err.message, err.details));
    return;
  }

  res.status(500).json(ApiResponseBuilder.error('INTERNAL_SERVER_ERROR', 'Internal Server Error'));
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  void req;
  res.status(404).json(ApiResponseBuilder.error('NOT_FOUND', 'Route not found'));
});

// Start server outside tests so Supertest can import the app without hanging Jest.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.warn(`Server is running on http://localhost:${PORT}`);
  });
}

export default app;
