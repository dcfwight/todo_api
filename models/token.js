// this model is for storing the hash values of the Auth tokens. This means we can delete them when they log out.

var cryptojs = require('crypto-js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('token',{
        token: {
            type: DataTypes.VIRTUAL, // this means the token is never stored in the database
            allowNull: false,
            validate: {
                len: [1] // low validation - length greater than one.
            },
            set: function(value) {
                var hash = cryptojs.MD5(value).toString(); // MD5 is a different encryption algorithm
                
                this.setDataValue('token', value);
                this.setDataValue('tokenHash', hash);
            }
        },
        tokenHash: DataTypes.STRING
    })
}