const mongoose = require("mongoose");

const userBankAccountDetailsSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true
  },
  ifscCode: {
    type: String,
    required: true,
  }
}, {_id : false});

module.exports = userBankAccountDetailsSchema;
