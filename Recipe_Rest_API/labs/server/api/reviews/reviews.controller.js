'use strict';

import { Review } from './reviews.model.js';


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

// Create a new review
export function create(req, res) {
  Review.create(req.body)
    .then(createdReview => {
      res.status(201).json(createdReview);
    })
    .catch(err => {
      res.status(400).send(err);
    });
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
