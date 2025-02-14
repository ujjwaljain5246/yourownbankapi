const dotenv = require("dotenv");
dotenv.config({path : "./source/.env"});
const cors = require("cors");
const express = require("express");
const app = express();
const userRouter = require("./Authentication/userRouter");
const userDetailsRouter = require("./UserDetails/userDetailsRouter");
const userTransactionRouter = require("./Transactions/userTransactionRouter");

// To add some header in the response
app.use(cors());

// To parse all the request body into json
app.use(express.json());

// All login related api
app.use("/users", userRouter)

// Api to send the user bank details
app.use("/userDetails", userDetailsRouter);

// Api to make the transaction
app.use("/sendMoney", userTransactionRouter);

// Mongoose DB related code
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_CONNECTION_URL)
.then(() => {
    app.listen(PORT, ()=> {
        console.log("Connection to DB successful and Server started on port no. " + PORT);
    });

})
.catch((error) => {
    console.log(error);
});







