var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore'); // access the underscore package - just use '_' - it is common.
// very useful for searching arrays etc. See http://underscorejs.org/ for full list of useful commands
// for example the where function _.where(list, properties), will return an array of ALL the values that contain all of the key-value pairs
// in that list. e.g. _.where(listOfPlays, {author:'Shakespeare', year:1611});
// findWhere returns just the first item.

var db = require('./db.js'); // this requires the db.js file. Creates the sqllite database, then loads a model from models/todo.js. Check out db.js to see how.

var app = express();
var PORT = process.env.PORT || 3000;
// port environment variable set by heroku, if running on heroku. If not (i.e. run local)- set to 3000.
var todos = []; // set up empty todos array.
var todoNextId = 1; //how we iterate over ids. It is NOT secure, it is just used to demonstrate here.

app.use(bodyParser.json()); // now any time a JSON req comes in, express is going to be able to parse it, and access it via req.body.

// This was the old code -before we changed it so that we can add items to the todo array
/*
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
    }]
// this is an array of objects. each needs to have an id. the set is called a 'collection'
// the 'model' is the individual item within a collection. So a collection is a set (array) of individual models.
*/


app.get('/', function(req, res) {
    res.send('Todo API root');
    console.log('root folder hit');
});

// get request - http method.
// GET /todos - this gets the collection
// Get /todos?completed=true&q=house. i.e. we are searching for a string that has 'house' in it. We need _.filter() - returns an array of items that
// pass a filter test.
app.get('/todos', function(req, res) {
    var queryParams = req.query; // this is the API request with a query?. Compare to request.params, which is the parameters.
    var filteredTodos = todos;

    // if hasProperty and completed === 'true'
    // filteredTodos = _.where(filteredTodos, ?)
    // else ifhasPoperty and completed is 'false'
    //NOTICE the difference between 'true' in the query parameters - these are always strings. But in the todo list, it is a Boolean.
    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {
            completed: true
        });
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {
            completed: false
        });
    }

    //"Go to work on Saturday".indexOf('work') - will return -1 if it doesn't exist, some number if it does exist..
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function(todo) {
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
    res.json(filteredTodos); // res.json converts into json - i.e. no need for parsing / stringify.
})

// GET /todos/:id - this gets an individual item.
// so this looks for the item id in the URL requested.(?)
// it is saying 'take whatever is AFTER THE COLON and pass it to req.params.

// this code works - just wanted to show different way of going through the loop.
/*
app.get('/todos/:id', function(req,res){
    var todo_id = req.params.id;
    //console.log(req.params);
    //res.send('Asking for todo with id of ' + req.params.id);
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
        res.status(404).send('ID NOT FOUND');
    }
})
*/
// you can send the status message before the actual respsone
// note if you send a response, there is automatically a status 200 attached to it.

// alternative way of doing the above
// note we needed to use parseInt, because req.params is always a string. parseInt second argument is the base - set to 10 usually.
app.get('/todos/:id', function(req, res) {
    var todo_id = parseInt(req.params.id, 10);

    var matchedTodo = _.findWhere(todos, {
        id: todo_id
    });
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
        res.status(404).send('No ID found with ID of ' + todo_id);
    }
})

// POST. This gets data in and updates variables.
// you need the body-parser module for posts.

// POST/todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed'); // we needed the body-parser to get the body, and underscore for the rest.
    // use underscore module to validate entries.

    // challenge - use the new todo model. Call create on db.todo
    // if success respond to API caller with 200 and the value of the todo object using .toJSON
    // if fail, respond with e res.json(e) - res.status(400).json(e)
    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON()); // you do the .toJSON as there are a lot of other attributes you don't really want to see
    }, function(e) {
        res.status(400).json(e);
    });

    /* All this code works - commented out for challenge at database stage.    
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
    */
});

// DELETE /todos/:id - call app.delete with 2 arguments, the URL and the second is a call back.
// to delete item from an array - need to find the todo to remove. then use a new underscore method to remove
// without is the method. Send back a 200 status, and the deleted item.
app.delete('/todos/:id', function(req, res) {
    var todo_id = parseInt(req.params.id, 10); // always need parseInt as the JSON comes in as strings.
    var matchedTodo = _.findWhere(todos, {
        id: todo_id
    });

    if (!matchedTodo) {
        res.status(404).json({
            "error": "no todo found with that id"
        });
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo); // you don't need to do res.status(200).send, as it does this automatically if
        // it successfully sends a JSON.
    }
});

// PUT /todos/:id
// PUTs update the information in your server/ database.
app.put('/todos/:id', function(req, res) {
    var todo_id = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {
        id: todo_id
    });
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};

    if (!matchedTodo) {
        return res.status(404).send(); // use of return means that the code stops executing after this point if it is triggered.
    }

    // returns true or false, if the object has the property completed.
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send(); // there was a problem here - the completed attribute is not a Boolean.
        // res.status(400) = 'bad request - the request could not be understood due to malformed syntax.
    } else {
        // never provided attribute - no problem here. Actually no need for this else clause..
    }

    //challenge. check for description. property exists, and its a string and if trimmed value length >0.
    // elseif - just check if property exists.
    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
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


// db sequelize.sync is performing the same function as in basic-sequelize-database.js
db.sequelize.sync().then(function() {
    app.listen(PORT, function() {
        console.log('express listening on port: ' + PORT + "!");
    })
});

// app.listen starts the server, listening on the PORT. ONCE running, it then moves to the second argument which in this case
// just logs to the console that the server is listening.