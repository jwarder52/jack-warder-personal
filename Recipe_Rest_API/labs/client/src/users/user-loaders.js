const BACKEND_URL = import.meta.env.DEV ? "http://localhost:3000/" : import.meta.env.BASE_URL;

function load_all() {
    return fetch(`${BACKEND_URL}api/users`);
}


function load_one({ params }) {
    return fetch(`${BACKEND_URL}api/users/${params.id}`);
}

export { load_all, load_one };