// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		const token =
			req.cookies.token ||
			req.body.token ||
			(req.header("Authorization") && req.header("Authorization").replace("Bearer ", ""));

		console.log("Auth middleware - Token present:", !!token);

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			console.log("Auth middleware - Token missing");
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			console.log(decode);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Admin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		console.log("isInstructor middleware - User email:", req.user.email);
		const userDetails = await User.findOne({ email: req.user.email });
		console.log("isInstructor middleware - User found:", !!userDetails);
		console.log("isInstructor middleware - Account type:", userDetails?.accountType);

		if (!userDetails) {
			console.log("isInstructor middleware - User not found");
			return res.status(401).json({
				success: false,
				message: "User not found",
			});
		}

		if (userDetails.accountType !== "Instructor") {
			console.log("isInstructor middleware - User is not an instructor");
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}
		console.log("isInstructor middleware - Authorization successful");
		next();
	} catch (error) {
		console.error("isInstructor middleware - Error:", error);
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};