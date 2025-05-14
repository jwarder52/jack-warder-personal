'use strict';

import { User } from './users.model.js';

// Find all Users
export function index(req, res) {
  User.find()
    .exec()
    .then(users => {
      res.json({ users });
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

// Find details for one user
export function show(req, res) {
  User.findById(req.params.id)
    .exec()
    .then(existingUser => {
      if (existingUser) {
        res.status(200).json(existingUser);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Create a new user
export function create(req, res) {
  User.create(req.body)
    .then(createdUser => {
      res.status(201).json(createdUser);
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Update a user
export function update(req, res) {
  User.findById(req.params.id)
    .exec()
    .then(existingUser => {
      if (existingUser) {
        existingUser.name.firstName = req.body.name.firstName;
        existingUser.name.middleName = req.body.name.middleName;
        existingUser.name.lastName = req.body.name.lastName;
        existingUser.userName = req.body.userName;
        existingUser.email = req.body.email;

        return existingUser.save();
      } else {
        return null;
      }
    })
    .then(updatedUser => {
      if (updatedUser) {
        res.status(200).json(updatedUser);
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// Remove a user
export function destroy(req, res) {
  User.findById(req.params.id)
    .exec()
    .then(existingUser => {
      if (existingUser) {
        return existingUser.deleteOne();
      } else {
        return null;
      }
    })
    .then(deletedUser => {
      if (deletedUser) {
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Not Found' });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}
