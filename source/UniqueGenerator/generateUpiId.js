const crypto = require("crypto");

const generateUpiId = (mobileNumber) => {
    return mobileNumber + '@yob';
}

module.exports = generateUpiId;