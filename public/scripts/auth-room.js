$(document).ready(function () {

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

      socket.emit('checkPresentation','asd');

      socket.on('isLive', function (a) {

        if(a){
          $('#preslink').modernBlink();

        }

      });

      $('.username').append(user.firstName);

      app.service('projects').find({
        query: {
          id: getQueryVariable('id'),
          include: 1
        }
      })
        .then(respond => {

          console.log(respond);

          const team = respond.data[0].users;

          team.forEach(function (data) {
            $('#team-result').append(`<div class="pop-client-bar">
              <div class="bar-image">
                <img src="images/common.png">
              </div>
              <div class="bar-data">
                <ul>
                  <li>${data.firstName} ${data.lastName} </li>
                  <li style="font-size: 9pt">
                  <p><span class="fa fa-briefcase" aria-hidden="true"></span>${data.profession}</p>
                  <p><span class="fa fa-building" aria-hidden="true"></span>${data.company}</p>
                </li>
                </ul>
              </div>
            </div>`)
          });

          const responds = respond.data[0];

          $(".projectname").append(responds.projectTitle);
          $(".projectroom").append(responds.id);

          $("#pname").append(responds.projectTitle);
          $("#pmname").append(responds.PmName);
          $("#strtdate").append(moment(responds.startDate).format('DD-MM-YYYY'));
          $("#enddate").append(moment(responds.endDate).format('DD-MM-YYYY'));

          $('#chlink').attr('href', '/projectcharter.html?id=' + getQueryVariable('id'));
          $('#mmlink').attr('href', '/mindmaps.html?id=' + getQueryVariable('id'));
          $('#gclink').attr('href', '/ganttchart.html?id=' + getQueryVariable('id'));

          $('#preslink').attr('href', '/presentation.html?id=' + getQueryVariable('id'));



          if(app.get('user').id === responds.creatorId){
            $('#teamlink').attr('href', '/team.html?id=' + getQueryVariable('id'));
            $('#propertieslink').attr('href', '/projectprop.html?id=' + getQueryVariable('id'));
          }
          else{
            $('#teamlink').hide();
            $('#propertieslink').hide();
          }



        })
        .catch(function (error) {
          console.log(error);
        });

    })
    .then(() => {
      stopIntro();
      findInvitation();
      findFriends(getQueryVariable('id'));
      findRequest();
    })
    .then(() => {
      stopIntro();
    })
    .catch(function () {
      //window.location.href = '/lobby.html';
    });

});
