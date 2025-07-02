import {redirect} from "react-router-dom";

// This is the same BACKEND_URL we use in recipe-loaders...it should be
// a config variable somewhere, but we'll just copy it for now
const BACKEND_URL = import.meta.env.DEV ? "http://localhost:3000/" : import.meta.env.BASE_URL;

// This function will convert form data in key-value pairs
// into the nested object structure our server expects
function extractRecipeDetails(formData) {
    const ingredients = [];
    let index = 0;

    const directions = [];
    for (let [key, value] of formData.entries()) {
        if (key.startsWith("direction")) {
            directions.push(value);
        }
    }

    while (formData.has(`ingredientName${index}`)) {
        const name = formData.get(`ingredientName${index}`);
        const amount = parseFloat(formData.get(`ingredientAmount${index}`));
        const unit = formData.get(`ingredientUnit${index}`);
        ingredients.push({ name, amount, unit });
        index++;
    }

    return {
        name: formData.get("name"),
        description: formData.get("description"),
        picture: formData.get("picture"),
        prepTime: Number(formData.get("prepTime")),
        cookTime: Number(formData.get("cookTime")),
        directions,
        ingredients,
        reviews: []
    };
}



// Create a new recipe and redirect to the recipe's page
async function create({ request }) {
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData()
    const newRecipe = extractRecipeDetails(formData);

    // Send data with fetch
    const response = await fetch(`${ BACKEND_URL }api/recipes/`,
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRecipe)
        });

    // Redirect to the recipe page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        const createdRecipe = await response.json();
        return redirect(`/recipes/${createdRecipe._id}`);
    } else {
        throw new Error("Failed to create recipe");
    }
}

// Update the recipe and redirect to the recipe's page
async function update({ params, request }) {
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData();
    const updatedRecipe = extractRecipeDetails(formData);

    const response = await fetch(`${ BACKEND_URL }api/recipes/${ params.id }`,
        {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRecipe)
        });

    // Redirect to the recipe page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        return redirect(`/recipes/${ params.id }`);
    } else {
        throw new Error("Failed to create recipe");
    }
}

async function deleteOne({ params, request }) {
    // Send a DELETE request to the server
    const response = await fetch(`${ BACKEND_URL }api/recipes/${ params.id }`, 
        {
        method: 'DELETE',
        });

    if (response.ok) {
        return redirect('/recipes');
    } else {
        throw new Error("Failed to delete recipe");
    }

}

export { create, update, deleteOne }