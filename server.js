var bodyParser = require('body-parser');
var express = require('express');
var _ = require('underscore'); // access the underscore package - just use '_' - it is common.
// very useful for searching arrays etc. See http://underscorejs.org/ for full list of useful commands
// for example the where function _.where(list, properties), will return an array of ALL the values that contain all of the key-value pairs
// in that list. e.g. _.where(listOfPlays, {author:'Shakespeare', year:1611});
// findWhere returns just the first item.
var bcrypt = require('bcryptjs');


var db = require('./db.js'); // this requires the db.js file. Creates the sqllite database, then loads a model from models/todo.js. Check out db.js to see how.
var middleware = require('./middleware.js')(db);// if you look at middleware.js, it is a function, which accepts one argument - a database.
// so we can pass in the database right away!


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
app.get('/todos', middleware.requireAuthentication, function(req, res) {
    var query = req.query; // this is the API request with a query?. Compare to request.params, which is the parameters.
    // following code checks that the userId in the header (req.user.get('id') matches to the userId in the database, when we do findAll down below)
    var where = {
        userId: req.user.get('id')
        };

    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'
        };
    }

    db.todo.findAll({
        where: where
    })
        .then(function(todos) {
        if (todos) {
            todos.forEach(function(todo) {
                //console.log(todo.toJSON());
            });
            res.json(todos)
        } else {
            res.send('no todos found');
        }
    }, function(e) {
        res.status(500).send();
    }).
    catch (function(e) {
        console.log(e);
    });


    // will need if statement to check if completed is true.
    // check if there is a query and the length >0. 

    /*all this code works, but is for static data. Inserted new code to use sequelize*/
    //var filteredTodos = todos;
    //
    ///* if hasProperty and completed === 'true'
    // filteredTodos = _.where(filteredTodos, ?)
    // else ifhasPoperty and completed is 'false'
    //NOTICE the difference between 'true' in the query parameters - these are always strings. But in the todo list, it is a Boolean.
    //*/
    //if (query.hasOwnProperty('completed') && query.completed === 'true') {
    //    filteredTodos = _.where(filteredTodos, {
    //        completed: true
    //    });
    //} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    //    filteredTodos = _.where(filteredTodos, {
    //        completed: false
    //    });
    //}
    //
    ////"Go to work on Saturday".indexOf('work') - will return -1 if it doesn't exist, some number if it does exist..
    //if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    //    filteredTodos = _.filter(filteredTodos, function(todo) {
    //        return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    //    });
    //}
    //res.json(filteredTodos); // res.json converts into json - i.e. no need for parsing / stringify.
});

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
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    // where sets up the filter function - the todoId has to be passed in, and the user ID in the header (req.user.get('id') has to match what was stored in the database)
    var where = {
        id: todoId,
        userId: req.user.get('id')
    }
    
    db.todo.findOne({where: where})
        .then(function(todo) {
        if ( !! todo) { // the double !! means that it is not a Boolean, it will return true (i.e. if it is an object or a string)
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }

    }, function(e) {
        res.status(500).send(); // 500 status means that something went wrong on the server end.
    });


    /* this code works, for static data. have commented out as we now start to use sequelize instead 
    var matchedTodo = _.findWhere(todos, {
        id: todoId
    });
    // Code below works, but we now use the helper function from underscore.
    var matched;
    
    todos.forEach(function(todo){
        if (todo.id === todoId) {
            matched = todo;
        }
    });
    
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send('No ID found with ID of ' + todoId);
    }
    */
});

// POST. This gets data in and updates variables.
// you need the body-parser module for posts.


app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function(e) {
        res.status(400).json(e);
    })
});

// POST /users/login
// create handler for this request.
// pick off email and password. Check if req.body.email and password are strings (basic validation)
// if everything fine, send back req.body to initial caller.
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var userInstance;
    
    db.user.authenticate(body).then(function(user){
        var token = user.generateToken('authentication');
        // if we have found a user in the database that passes authentication (i.e. the email and password match), we want to then store the token in the dataabase.
        userInstance = user;
        
        return db.token.create({
            token: token, 
        });
        
        // following code is obsolete after we have started storing tokens
        //if (token) {
        //    res.header('Auth', token).json(user.toPublicJSON());
        //    // note we are chaining here. Response sends a header, with two arguments - key and value. For value, check out user.js instancemethod generateToken.
        //} else {
        //    res.status(401).send();
        //}
    }).then(function(tokenInstance){
        res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
    
    }).catch ( function(){
        res.status(401).send(); // send a vague error message for security features like this.
    })
    
    // all the code below works, we have just factored it away to the user.js classMethods
    //if (!_.isString(body.email) || !_.isString(body.password)) {
    //    return res.status(400).send();
    //    // NOTE - instrcutor did the following if statement instead:
    //    // if (typeof body.email !== 'string') || typeof body.password !== 'string)
    //
    //} else {
    //    db.user.findOne({
    //        where: {
    //            email: body.email
    //        }
    //    }).then(function(user) {
    //        if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
    //            // the bcrypt.compareSync function will compare passwords. Takes two arguments to compare against each other.
    //            // user.get is simply getting the value for the attribute in the argument - in this case user.password_hash.
    //            
    //            return res.status(401).send(); // 401 means authentication is possible but fail - route exists, but for some reason it failed.
    //        } else {
    //            res.json(user.toPublicJSON());    
    //        }
    //        
    //    }, function(e) {
    //        return res.status(500).send();
    //    })
    //}
})

// DELETE/users/login
app.delete('/users/login/', middleware.requireAuthentication, function(req,res){
    // this next code deletes the tokens from the headers, thus preventing further changes, unless the user logs in again.
    req.token.destroy().then(function(){
        res.status(204).send(); // 204 means server has successfully fulfilled the request - no data to send back.
    }).catch(function(){
        res.status(500).send(); // 500 means server error.
    });
});

// POST/todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed'); // we needed the body-parser to get the body, and underscore for the rest.
    // use underscore module to validate entries.

    // this next section is associating a todo with a user. The req.user has the user details (see middleware.js to see how it was added)
    // so you create the todo, then you add it to the user (see associations / one to many). We then need to reload the todo (as it has been amended)
    // that is then sent back via response.
    if (typeof body.description !== 'string') {
        res.status(400).send();
    } else {
    
        db.todo.create(body).then(function(todo) {
            req.user.addTodo(todo).then(function(){
                return todo.reload();
            }).then(function(todo){
                res.json(todo.toJSON());
            });
            // challenge - use the new todo model. Call create on db.todo
            // if success respond to API caller with 200 and the value of the todo object using .toJSON
            // if fail, respond with e res.json(e) - res.status(400).json(e)
            
            //res.json(todo.toJSON()); // you do the .toJSON as there are a lot of other attributes you don't really want to see
        }, function(e) {
            res.status(400).json(e);
        });
    }

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
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todo_id = parseInt(req.params.id, 10); // always need parseInt as the JSON comes in as strings.
    // where is the filter - todo_id is passed in by API, and the user's ID (req.user.get('id') has to match the userId in the database)
    var where = {
        id: todo_id,
        userId: req.user.get('id')
    }
    
    db.todo.destroy({where: where}).then(function(rows_deleted) {
        if (rows_deleted === 0) {
            console.log('no rows deleted');
            res.status(404).json({
                error: 'No todo with ID'
            });
        } else {
            res.status(204).send(); // 204 status means that it went well (same as 200), but no data to send back.
        }
    }, function(e) {
        res.status(500).send();
    }).
    catch (function(e) {
        console.log(e);
        res.status(404).send('no todo found with id: ' + todo_id);
    })


    /* the following code works, but it is for static data - before we updated the code for sequelize.*/
    //var matchedTodo = _.findWhere(todos, {
    //    id: todo_id
    //});
    //
    //if (!matchedTodo) {
    //    res.status(404).json({
    //        "error": "no todo found with that id"
    //    });
    //} else {
    //    todos = _.without(todos, matchedTodo);
    //    res.json(matchedTodo); // you don't need to do res.status(200).send, as it does this automatically if
    //    // it successfully sends a JSON.
    //}
});

// PUT /todos/:id
// PUTs update the information in your server/ database.
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todo_id = parseInt(req.params.id, 10);

    var body = _.pick(req.body, 'description', 'completed');
    //var validAttributes = {};
    var attributes = {};
    // set up filter - only adjust if userId in database matches the ID in the header (req.user.get('id'))
    var where = {
        id: todo_id,
        userId: req.user.get('id')
    }
    /* code works for static data - now using sequelize */
    //var matchedTodo = _.findWhere(todos, {
    //    id: todo_id
    //});
    //
    //if (!matchedTodo) {
    //    return res.status(404).send(); // use of return means that the code stops executing after this point if it is triggered.
    //}

    /* updated the code for sequelize. Note we don't need the second validation (boolean, length etc, as they are built into the sequelize model)*/
    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    
    
    
    
    db.todo.findOne({where: where}).then(function(todo) {
        if (todo) {
            todo.update(attributes) // this tries to update the specific model with the attributes - note that they may not pass validation.
            .then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).json(e);
            })
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    })

    // returns true or false, if the object has the property completed. (note -when we move to sequelize, it validates data, so don't need it here.)
    //if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    //    validAttributes.completed = body.completed;
    //} else if (body.hasOwnProperty('completed')) {
    //    return res.status(400).send(); // there was a problem here - the completed attribute is not a Boolean.
    //    // res.status(400) = 'bad request - the request could not be understood due to malformed syntax.
    //} else {
    //    // never provided attribute - no problem here. Actually no need for this else clause..
    //}

    //challenge. check for description. property exists, and its a string and if trimmed value length >0.
    // elseif - just check if property exists.
    //if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    //    validAttributes.description = body.description;
    //} else if (body.hasOwnProperty('description')) {
    //    return res.status(400).send();
    //}
    // HERE
    // use _.extend(destination, *sources) - takes all the properties in sources and writes them to destination. It will
    // overwrite the properties in destination of they are also in sources.

    //matchedTodo = _.extend(matchedTodo, validAttributes);
    // you actually don't need to do that - you can just do the following:
    //_.extend(matchedTodo, validAttributes); // as you pass in the original matchedTodo, and then do something to it,
    // it then returns the matchedTodo array.
    //res.json(matchedTodo); // automatically sends back status 200 as well.

});


// db sequelize.sync is performing the same function as in basic-sequelize-database.js
// NB the force: true wipes the database. This will clean all your data. It is important if you have changed the structure of the database, to do this
db.sequelize.sync({
    force: true
}).then(function() {
    app.listen(PORT, function() {
        console.log('express listening on port: ' + PORT + "!");
    })
});

// app.listen starts the server, listening on the PORT. ONCE running, it then moves to the second argument which in this case
// just logs to the console that the server is listening.