import { Link } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { Form } from 'react-router-dom';
import styles from './recipe-list.module.scss';
import { FaPlus, FaArrowLeft, FaRegTrashCan } from "react-icons/fa6";
import { LuPencilLine, LuView } from "react-icons/lu";

export function RecipeList() {
    const { recipes } = useLoaderData();

    return (
        <div>
            <div className={styles.header}>
                <Link className={styles.link} to="/"><FaArrowLeft />Return to Home</Link>
                <Link className={styles.link} to="/recipes/create"><FaPlus />Create New Recipe</Link>
            </div>
            <h2>Recipes List</h2>
            <div className={styles.background}>
                <div className={styles.grid}>
                    {recipes.map(recipe => (
                        <div className={styles.card} key={recipe._id}>
                            <img className={styles.image} src={recipe.picture} alt={recipe.name} />
                            <div className={styles.details}>
                                <hr className={styles.hr}></hr>
                                <h3 className={styles.name}>{recipe.name}</h3>
                                <hr className={styles.hr}></hr>
                                <p className={styles.description}>{recipe.description}</p>
                                <hr className={styles.hr}></hr>
                                <p className={styles.time}>Prep: {recipe.prepTime} min</p>
                                <hr className={styles.hr}></hr>
                                <p className={styles.time}>Cook: {recipe.cookTime} min</p>
                                <hr className={styles.hr}></hr>
                                <Link className={styles.cardLink} to={`/recipes/${recipe._id}`}>View < LuView /> </Link>
                                <Link className={styles.cardLink} to={`/recipes/update/${recipe._id}`}>Update <LuPencilLine /></Link>
                                {/* <Link className={styles.cardLink} to={`/recipes/delete/${recipe._id}`}>Delete</Link> */}
                                <Form method="post" action={`/recipes/delete/${recipe._id}`} className={styles.deleteForm} >
                                    <button type="submit" className={styles.deleteLink}>
                                        Delete < FaRegTrashCan />
                                    </button>
                                </Form>

                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
