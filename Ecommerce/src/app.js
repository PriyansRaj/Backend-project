import express from 'express';
import { errorMiddleWare } from './middlewares/error.middleware.js';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js';
import staffRoutes from './routes/manager.route.js';
const app = express();
app.use(
  express.json({
    limit: '16kb',
    strict: true,
  })
);
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    limit: '16kb',
  })
);
app.use(helmet());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staffs', staffRoutes);
app.use(errorMiddleWare);
export default app;
