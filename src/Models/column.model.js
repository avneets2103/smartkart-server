import mongoose from 'mongoose';

// Option subdocument schema
const optionSchema = new mongoose.Schema({
    option: {
        type: String,
        required: true,
    },
    utility: {
        type: Number,
        required: true,
    }
});

// Column schema
const columnSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        List: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'List',
            required: true,
        },
        options: [optionSchema]
    },
    { timestamps: true }
);

export const Column = mongoose.model('Column', columnSchema);
