// defines the database model.
// the two arguments that are required are passed in (behind the scenes) during the sequelize.import() method.

var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250]
            }
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }
    // this code did work to validate that description had to be string, but then it fouled up with the association code from 9/81.
    // so instead, 
    //, {
    //    validate: {
    //        descriptionIsString: function() {
    //            if (!_.isString(this.description)) {
    //                throw new Error('Description must be string.')
    //            }
    //        },
    //        completedIsBoolean: function() {
    //            if (!_.isBoolean(this.completed)) {
    //                throw new Error('Completed must be boolean.')
    //            }
    //        }
    //    }
    //} 
    );
};