const express = require("express");
const makeTransaction = require("./userTransactionController");
const userTransactionRouter = express.Router();

userTransactionRouter.post("/:userId", makeTransaction);

module.exports = userTransactionRouter;