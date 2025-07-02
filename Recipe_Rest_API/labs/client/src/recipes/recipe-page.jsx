import { Link } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import { Form } from 'react-router-dom';
import React, { useState } from 'react';
import styles from './recipe-page.module.scss';
import { LuPencilLine } from "react-icons/lu";
import { FaPlus, FaArrowLeft, FaStar, FaRegTrashCan } from "react-icons/fa6";

export function RecipePage() {
    const recipe = useLoaderData();
    const [showForm, setShowForm] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);



    return (
        <div>
            <div className={styles.actions}>
                <Link className={styles.link} to="/recipes">< FaArrowLeft /> Return to Recipes List</Link>
                <Link className={styles.cardLink} to={`/recipes/update/${recipe._id}`}>Update < LuPencilLine /></Link>
            </div>
            <h2 className={styles.pageHeader}><span>{recipe.name}</span><span>Reviews</span></h2>
            <div className={styles.background}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.imageWrapper}>
                            <img src={recipe.picture} alt={recipe.name} className={styles.image} />
                        </div>

                        <div className={styles.section}>
                            <hr className={styles.hr}></hr>
                            <p className={styles.label}>Description:</p>
                            <p className={styles.value}>{recipe.description}</p>
                            <hr className={styles.hr}></hr>
                            <p className={styles.label}>Prep Time:</p>
                            <p className={styles.value}>{recipe.prepTime} minutes</p>
                            <hr className={styles.hr}></hr>
                            <p className={styles.label}>Cook Time:</p>
                            <p className={styles.value}>{recipe.cookTime} minutes</p>
                            <hr className={styles.hr}></hr>
                            <p className={styles.label}>Directions:</p>
                            <div className={styles.value}>
                                <ol className={styles.value}>
                                    {Array.isArray(recipe.directions) &&
                                        recipe.directions.map((step, i) => (
                                            <li key={i}>{step}</li>
                                        ))}
                                </ol>
                            </div>
                            <hr className={styles.hr}></hr>
                            <p className={styles.label}>Ingredients:</p>
                            <div className={styles.value}>
                                {Array.isArray(recipe.ingredients) &&
                                    recipe.ingredients.map((ing, i) => (
                                        <p key={i}>{ing.amount} {ing.unit} {ing.name}</p>
                                    ))}
                            </div>
                            <div className={styles.label}>
                                <Form method="post" action={`/recipes/delete/${recipe._id}`} >
                                    <button type="submit" className={styles.button}>
                                        Delete < FaRegTrashCan />
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                    <div className={styles.reviewsContainer}>
                        <div className={styles.reviewsSection}>


                            <button
                                type="button"
                                className={styles.button}
                                onClick={() => setShowForm(prev => !prev)}>
                                <FaPlus /> Create Review
                            </button>
                            {showForm && (
                                <Form
                                    className={styles.reviewForm}
                                    action={`/recipes/${recipe._id}/reviews`}
                                    method="post"
                                >
                                    <input type="hidden" name="recipeId" value={recipe._id} />
                                    <input type="hidden" name="user" value="6844f05e611330bcb9152908" />
                                    <label className={styles.label}>
                                        Add a Review:
                                        <textarea
                                            className={styles.textarea}
                                            name="description"
                                            maxLength={75}
                                            required
                                        ></textarea>
                                    </label>
                                    <label className={styles.label}>
                                        Rating:
                                        <input
                                            className={styles.input}
                                            type="number"
                                            name="rating"
                                            min="1"
                                            max="5"
                                            required
                                        />
                                    </label>
                                    <button className={styles.button} type="submit">
                                        Submit Review
                                    </button>
                                </Form>
                            )}
                            <div>
                                <div className={styles.reviewsList}>
                                    {Array.isArray(recipe.reviews) &&
                                        recipe.reviews.map(review => (
                                            <div key={review._id} className={styles.reviewCard}>
                                                {editingReviewId === review._id ? (
                                                    <Form method="post" action={`/recipes/${recipe._id}/reviews/update/${review._id}`} className={styles.reviewForm} 
                                                    onSubmit={() => setEditingReviewId(null)}>
                                                        <input type="hidden" name="user" value={review.user} />
                                                        <label className={styles.label}>
                                                            Edit Review:
                                                            <textarea
                                                                className={styles.textarea}
                                                                name="description"
                                                                defaultValue={review.description}
                                                                maxLength={75}
                                                                required
                                                            ></textarea>
                                                        </label>
                                                        <label className={styles.label}>
                                                            Rating:
                                                            <input
                                                                className={styles.input}
                                                                type="number"
                                                                name="rating"
                                                                defaultValue={review.rating}
                                                                min="1"
                                                                max="5"
                                                                required
                                                            />
                                                        </label>
                                                        <button className={styles.button} type="submit">Save</button>
                                                        <button
                                                            className={styles.button}
                                                            type="button"
                                                            onClick={() => setEditingReviewId(null)}>
                                                            Cancel
                                                        </button>
                                                    </Form>
                                                ) : (
                                                    <>
                                                        <p>
                                                            <strong>
                                                                {[...Array(review.rating)].map((_, i) => (
                                                                    <FaStar color="yellow" key={i} />
                                                                ))}
                                                            </strong>
                                                        </p>
                                                        <p>{review.description}</p>
                                                        <div className={styles.actions}>
                                                            <Form method="delete" action={`/recipes/${recipe._id}/reviews/${review._id}`} className={styles.cardLinkForm}>
                                                                <button type="submit" className={styles.button}>
                                                                    Delete <FaRegTrashCan />
                                                                </button>
                                                            </Form>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingReviewId(review._id)}
                                                                className={styles.button}>
                                                                Edit <LuPencilLine />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
