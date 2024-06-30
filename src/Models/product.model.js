import mongoose from 'mongoose';

// Define a schema for the link
const linkSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true,
    },
    site: {
        type: String,
        required: true,
    },
}, { _id: false });

// Feature schema
const featureSchema = new mongoose.Schema(
    {
        column: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
            required: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,  // Support both String and Number
            required: true,
        },
    },
    { _id: false }
);

// Product schema
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        productImage: {
            type: String,
        },
        features: [featureSchema],
        link: linkSchema,
        utility: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);