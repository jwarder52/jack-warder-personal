import express from "express";
import userRoutes from './api/routes/users.routes.js';
import recipeRoutes from './api/routes/recipes.routes.js';
import reviewRoutes from './api/routes/reviews.routes.js';
import bodyParser from "body-parser";
import mongoose from "mongoose";

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

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use(bodyParser.json());
  app.use('/users', userRoutes);
  app.use('/recipes', recipeRoutes);
  app.use('/recipes/:recipeId/reviews', reviewRoutes);
  app.use('/reviews', reviewRoutes);



  app.listen(port, () => console.log(`App started on port ${port}`));
  return app;
};
