/**
 * Created by franky on 2/5/2017.
 */
'use strict';

$(document).ready(function () {

  var openPopupOne  = $('#openPopupOne'),
    overlay     = $('.overlay'),
    popup       = $('.popup'),
    closePopUpOne = $('.overlay'),
    sumbit = $('.submit');

  // main style action

  openPopupOne.on('click', function () {
    overlay.fadeIn();
    popup.show(0, function () {
      $(this).toggleClass('oneOpen');
      $(".popup").height($('#msform').outerHeight( true ));
    });
  });

  closePopUpOne.on('click', function () {
    overlay.fadeOut();
    popup.toggleClass('oneOpen').delay(700).promise().done(function () {
      $(this).hide();
    });
  });

});

$(".container").on('mouseenter','.project',function() {
  $(this).toggleClass('selected');
});

$('.container').on('mouseleave','.project',function() {
  $(this).toggleClass('selected');
});

var current_fs, next_fs, previous_fs; //fieldsets
var left, opacity, scale; //fieldset properties which we will animate
var animating; //flag to prevent quick multi-click glitches

$('.next').click(function(){

  let pname = $("input[name=pname]").val();
  let pdesc = $("input[name=PDesc]").val();

  if(!pname || !pdesc){

    return false

  }
  else {

    if(animating) return false;
    animating = true;

    current_fs = $(this).parent();
    next_fs = $(this).parent().next();

    //activate next step on progressbar using the index of next_fs
    $("#progressbar").find("li").eq($("fieldset").index(next_fs)).addClass("active");

    //show the next fieldset
    next_fs.show();
    //hide the current fieldset with style
    current_fs.animate({opacity: 0}, {
      step: function(now, mx) {
        //as the opacity of current_fs reduces to 0 - stored in "now"
        //1. scale current_fs down to 80%
        scale = 1 - (1 - now) * 0.2;
        //2. bring next_fs from the right(50%)
        left = (now * 50)+"%";
        //3. increase opacity of next_fs to 1 as it moves in
        opacity = 1 - now;
        current_fs.css({
          'transform': 'scale('+scale+')',
          'position':'absolute'
        });
        next_fs.css({'left': left, 'opacity': opacity});

        var heightcalc =  $('#msform').outerHeight( true );
        heightcalc  -=  $('#msform').outerHeight();
        heightcalc  +=  $('#progressbar').outerHeight( true );
        heightcalc  +=  next_fs.outerHeight( true );

        $(".popup").height(heightcalc);

      },
      duration: 600,
      complete: function(){

        current_fs.css({
          'position':'relative'
        });

        current_fs.hide();

        animating = false;
      },
      //this comes from the custom easing plugin
      easing: 'easeInOutBack'
    });
  }

});

$(".previous").click(function(){
  if(animating) return false;
  animating = true;

  current_fs = $(this).parent();
  previous_fs = $(this).parent().prev();

  //de-activate current step on progressbar
  $("#progressbar").find("li").eq($("fieldset").index(current_fs)).removeClass("active");

  //show the previous fieldset
  previous_fs.show();
  //hide the current fieldset with style
  current_fs.animate({opacity: 0}, {
    step: function(now, mx) {
      //as the opacity of current_fs reduces to 0 - stored in "now"
      //1. scale previous_fs from 80% to 100%
      scale = 0.8 + (1 - now) * 0.2;
      //2. take current_fs to the right(50%) - from 0%
      left = ((1-now) * 50)+"%";
      //3. increase opacity of previous_fs to 1 as it moves in
      opacity = 1 - now;
      current_fs.css({'left': left});

      previous_fs.css({'transform': 'scale('+scale+')', 'opacity': opacity, 'position':'absolute'});

      var heightcalc =  $('#msform').outerHeight( true );
      heightcalc  -=  $('#msform').outerHeight();
      heightcalc  +=  $('#progressbar').outerHeight( true );
      heightcalc  +=  previous_fs.outerHeight( true );

      $(".popup").height(heightcalc);

    },
    duration: 600,
    complete: function(){

      previous_fs.css({
        'position':'relative'
      });

      current_fs.css({
        'position':'relative'
      });

      current_fs.hide();

      animating = false;
    },
    //this comes from the custom easing plugin
    easing: 'easeInOutBack'
  });


});
