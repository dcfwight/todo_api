var bodyParser = require('body-parser');
var express = require('express');

var app = express();
var port = process.env.PORT || 3000;
// port environment variable set by heroku.
var todos = []; // set up empty todos array.
var todoNextId = 1;  //how we iterate over ids.

app.use(bodyParser.json());// now any time a JSON req comes in, express is going to be able to parse it, and access it via req.body.

/* This was the old code -before we changed it so that we can add items to the todo array
var todos = [{
    id: 1,
    description: 'meet Dad for lunch',
    completed: false
    },{
    id: 2,
    description: 'go to market',
    completed: false
    },{
    id:3,
    description: 'have dinner',
    completed: true
    }]*/
// this is an array of objects. each needs to have an id. this is called a 'collection'
// the 'model' is the individual item within a collection.


app.get('/', function(req,res){
    res.send('Todo API root');
});

// get request - http method.
// GET /todos - this gets the collection
app.get('/todos', function(req,res) {
    res.json(todos);
})

// GET /todos/:id - this gets an individual item.
// so this looks for the item id in the URL requested.(?)
// it is saying 'take whatever is after the colon and pass it to req.params.

/* this code works - just wanted to show different way of going through the loop.
app.get('/todos/:id', function(req,res){
    var todo_id = req.params.id;
    
    // iterate over todos array. Find the match.
    // if it doesn't find it, send a (404)status update
    var match = false;
    for (var i in todos) {
        if (todo_id == todos[i].id) {
            res.json(todos[i]);
            match = true;
        }
    }
    if (!match) {
        res.status(404).send;
    }
})
*/

// alternative way of doing the above
// note we needed to use parseInt, because req.params is always a string. parseInt second argument is the base - set to 10 usually.
app.get('/todos/:id', function(req,res){
    var todo_id = parseInt(req.params.id, 10);
    var matched;
    
    todos.forEach(function(todo){
        if (todo.id === todo_id) {
            matched = todo;
        }
    });
    
    if (matched) {
        res.json(matched);
    } else {
        res.status(404).send();
    }
})
    
// POST. This gets data in and updates variables.
// you need the body-parser module for posts.

// POST/todos
app.post('/todos', function(req,res){
    var body = req.body; // i think we needed teh body-parser module to do this.
    console.log('description' + body.description);
    // challenge - push body into array, after adding ID
    body.id = todoNextId;
    todos.push(body);
    todoNextId +=1;
   
   
    res.json(todos);
    })
        
    
    


app.listen(port, function(){
    console.log('express listening on port: '+ port + "!");
})
