var crypto = require('crypto');
var moment = require('moment');
var mongoose = require('./mongoose');

var userModel = mongoose.getUserModel();

/* login validation methods */
exports.autoLogin = function (user, pass, callback) {
    userModel.findOne({username:user}, function (e, o) {
        if (o) {
            o.password == pass ? callback(o) : callback(null);
        } else {
            callback(null);
        }
    });
};

exports.manualLogin = function (user, pass, callback) {
    userModel.findOne({username:user}, function (e, o) {
        if (e != null) {
            console.log(e);
        }

        if (o == null) {
            callback('user-not-found');
        } else {
            validatePassword(pass, o.password, function (err, res) {
                if (res) {
                    callback(null, o);
                } else {
                    callback('invalid-password');
                }
            });
        }
    });
};

/* record insertion, update & deletion methods */

exports.addNewAccount = function (newData, callback) {
    var user = new userModel();

    userModel.findOne({username:newData.user}, function (e, o) {
        if (o) {
            callback('username-taken');
        } else {
            userModel.findOne({email:newData.email}, function (e, o) {
                if (o) {
                    callback('email-taken');
                } else {
                    saltAndHash(newData.pass, function (hash) {
                        user.password = hash;
                        user.email = newData.email;
                        user.username = newData.user;

                        newData.pass = hash;
                        // append date stamp when record was created //
                        newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
                        user.save(callback);
                    });
                }
            });
        }
    });
};

exports.updateAccount = function (newData, callback) {
    userModel.findOne({username:newData.user}, function (e, o) {
        o.name = newData.name;
        o.email = newData.email;
        o.country = newData.country;
        if (newData.pass == '') {
            userModel.save(o, {safe:true}, callback);
        } else {
            saltAndHash(newData.pass, function (hash) {
                o.password = hash;
                userModel.save(o, {safe:true}, callback);
            });
        }
    });
};

exports.updatePassword = function (email, newPass, callback) {
    saltAndHash(newPass, function (hash) {
        userModel.findOneAndUpdate(
            {email:email},
            {password:hash},
            callback
        );
    });
};

exports.deleteAccount = function (id, callback) {
    userModel.findByIdAndRemove(
        id,
        callback
    );
};

exports.getAccountByEmail = function (email, callback) {
    userModel.findOne({email:email}, function (e, o) {
        callback(o);
    });
};

exports.validateResetLink = function (email, passHash, callback) {
    userModel.find({ $and:[
        {email:email, password:passHash}
    ] }, function (e, o) {
        callback(o ? 'ok' : null);
    });
};

exports.getAllRecords = function (callback) {
    userModel.find(function (e, res) {
        if (e) callback(e);
        else callback(null, res);
    });
};

exports.getRecordsForQuery = function (query, callback) {
    userModel.find(query).toArray(callback);
};

var generateSalt = function () {
    var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
    var salt = '';
    for (var i = 0; i < 10; i++) {
        var p = Math.floor(Math.random() * set.length);
        salt += set[p];
    }
    return salt;
};

var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};

var saltAndHash = function (pass, callback) {
    var salt = generateSalt();
    callback(salt + md5(pass + salt));
};

var validatePassword = function (plainPass, hashedPass, callback) {
    var salt = hashedPass.substr(0, 10);
    var validHash = salt + md5(plainPass + salt);
    callback(null, hashedPass === validHash);
};