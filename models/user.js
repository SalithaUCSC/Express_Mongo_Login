const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    fullname: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    }
});

const User = module.exports = mongoose.model('User', userSchema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback) {
    var query = { username: username};
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}