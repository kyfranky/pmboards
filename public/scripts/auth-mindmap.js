$(document).ready(function () {

  socket.on('whereareyou', function () {
    socket.emit('ImIn', {value: 'MindMap'});
  });

  socket.on('exitMM', function () {
    window.location.href = '/previewMM.html?id=' + getQueryVariable("id");
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
      socket.emit('ListMe', {
        id: app.get('user').id,
        name: (app.get('user').firstName + "" + app.get('user').lastName)
      });
      app.service('projects').get(getQueryVariable("id"))
        .then(() => {
          $('.logo').attr('href', '/room.html?id=' + getQueryVariable("id"));
          $('#homy').attr('href', '/room.html?id=' + getQueryVariable("id"));
          $('#linkPGC').attr('href', '/previewGantt.html?id=' + getQueryVariable("id"));
        })

    })
    .then(() => {
      stopIntro();
    })
    .catch(function (error) {
      window.location.href = '/lobby.html';
    });

});
