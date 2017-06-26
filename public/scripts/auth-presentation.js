$(document).ready(function () {

  app.authenticate()
    .then(response => {
      return app.passport.verifyJWT(response.accessToken);
    })
    .then(payload => {
      return app.service('users').get(payload.userId);
    })
    .then(user => {

      const roomId = getQueryVariable("id");

      app.set('roomId', roomId);
      app.set('user', user);

      socket.emit('ListMe', {id:app.get('user').id, name:(app.get('user').firstName+" "+app.get('user').lastName),profession:app.get('user').profession});

      app.service('projects').get(getQueryVariable("id"))
        .then(respond => {

          if(respond.creatorId === app.get('user').id){
            app.set('owner',true);
          }
          else {
            $('#menu-trigger').css('display','none');
            app.set('owner',false)
          }

          $('#homelink').attr('href', '/room.html?id=' + roomId);
        });

      app.service('documents').find({
        query: {
          projectId: roomId
        }
      })
        .then(respond => {
          let result = respond.data;
          result.forEach(function (item) {

            $("#forDocument").append(
              '<div onclick="getData(this)" class="icon icon--pdf" data-documentId=' + item.documentId + '><i title=' + item.FileName + '></i></div>'
            )

          });
        });

      app.service('documents').on('created', function (item) {
        $("#forDocument").append(
          '<div onclick="getData(this)" class="icon icon--pdf" data-documentId=' + item.documentId + '><i title=' + item.FileName + '></i></div>'
        )
      });

    })
    .then(() => {
      stopIntro();
    })
    .catch(function (error) {
      window.location.href = '/lobby.html';
    });

});

socket.on('whereareyou', function (data) {
  socket.emit('ImIn', {value: 'Presentation'});
});
