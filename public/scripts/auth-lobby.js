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

    app.authenticate()
      .catch(function (error) {
        window.location.href = '/login.html';
      });

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
    .then(user => {
      app.set('user', user);

      console.log(user);

      $('.username').append(user.firstName);

      app.service('users').find({
        query:{
          includeProjects:1
        }
      })
        .then(page => {

          if(page.data[0]){
            const datas = page.data[0].projects;
            datas.forEach(addRoom);
          }
          findRequest();
          findFriendInvitation();
          findFriends();
          stopIntro();
        })
        .catch(function (error) {
          console.log(error)
        });

    })
    .catch(function (error) {
      console.log(error)
    });

});

function addRoom(room) {

  console.log(room)

  if(room.creatorId !== app.get('user').id){

    $('.container').append(`
        <div class="box project">
        <a href="room.html?id=${room.id}">
        <span class="icon-cont">
        <i class="fa fa-briefcase"></i>
        </span>
        <h3>${room.projectTitle}</h3>
        <ul class="slip">
        <li>Creator &ensp;:&ensp;<span>${room.Owner.firstName} ${room.Owner.lastName}</span></li>
        <li>Start :&ensp;${moment(room.startDate).format('YYYY-MM-DD')}</li>
        <li>End   :&ensp;${moment(room.endDate).format('YYYY-MM-DD')}</li>
        </ul>
        </a>
        </div>`
    );

  }
  else {

    $('.container').append(`
        <div class="box project">
        <a href="room.html?id=${room.id}">
        <span class="icon-cont">
        <i class="fa fa-briefcase"></i>
        </span>
        <h3>${room.projectTitle}</h3>
        <ul class="slip">
        <li>Creator &ensp;:&ensp;<span>${app.get('user').firstName} ${app.get('user').lastName}</span></li>
        <li>Start :&ensp;${moment(room.startDate).format('YYYY-MM-DD')}</li>
        <li>End   :&ensp;${moment(room.endDate).format('YYYY-MM-DD')}</li>
        </ul>
        </a>
        </div>`
    );

  }

};

function stopIntro() {


  $(".se-pre-con").fadeOut("slow");


}
