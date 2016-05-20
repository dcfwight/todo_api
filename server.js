var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore'); // access the underscore package - just use '_' - it is common.
// very useful for searching arrays etc. See http://underscorejs.org/ for full list of useful commands
// for example the where function _.where(list, properties), will return an array of ALL the values that contain all of the key-value pairs
// in that list. e.g. _.where(listOfPlays, {author:'Shakespeare', year:1611});
// findWhere returns just the first item.

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
    
    var matchedTodo = _.findWhere(todos, {id:todo_id});
    /* Code below works, but we now use the helper function from underscore.
    var matched;
    
    todos.forEach(function(todo){
        if (todo.id === todo_id) {
            matched = todo;
        }
    });
    */
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
})
    
// POST. This gets data in and updates variables.
// you need the body-parser module for posts.

// POST/todos
app.post('/todos', function(req,res){
    var body = req.body; // we needed the body-parser module to do this.
    // use underscore module to validate entries.
    
    // challenge - use underscore pick to only pick description and completed.
    body = _.pick(body, 'description', 'completed')
    
    // logic statement runs if the completed attribute is not a Boolean
    // also the description has to be a string. String also has to have > 0 length.
    // if any of the conditions fail, then a status error 400 is returned.
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {  
        return res.status(400).send();
    }
    
    // set body.description to be trimmed value.
    body.description = body.description.trim();
     
    console.log('description: ' + body.description);
    // challenge - push body into array, after adding ID
    body.id = todoNextId++; // this sets body.id to todoNextID, THEN it increments todoNextId by 1.
    todos.push(body);
   
    res.json(body);
    })

// DELETE /todos/:id - call app.delete with 2 arguments, the URL and the second is a call back.
// to delete item from an array - need to find the todo to remove. then use a new underscore method to remove
// without is the method. Send back a 200 status, and the deleted item.
app.delete('/todos/:id', function(req,res){
    var todo_id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id:todo_id});
    
    if (!matchedTodo) {
        res.status(404).json({"error":"no todo found with that id"});
    } else{
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo); // you don't need to do res.status(200).send, as it does this automatically if
        // it successfully sends a JSON.
    }
});

// PUT /todos/:id
app.put('/todos/:id', function(req,res){
    var todo_id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id:todo_id});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    
    if (!matchedTodo) {
        return res.status(404).send();
    }
    
    // returns true or false, if the object has the property completed.
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send(); // there was a problem here - the completed attribute is not a Boolean.
    } else {
        // never provided attribute - no problem here. Actually no need for this else clause..
    }
    
    //challenge. check for description. property exists, and its a string and if trimmed value length >0.
    // elseif - just check if property exists.
    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length >0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }    
    // HERE
    // use _.extend(destination, *sources) - takes all the properties in sources and writes them to destination. It will
    // overwrite the properties in destination of they are also in sources.

    //matchedTodo = _.extend(matchedTodo, validAttributes);
    // you actually don't need to do that - you can just do the following:
    _.extend(matchedTodo, validAttributes); // as you pass in the original matchedTodo, and then do something to it,
    // it then returns the matchedTodo array.
    res.json(matchedTodo); // automatically sends back status 200 as well.

});



app.listen(port, function(){
    console.log('express listening on port: '+ port + "!");
})
