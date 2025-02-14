const mongoose = require("mongoose");
const userAccountDetailsSchema = require("../../Authentication/models/UserAccountDetailsModel")
const userBankAccountDetailsSchema = require("./userBankAccountDetailsModel");
const userPersonalDetailsSchema = require("../../Authentication/models/UserPersonalDetailsModel");
const userContactDetailsSchema = require("../../Authentication/models/userContactDetailsModel")
const userUpiDetailsSchema = require("./userUpiDetailsModel");

const customerBankDetailsSchema = mongoose.Schema({
    userCustomerId : {
        type : String,
        required : true
    },
    userAvailableBalance : {
        type : Number,
        required : true
    },
    userBankAccountDetails : userBankAccountDetailsSchema,
    userPersonalDetails : userPersonalDetailsSchema,
    userContactDetails : userContactDetailsSchema,
    userAccountDetails : userAccountDetailsSchema,
    userUpiDetails : userUpiDetailsSchema,
}, {timestamp : true})

module.exports = mongoose.model("UserBankDetails", customerBankDetailsSchema);
