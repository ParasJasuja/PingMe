require("dotenv").config({
    path: "./.env"
})

const server = require("./app");
const connectToDB = require("./config/db");
const port = process.env.port || 4000



connectToDB()


server.listen(port, () => {
    console.log(`Listening on port :${port}....`);
});