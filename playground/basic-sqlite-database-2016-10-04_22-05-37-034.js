var Sequelize = require('sequelize'); // loads in the sequelize module

// next you store an instance of Sequelize - an instance off a blueprint.
// first three arguments you can set to undefinde. Fourth argument is an object which sets what type of database to use (the dialect)
// next part of the object is specific to sqlite and is storage
var sequelize = new Sequelize(undefined,undefined,undefined, {
    'dialect':"sqlite",
    "storage":__dirname + "/basic-sqlite-database.sqlite" //__dirname is the current folder.
});


// sequelize.define first argument is the model name. Second argument is the attribute configuration. You are setting what a model should look like.
var Todo = sequelize.define('todo', {
    description: {
        type:Sequelize.STRING,
        allowNull: false, // this is  validation field - you HAVE to have a description. Look at sequelize docs website for all validations.
        validate: {
            //notEmpty: true, // Validation - can't be empty.
            len: [1,255] // only valid if length is between 1 and 256.
        }
    },
    completed: {
        type:Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        validate: {
            
        }
    }
})


// You need to run sequelize.sync, which is a method and which returns a Promise, so you can call then.
sequelize.sync({
        force: true // if set to true, this wipes all the previous table.
    }).then(function(){
        console.log('everything is synced');
    // this next bit is adding static data - you would normally do this by API.
    // Todo.create returns a promise, so you can log it using then.
    Todo.create({
        description:'take out the trash',
        //completed: false
    }).then(function(todo){
        return Todo.create({
            description: 'clean the office'
        });
    })

    // challenge - fetch todo item by it's id. if you find it, print to screen via toJson, otherwise print not found.
    .then(function(){
        //return Todo.findById(1);
        return Todo.findAll({
            where: {
                completed: false
            }
        });
    }).then(function(todos){
        if (todos) { // we will be passed the results of the findById function, so it may be empty.
            todos.forEach(function(todo){
                console.log(todo.toJSON());    
            })
            
        } else {
            console.log('no todo found');
        }
    }).catch(function(e){
        console.log(e);
    });
});
    
    
    /* all this code works - commented out, for the challenge.
    Todo.create({
        description:'take out the rubbish'
    }).then(function(todo){
        return Todo.create({
            description: 'clean office'
        });
        console.log('Finished');
        console.log(todo);
    }).then(function(){
        //return Todo.findById(1); this works - just commented out so we can try the different method.
        return Todo.findAll({
            where: {
                description: {
                    $like: "%Office%" // searches for phrase with 
                }
            }
        })
    }).then(function(todos){
        if (todos) {
            todos.forEach(function(todo){
                console.log(todo.toJSON());
                })
        } else {
            console.log('no todos found');
        }
    }).catch(function(e){
        console.log(e);
    })
});
*/