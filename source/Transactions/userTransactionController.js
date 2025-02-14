const jwt = require("jsonwebtoken");
const userTransactionDetailsModel = require("./model/userTransactionDetailsModel");
const userModel = require("../Authentication/models/userModel");
const userBankDetailsModel = require("../UserDetails/models/userBankDetailsModel");
const { decrypt, encrypt, formateDate } = require("../EncryptionDecryptionConfiguration/encryptDecryptConfig");
const generateTransactionId = require("../UniqueGenerator/generateUniqueTransactionId");
const SECRET_KEY = process.env.SECRET_KEY;

const makeTransaction = async (req, res) => {

    try {
        // Get the user input details send in request body
        const userId = req.params.userId;
        const token = req.headers.token;

        const {
            modeOfTransaction,
            userBankAccountDetails: {
                accountNumber = "",
                ifscCode = "",
            } = {}, // Default object and values
            userUpiDetails: {
                upiId = "",
            } = {}, // Default object and values
            amount,
        } = req.body;

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
        if (exisingUser == null) return res.status(404).json({ code: 404, message: "You are not our customer. So, You are not allowed to complete this transaction" });

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

        // Fetch the account details of sender and check if the user had availalble balance is greater or equal to transfer money.
        const senderBankDetails = await userBankDetailsModel.findOne({ userCustomerId: userId });
        if (amount <= 0) return res.status(400).json({code: 400, message : "Entered amount should be greater than 0"});
        if (senderBankDetails.userAvailableBalance < amount) return res.status(400).json({ code: 400, message: "Insufficient balance" });

        // To fetch the account details of receiver, based on either upiId or bank account details
        let receiverBankDetails;
        if (modeOfTransaction == "UPI") {
            if (upiId == "") return res.status(400).json({ code: 400, message: "UPI Id is missing" });
            receiverBankDetails = await userBankDetailsModel.findOne({ "userUpiDetails.upiId": encrypt(upiId) });
            if (receiverBankDetails == null) return res.status(400).json({ code: 400, message: "No user found with the given UPI Id." });
        } else {
            if (accountNumber == "" && ifscCode == "") return res.status(400).json({ code: 400, message: "Account number and IFSC code is missing" });
            if (accountNumber == "") return res.status(400).json({ code: 400, message: "Account number is missing" });
            if (ifscCode == "") return res.status(400).json({ code: 400, message: "IFSC code is missing" });
            receiverBankDetails = await userBankDetailsModel.findOne({
                "userBankAccountDetails.accountNumber": encrypt(accountNumber),
                "userBankAccountDetails.ifscCode": ifscCode
            });
            if (receiverBankDetails == null) {
                // Check if only account number exists (but IFSC is incorrect)
                const accountExists = await userBankDetailsModel.findOne({
                    "userBankAccountDetails.accountNumber": encrypt(accountNumber)
                });

                if (accountExists) {
                    return res.status(400).json({ code: 400, message: "Incorrect IFSC code for the given account number." });
                }

                // Check if only IFSC code exists (but account number is incorrect)
                const ifscExists = await userBankDetailsModel.findOne({
                    "userBankAccountDetails.ifscCode": ifscCode
                });

                if (ifscExists) {
                    return res.status(400).json({ code: 400, message: "Incorrect account number for the given IFSC code." });
                }

                // If neither account number nor IFSC exists
                return res.status(400).json({ code: 400, message: "No user found with the given bank account number and IFSC code." });
            }
        }

        if (receiverBankDetails.userCustomerId == userId) return res.status(400).json({ code: 400, message: "This is not possible because you are trying to transfer money from your own account to your own account" });

        const newBalanceToSender = senderBankDetails.userAvailableBalance - amount;
        const newBalanceToReceiver = receiverBankDetails.userAvailableBalance + amount;
        // Update the balance in sender account
        await userBankDetailsModel.findOneAndUpdate(
            { userCustomerId: userId }, // Condition to find the user
            { $set: { userAvailableBalance: newBalanceToSender } }, // Updating balance
        )

        // Update the balance in receiver account
        await userBankDetailsModel.findOneAndUpdate(
            { userCustomerId: receiverBankDetails.userCustomerId }, // Condition to find the user
            { $set: { userAvailableBalance: newBalanceToReceiver } }, // Updating balance
        )

        // Save the transaction details into db
        const newTransactionDetails = await userTransactionDetailsModel.create({
            modeOfTransaction: modeOfTransaction,
            userName: exisingUser.userPersonalDetails.name,
            senderDetails: { senderCustomerId: userId, senderName: senderBankDetails.userPersonalDetails.name, senderBankAccountDetails: senderBankDetails.userBankAccountDetails, senderUpiDetails: senderBankDetails.userUpiDetails },
            receiverDetails: { receiverCustomerId: receiverBankDetails.userCustomerId, receiverName: receiverBankDetails.userPersonalDetails.name, receiverBankAccountDetails: receiverBankDetails.userBankAccountDetails, receiverUpiDetails: receiverBankDetails.userUpiDetails },
            amount: amount,
            transactionId: generateTransactionId(decrypt(senderBankDetails.userBankAccountDetails.accountNumber), senderBankDetails.userBankAccountDetails.ifscCode, decrypt(senderBankDetails.userUpiDetails.upiId), amount),
            transactionStatus: "Success"
        });

        // Create a variable to send the transaction details as response
        const responseOfTransaction = {
            modeOfTransaction: modeOfTransaction,
            userName: exisingUser.userPersonalDetails.name,
            senderDetails: {
                senderCustomerId: userId,
                senderName: senderBankDetails.userPersonalDetails.name,
                senderBankAccountDetails: {
                    accountNumber: decrypt(senderBankDetails.userBankAccountDetails.accountNumber),
                    ifscCode: senderBankDetails.userBankAccountDetails.ifscCode
                },
                senderUpiDetails: {
                    upiId: decrypt(senderBankDetails.userUpiDetails.upiId)
                }
            },
            receiverDetails: {
                receiverCustomerId: receiverBankDetails.userCustomerId,
                receiverName: receiverBankDetails.userPersonalDetails.name,
                receiverBankAccountDetails: {
                    accountNumber: decrypt(receiverBankDetails.userBankAccountDetails.accountNumber),
                    ifscCode: receiverBankDetails.userBankAccountDetails.ifscCode
                },
                receiverUpiDetails: {
                    upiId: decrypt(receiverBankDetails.userUpiDetails.upiId)
                }
            },
            amount: amount,
            transactionId: newTransactionDetails.transactionId,
            transactionStatus: newTransactionDetails.transactionStatus,
            transactiionTime: formateDate(newTransactionDetails.createdAt)
        }


        return res.status(200).json({ code: 200, message: "Money transferred successfully", transactionDetails: responseOfTransaction });


    } catch (error) {
        return res.status(500).json({ code: 500, message: "Server error", error: error });
    }

}


module.exports = makeTransaction;