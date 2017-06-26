let findQueryFriend;
let friendQuery;
let tempCompare = null;

$("#search-friend").keyup(function () {

  if ($("#search-friend").val().length != 0) {
    friendQuery = "%" + $("#search-friend").val() + "%";
    findFriend(friendQuery)
  }
  else if ($("#search-friend").val().length == 0) {
    findFriends()
  }

});

$("#search-find").keyup(function () {

  if(tempCompare === $("#search-find").val()){
    return;
  }
  else {
    console.log(tempCompare)
    tempCompare = $("#search-find").val();
  }

  if ($("#search-find").val().length > 1) {
    findQueryFriend = "%" + $("#search-find").val() + "%";
    findUsers(findQueryFriend)
  }
  else {
    findQueryFriend = " ";
    findUsers(findQueryFriend)
  }

});

$(document).on('click', '.bar-button .addbutton', function (e) {

  let idtoAdd = e.target.value;

  app.service('friends').create({
    invitedId: idtoAdd,
    status: 0
  })
    .then(() => {
      findUsers(findQueryFriend);
    })
    .catch(function (error) {
      console.log(error)
    });

});

$(document).on('click', '.bar-button .bar-btn-acc', function (e) {

  let idtoPatch = e.target.value;

  app.service('friends').patch(idtoPatch, {
    status: 1
  })
    .then(() => {
      findFriendInvitation();
      findFriends();
    })
    .catch(function (error) {
      console.log(error)
    });

});

$(document).on('click', '.bar-button .bar-btn-dec', function (e) {

  let idtoRemove = e.target.value;

  app.service('friends').remove(idtoRemove)
    .then(findFriendInvitation())
    .catch(function (error) {
      console.log(error)
    });

});

function findUsers(userName) {

  $('#search-result').empty();

  app.service('users').find({
    query: {
      uName: userName
    }
  })
    .then(page => {
      const data = page.data;

      data.sort(byName);

      data.forEach(function (data) {

        if (data.Inviter.length !== 0 || data.Invited.length !== 0) {
          appendSearch(data)
        }
        else {
          appendSearchNon(data)
        }

      });

    })
    .catch(function (error) {
      console.log(error)
    });

}

function findFriends() {

  $("#friend-result").empty();

  app.service('users').find({

    query: {
      includefriends: 1,
    }

  })
    .then(page => {

      const friend = processResult(page);

      friend.forEach(appendFriend);


    })
    .catch(function (error) {
      console.log(error)
    });
}

function findFriend(Query) {

  $("#friend-result").empty();

  app.service('users').find({

    query: {
      includefriends: 1,
      uName: Query
    }

  })
    .then(page => {

      const friend = processResult(page);

      friend.forEach(appendFriend)

    })
    .catch(function (error) {
      console.log(error)
    });

}

function findFriendInvitation() {

  $("#invited-result").empty();

  app.service('users').find({
    query: {
      includeInvitation: 1
    }
  })

    .then(page => {

      let inviter = page.data[0].Invited;

      console.log(inviter);

      inviter.forEach(appendInvitation)

    })

    .catch(function (error) {
      console.log(error)
    });


}

function appendFriend(data) {
  $("#friend-result").append(
    `<div class="pop-client-bar">
              <div class="bar-image">
                <img src="images/common.png">
              </div>
              <div class="bar-data">
                <ul>
                  <li>${data.firstName} ${data.lastName} </li>
                  <li style="font-size: 9pt">
                  <p><span class="fa fa-briefcase" aria-hidden="true"></span>${data.profession}</p>
                  <p><span class="fa fa-building" aria-hidden="true"></span>${data.company}</p>
                </ul>
              </div>
`)
}

function appendInvitation(data) {

  $("#invited-result").append(
    `
            <div class="pop-client-bar">

              <div class="bar-image">
                <img src="images/common.png">
              </div>

              <div class="bar-data">
                <ul>
                  <li>${data.firstName} ${data.lastName} </li>
                  <li style="font-size: 9pt">
                  <p><span class="fa fa-briefcase" aria-hidden="true"></span>${data.profession}</p>
                  <p><span class="fa fa-building" aria-hidden="true"></span>${data.company}</p>
                </ul>
              </div>

              <div class="bar-button">
                <button value=${data.friends.id} class="fa fa-check-circle bar-btn-acc"></button>
                <button value=${data.friends.id} class="fa fa-times-circle bar-btn-dec"></button>
              </div>

            </div>`
  )

}

function appendSearchNon(data) {

  $('#search-result').append(
    `<div class="pop-client-bar">

              <div class="bar-image">
                <img src="images/common.png">
              </div>

              <div class="bar-data">
                <ul>
                  <li>${data.firstName} ${data.lastName} </li>
                  <li style="font-size: 9pt">
                  <p><span class="fa fa-briefcase" aria-hidden="true"></span>${data.profession}</p>
                  <p><span class="fa fa-building" aria-hidden="true"></span>${data.company}</p>
                </ul>
              </div>

              <div class="bar-button">
                <button value= ${data.id} class="fa fa-plus-circle addbutton"></button>
              </div>

            </div>`
  )

}

function appendSearch(data) {

  $('#search-result').append(
    `<div class="pop-client-bar">

              <div class="bar-image">
                <img src="images/common.png">
              </div>

              <div class="bar-data">
                <ul>
                  <li>${data.firstName} ${data.lastName} </li>
                  <li style="font-size: 9pt">
                  <p><span class="fa fa-briefcase" aria-hidden="true"></span>${data.profession}</p>
                  <p><span class="fa fa-building" aria-hidden="true"></span>${data.company}</p>
                </ul>
              </div>

              <div class="bar-button">

              </div>

            </div>`
  )

}

function processResult(result) {

  const data = result.data[0];

  const inviter = data.Inviter;
  const invited = data.Invited;
  const friend = [];

  inviter.forEach(function (data) {
    friend.push(data)
  });
  invited.forEach(function (data) {
    friend.push(data)
  });

  friend.sort(byName);

  return friend;

}

function byName(a, b) {
  const fullname1 = a.firstName.toLowerCase() + " " + a.lastName.toLowerCase();
  const fullname2 = b.firstName.toLowerCase() + " " + b.lastName.toLowerCase();

  if (fullname1 < fullname2)
    return -1;
  if (fullname1 > fullname2)
    return 1;
  return 0;
}



