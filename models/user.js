var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        // salt adds a random set of characters onto the end of the password. This is because the hash of two identical passwords would be the same
        // by using salt you are randomising it a bit.
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL, // this will NOT be stored on the database as it is a virtual datatype.
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10); // only argument is the number of characters to salt the password
                var hashedPassword = bcrypt.hashSync(value, salt); // creates the hashed password by taking the value and adding the salt, and doing its thing

                this.setDataValue('password', value); // 'this' goes to the top level and finds the attribute.
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                //user.email convert to lower case, only if it's a string.
                if (typeof user.email === 'string') { // NB can also use _.isString(user.email)
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function(body) {
                return new Promise(function(resolve, reject) {
                    if (!_.isString(body.email) || !_.isString(body.password)) {
                        return reject(); // NB you just return reject here - the handler will pick it up and know what to do.
                        // NOTE - instrcutor did the following if statement instead:
                        // if (typeof body.email !== 'string') || typeof body.password !== 'string)

                    } 
                    user.findOne({
                        where: {
                            email: body.email
                        }
                    }).then(function(user) {
                        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                        // the bcrypt.compareSync function will compare passwords. Takes two arguments to compare against each other.
                        // user.get is simply getting the value for the attribute in the argument - in this case user.password_hash.

                            return reject();
                        }
                        resolve (user);
                    }, function(e) {
                        reject ();
                    });
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function() {
                var json = this.toJSON();
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
            }
        }
    });
    
    return user;
};