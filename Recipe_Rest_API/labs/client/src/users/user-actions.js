import {redirect} from "react-router-dom";

// This is the same BACKEND_URL we use in user-loaders...it should be
// a config variable somewhere, but we'll just copy it for now
const BACKEND_URL = import.meta.env.DEV ? "http://localhost:3000/" : import.meta.env.BASE_URL;

// This function will convert form data in key-value pairs
// into the nested object structure our server expects
function extractUserDetails(formData) {
    return {
        name: {
            firstName: formData.get('firstName'),
            middleName: formData.get('middleName'),
            lastName: formData.get('lastName')
        },
        address: {
            addressLine1: formData.get('addressLine1'),
            addressLine2: formData.get('addressLine2'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        age: formData.get('age')
    };
}

// Create a new user and redirect to the user's page
async function create({ request }) {
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData()
    const newUser = extractUserDetails(formData);

    // Send data with fetch
    const response = await fetch(`${ BACKEND_URL }api/users/`,
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

    // Redirect to the user page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        const createdUser = await response.json();
        return redirect(`/users/${ createdUser._id }`);
    } else {
        throw new Error("Failed to create user");
    }
}

// Update the user and redirect to the user's page
async function update({ params, request }) {
    // Await gets the result of the Promise returned
    // by request.formData
    const formData = await request.formData();
    const updatedUser = extractUserDetails(formData);

    const response = await fetch(`${ BACKEND_URL }api/users/${ params.id }`,
        {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser)
        });

    // Redirect to the user page if everything is alright, otherwise
    // throw an error
    if (response.ok) {
        return redirect(`/users/${ params.id }`);
    } else {
        throw new Error("Failed to create user");
    }
}

export { create, update }