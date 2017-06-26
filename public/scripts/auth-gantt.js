$(document).ready(function () {

  socket.on('whereareyou', function () {
    socket.emit('ImIn', {value: 'Gantt'});
  });

  socket.on('exitGantt', function () {
    window.location.href = '/previewGantt.html?id=' + getQueryVariable("id");
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
        .then(respond => {
          $('.logo').attr('href', '/room.html?id=' + getQueryVariable("id"));
          $('#homy').attr('href', '/room.html?id=' + getQueryVariable("id"));
          $('#linkPMM').attr('href', '/previewMM.html?id=' + getQueryVariable("id"));
          //$('#homelink').attr('href','/room.html?id='+getQueryVariable("id"));
          //$('#homelink').attr('href','/room.html?id='+getQueryVariable("id"));
        })
        .catch(function (err) {
          window.location.href = '/lobby.html';
        });
    })
    .then(() => {
      stopIntro();
    })
    .catch(function () {
      window.location.href = '/lobby.html';
    });

});
