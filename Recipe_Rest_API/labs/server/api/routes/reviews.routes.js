import express from 'express';
import * as controller from '../reviews/reviews.controller.js';

let router = express.Router();

// GET methods
router.get('/', controller.index);
router.get('/:id', controller.show);

// POST method
//router.post('/', controller.create);
router.post('/:recipeId/reviews', controller.create);

// PUT method
router.post('/:id', controller.update);

// DELETE method
router.delete('/:id', controller.destroy);

export default router;
