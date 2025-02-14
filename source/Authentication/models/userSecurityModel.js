const mongoose = require("mongoose");

const userSecuritySchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    }
}, {_id : false});

module.exports = userSecuritySchema;
