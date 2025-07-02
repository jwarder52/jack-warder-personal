import { createBrowserRouter } from "react-router-dom";
import { Root } from "./root/root.jsx";

import { UserList } from "./users/user-list";
import { UserPage } from "./users/user-page";
import * as users from "./users/user-loaders.js";
import * as userActions from "./users/user-actions.js"
import UserCrupdate from "./users/user-crupdate.jsx";
import UserError from "./users/user-error.jsx";

import { RecipeList } from "./recipes/recipe-list.jsx";
import { RecipePage } from "./recipes/recipe-page.jsx";
import RecipeCrupdate from "./recipes/recipe-crupdate.jsx";
import * as recipeActions from "./recipes/recipe-actions.js";
import * as recipeLoaders from "./recipes/recipe-loaders.js";

import * as reviewActions from "./reviews/review-actions.js";
//import { ReviewPage } from "./reviews/review-page.jsx";
import * as reviewLoaders from "./reviews/review-loaders.js";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Root />
    },
    {
        path: "/users",
        element: <UserList />,
        loader: users.load_all
    },
    {
        path: "/users/:id",
        element: <UserPage />,
        loader: users.load_one
    },
    {
        path: "/users/create",
        element: <UserCrupdate />,
        errorElement: <UserError />,
        action: userActions.create
    },
    {
        path: "/users/update/:id",
        element: <UserCrupdate />,
        errorElement: <UserError />,
        loader: users.load_one,
        action: userActions.update
    },
    {
        path: "/recipes",
        element: <RecipeList />,
        loader: recipeLoaders.load_all,
    },
    {
        path: "/recipes/:id",
        element: <RecipePage />,
        loader: recipeLoaders.load_one,
    },
    {
        path: "/recipes/create",
        element: <RecipeCrupdate />,
        action: recipeActions.create,
    },
    {
        path: "/recipes/update/:id",
        element: <RecipeCrupdate />,
        loader: recipeLoaders.load_one,
        action: recipeActions.update,
    },
    {
        path: "/recipes/delete/:id",
        action: recipeActions.deleteOne
    },
    {
        path: "/recipes/:recipeId/reviews",      
        action: reviewActions.create 
    },
    {
        path: "/recipes/:recipeId/reviews/:id",
        action: reviewActions.deleteOne
    },
    {
        path: "/recipes/:recipeId/reviews/update/:id",
        action: reviewActions.update
    }         
]);

export default router;