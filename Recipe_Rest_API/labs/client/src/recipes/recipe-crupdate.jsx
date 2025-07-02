import { useLoaderData, Form } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import styles from './recipe-crupdate.module.scss';
import { FaRegTrashCan } from "react-icons/fa6";

const UNIT_OPTIONS = ["tsp", "tbsp", "cup", "g", "kg", "oz", "lb", "ml", "l", "N/A"];

export default function RecipeCrupdate() {
    const recipe = useLoaderData();

    const [ingredients, setIngredients] = useState(
        recipe?.ingredients || [{ name: "", amount: "", unit: "tsp" }]
    );

    const [directions, setDirections] = useState(
        recipe?.directions || [""]
    );

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: "", amount: "", unit: "tsp" }]);
    };

    return (
        <div className={styles.background}>
            <Form
                className={styles.container}
                action={recipe ? `/recipes/update/${recipe._id}` : '/recipes/create'}
                method={recipe ? 'put' : 'post'}
            >
                <label className={styles.label}>
                    Name:
                    <input className={styles.input} name="name" defaultValue={recipe?.name} required />
                </label>

                <label className={styles.label}>
                    Description:
                    <input className={styles.input} name="description" defaultValue={recipe?.description} required />
                </label>

                <label className={styles.label}>
                    Picture URL:
                    <input className={styles.input} name="picture" defaultValue={recipe?.picture} required />
                </label>

                <label className={styles.label}>
                    Prep Time:
                    <input className={styles.input} name="prepTime" type="number" defaultValue={recipe?.prepTime} required />
                </label>

                <label className={styles.label}>
                    Cook Time:
                    <input className={styles.input} name="cookTime" type="number" defaultValue={recipe?.cookTime} required />
                </label>

                <h3 className={styles.label}>Directions:</h3>
                {directions.map((step, index) => (
                    <label key={index} className={styles.label}>
                        Step {index + 1}:
                        <input
                            className={styles.input}
                            name={`direction${index}`}
                            defaultValue={step}
                            required
                        />
                    </label>
                ))}
                <button
                    type="button"
                    onClick={() => setDirections([...directions, ""])}
                    className={styles.inputButton}
                >
                    Add Step
                </button>

                <h3 className={styles.label}>Ingredients:</h3>
                {ingredients.map((ing, index) => (
                    <div key={index} className={styles.ingredientRow}>
                        <input
                            className={styles.input}
                            name={`ingredientName${index}`}
                            placeholder="Name"
                            defaultValue={ing.name}
                            required
                        />
                        <input
                            className={styles.input}
                            name={`ingredientAmount${index}`}
                            placeholder="Amount"
                            type="number"
                            step="any"
                            defaultValue={ing.amount}
                            required
                        />
                        <select
                            className={styles.input}
                            name={`ingredientUnit${index}`}
                            defaultValue={ing.unit}
                        >
                            {UNIT_OPTIONS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => {
                                const updated = ingredients.filter((_, i) => i !== index);
                                setIngredients(updated);
                            }}
                        >
                            < FaRegTrashCan />
                        </button>
                    </div>
                ))}

                <button type="button" onClick={handleAddIngredient} className={styles.inputButton}>
                    Add Ingredient
                </button>

                <input className={styles.inputButton} type="submit"
                    value={recipe ? "Update Recipe" : "Create Recipe"}
                />

                <Link className={styles.link} to="/recipes">
                    Return to Recipe List
                </Link>
            </Form>
        </div>
    );
}
