const crypto = require('crypto');

// Encryption Decryption configuration
const algorithm = 'aes-256-cbc'; // Symmetric encryption algorithm
const secretKey = 'YourOwnBank5246'; // Secret key (32 characters for AES-256)
const iv = crypto.randomBytes(16); // Initialization vector

// Function to encrypt
function encrypt(textToEncrypt) {
  const encryptedData = Buffer.from(textToEncrypt).toString('base64');
  return encryptedData;
}

// Function to decrypt
function decrypt(encryptedData) {
  const decryptedData = Buffer.from(encryptedData, 'base64').toString('ascii');
  return decryptedData;
}

// Encrypt the entire address object
const encryptAddressObject = (address) => {
  const encryptedAddress = {};
  for (let key in address) {
    if (address[key]) {
      encryptedAddress[key] = encrypt(address[key]);
    }
  }
  return encryptedAddress;
};

// Decrypt the entire address object
const decryptAddressObject = (encryptedAddress) => {
  encryptedAddress = encryptedAddress.toObject();
  const decryptedAddress = {};
  for (let key in encryptedAddress) {
    if (encryptedAddress[key]) {
      decryptedAddress[key] = decrypt(encryptedAddress[key]);
    }
  }
  return decryptedAddress;
};

// Function to format and decrypt transaction details
const decryptTransactionDetails = (transactions, userId) => {
  return transactions.map(transaction => ({
    modeOfTransaction: transaction.modeOfTransaction,
    userName: transaction.receiverDetails?.receiverCustomerId === userId ? transaction.receiverDetails?.receiverName || "" : transaction.senderDetails?.senderName || "",
    senderDetails: {
      senderCustomerId: transaction.senderDetails?.senderCustomerId || "",
      senderName: transaction.senderDetails?.senderName || "",
      senderBankAccountDetails: {
        accountNumber: decrypt(transaction.senderDetails.senderBankAccountDetails?.accountNumber || ""), // 🔓 Decrypt Account Number
        ifscCode: transaction.senderDetails.senderBankAccountDetails?.ifscCode || ""
      },
      senderUpiDetails: {
        upiId: decrypt(transaction.senderDetails.senderUpiDetails?.upiId || "") // 🔓 Decrypt UPI ID
      }
    },
    receiverDetails: {
      receiverCustomerId: transaction.receiverDetails?.receiverCustomerId || "",
      receiverName: transaction.receiverDetails?.receiverName || "",
      receiverBankAccountDetails: {
        accountNumber: decrypt(transaction.receiverDetails.receiverBankAccountDetails?.accountNumber || ""), // 🔓 Decrypt Account Number
        ifscCode: transaction.receiverDetails.receiverBankAccountDetails?.ifscCode || ""
      },
      receiverUpiDetails: {
        upiId: decrypt(transaction.receiverDetails.receiverUpiDetails?.upiId || "") // 🔓 Decrypt UPI ID
      }
    },
    amount: transaction.amount,
    transactionId: transaction.transactionId,
    transactionStatus: transaction.transactionStatus,
    creditDebitStatus: transaction.receiverDetails?.receiverCustomerId === userId ? "Credit" : "Debit",
    transactionTime : formateDate(transaction.createdAt)
  }));
};

const formateDate = (dateString) => {
  const date = new Date(dateString);

  // Get the day, month, year, hours, minutes, seconds, and milliseconds
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); // Get short month name
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

  // Return formatted date string
  return `${day} ${month}, ${year}, ${hours}:${minutes}:${seconds}:${milliseconds}`;
}



module.exports = { encrypt, decrypt, encryptAddressObject, decryptAddressObject, decryptTransactionDetails, formateDate };