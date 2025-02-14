const jwt = require("jsonwebtoken");

const userBankDetailsModel = require("./models/userBankDetailsModel");
const userTransactionDetailsModel = require("../Transactions/model/userTransactionDetailsModel");
const userModel = require("../Authentication/models/userModel");
const { decrypt, decryptAddressObject, encrypt, decryptTransactionDetails } = require("../EncryptionDecryptionConfiguration/encryptDecryptConfig");
const generateUniqueIFSCCode = require("../UniqueGenerator/ifscCodeGenerator");
const generateUniqueAccountNumber = require("../UniqueGenerator/generateUniqueAccountNumber");
const generateUpiId = require("../UniqueGenerator/generateUpiId");
const userAccountDetailsSchema = require("../Authentication/models/UserAccountDetailsModel");
const userUpiDetailsSchema = require("./models/userUpiDetailsModel");
const SECRET_KEY = process.env.SECRET_KEY;

const userBankDetails = async (req, res) => {
    try {
        const userId = req.params.userId;

        const token = req.headers.token;

        // Validate if token sent by user is not empty or null
        if (!token) {
            return res.status(401).json({ code: 401, message: "Authorization token is missing." });
        }

        // Verify the token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, SECRET_KEY);
        } catch (error) {
            return res.status(401).json({ code: 401, message: "Invalid or expired token.", error: error });
        }

        // Check if the user available in the UserModel
        // If yes, then continue else return the response with respective error
        const exisingUser = await userModel.findOne({ _id: userId });
        if (exisingUser == null) return res.status(404).json({ code: 404, message: "No any details available of userId." });

        // If not then add into userBankDetailsModel and then return the response
        // Get all the details from UserModel table of DB in decrypted mode
        const decryptedMobileNumber = decrypt(exisingUser.userContactDetails.mobile);
        const decryptedAadharNumber = decrypt(exisingUser.userPersonalDetails.aadharNumber);
        const decryptedPanNumber = decrypt(exisingUser.userPersonalDetails.panNumber);
        const decryptedAddress = decryptAddressObject(exisingUser.userContactDetails.address);
        const upiId = generateUpiId(decryptedMobileNumber);
        const initialDepositeAmount = 100000;

        // Verify the token matches the user's data
        if (
            decodedToken.id !== exisingUser._id.toString() ||
            (decodedToken.email !== exisingUser.userContactDetails.email) ||
            (decodedToken.mobile !== decryptedMobileNumber) ||
            (decodedToken.aadharNumber !== decryptedAadharNumber) ||
            (decodedToken.panNumber !== decryptedPanNumber)
        ) {
            // In case Token format is correct, token has correct paylod but the credential inside the token is of different user then this will come and make sure
            // that token of that different user is also not expired
            return res.status(403).json({ code: 403, message: "Token does not match the user's credentials." });
        }

        // Now check if the user's bank details available or not
        // If yes, then just return the available details after converting details into decrypted mode
        const isUserBankDetailsAvailable = await userBankDetailsModel.findOne({ userCustomerId: userId });
        if (isUserBankDetailsAvailable) {
            const availableUserResponse = {
                userCustomerId: userId,
                userAvailableBalance: isUserBankDetailsAvailable.userAvailableBalance,
                userBankAccountDetails: { accountNumber: decrypt(isUserBankDetailsAvailable.userBankAccountDetails.accountNumber), ifscCode: isUserBankDetailsAvailable.userBankAccountDetails.ifscCode },
                userPersonalDetails: { name: exisingUser.userPersonalDetails.name, gender: exisingUser.userPersonalDetails.gender, aadharNumber: decryptedAadharNumber, panNumber: decryptedPanNumber },
                userContactDetails: { mobile: decryptedMobileNumber, email: exisingUser.userContactDetails.email, address: decryptedAddress },
                userAccountDetails: exisingUser.userAccountDetails,
                userUpiDetails: { upiId: decrypt(isUserBankDetailsAvailable.userUpiDetails.upiId) }
            }
            return res.status(200).json({ code: 200, message: "User details fetched successfully", userBankDetails: availableUserResponse });
        }

        // Creating UserBankDetailsSchema object to save into DB with hashed data
        await userBankDetailsModel.create({
            userCustomerId: userId,
            userAvailableBalance: initialDepositeAmount,
            userBankAccountDetails: { accountNumber: encrypt(generateUniqueAccountNumber(decryptedMobileNumber, decryptedAadharNumber)), ifscCode: generateUniqueIFSCCode(decryptedAddress.pincode) },
            userPersonalDetails: exisingUser.userPersonalDetails,
            userContactDetails: exisingUser.userContactDetails,
            userAccountDetails: exisingUser.userAccountDetails,
            userUpiDetails: { upiId: encrypt(upiId) }
        });

        const responseUser = {
            userCustomerId: userId,
            userAvailableBalance: initialDepositeAmount,
            userBankAccountDetails: { accountNumber: generateUniqueAccountNumber(decryptedMobileNumber, decryptedAadharNumber), ifscCode: generateUniqueIFSCCode(decryptedAddress.pincode) },
            userPersonalDetails: { name: exisingUser.userPersonalDetails.name, gender: exisingUser.userPersonalDetails.gender, decryptedAadharNumber, decryptedPanNumber },
            userContactDetails: { decryptedMobileNumber, email: exisingUser.userContactDetails.email, address: decryptedAddress },
            userAccountDetails: exisingUser.userAccountDetails,
            userUpiDetails: { upiId },
        }

        return res.status(200).json({ code: 200, message: "User details fetched successfully", userBankDetails: responseUser });
    } catch (error) {
        return res.status(500).json({ code: 500, message: "Server error", error: error })
    }
}

const userTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.userId;

        const token = req.headers.token;

        // Validate if token sent by user is not empty or null
        if (!token) {
            return res.status(401).json({ code: 401, message: "Authorization token is missing." });
        }

        // Verify the token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, SECRET_KEY);
        } catch (error) {
            return res.status(401).json({ code: 401, message: "Invalid or expired token.", error: error });
        }

        // Check if the user available in the UserModel
        // If yes, then continue else return the response with respective error
        const exisingUser = await userModel.findOne({ _id: userId });
        if (exisingUser == null) return res.status(404).json({ code: 404, message: "No any details available of userId." });

        // Get all the details from UserModel table of DB in decrypted mode
        const decryptedMobileNumber = decrypt(exisingUser.userContactDetails.mobile);
        const decryptedAadharNumber = decrypt(exisingUser.userPersonalDetails.aadharNumber);
        const decryptedPanNumber = decrypt(exisingUser.userPersonalDetails.panNumber);

        // Verify the token matches the user's data
        if (
            decodedToken.id !== exisingUser._id.toString() ||
            (decodedToken.email !== exisingUser.userContactDetails.email) ||
            (decodedToken.mobile !== decryptedMobileNumber) ||
            (decodedToken.aadharNumber !== decryptedAadharNumber) ||
            (decodedToken.panNumber !== decryptedPanNumber)
        ) {
            // In case Token format is correct, token has correct paylod but the credential inside the token is of different user then this will come and make sure
            // that token of that different user is also not expired
            return res.status(403).json({ code: 403, message: "Token does not match the user's credentials." });
        }

        const userTransactionHistory = await userTransactionDetailsModel.find({
            $or: [
                { "senderDetails.senderCustomerId": userId },
                { "receiverDetails.receiverCustomerId": userId }
            ]
        }).sort({ createdAt: -1 });

        const responseTransactionHistory = decryptTransactionDetails(userTransactionHistory, userId);

        return res.status(200).json({ code: 200, message: "Transaction history fetched successfully", transactionHistory: responseTransactionHistory });

    } catch (error) {
        return res.status(500).json({ code: 500, message: "Server error", error: error });
    }
}


module.exports = { userBankDetails, userTransactionHistory };