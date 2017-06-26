$(document).ready(function() {

  $(".menu").niceScroll("#scroller",{
    cursorcolor: "#424242",
    cursorwidth: 0,
    zindex:-9999,
    cursoropacitymin: 0,
    cursoropacitymax: 0,
    bouncescroll:false,
  }).resize;

  $(".container").niceScroll(".a4",{
    cursorcolor: "#424242",
    bouncescroll:false,
  }).resize;

  $(".rippler").rippler({
    effectClass      :  'rippler-effect'
    ,effectSize      :  0      // Default size (width & height)
    ,addElement      :  'div'   // e.g. 'svg'(feature)
    ,duration        :  400
  });

});

$(window).resize(function() {

  $(".container").niceScroll(".a4",{
    cursorcolor: "#424242",
    bouncescroll:false,
  }).resize;

  $(".menu").niceScroll("#scroller",{
    cursorcolor: "#424242",
    cursorwidth: 0,
    zindex:-9999,
    cursoropacitymin: 0,
    cursoropacitymax: 0,
    bouncescroll:false,
  }).resize;

});

function print() {

  $("#paper").printThis({
    debug: false,
    importCSS: true,
    importStyle: true,
    printContainer: true,
    pageTitle: "",
    removeInline: false,
    printDelay: 333,
    header: null,
    footer: null,
    base: false,
    formValues: false,
    canvas: false
  });

}

$(".pullbutton").click(function () {

  $(".a4").toggleClass("extend");

  // $(".container").animate({ scrollTop: $('.container').prop("scrollHeight")}, 1000);

});
