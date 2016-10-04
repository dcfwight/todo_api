// defines the database model.
// the two arguments that are required are passed in (behind the scenes) during the sequelize.import() method.

module.exports = function(sequelize, DataTypes){
    return sequelize.define('todo', {
        description: {
            type:DataTypes.STRING, // NOTE THE DIFFERENCE - it used to be Sequelize.STRING, now it's DataTypes.STRING
            allowNull: false, // this is  validation field - you HAVE to have a description
            validate: {
                len: [1,255] // only valid if length is between 1 and 256.
            }
        },
        completed: {
            type:DataTypes.BOOLEAN, // same datatypes comment as above.
            defaultValue: false,
            allowNull: false
        }
    });
};