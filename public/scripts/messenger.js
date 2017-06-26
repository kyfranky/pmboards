$(window).load(function () {
  app.authenticate()
    .then(() => {
      app.service('messages').find({
        query: {
          projectId: getQueryVariable("id"),
          $sort: {createdAt: -1}
        }
      })
        .then(page => {
          const messages = page.data.reverse();

          const user = app.get('user');
          for (let i = 0; i < messages.length; i++) {
            (function (i) {
              setTimeout(function () {
                if (messages[i].senderId !== user.id) {
                  leftMessages(messages[i]);
                }
                else {
                  rightMessages(messages[i], user.firstName);
                }
              }, i * 50);
            })(i);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    })
    .catch(function () {
      window.location.href = '/lobby.html';
    });
});

let friendsList = [];

socket.on('ListMe', function (data) {

  const filter = friendsList.filter(function (item) {
    return item.id === data.id
  });

  if (filter.length == 0) {

    socket.emit('ListMe', {id:app.get('user').id, name:(app.get('user').firstName+" "+app.get('user').lastName), profession:app.get('user').profession});

    friendsList.push(data);

    $('.list-friends').append(
      `<li id="LF ${data.id}">
        <img width="50" height="50" src="../images/common.png">
         <div class="info">
         <div class="user">${data.name}</div>
         <div class="status"> <span class="fa fa-briefcase"></span> ${data.profession}</div>
        </div>
       </li>`
    )

  }

});

socket.on('unListMe', function (data) {

  const filter = friendsList.filter(function (item) {
    return item.socketId === data.socketId
  });

  friendsList = friendsList.filter(function (item) {
    return item.socketId !== data.socketId
  });

  if(!filter[0]) return

  const id = "LF "+ filter[0].id;
  document.getElementById(id).remove();
});

socket.on('getMessages', function (data, id) {
  leftMessage(data, id);
});

function send(data) {
  socket.emit('sendMessages', data);
}

function rightMessages(data, name) {

  $(".messages").append(
    `<li class="i">
     <div class="head">
     <span class="time">${moment(data.createdAt).format("h:mm a")}, Today</span>
     <span class="name">${name}</span>
     </div>
     <div class="message">${data.messageValue}</div>
     </li>`
  );

  toBottom();

}

function leftMessages(data) {

  app.service('users').get(data.senderId)
    .then(respond => {

      $(".messages").append(
        `<li class="friend-with-a-SVAGina">
      <div class="head">
      <span class="name">${respond.firstName}</span>
      <span class="time">${moment(data.createdAt).format("h:mm a")}, Today</span>
      </div>
      <div class="message">${data.messageValue}</div>
      </li>`
      );

    });

  toBottom();

}

function leftMessage(data, id) {

  app.service('users').get(id)
    .then(respond => {

      $(".messages").append(
        `<li class="friend-with-a-SVAGina">
      <div class="head">
      <span class="name">${respond.firstName}</span>
      <span class="time">${moment().format("h:mm a")}, Today</span>
      </div>
      <div class="message">${data}</div>
      </li>`
      );

    });

  toBottom();

}

function toBottom() {

  $(".messages").scrollTop(100000);

}


