import { User } from "../Models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../Utils/ApiError.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("token", token);
    
    if (!token) {
        // No token provided
        return next(new ApiError(401, "Unauthorized request: No token provided"));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            return next(new ApiError(401, "Invalid access token: User not found"));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return next(new ApiError(401, "Unauthorized request: Invalid or expired token"));
        }
        next(new ApiError(500, "Unexpected error in auth middleware"));
    }
});

export { verifyJWT };
