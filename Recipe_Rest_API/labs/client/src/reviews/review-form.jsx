import { Link } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import styles from './review-form.module.scss';

export function ReviewPage() {
    const review = useLoaderData();

    return (
        <div>
            <div className={styles.actions}>
                <Link className={styles.cardLink} to={`/recipes/${recipe._id}`}>← Return to Recipe</Link>
                <Link className={styles.cardLink} to={`/reviews/update/${review._id}`}>Update</Link>
            </div>
            <h2 className={styles.header}>Review</h2>
            <div className={styles.background}>
            <div className={styles.container}>
                <div className={styles.card}>
                <div className={styles.section}>
                    <hr className={styles.hr} />
                    <p className={styles.label}>Comment:</p>
                    <p className={styles.value}>{review.comment}</p>

                    <hr className={styles.hr} />
                    <p className={styles.label}>Rating:</p>
                    <p className={styles.value}>{review.rating} out of 5</p>

                    <hr className={styles.hr} />
                    <p className={styles.label}>Date Created:</p>
                    <p className={styles.value}>{new Date(review.createdAt).toLocaleDateString()}</p>

                    <hr className={styles.hr} />
                    <p className={styles.label}>User:</p>
                    <p className={styles.value}>{review.user?.username || "Unknown"}</p>
                </div>
                </div>
            </div>
            </div>
        </div>

    );
}
