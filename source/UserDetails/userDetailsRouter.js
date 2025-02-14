const express = require("express");
const {userBankDetails, userTransactionHistory} = require("../UserDetails/userDetailsController")
const userDetailsRouter = express.Router();

userDetailsRouter.get("/bankDetails/:userId", userBankDetails);

userDetailsRouter.get("/transactionHistory/:userId", userTransactionHistory)

module.exports = userDetailsRouter;