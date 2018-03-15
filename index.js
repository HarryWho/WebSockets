var express = require('express');
var app=express();
var bodyParser = require('body-parser');

var server = require('ws').Server;
var path=require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars'); 
var expressValidator=require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport=require('passport');
var localStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');
var db=mongoose.connection;

var index = require('./routes/index');
var users = require('./routes/users');


app.engine('handlebars', exphbs({defaultLayout: 'main'})); 
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

app.use(session({
    secret:'secret',
    saveUninitialized:true,
    resave:false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator());
app.use(flash());
app.use(function(req, res, next){
    res.locals.success_msg=req.flash('success_msg');
    res.locals.error_msg=req.flash('error_msg');
    res.locals.error=req.flash('error');
    res.locals.user=req.user||null;
    next();
});
app.use('/', index);
app.use('/users', users)

// express server
app.listen(5001, function(){
    console.log("Webserver listening on port 5001");
});



// websocket stuff
var s = new server({port:5000},()=>{
    
});

s.on('connection', (ws)=>{
    ws.on('message',(message)=>{
        var response='';
       message=JSON.parse(message);
        
        if(message.type==="name"){
            ws.personName = req.user.username;
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
    // console.log("Websocket connected");
});

