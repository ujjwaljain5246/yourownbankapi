const mongoose = require("mongoose");
const userBankAccountDetailsSchema = require("../../UserDetails/models/userBankAccountDetailsModel");
const userUpiDetailsSchema = require("../../UserDetails/models/userUpiDetailsModel");

const userTransactionSchema = new mongoose.Schema({
    modeOfTransaction: {
        type: String,
        required: true
    },
    userName : {
        type: String,
        required: true
    },
    senderDetails: {
        senderCustomerId: { type: String},
        senderName: {type: String},
        senderBankAccountDetails: { type: userBankAccountDetailsSchema},
        senderUpiDetails: { type: userUpiDetailsSchema},
    },
    receiverDetails: {
        receiverCustomerId: { type: String},
        receiverName: {type: String},
        receiverBankAccountDetails: { type: userBankAccountDetailsSchema},
        receiverUpiDetails: { type: userUpiDetailsSchema},
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    transactionStatus: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("UserTransactionsModel", userTransactionSchema);
