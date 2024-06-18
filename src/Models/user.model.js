import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            // Password is no longer required
        },
        refreshToken: {
            type: String,
        },
        avatarNumber: {
            type: Number,
            default: 1,
            required: true
        },
        Lists: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List'
        }],
        Categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
    },
    { timestamps: true }
);

// Pre-save hook to hash the password if it exists and is modified
userSchema.pre("save", async function (next) {
    if (this.password && this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Method to compare password
userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) {
        throw new Error("Password not set for this user.");
    }
    return await bcrypt.compare(password, this.password);
}

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return token;
}

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);
