import { Link } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import styles from './user-list.module.scss';

export function UserList() {
    console.log(useLoaderData());
    const { users } = useLoaderData();
    let rows = users.map(user => 
        <tr key={ user._id }>
            <td>{ user.name.lastName }</td>
            <td>{ user.name.firstName }</td>
            <td>{ user.name.middleName }</td>
            <td>{ user.address.addressLine1 }</td>
            <td>{ user.address.addressLine2 }</td>
            <td>{ user.address.city }</td>
            <td>{ user.address.state }</td>
            <td>{ user.address.zip }</td>
            <td>{ user.age }</td>
            <td><Link className={styles.tableLink} to={`/users/${user._id}`}>View User</Link></td>
            <td><Link className={styles.tableLink} to={`/users/update/${user._id}`}>Update</Link></td>
        </tr>);
    return (
        <div>
            <Link className={styles.link} to={ '/' } >Return to Home</Link>
            <div>
                <Link className={styles.link} to={ '/users/create' } >Create New User</Link>
            </div>
            <table className={styles.tableHeaders}>
                <thead>
                    <tr>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>Middle Name</th>
                        <th>Address Line 1</th>
                        <th>Address Line 2</th>
                        <th>City</th>
                        <th>State</th>
                        <th>Zip</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    { rows }
                </tbody>
            </table>
        </div>
    );
}