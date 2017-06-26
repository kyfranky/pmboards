var constraints = {
  audio: true
};

navigator.mediaDevices.getUserMedia(constraints)
  .then(function (mediaStream) {

    var mediaRecorder = new MediaRecorder(mediaStream);
    let onstart = false;

    mediaRecorder.onstart = function (e) {
      onstart = true;
      this.chunks = [];
    };
    mediaRecorder.ondataavailable = function (e) {
      this.chunks.push(e.data);
    };
    mediaRecorder.onstop = function (e) {
      var blob = new Blob(this.chunks, {
        'type': 'audio/ogg; codecs=opus'
      });
      console.log(blob.size);
      onstart = false;
      socket.emit('radio', blob);
      insertVoice();
    };

    let timeout;

    function startTimeout() {
      timeout = window.setTimeout(End, 2000);
    }

    function clearTimeout() {
      window.clearTimeout(timeout);
    }

    function Start() {
      console.log("start")
      console.log(mediaRecorder.state)
      mediaRecorder.start();
    }

    function End() {
      console.log("stop")
      console.log(mediaRecorder.state)
      if (mediaRecorder.state === 'inactive') {
        return
      }
      mediaRecorder.stop();
    }

    Mousetrap.bind('ctrl+b', function (e) {
      clearTimeout();
      window.setTimeout(End, 250);
      e.preventDefault();
    }, 'keyup');

    Mousetrap.bind('ctrl+b', function (e) {
      e.preventDefault();
      clearTimeout();
      startTimeout();
      if (onstart) {
        return;
      }
      Start()
    }, 'keydown');

  })
  .catch(function (err) {
    console.log(err.name + ": " + err.message);
    console.log(err);
  });

socket.on('voice', function (arrayBuffer,id) {

  var blob = new Blob([arrayBuffer], {
    'type': 'audio/ogg; codecs=opus'
  });
  if (blob.size === 0) {
    return
  }

  const data = '7e4b92895c8827840b68e6d7b7663f83';

  leftVoiceMessage(data, id);

  var audio = document.createElement('audio');

  audio.src = window.URL.createObjectURL(blob);

  audio.play().catch(function (err) {
      console.log(err.name + ": " + err.message)
    });

});

insertVoice = function() {

    $(".messages").append(
      `<li class="i">
                  <div class="head">
                    <span class="time">${moment().format("h:mm a")}, Today</span>
                    <span class="name">${app.get('user').firstName+" "+app.get('user').lastName}</span>
                  </div>
                   <div class="message" style="font-size: 40px; padding: 10px"><span class="fa fa-volume-up"></span> </div>
                </li>`
    );

    toBottom();

};

function leftVoiceMessage (data, id) {

  app.service('users').get(id)
    .then(respond => {
      $(".messages").append(
        `<li class="friend-with-a-SVAGina">
      <div class="head">
      <span class="name">${respond.firstName}</span>
      <span class="time">${moment().format("h:mm a")}, Today</span>
      </div>
        <div class="message" style="font-size: 40px; padding: 10px"><span class="fa fa-volume-up"></span> </div>
      </li>`
      );
    });

  toBottom();

}
