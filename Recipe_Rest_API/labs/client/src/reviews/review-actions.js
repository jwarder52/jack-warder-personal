import {redirect} from "react-router-dom";

// This is the same BACKEND_URL we use in review-loaders...it should be
// a config variable somewhere, but we'll just copy it for now
const BACKEND_URL = import.meta.env.DEV ? "http://localhost:3000/" : import.meta.env.BASE_URL;

// This function will convert form data in key-value pairs
// into the nested object structure our server expects
function extractReviewDetails(formData) {
    return {
        description: formData.get('description'),
        rating: parseInt(formData.get('rating')),
        dateCreated: new Date().toISOString(),
        user: formData.get('user'),
    };
}


// Create a new review and redirect to the review's page
async function create({ params, request }) {
    console.log("Incoming review data:", request.body);
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData()
    const newReview = extractReviewDetails(formData);
    console.log("Extracted review data:", newReview);
    const recipeId = params.recipeId;

    // Send data with fetch
    const response = await fetch(`${BACKEND_URL}api/recipes/${recipeId}/reviews`,
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newReview)
        });

    // Redirect to the review page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        const createdReview = await response.json();
        return redirect(`/recipes/${recipeId}`);
    } else {
        throw new Error("Failed to create review");
    }
}

// Update the review and redirect to the review's page
async function update({ params, request }) {
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData();
    const updatedReview = extractReviewDetails(formData);
    const recipeId = params.recipeId;

    const response = await fetch(`${BACKEND_URL}api/reviews/${ params.id }`,
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedReview)
        });

    // Redirect to the review page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        return redirect(`/recipes/${recipeId}`);
    } else {
        throw new Error("Failed to create review");
    }
}

async function deleteOne({ params }) {
    const recipeId = params.recipeId;
    const reviewId = params.id;

    const response = await fetch(`${BACKEND_URL}api/reviews/${reviewId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        return redirect(`/recipes/${recipeId}`);
    } else {
        throw new Error("Failed to delete review");
    }
}


export { create, update, deleteOne }