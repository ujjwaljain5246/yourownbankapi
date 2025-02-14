const crypto = require("crypto");

const generateUniqueAccountNumber = (mobileNumber, aadharNumber) => {
    // Sanitize input to ensure consistency
    const sanitizedMobile = mobileNumber.replace(/\D/g, ""); // Remove non-digit characters
    const sanitizedAadhar = aadharNumber.replace(/\D/g, ""); // Remove non-digit characters

    // Create a unique hash using mobile, Aadhaar, and timestamp
    const data = `${sanitizedMobile}${sanitizedAadhar}`;

    // Generate a hash for uniqueness
    const hash = crypto.createHash("sha256").update(data).digest("hex");

    // Return the first 12 digits of the hash as the account number
    return hash.slice(0, 12).toUpperCase();
};

module.exports = generateUniqueAccountNumber;