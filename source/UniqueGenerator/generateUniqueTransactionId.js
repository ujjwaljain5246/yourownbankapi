const crypto = require("crypto");

const generateTransactionId = ({ accountNumber, ifscCode, upiId, amount}) => {
    // Generate the current timestamp
    const timestamp = new Date().toISOString();

    // Combine all transaction details into a string
    const transactionData = `${accountNumber || ""}|${ifscCode || ""}|${upiId || ""}|${amount}|${timestamp}`;

    // Generate a SHA256 hash to create a unique transaction ID
    const transactionId = crypto.createHash("sha256").update(transactionData).digest("hex");

    // Return first 16 characters to make it readable and unique
    return `TXN-${transactionId.substring(0, 16).toUpperCase()}`;
};

module.exports = generateTransactionId;