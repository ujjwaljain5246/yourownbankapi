const mongoose = require("mongoose");

const userQRCodeSchema = new mongoose.Schema({
  data: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
}, {_id : false});

module.exports = userQRCodeSchema;
