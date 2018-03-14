var express = require('express');
var app=express();
var bodyParser = require('body-parser');
var index = require('./routes');
var server = require('ws').Server;
var path=require('path');

var exphbs = require('express-handlebars'); 
app.use('/', index);

app.use(express.static(path.join(__dirname,'public')));

app.engine('handlebars', exphbs({defaultLayout: 'main'})); 
app.set('view engine', 'handlebars');


// express server
app.listen(5001, function(){
    console.log("Webserver listening on port 5001");
});

// websocket stuff
var s = new server({port:5000},()=>{
    console.log("Websocket now listening on port 5000")
});

s.on('connection', (ws)=>{
    ws.on('message',(message)=>{
        var response='';
       message=JSON.parse(message);
        
        if(message.type==="name"){
            ws.personName = message.name;
            var joinMsg='';
            s.clients.forEach(function (client){
                if(ws.personName === client.personName){
                    joinMsg ="You have joind the chat";
                }else{
                    joinMsg = ws.personName+" has joined the chat";
                }
                client.send(JSON.stringify({
                    type:"message",
                    message:joinMsg
                }));
            });
            var list ='';
            s.clients.forEach(function(client){
                list+="<li class='nav-item'>\
                <a class='nav-link' href='#'>\
                  <span data-feather='user'></span>"+
                  client.personName
                +'</a>\
              </li>';
              client.send(JSON.stringify({type:'list',list:list}));
            });
            
        }
        
    });
    console.log("Websocket connected");
});

