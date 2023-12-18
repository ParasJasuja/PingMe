const mongoose = require("mongoose");


const connectToDB = () => {
    const dbURL = process.env.DB_URL
    mongoose.connect(dbURL).then(() => {
        console.log(":::::::Connected to db successfully::::::");
    }).catch(err => {
        console.log("::::::::Error connection to db::::::\n" + err);
    })
}

module.exports = connectToDB