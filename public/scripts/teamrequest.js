function findRequest() {

  $("#requested-result").empty();

  app.service('users').find({

    query: {
      includeRequest: 1
    }

  })
    .then(respond => {
      const request = processReqResult(respond);
      request.forEach(appendReqSearch);
    })
    .catch(function (error) {
      console.log(error)
    });


}

function processReqResult(result) {

  const data = result.data[0];
  const project = data.projects;
  const projects = [];

  project.forEach(function (data) {
    projects.push(data)
  });

  projects.sort(byDate);

  return projects;
}

function byDate(a, b) {
  const project1 = moment(a);
  const project2 = moment(b);
  if (project1.isBefore(project2,'year'))
    return -1;
  if (project1.isAfter(project1,'year'))
    return 1;
  return 0;
}

function appendReqSearch(data) {

  $('#requested-result').append(
    `<div class="pop-content">
                <div class="pop-content-top">

                  <div class="top-image">
                    <img src="images/common.png">
                  </div>
                  <div class="top-info">
                    <h1>${data.Owner.firstName} ${data.Owner.lastName}</h1>
                    <span>Has Invited You to Project:</span>
                    <h2>${data.projectTitle} </h2>
                  </div>
                </div>
                <div class="pop-content-bottom">
                  <button value=${data.teams.id} class="acc-req"><span class="fa fa-check-circle" aria-hidden="true"></span></button>
                  <button value=${data.teams.id} class="dec-req"><span class="fa fa-times-circle" aria-hidden="true"></span></button>
                </div>
              </div>`
  )

}

$(document).on('click', '.pop-content-bottom .acc-req', function (e) {

  let patchId = e.target.value;

  if(!patchId) return

  console.log(patchId);
  console.log(e.target.value);

  app.service('teams').patch(patchId, {
    status: 1
  })
    .then(respond => {
      console.log(respond);

      setTimeout(function () {
        window.location.href = '/room.html?id=' + respond.projectId;
      },1000)

    })
    .catch(function (error) {
      console.log(error)
    });

});

$(document).on('click', '.pop-content-bottom .dec-req', function (e) {

  let idtoRemove = e.target.value;
  app.service('teams').remove(idtoRemove)
    .then(() => {
      findRequest()
    })
    .catch(function (error) {
      console.log(error)
    });

});
