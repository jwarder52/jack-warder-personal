import { Link } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import styles from './user-page.module.css';

export function UserPage() {
    console.log(useLoaderData());
    const user = useLoaderData();
    return (
        <div>
            <ul className={styles.list}>
                <li className={styles.listHeader}>Name:</li>
                <li className={styles.listBody}>{ user.name.firstName } { user.name.middleName } {user.name.lastName }</li>
                <li className={styles.listHeader}>Address:</li>
                <li className={styles.listBody}>{ user.address.addressLine1 }</li>
                <li className={styles.listBody}>{ user.address.addressLine2 }</li>
                <li className={styles.listBody}>{ user.address.city }, { user.address.state } { user.address.zip }</li>
                <li className={styles.listHeader}>Age:</li>
                <li className={styles.listBody}>{ user.age }</li>
                <li><Link className={styles.link} to="/users">Return to Users List</Link></li>
            </ul>
        </div>
    );

}