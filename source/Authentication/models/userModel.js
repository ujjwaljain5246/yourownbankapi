const mongoose = require("mongoose");
const UserPersonalDetailsModel = require("./UserPersonalDetailsModel");
const UserAccountDetailsModel = require("./UserAccountDetailsModel");
const userSecurityModel = require("./userSecurityModel");
const userContactDetailsModel = require("./userContactDetailsModel");

const userModel = mongoose.Schema({
    userPersonalDetails : UserPersonalDetailsModel,
    userContactDetails : userContactDetailsModel,
    userAccountDetails : UserAccountDetailsModel,
    userSecurityDetails : userSecurityModel
}, {timestamp : true})

module.exports = mongoose.model("User", userModel);