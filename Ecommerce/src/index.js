import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();
console.log('Cloudinary URL:', process.env.CLOUDINARY_URL);

import { connectDB } from './config/connectDB.js';
const PORT = process.env.PORT || 8000;
await connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is listening to port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
