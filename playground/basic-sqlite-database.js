var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined,undefined,undefined, {
    'dialect':"sqlite",
    "storage":__dirname + "/basic-sqlite-database.sqlite" //__dirname is the current folder.
});

var Todo = sequelize.define('todo', {
    description: {
        type:Sequelize.STRING,
        allowNull: false, // this is  validation field - you HAVE to have a description
        validate: {
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

sequelize.sync({
        //force: true // this wipes all the previous table.
    }).then(function(){
        console.log('everything is synced');
    // challenge - fetch todo item by it's id. if you find it, print to screen via toJson, otherwise print not found.
    }).then(function(){
        return Todo.findById(1);
    }).then(function(todo){
        if (todo) {
            console.log(todo.toJSON());
        } else {
            console.log('no todo found');
        }
    }).catch(function(e){
        console.log(e);
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