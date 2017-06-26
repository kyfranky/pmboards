// Set up socket.io
let socket = io();

// Set up Feathers client side
let app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: localStorage
  }));

$('.logout').on('click', function () {
  app.logout().then(() => window.location.href = '/login.html');
});

$(document).ready(function () {

  socket.on('connect', function () {
    const roomId = getQueryVariable("id");
    app.authenticate()
      .catch(function (error) {
        window.location.href = '/login.html';
      });
    if (roomId) {
      socket.emit('joinRoom', {
        text: this.id,
        roomId: roomId
      });
    }
  });

  app.authenticate()
    .then(response => {
      console.log('Authenticated!', response);
      return app.passport.verifyJWT(response.accessToken);
    })
    .then(payload => {
      console.log('JWT Payload', payload);
      return app.service('users').get(payload.userId);
    })
    .then(users => {

    app.service('teams').find({
      query:{
        userId: users.id,
        projectId: getQueryVariable('id'),
        status: 1
      }
    }).then(result =>{
      if(result.total === 0){
        window.location.href = '/lobby.html';
      }
    })
      .catch(function (err) {
        console.log(err)
      });

    })
    .catch(function () {
      window.location.href = '/lobby.html';
    });

});

function getQueryVariable(variable) {

  let query = window.location.search.substring(1);

  let vars = query.split("&");

  if (!query) {
    window.location.href = '/lobby.html';
  }
  if (!vars) {
    window.location.href = '/lobby.html';
  }
  else {
    for (let i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (pair[0] == variable) {
        if (pair[1]) {
          return pair[1];
        }
        else {
          window.location.href = '/lobby.html';
        }
      }
      else {
        window.location.href = '/lobby.html';
      }
    }
  }
  window.location.href = '/lobby.html';

}

function stopIntro() {


  $(".se-pre-con").fadeOut("slow");


}

function secondPhaseAuth() {


  $(".se-pre-con").fadeOut("slow");


}
