// we set module exports to a function instead of an object to allow other files to pass in configuration data. All they need is access to the database.

module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth'); // req.get is an express function, which gets the header with that value.
            db.user.findByToken(token).then(function(user){
                req.user = user; // this adds the user to the request before moving on to the next stage of the process (the private part)
                //console.log(user);
                next();
            }, function() {
                res.status(401).send(); // by NOT calling next, the process stops and it does not continue to the private code.
            });
        }
    };
};