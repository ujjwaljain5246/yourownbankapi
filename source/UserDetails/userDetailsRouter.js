const express = require("express");
const {userBankDetails, userTransactionHistory, userAvailableBalance} = require("../UserDetails/userDetailsController")
const userDetailsRouter = express.Router();

userDetailsRouter.get("/bankDetails/:userId", userBankDetails);

userDetailsRouter.get("/transactionHistory/:userId", userTransactionHistory);

userDetailsRouter.get("/fetchBalance/:userId", userAvailableBalance);

module.exports = userDetailsRouter;