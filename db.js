// creates a new sql database

var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined,undefined,undefined, {
    'dialect':'sqlite',
    'storage': __dirname + '/data/dev-todo-api.sqlite' //__dirname is the current folder.
});

var db ={}; // this is common - set db object as the object to return from a database file system.

// db then loads in our database model
db.todo = sequelize.import(__dirname + "/models/todo.js");
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// then it exports to any program that requires this file.
module.exports = db;