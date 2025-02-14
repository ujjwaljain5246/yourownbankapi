const mongoose = require("mongoose");

const userPersonalDetailsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true
    },
    panNumber: {
        type: String,
        required: true
    }
}, {_id : false});

module.exports = userPersonalDetailsSchema;
