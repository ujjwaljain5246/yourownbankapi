const mongoose = require("mongoose");

const userAccountDetailsSchema = new mongoose.Schema({
    accountType: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        required: true
    }
}, {_id : false});

module.exports = userAccountDetailsSchema;