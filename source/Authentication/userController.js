const userModel = require("./models/userModel");
const userBankDetailsModel = require("../UserDetails/models/userBankDetailsModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { encrypt, decrypt, encryptAddressObject, decryptAddressObject } = require("../EncryptionDecryptionConfiguration/encryptDecryptConfig");
const userBankDetails = require("../UserDetails/userDetailsController");
const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res) => {
    // Check if the user is existing user
    // Hash the password
    // Create a new user
    // Token generate

    try {
        // Get the user input details send in request body
        const {
            userPersonalDetails: { name, gender, aadharNumber, panNumber },
            userContactDetails: { mobile, email, address },
            userAccountDetails: { accountType, occupation },
            userSecurityDetails: { password }
        } = req.body;

        // Store the encoded sensitive data
        const encodedMobile = encrypt(mobile);
        const encodedAadharNumber = encrypt(aadharNumber);
        const encodedPanNumbber = encrypt(panNumber);
        const encodedAddres = encryptAddressObject(address);        

        // Perform the checks for existing user
        const existingUserObject = await userModel.findOne({
            $or: [
                { "userContactDetails.mobile": encodedMobile },
                { "userContactDetails.email": email },
                { "userPersonalDetails.aadharNumber": encodedAadharNumber },
                { "userPersonalDetails.panNumber": encodedPanNumbber }
            ]
        });

        // If the user is existing one then throw respective error
        if (existingUserObject) {
            // Build conflictFields dynamically
            const conflictFields = {};
        
            if (existingUserObject.userContactDetails.mobile === encodedMobile) {
                conflictFields.mobile = mobile;
            }
            if (existingUserObject.userContactDetails.email === email) {
                conflictFields.email = email;
            }
            if (existingUserObject.userPersonalDetails.aadharNumber === encodedAadharNumber) {
                conflictFields.aadharNumber = aadharNumber;
            }
            if (existingUserObject.userPersonalDetails.panNumber === encodedPanNumbber) {
                conflictFields.panNumber = panNumber;
            }
        
            return res.status(400).json({
                code : 400,
                message: "User already exists with one of the provided details.",
                conflictFields
            });
        }
        

        // If no match, create a new user into the DB
        // But first of all hash the password and all other sensitivie data of user
        const hashPassword = await bcrypt.hash(password, 10);

        // Creating newUser object to save into DB with hashed data
        const newUser = await userModel.create({
            userPersonalDetails: { name, gender, aadharNumber : encodedAadharNumber, panNumber : encodedPanNumbber },
            userContactDetails: { mobile : encodedMobile, email, address : encodedAddres },
            userAccountDetails: { accountType, occupation },
            userSecurityDetails: { password : hashPassword }
        });

        // Prepare a sanitized user object for the response
        const responseUser = {
            userId : newUser._id.toString(),
            userPersonalDetails: { name, gender, aadharNumber, panNumber },
            userContactDetails: { mobile, email, address },
            userAccountDetails: { accountType, occupation },
            userSecurityDetails: {password}
        };

        // Now, generate a token i.e. JWT
        const userJwt = jwt.sign({
                                    mobile : responseUser.userContactDetails.mobile, 
                                    email : responseUser.userContactDetails.email, 
                                    aadharNumber : responseUser.userPersonalDetails.aadharNumber, 
                                    panNumber : responseUser.userPersonalDetails.panNumber,
                                    id : newUser._id
                                }, SECRET_KEY);


        return res.status(201).json({ code : 201, message: "User created successfully.", user: responseUser, token : userJwt });
    } catch (error) {
        return res.status(500).json({ code : 500, message: "Server error", error: error.message });
    }

}

const signin = async (req, res) => {
    // Check if the user exist or not
    let {userName, password} = req.body;
    const isUserNameIsEmail = userName.includes("@");
    // If user name is mobile then first encrypt the input mobile to match in DB
    if (isUserNameIsEmail == false) userName = encrypt(userName);


    try {
        // Find the user by email or mobile
        const isUserExisting = isUserNameIsEmail
            ? await userModel.findOne({ "userContactDetails.email": userName })
            : await userModel.findOne({ "userContactDetails.mobile": userName });
        
        if (isUserExisting == null) return res.status(404).json({code : 404, message : "You are not our customer. Give us chance to provide service to you."});
            
        // Yes, User is existing. So, now match the entered password and send the response accordingly
        const isPasswordMatch = await bcrypt.compare(password, isUserExisting.userSecurityDetails.password);
        if (isPasswordMatch == false) return res.status(400).json({code : 400, message : "Wrong password"});

        // Password match
        // Return a JWT to the logged in user
        // Before generating JWT, we need to have the decrypted mobile, aadhar, pan 
        const decryptedMobile = decrypt(isUserExisting.userContactDetails.mobile);
        const decryptedAadharNumber = decrypt(isUserExisting.userPersonalDetails.aadharNumber);
        const decryptedPanNumber = decrypt(isUserExisting.userPersonalDetails.panNumber);
        const decryptedAddress = decryptAddressObject(isUserExisting.userContactDetails.address);
        
        // Now generate the JWT
        const userJwt = jwt.sign({
            mobile : decryptedMobile, 
            email : isUserExisting.userContactDetails.email, 
            aadharNumber : decryptedAadharNumber, 
            panNumber : decryptedPanNumber,
            id : isUserExisting._id
        }, SECRET_KEY);

        // Creting responseUser 
        // Create the response user object
        const responseUser = {
            userId : isUserExisting._id.toString(),
            userPersonalDetails: {
                name: isUserExisting.userPersonalDetails.name,
                gender: isUserExisting.userPersonalDetails.gender,
                aadharNumber: decryptedAadharNumber,
                panNumber: decryptedPanNumber,
            },
            userContactDetails: {
                mobile: decryptedMobile,
                email: isUserExisting.userContactDetails.email,
                address: decryptedAddress,
            },
            userAccountDetails: {
                accountType: isUserExisting.userAccountDetails.accountType,
                occupation: isUserExisting.userAccountDetails.occupation,
            },
        };
        
        // Now, return the success response
        return res.status(200).json({code : 200, message: "Login success", user : responseUser, token : userJwt});
        
    } catch(error) {
        res.status(500).json({code : 500, message : "Server error", error : error});
    }
}

const deleteUser = async (req, res) => {
    try {
        // Get the user's request from the body and token from the request headers
        const { userName, password } = req.body;
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
            return res.status(401).json({ code: 401, message: "Invalid or expired token." , error : error});
        }

        // Check if userName is email or mobile
        const isUserNameEmail = userName.includes("@");
        const encryptedUserName = isUserNameEmail ? userName : encrypt(userName);

        // Find the user in the database
        const isUserExisting = isUserNameEmail
            ? await userModel.findOne({ "userContactDetails.email": userName })
            : await userModel.findOne({ "userContactDetails.mobile": encryptedUserName });

        if (isUserExisting == null) {
            return res.status(404).json({ code: 404, message: "You are not our customer. Give us chance to provide service to you." });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, isUserExisting.userSecurityDetails.password);
        if (!isPasswordMatch) return res.status(400).json({ code: 400, message: "Incorrect password." });

        // Verify the token matches the user's data
        if (
            decodedToken.id !== isUserExisting._id.toString() ||
            (isUserNameEmail && decodedToken.email !== isUserExisting.userContactDetails.email) ||
            (!isUserNameEmail && decodedToken.mobile !== decrypt(isUserExisting.userContactDetails.mobile))
        ) {
            // In case Token format is correct, token has correct paylod but the credential inside the token is of different user then this will come and make sure
            // that token of that different user is also not expired
            return res.status(403).json({ code: 403, message: "Token does not match the user's credentials." });
        }

        // If above all case fails then at last delete the user and all related data from db
        await userModel.deleteOne({ _id: isUserExisting._id });
        await userBankDetailsModel.deleteOne({userCustomerId : isUserExisting._id});

        // Send response
        return res.status(200).json({ code: 200, message: "User details deleted successfully." });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Server error.", error: error });
    }
}


module.exports = {signup, signin, deleteUser};