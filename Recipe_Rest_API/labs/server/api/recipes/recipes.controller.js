'use strict';

import { Recipe } from './recipes.model.js';


// Find all Recipes
export function index(req, res) {
  Recipe.find()
    .exec()
    .then(recipes => {
      res.json({ recipes });
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

// Find details for one recipe
export function show(req, res) {
  Recipe.findById(req.params.id)
    .populate('reviews')
    .exec()
    .then(existingRecipe => {
      if (existingRecipe) {
        res.status(200).json(existingRecipe);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Create a new recipe
export function create(req, res) {
  Recipe.create(req.body)
    .then(createdRecipe => {
      res.status(201).json(createdRecipe);
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Update a recipe
export function update(req, res) {
  Recipe.findById(req.params.id)
    .populate('reviews')
    .exec()
    .then(existingRecipe => {
      if (existingRecipe) {
        existingRecipe.name = req.body.name;
        existingRecipe.description = req.body.description;
        existingRecipe.picture = req.body.picture;
        existingRecipe.prepTime = req.body.prepTime;
        existingRecipe.cookTime = req.body.cookTime;
        existingRecipe.directions = req.body.directions;
        existingRecipe.ingredients = req.body.ingredients;
        return existingRecipe.save();
      } else {
        return null;
      }
    })
    .then(updatedRecipe => {
      if (updatedRecipe) {
        res.status(200).json(updatedRecipe);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Remove a recipe
export function destroy(req, res) {
  Recipe.findById(req.params.id)
    .exec()
    .then(existingRecipe => {
      if (existingRecipe) {
        return existingRecipe.deleteOne();
      } else {
        return null;
      }
    })
    .then(deletedRecipe => {
      if (deletedRecipe) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}
