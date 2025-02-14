const mongoose = require("mongoose");
const userAddressSchema = require("./userAddressModel");

const userContactDetailsSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: userAddressSchema,
}, {_id : false});

module.exports = userContactDetailsSchema;
