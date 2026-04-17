import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// IMPORT ROUTES
import userRoutes from './routes/userRoutes.js';

dotenv.config();

console.log('ENV CHECK:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'OK' : 'MISSING');
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'OK' : 'MISSING');

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
