# YourOwnBank API for financial transactions

A secure and scalable RESTful API for user authentication and financial transactions, built using **Node.js, Express, Mongoose, and JWT**. The API allows users to **sign up, log in, delete accounts, retrieve balances, transfer funds via UPI ID or bank account & IFSC code, and track transaction history**. Deployed on **Railway** for seamless frontend integration.

## Features
- **User Authentication:** Secure signup, login, and JWT-based authentication.
- **Account Management:** Users can create and delete accounts.
- **Balance Retrieval:** Fetch current account balance.
- **Fund Transfer:** Transfer funds via **UPI ID** or **Bank Account & IFSC code**.
- **Transaction History:** View past transactions.

## Dependencies

This project uses the following Node.js libraries:

- **ExpressJS**: A web application framework for Node.js.
- **jsonwebtoken**: For generating and verifying JSON Web Tokens (JWT) for user authentication.
- **nodemon**: Automatically restarts the server when changes are detected.
- **bcrypt**: Used for hashing passwords for secure storage.
- **dotenv**: Loads environment variables from a `.env` file.
- **mongoose**: A MongoDB object modeling tool designed to work in an asynchronous environment.

## Software Required

To work with this API, you'll need the following software installed:

- **VSCode**: Use VSCode as your code editor.
- **Postman**: Utilize Postman for testing the API endpoints.
- **NodeJS**: Ensure NodeJS is installed on your system to run ExpressJS.

## Usage

1. Clone the repository to your local machine.
2. Install dependencies using `npm install`.
3. Set up your environment variables by creating a `.env` file and adding necessary configurations such as MongoDB URI, JWT secret, and AWS credentials.
4. Run the server using `npm start`.
5. Use Postman or any other API testing tool to interact with the API endpoints.


# Available curls

NOTE: User-sensitive information has been removed and placeholders have been added. Once you create your account, you will receive all the required parameters needed to use the CURL requests below.

1. SignIn
   
   curl --location 'https://yourownbankapi-production.up.railway.app/users/signin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userName" : "USER_NAME",
    "password" : "PASSWORD"
}'

2. SignUp

   curl --location 'https://yourownbankapi-production.up.railway.app/users/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
  "userPersonalDetails": {
    "name": "NAME",
    "gender": "Male",
    "aadharNumber": "AADHAR_NUMBER",
    "panNumber": "PAN_NUMBER"
  },
  "userContactDetails": {
    "mobile": "MOBILE_NUMBER",
    "email": "EMAIL_ID",
    "address": {
      "street": "STREET_NAME",
      "city": "CITY_NAME",
      "state": "STATE_NAME",
      "country": "India",
      "pincode": "PIN_CODE"
    }
  },
  "userAccountDetails": {
    "accountType": "Savings",
    "occupation": "Engineer"
  },
  "userSecurityDetails": {
    "password": "PASSWORD"
  }
}'

3. Delete account

   curl --location --request DELETE 'https://yourownbankapi-production.up.railway.app/users/deleteuser' \
--header 'token: JSON_WEB_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "userName" : "USER_NAME",
    "password" : "PASSWORD"
}'

4. Setup bank account

   curl --location 'https://yourownbankapi-production.up.railway.app/userDetails/bankDetails/USER_ID' \
--header 'token: JSON_WEB_TOKEN'

5. Send money
   
   a. Using UPI Id
   
     curl --location 'https://yourownbankapi-production.up.railway.app/sendMoney/USER_ID' \
--header 'token: JSON_WEB_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "modeOfTransaction" : "UPI",
    "userUpiDetails" : {
        "upiId" : "RECEIVER_UPI_ID"
    },
    "amount" : 50
}'

    b. Using Bank account number and IFSC Code

    curl --location 'https://yourownbankapi-production.up.railway.app/sendMoney/USER_ID' \
  --header 'token: JSON_WEB_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
      "modeOfTransaction" : "Bank Transfer",
      "userBankAccountDetails" : {
          "accountNumber" : "BANK_ACCOUNT_NUMBER",
          "ifscCode" : "IFSC_CODE"
      },
      "amount" : 50
  }'

6. Fetch available balance

   curl --location 'https://yourownbankapi-production.up.railway.app/userDetails/fetchBalance/USER_ID' \
--header 'token: JSON_WEB_TOKEN'

8. Fetch transaction history

   curl --location 'https://yourownbankapi-production.up.railway.app/userDetails/transactionHistory/USER_ID' \
--header 'token: JSON_WEB_TOKEN'

### If the above endpoints are not working, the Railway hosting service may be experiencing issues or the plan may have expired. Please try again later.

### Feel free to contact in case of any doubt....
