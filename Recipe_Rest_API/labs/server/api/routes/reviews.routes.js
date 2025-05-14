import express from 'express';
import * as controller from '../reviews/reviews.controller.js';

let router = express.Router();

// GET methods
router.get('/', controller.index);
router.get('/:id', controller.show);

// POST method
router.post('/', controller.create);

// PUT method
router.put('/:id', controller.update);

// DELETE method
router.delete('/:id', controller.destroy);

export default router;
