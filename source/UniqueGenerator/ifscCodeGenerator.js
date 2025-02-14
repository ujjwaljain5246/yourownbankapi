const crypto = require("crypto");

const generateUniqueIFSCCode = (pincode) => {
    // Bank code
    const bankCode = 'YOB';
    // The fourth character is always '0' in IFSC code
    const fourthChar = '0';
    // Extract the first 6 digits from the pincode (if pincode has less than 6 digits, pad with leading zeros)
    let branchCode = pincode.slice(0, 6);
    // Create the IFSC code in the format: 'YOB0XXXXXX' (Bank code + '0' + branch code)
    const ifscCode = `${bankCode}${fourthChar}${branchCode}`;
    return ifscCode;
};

module.exports = generateUniqueIFSCCode;