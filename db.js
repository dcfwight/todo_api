

// creates a new sql database OR POSTGRES database, if we are using Heroku
// environment variables are set according to the environment we are using.
// they are all stored in process.env object, and are all strings.
// so it looks to see if process.env.NODE_ENV exists and is set as production - if it does we are using Heroku, if not, then set as 'development'
var Sequelize = require('sequelize');
var sequelize;
var env = process.env.NODE_ENV || 'development';


if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres'
    })
} else {
    sequelize = new Sequelize(undefined,undefined,undefined, {
    'dialect':'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite' //__dirname is the current folder.
});    
}



var db ={}; // this is common - set db object as the object to return from a database file system.

// db then loads in our database model
db.todo = sequelize.import(__dirname + "/models/todo.js"); // set a todo property which is a call to sequelize.import. This loads in sequelize models
// from separate files. Have a look at the todo.js and you will see the models, and the format required.
db.user = sequelize.import(__dirname + "/models/user.js");
db.sequelize = sequelize; // set it to the sequelize instance
db.Sequelize = Sequelize; // set it to the sequelize library

// then it exports to any program that requires this file.
module.exports = db;