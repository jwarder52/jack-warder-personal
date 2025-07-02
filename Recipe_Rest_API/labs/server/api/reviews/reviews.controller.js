'use strict';

import { Review } from './reviews.model.js';
import { Recipe } from '../recipes/recipes.model.js';


// Find all Reviews
export function index(req, res) {
  Review.find()
    .exec()
    .then(reviews => {
      res.json({ reviews });
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

// Find details for one review
export function show(req, res) {
  Review.findById(req.params.id)
    .exec()
    .then(existingReview => {
      if (existingReview) {
        res.status(200).json(existingReview);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}


export async function create(req, res) {
  console.log("REQ.PARAMS:", req.params); 
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Create the review
    const newReview = await Review.create(req.body);

    // Link review to recipe
    recipe.reviews.push(newReview._id);
    await recipe.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(400).json({ error: err.message });
  }
}

// Update a review
export function update(req, res) {
  Review.findById(req.params.id)
    .exec()
    .then(existingReview => {
      if (existingReview) {
        existingReview.description = req.body.description;
        existingReview.rating = req.body.rating;
        return existingReview.save();
      } else {
        return null;
      }
    })
    .then(updatedReview => {
      if (updatedReview) {
        res.status(200).json(updatedReview);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Remove a review
export function destroy(req, res) {
  Review.findById(req.params.id)
    .exec()
    .then(existingReview => {
      if (existingReview) {
        return existingReview.deleteOne();
      } else {
        return null;
      }
    })
    .then(deletedReview => {
      if (deletedReview) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}
