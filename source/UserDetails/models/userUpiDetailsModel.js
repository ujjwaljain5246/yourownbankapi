const mongoose = require("mongoose");

const userUpiDetailsSchema = new mongoose.Schema({
  upiId: {
    type: String,
    required: true
  }
}, {_id : false});

module.exports = userUpiDetailsSchema;
