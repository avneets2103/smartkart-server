import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema(
    {
        column: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
            required: true,
        },
        value: {
            type: String | Number,
            required: true,
        }
    }
);

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
        link: {
            type: {
                uri: String,
                site: String,
            }
        },
        utility: {
            type: Number
        }
    },
    { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
