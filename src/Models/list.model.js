import mongoose from 'mongoose'

const listSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: false,
        },
        emoji: {
            type: String,
            required: true,
        },
        products: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }],
        columns: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
        }],
    },
    { timestamps: true }
)

export const List = mongoose.model('List', listSchema)
