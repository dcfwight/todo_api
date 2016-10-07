// we set module exports to a function instead of an object to allow other files to pass in configuration data. All they need is access to the database.

var cryptojs = require('crypto-js');

module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth') || ""; // req.get is an express function, which gets the header with that value.
            // we added the or empty string, so that the cryptojs function does not Fail - it would do with NUll
            
            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString() // this is comparing the User's session token (the hashed value of Auth header) to the database hashed token.
                    // this means that even a valid request would fail UNLESS the hashed token has been saved to the database
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error(); // this just throws an error which then gets picked up by the catch function.
                }
                req.token = tokenInstance; // i.e. if we did find a match, we store the tokenInstance to the req header
                return db.user.findByToken(token); // keep chain alive by returning a found object (a user)
            }).then(function(user) {
                req.user = user;
                next(); // this then continues the execution in server.js
            }).catch(function(){
                res.status(401).send();
            })
            
            // Next code commented out after we started using Session tokens.
            //db.user.findByToken(token).then(function(user){
            //    req.user = user; // this adds the user to the request before moving on to the next stage of the process (the private part)
            //    //console.log(user);
            //    next();
            //}, function() {
            //    res.status(401).send(); // by NOT calling next, the process stops and it does not continue to the private code.
            //});
        }
    };
};