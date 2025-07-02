Overview:
Recipe API Design Frontend and Backend
Using MongoDB, Express, React, Node
Front Page and User implementations still in the works

Schemas:

User Schema:
    The required fields in my user schema are: the users name (SubDocument), username (String), and email address(String).
    I implemented the users name schema as a subdocument where the first and last name (String) are required, but the middle name (String) is optional.
    The users email address and username have to be unique in order to avoid duplicates between accounts
Recipe Schema:
    The required fields in my recipe schema are: the recipe's name (String), description (String), picture (String), prepTime (Number), cookTime (Number), directions (Array of Strings), ingredients (SubDocument), and reviews (Array of ObjectIds).
    I implemented the ingredient schema as a subdocument that tracks the name of the ingredient (String), amount (Number), and unit (String), which are all required
    The reviews field is an array of ObjectIDs that references my review schema
Review Schema:
    The required fields in my review schema are: the description (String), rating (Number), dateCreated (Date), and user (ObjectId)
    I restricted my rating field to be a minimum of 1 star and a maximum of 5 to keep ratings on a uniform scale
    The date created is automatically generated using Date.now, so no user error
    The user field is an ObjectID that references my User schema

Rest API Routes/Methods:

    Users:
        POST: localhost:3000/users (Creates a User), JSON: {name, username, email}, Status Codes: 201,400
        GET: localhost:3000/users (Get all Users), JSON: N/A, Status Codes: 200, 500
        GET: localhost:3000/users/:id (Get User by ID), JSON: N/A, Status Codes: 200, 404, 500
        PUT: localhost:3000/users/:id (Update a User by ID), JSON: {name, username, email}, Status Codes: 200, 400, 404
        DELETE: localhost:3000/users/:id (Delete a User by ID), JSON: N/A, Status Codes: 204, 400, 404

    Recipes:
        POST: localhost:3000/recipes (Creates a Recipe), JSON: {name, description, picture, prepTime, cookTime, directions, ingredients, reviews}, Status Codes: 201, 400
        GET: localhost:3000/recipes (Get all Recipes), JSON: N/A, Status Codes: 200, 500
        GET: localhost:3000/recipes/:id (Get Recipe by ID), JSON: N/A, Status Codes: 200, 404, 400
        PUT: localhost:3000/recipes/:id (Update a Recipe by ID), JSON: {name, description, picture, prepTime, cookTime, directions, ingredients}, Status Codes: 200, 400, 404
        DELETE: localhost:3000/recipes/:id (Delete a Recipe by ID), JSON: N/A, Status Codes: 204, 400, 404

    Reviews:
        POST: localhost:3000/reviews or localhost:3000/recipes/:recipeId/reviews (Creates a Review), JSON: {description, rating, user}, Status Codes: 201, 400
        GET: localhost:3000/reviews (Get all Reviews), JSON: N/A, Status Codes: 200, 500
        GET: localhost:3000/reviews/:id (Get Review by ID), JSON: N/A, Status Codes: 200, 404, 400
        PUT: localhost:3000/reviews/:id (Update a Review by ID), JSON: {description, rating}, Status Codes: 200, 400, 404
        DELETE: localhost:3000/reviews/:id (Delete a Review by ID), JSON: N/A, Status Codes: 204, 400, 404 

