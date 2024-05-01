const mongoose = require('mongoose');

const User = new mongoose.Schema({
    profilephoto:{
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
}, {collection: 'Users'})

module.exports = mongoose.model('User', User);