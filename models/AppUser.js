const mongoose = require('mongoose');

const appUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'false',
        enum: ['true', 'false']
    },
    isDeletable: {
        type: String,
        default: 'true',
        enum: ['true', 'false']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AppUser', appUserSchema);