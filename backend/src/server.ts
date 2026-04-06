// backend/src/server.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
// Assume you initialize Prisma Client here:
// import { PrismaClient } from '@prisma/client'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Basic Route Test
app.get('/', (req: Request, res: Response) => {
  res.status(200).send({ message: 'Welcome to the Express Backend API!' });
});

// Example endpoint that uses Prisma (requires database connection setup)
app.post('/api/users', async (req: Request, res: Response) => {
    /* 
    try {
        const newUser = await prisma.user.create({
            data: { email: req.body.email, password: 'hashed_password' }
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Failed to create user.');
    }
    */
   res.status(200).send({ message: 'User creation endpoint active.' });
});


// Start Server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

// Global error handling middleware (optional but recommended)
app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error('Global Error:', err);
    res.status(500).send({ message: 'Something went wrong on the server.' });
});

