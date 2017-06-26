app.authenticate()
  .then(response => {
    return app.passport.verifyJWT(response.accessToken);
  })
  .then(payload => {
    return app.service('users').get(payload.userId);
  })
  .then(user => {
    app.set('user', user);
  })
  .then(() => {

    app.service('projects').get(getQueryVariable('id'))
      .then(respond => {

        console.log(respond)

        $('#pt').val(respond.projectTitle);
        $('#pm').val(respond.PmName);
        $('#start').val(moment(respond.startDate).format('YYYY-MM-DD'));
        $('#end').val(moment(respond.endDate).format('YYYY-MM-DD'));

        $('#save').prop('disabled', true);

        $('#pt').keyup(function () {
          $('#save').prop('disabled', false);
        });

        $('#pm').keyup(function () {
          $('#save').prop('disabled', false);
        })

        $('#save').click(function () {

          app.service('projects').patch(getQueryVariable('id'), {
            projectTitle: $('#pt').val(),
            PmName: $('#pm').val()
          })
            .catch(error => console.log(error));

          $('#save').prop('disabled', true);

        });

        $('#delete').click(function () {

          app.service('projects').remove(getQueryVariable('id'))
            .catch(error => console.log(error));

          window.location.href = "/lobby.html";

        });


      })
      .catch(function (error) {
        console.log(error);
      });

  })
  .catch(function (error) {
    console.log(error);
  });
