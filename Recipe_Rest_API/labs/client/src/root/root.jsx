import { Link } from 'react-router-dom';

export function Root() {
    return (
        <div>
        <h1>Recipe API</h1>
        <Link to={ '/recipes' } >Recipes</Link>
        </div>
    );
}