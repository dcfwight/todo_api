var express = require('express');
var app = express();

var port = process.env.PORT || 3000;
// port environment variable set by heroku.

app.get('/', function(req,res){
    res.send('Todo API root');
});

app.listen(port, function(){
    console.log('express listening on port: '+ port + "!");
})
