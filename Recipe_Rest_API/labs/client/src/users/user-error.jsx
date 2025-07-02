import { useRouteError } from "react-router-dom";

export default function UserError() {

    const error = useRouteError();
    console.error(error);
    return (
        <div>
            <h1>Error:</h1>
            <p>{ error.message }</p>
            <p>{ error.status }</p>
        </div>
    );
}