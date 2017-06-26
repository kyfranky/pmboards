$(window).load(function () {
  app.authenticate()
    .then(() => {

      app.service('project-logs').find({
        query: {
          projectId: getQueryVariable("id"),
          subProjectId: 1,
          $sort: {createdAt: -1}
        }
      })
        .then(page => {
          const reversedata = page.data;
          reversedata.forEach(function (item) {

            if (item.activityType === 'Change Node Text') {
              appendLogTXT(item);
            }
            else if (item.activityType === 'Delete Node') {
              appendLogDelNode(item);
            }
            else if (item.activityType === 'Move Node') {
              appendLogMoveNode(item);
            }
            else if (item.activityType === 'Add Node') {
              appendLogAddNode(item);
            }
            else {
              appendLogMM(item);
            }

          })
        })

      app.service('project-logs').find({
        query: {
          projectId: getQueryVariable("id"),
          subProjectId: 2,
          $sort: {createdAt: -1}
        }
      })
        .then(page => {
          const reversedata = page.data;

          console.log(reversedata)

          reversedata.forEach(function (item) {

            if (item.activityType === 'baselineStart') {
              appendLogUpdateBSD(item);
            }
            else if (item.activityType === 'baselineEnd') {
              appendLogUpdateBED(item);
            }
            else if (item.activityType === 'actualStart') {
              appendLogUpdateASD(item);
            }
            else if (item.activityType === 'actualEnd') {
              appendLogUpdateAED(item);
            }
            if (item.activityType === 'progressValue') {
              appendLogUpdatePROG(item);
            }
            else if (item.activityType === 'Add Task') {
              appendLogAddTask(item);
            }
            else if (item.activityType === 'Delete Task') {
              appendLogDeleteTask(item);
            }
            else if (item.activityType === 'Create connector') {
              appendLogCreateConnector(item);
            }
            else if (item.activityType === 'Delete connector') {
              appendLogDeleteConnector(item);
            }
            else if (item.activityType === 'name') {
              appendLogUpdateName(item);
            }

          })
        })

    })
});

function appendLogMM(data) {
  $("#logsMM").append(
    `                <div class="pop-client-bar">
                  <div class="bar-image">
                    <img src="images/common.png">
                  </div>
                  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]} </li>
                      <li style="font-size: 9pt">
                        <p><span>${data.activityType}</span></p>
                    </ul>
                  </div>
                </div>`
  )
}

function appendLogTXT(data) {
  $("#logsMM").append(
    `                <div class="pop-client-bar">
                  <div class="bar-image">
                    <img src="images/common.png">
                  </div>
                  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
                  </div>
                </div>`
  )
}

function appendLogDelNode(data) {
  $("#logsMM").append(
    `                <div class="pop-client-bar">
                  <div class="bar-image">
                    <img src="images/common.png">
                  </div>
                  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0">
                       <p><span>${data.activityType}</span> : </p>
                      </li>
                      <li style="font-size: 9pt">
                       <p><span style="color: #1abc9c">${data.oldValue}</span></p>
                      </li>
                    </ul>
                  </div>
                </div>`
  )
}

function appendLogMoveNode(data) {
  $("#logsMM").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>Root Idea of <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogAddNode(data) {
  $("#logsMM").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogAddTask(data) {
  $("#logsGantt").append(
    `                <div class="pop-client-bar">
                  <div class="bar-image">
                    <img src="images/common.png">
                  </div>
                  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.newValue}</span>To <span style="color: #1abc9c">${data.oldValue}</span></p> </li>
                    </ul>
                  </div>
                </div>`
  )
}

function appendLogDeleteTask(data) {
  $("#logsGantt").append(
    `                <div class="pop-client-bar">
                  <div class="bar-image">
                    <img src="images/common.png">
                  </div>
                  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0">
                       <p><span>${data.activityType}</span> : </p>
                      </li>
                      <li style="font-size: 9pt">
                       <p><span style="color: #1abc9c">${data.oldValue}</span></p>
                      </li>
                    </ul>
                  </div>
                </div>`
  )
}

function appendLogUpdateName(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Task Name : </span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogUpdateBED(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Planned End Date : </span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogUpdateBSD(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Planned Start Date :</span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogUpdateAED(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Actual End Date : </span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogUpdatePROG(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Progress Value :</span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogUpdateASD(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>Change Actual Start Date :</span></p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogCreateConnector(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

function appendLogDeleteConnector(data) {
  $("#logsGantt").append(`
  <div class="pop-client-bar">
  <div class="bar-image">
    <img src="images/common.png">
  </div>
  <div class="bar-data">
                    <ul>
                      <li>${data["user.firstName"]}  ${data["user.lastName"]}</li>
                      <li style="font-size: 9pt; margin-bottom: 0"> <p><span>${data.activityType}</span>: </p> </li>
                      <li> <p><span style="color: #1abc9c">${data.oldValue}</span>To <span style="color: #1abc9c">${data.newValue}</span></p> </li>
                    </ul>
  </div>
</div>
  `)
}

$("#page0").niceScroll("#logsMM", {
  cursorcolor: "#424242",
  cursorwidth: 0,
  zindex: -9999,
  cursoropacitymin: 0,
  cursoropacitymax: 0,
  bouncescroll: false,
});

$("#page1").niceScroll("#logsGantt", {
  cursorcolor: "#424242",
  cursorwidth: 0,
  zindex: -9999,
  cursoropacitymin: 0,
  cursoropacitymax: 0,
  bouncescroll: false,
});
