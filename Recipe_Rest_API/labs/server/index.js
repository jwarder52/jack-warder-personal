import startApp from "./app.js";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const dbUrl = process.env.DB_URL ? process.env.DB_URL : "mongodb://localhost:27017/project1db";
console.log("Connecting to MongoDB at:", dbUrl);
startApp(port, dbUrl);
