import { useLoaderData, Form } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from './user-crupdate.module.css';

export default function UserCrupdate() {
    const user = useLoaderData();

    return (
            <Form action={ user ? `/users/update/${ user._id }` : '/users/create' } method={ user ? 'put' : 'post' }>
            <div>
                <label className={styles.label}>First Name:<input className={styles.input} name={ "firstName" } defaultValue={ user && user.name.firstName }/></label>
            </div>
            <div>
                <label className={styles.label}>Last Name:<input className={styles.input} name={ "lastName" } defaultValue={ user && user.name.lastName }/></label>
            </div>
            <div>
                <label className={styles.label}>Middle Name:<input className={styles.input} name={ "middleName" } defaultValue={ user && user.name.middleName }/></label>
            </div>
            <div>
                <label className={styles.label}>Address Line 1:<input className={styles.input} name={ "addressLine1" } defaultValue={ user && user.address.addressLine1 }/></label>
            </div>
            <div>
                <label className={styles.label}>Address Line 2:<input className={styles.input} name={ "addressLine2" } defaultValue={ user && user.address.addressLine2 }/></label>
            </div>
            <div>
                <label className={styles.label}>City:<input className={styles.input} name={ "city" } defaultValue={ user && user.address.city }/></label>
            </div>
            <div>
                <label className={styles.label}>State:<input className={styles.input} name={ "state" } defaultValue={ user && user.address.state }/></label>
            </div>
            <div>
                <label className={styles.label}>Zip:<input className={styles.input} name={ "zip" } defaultValue={ user && user.address.zip }/></label>
            </div>
            <div>
                <label className={styles.label}>Age:<input className={styles.input} name={ "age" } defaultValue={ user && user.age }/></label>
            </div>
            <input className={styles.inputButton} type="submit" value={user ? "Update User" : "Create User"} />
            <Link className={styles.link} to="/users">Return to User List</Link>
        </Form>
    );
}
