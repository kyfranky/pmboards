  var whatTab;

$("ul li").click(function(e) {

  var whatPages;

  // make sure we cannot click the slider
  if ($(this).hasClass('slider')) {
    return;
  }

  if (whatTab == undefined) {
    whatTab = 0;
  }

  whatPages = "#page"+whatTab;
  $( whatPages ).toggleClass( "shows" );
  console.log("1 " +whatPages);


  /* Add the slider movement */

  // what tab was pressed
  whatTab = $(this).index();

  whatPages = "#page"+whatTab;
  $( whatPages ).toggleClass( "shows" );
  console.log("2 " +whatPages);

  // Work out how far the slider needs to go
  var howFar = $( ".li2" ).width() * whatTab;

  $(".slider").css({
    left: howFar + "px"
  });

  /* Add the ripple */

  // Remove olds ones
  $(".ripple").remove();

  // Setup
  var posX = $(this).offset().left,
    posY = $(this).offset().top,
    buttonWidth = $(this).width(),
    buttonHeight = $(this).height();

  // Add the element
  $(this).prepend("<span class='ripple'></span>");

  // Make it round!
  if (buttonWidth >= buttonHeight) {
    buttonHeight = buttonWidth;
  } else {
    buttonWidth = buttonHeight;
  }

  // Get the center of the element
  var x = e.pageX - posX - buttonWidth / 2;
  var y = e.pageY - posY - buttonHeight / 2;













  // Add the ripples CSS and start the animation
  $(".ripple").css({
    width: buttonWidth,
    height: buttonHeight,
    top: y + 'px',
    left: x + 'px'
  }).addClass("rippleEffect");
});



$( window ).resize(function() {

  // make sure we cannot click the slider
  if (whatTab == undefined) {
    whatTab = 0;
  }

  /* Add the slider movement */

  // Work out how far the slider needs to go
  var howFar = $( ".li2" ).width() * whatTab;

  $(".slider").css({
    left: howFar + "px"
  });

});

