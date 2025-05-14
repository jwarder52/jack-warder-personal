import mongoose from 'mongoose';
let Schema = mongoose.Schema;

//This schema represents the recipe
//Required attributes: 
//Name of recipe
//Description of recipe
//Picture URL for recipe
//Prep time (minutes)
//Cooking time (minutes)
//Array of directions (i.e. step by step directions)
//Array of ingredients
//Must be implemented as a subdocument
//Array of user reviews
//Must be implemented as an Array of ObjectIds referencing reviews collection

let ingredientSchema = Schema ({
    name: {type: String, required: true},
    amount: {type: Number, required: true},
    unit: {type: String, required: true},
})

let recipeSchema = Schema ({
    name: {type: String, required: true},
    description: {type: String, required: true},
    picture: {type: String, required: true},
    prepTime: {type: Number, required: true},
    cookTime: {type: Number, required: true},
    directions: {type: [String], required: true},
    ingredients: {type: [ingredientSchema], required: true},
    reviews: {type: [Schema.Types.ObjectId], ref: 'Review', required: true}

})

const Recipe = mongoose.model('Recipe', recipeSchema);
export { Recipe };