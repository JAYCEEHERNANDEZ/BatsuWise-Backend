import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORT ROUTES
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ROUTES
app.use('/api/users', userRoutes);

// TEST ROUTE
app.get('/', (req, res) => {
  res.send('API is running...');
});

// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
