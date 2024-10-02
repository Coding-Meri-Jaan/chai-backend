import { ApiError } from "../utils/ApiError.js"; // Import custom error class to handle API-specific errors
import { asyncHandler } from "../utils/asyncHandler.js"; // Import async handler to catch and handle errors in async functions
import jwt from "jsonwebtoken"; // Import jsonwebtoken library to handle JWTs (JSON Web Tokens)
import { User } from "../models/user.model.js"; // Import the User model to fetch users from the database

// Middleware to verify JWT (JSON Web Token)
export const verifyJWT = asyncHandler(
    async (req, _, next) => {
       try {
         // Retrieve the token from either cookies or the Authorization header
         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

         // If no token is found, throw an error indicating an unauthorized request
         if (!token) {
             throw new ApiError(401, "Unauthorized request");
         }

         // Verify the token using the secret key and decode its contents
         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

         // Find the user in the database using the decoded token's user ID (_id)
         // Exclude sensitive information like the password and refresh token
         const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

         // If the user is not found, throw an error indicating an invalid token
         if (!user) {
             throw new ApiError(401, "Invalid Access Token");
         }

           // Attach the user to the request object so it can be accessed later in the request cycle
// req object: This object represents the HTTP request, which contains details like headers, body, and any other data associated with the request.
// user: After verifying the JWT and finding the user in the database, the user object holds information about the authenticated user (excluding sensitive fields like password and refresh token).
// Attaching user info: By assigning user to req.user, you make the user’s details accessible to all subsequent middleware or route handlers in the request lifecycle.
         req.user = user;

         // Proceed to the next middleware or route handler
         next();
       } catch (error) {
         // If any error occurs, throw a 401 error with the message or a default message
         throw new ApiError(401, error?.message || "Invalid Access Token");
       }
    }
);