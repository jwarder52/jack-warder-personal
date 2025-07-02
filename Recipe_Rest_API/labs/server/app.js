import express from "express";
import userRoutes from './api/routes/users.routes.js';
import recipeRoutes from './api/routes/recipes.routes.js';
import reviewRoutes from './api/routes/reviews.routes.js';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (port, dbUrl) => {

  mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDB connection successful, MongoDB available ');
    })
    .catch(err => {
        console.error(`MongoDB connection error: ${err}`);
        process.exit(-1);
    });
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.use(cors());
  app.use(bodyParser.json());
  // app.use('/users', userRoutes);
  // app.use('/recipes', recipeRoutes);
  // app.use('/recipes/:recipeId/reviews', reviewRoutes);
  // app.use('/reviews', reviewRoutes);

  app.use('/api/users', userRoutes);
  app.use('/api/recipes', recipeRoutes);
  app.use('/api/recipes', reviewRoutes);
  app.use('/api/recipes/:recipeId/reviews', reviewRoutes);
  app.use('/api/reviews', reviewRoutes);

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
  });



  app.listen(port, () => console.log(`App started on port ${port}`));
  return app;
};
