
var socket = new WebSocket("ws://localhost:5000/");
var button = document.getElementById('send');
var messages = document.getElementById('messages');
var users=document.getElementById('users');
button.addEventListener('click',function(){
    var name = prompt("Enter your name");
    var message=JSON.stringify({type:"name",name:name});
    socket.send(message);
})
socket.onopen=function(event){
   
   
};
socket.onmessage = function(message){
    message=JSON.parse(message.data);
    if(message.type=="message"){
        messages.innerHTML+=message.message+'<br>';    
    }else if(message.type==='list'){
        users.innerHTML = message.list;
    }
    
    
};
