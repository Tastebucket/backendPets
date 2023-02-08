const mongoose = require('mongoose')

// toy is a subdoc

const toySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String
    },
    isSqueaky: {
        type: Boolean,
        required: true,
        default: false
    },
    condition: {
        type: String,
        // we will use enum, which means we can only use specific strings for this field.
        // enum is a validator on the type String that says "you can only use one of the values within this array"
        enum: ['new', 'used', 'disgusting'],
        default: 'new'
    }
})

module.exports = toySchema