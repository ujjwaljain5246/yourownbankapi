const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
      },
}, {_id : false});

module.exports = userAddressSchema;
