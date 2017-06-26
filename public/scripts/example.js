socket.on('connect', function () {

  app.authenticate().then(() => {


    username = app.get('user').first_name;
    socket.emit('adduser', username);
    socket.emit('sendchat', "i'm here");
    socket.emit('checkroom', "check 1 2 3");
    switchRoom(roomnumber)

  })
    .catch(error => {
      if (error.code === 401) window.location.href = '/login.html'
    });

});

socket.on('updatechat', function (username, data) {
  console.log(username," : ",data);
});


socket.on('absen', function (username, data) {
  console.log(username," : ",data);
});


socket.on('updaterooms', function (rooms, current_room) {
  $('#rooms').empty();
  $.each(rooms, function (key, value) {
    if (value == current_room) {
      $('#rooms').append('<div>' + value + '</div>');
    }
    else {
      $('#rooms').append('<div><a href="#" onclick="switchRoom(\'' + value + '\')">' + value + '</a></div>');
    }
  });
});

function switchRoom(room) {
  socket.emit('switchRoom', roomnumber);
  console.log("room :", room);
}

$(function(){
  $('#datasend').click( function() {
    var message = $('#data').val();
    $('#data').val('');
    socket.emit('sendchat', message);
  });

  $('#data').keypress(function(e) {
    if(e.which == 13) {
      $(this).blur();
      $('#datasend').focus().click();
    }
  });

  $('#roombutton').click(function(){
    var name = $('#roomname').val();
    $('#roomname').val('');
    socket.emit('create', name)
  });
})




socket.on('prepareNameSpace', function(username, nsp) {

  checkNameSpace(nsp);


  socket.nsp = nsp;

  usernames[username] = username;

  console.log(username, "has connected in namespace: ",room);

  socket.emit('shoutRoom', 'SERVER', 'you have connected to Room : ',room);
  socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' has connected to this room');
  // socket.emit('updaterooms', rooms, socket.room);

});

function checkNameSpace (nsp) {

  let result = namespaces.indexOf(nsp);

  if(result>=0){
    console.log("Namespace already created");
  }

  else{
    console.log("create Namespace :", nsp);
    namespaces.push(nsp);
    //  socket.emit('updaterooms', rooms, socket.room);
  }

}
