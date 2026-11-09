
const express = require("express");

const router = express.Router();

const {
    signup,
    login
} = require("../controllers/authController");

// Signup API
router.post("/signup", signup);

// Login API
router.post("/login", login);

module.exports = router;