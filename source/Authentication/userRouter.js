const express = require("express");
const { signin, signup, deleteUser } = require("./userController");
const userRouter = express.Router();

userRouter.post("/signup", signup);

userRouter.post("/signin", signin);

userRouter.delete("/deleteuser", deleteUser);


module.exports = userRouter;