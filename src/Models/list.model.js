import mongoose from 'mongoose'

const listSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        budget: {
            type: Number,
            required: false,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
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
