$(document).ready(function () {

  socket.on('whereareyou', function () {
    socket.emit('ImIn', {value: 'Charter'});
  });

  app.authenticate()
    .then(response => {
      return app.passport.verifyJWT(response.accessToken);
    })
    .then(payload => {
      return app.service('users').get(payload.userId);
    })
    .then(user => {
      app.set('user', user);

      socket.emit('ListMe', {id:app.get('user').id, name:(app.get('user').firstName+" "+app.get('user').lastName),profession:app.get('user').profession});

      app.service('projects').get(getQueryVariable("id"))
        .then(() => {
          $('#homelink').attr('href', '/room.html?id=' + getQueryVariable("id"));
        })
        .catch(function () {
          window.location.href = '/lobby.html';
        });
    })
    .then(() => {
      stopIntro();
    })
    .catch(function () {
     window.location.href = '/login.html';
    });

});
