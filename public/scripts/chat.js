(function() {

    var claerResizeScroll, conf, insertI, lol;

    conf = {
        cursorcolor: "#696c75",
        cursorwidth: "4px",
        cursorborder: "none"
    };

    lol = {
        cursorcolor: "#cdd2d6",
        cursorwidth: "4px",
        cursorborder: "none"
    };

    claerResizeScroll = function() {
        $("#texxt").val("");
        $(".messages").getNiceScroll(0).resize();
        return $(".messages").getNiceScroll(0).doScrollTop(999999, 999);
    };

    insertI = function() {
        var innerText, otvet;
        innerText = $.trim($("#texxt").val());

          if (innerText !== "") {

            $(".messages").append(
              `<li class="i">
                  <div class="head">
                    <span class="time">${moment().format("h:mm a")}, Today</span>
                    <span class="name">${app.get('user').firstName+" "+app.get('user').lastName}</span>
                  </div>
                   <div class="message">${innerText}</div>
                </li>`
            );

            toBottom();
            claerResizeScroll();

          }

    };

    $(document).ready(function() {
        $(".list-friends").niceScroll(conf);
        $(".messages").niceScroll(lol);

        $("#texxt").keypress(function(e) {
            if (e.keyCode === 13) {
              if ($.trim($("#texxt").val()) !== "") {
                sendMessages();
                insertI();
              }
              return false;
            }
        });

        $(".send").click(function() {
          if ($.trim($("#texxt").val()) !== "") {
            sendMessages();
            insertI();
          }
        });

    });

}).call(this);

$( document ).ready(function() {
    $('.messages').scrollTop($('.messages')[0].scrollHeight - $('.messages')[0].clientHeight);
});

$( ".pullbutton" ).click(function() {

    $( this ).toggleClass( "clicked" );
    $( ".ui").toggleClass( "pushchat" );

  toBottom();

});

function sendMessages() {

  innerText = $.trim($("#texxt").val());

  app.service('messages').create({
    projectId: getQueryVariable("id"),
    messageValue: innerText,
  })
    .catch(error => console.log(error));

  send(innerText);

};


