
/*
 * Timeline - for jQuery 1.3+
 * http://codecanyon.net/item/timetable-for-events-with-php-jquery-and-xml/546355?ref=RikdeVos
 *
 * Version: 1.2 (Mar 14 2012)
 */

(function($) { 
	$(document).ready(function(){

    //Scroll to left true or false
    var scrollleft = true;


	$(".tl_timeline").each(function(){

		var $tl = $(this),
			parent_width = parseFloat($tl.parent().css('width')),
			too_wide = false,
			increment = parseFloat($tl.attr('data-increment')),
			interval = increment;

		$tl.find('.tl_date_title').click(function() {
			$tl.find('.tt_date_title_picker').toggle();
			return false;
		})
		$tl.find('.tt_date_title_picker').datepicker({
			maxDate: $tl.find('.tt_date_title_picker').attr('data-maxdate'),
			minDate: $tl.find('.tt_date_title_picker').attr('data-mindate'),
			dateFormat: 'dd/mm/yy',
			onSelect: function(dateText) {
				var dates = dateText.split('/'),
					link = $(this).attr('data-link');

				link = link.replace('tl_day_to_load', dates[0]);
				link = link.replace('tl_month_to_load', dates[1]);
				link = link.replace('tl_year_to_load', dates[2]);
				window.top.location = link;
			}
		})

		if(isMobile()) {
			$tl.addClass('tl_is_mobile');
		}

		//If the timeline is wider than number of hours
		if(interval == 1) {

			if($tl.find(".tl_time_indicator li").length*100 < parseFloat($tl.parent().css('width'))-100) {
				$tl.attr('data-hours', (parent_width-200) / 50 / parseFloat($tl.attr('data-increment')));
				too_wide = true;
			}
		}else {

			var plus = 100;

			if(interval == 4) {
				var plus = 300;
			}
			
			//if(($tl.find(".tl_time_indicator li").length-2) * 100 < parseFloat($tl.parent().css('width'))) {
			if(($tl.find(".tl_time_indicator li").length) * 100 < parseFloat($tl.parent().css('width')) - 200 + plus) {
				$tl.attr('data-hours', (parent_width-200) / 50 / parseFloat($tl.attr('data-increment')));
				too_wide = true;
			}
		}

		var animating = false,
			hover = false,
			refresh_height_interval,
			expand = true,
			parent_width = parseFloat($tl.parent().css('width')),
			grid_width = parent_width-200,
			num_hours = parseFloat($tl.attr('data-hours')),
			num_blocks = num_hours*increment,
			scroll_blocks = 0,
			max_scroll_blocks = num_blocks-grid_width/50,
			scroll_blocks_interval = Math.round(grid_width/100)-1,
			autoscroll = ($tl.attr('data-autoscroll') == 'true') ? true : false,
			firefox = (navigator.userAgent.indexOf("Firefox")!=-1)?true:false;

		//Scroll function
		$tl.mousewheel(function(event, delta) {
			if(delta > 0 && $tl.attr('data-expand') == 'true') {
				//Scroll up
				scroll_blocks = scrollToPrevious(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, true);
				updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);
				return false;
			}else if(delta < 0 && $tl.attr('data-expand') == 'true') {
				//Scroll down
				scroll_blocks = scrollToNext(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, true);
				updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);
				return false;
			}
		});

		//Fix some width issues
		fixBrowserCompatibilityIssues($tl);

		//Enable expanding
		$tl.attr('data-expand', 'true');

		// Print function colorbox
		// $tl.find(".tl_print[data-printbox=true]").colorbox({width:"850px", height:"80%", iframe:true});

		//Program function
		//Add dots to all active programs
		$tl.find(".tl_program_button").click(function() {
			var $this = $(this),
				value = ($this.attr('data-val') == 'true')?true:false,
				evt = $this.parent().parent('.tl_event_details').attr('data-event');
			
			if(value) {
				$this.html($this.attr('data-add-text'));
				$this.attr('data-val', 'false');
				$this.parent().parent().parent().parent().find('.tl_event[data-event='+evt+'] .tl_event_program_indicator').fadeOut(250, function(){
					$(this).removeClass('tl_active');
				});

				//Remove from cookie
				var eventid = $this.attr('data-eventid');

				if($.cookie('program')) {
					var data = convertCookieToArray($.cookie('program'));
					var found = 'false';
					for (var i = 0; i < data.length; i++) {

						var this_data = data[i];
						var event_prefix = '0';
						var event_eventid = this_data[1];


						if(event_eventid == eventid) {
							data.splice(i,1);
							found = 'true';
							break;
						}

					};
					data.sort();
					$.cookie('program', convertArrayToCookie(data), { path: '/' });
				}
			}else {
				$this.html($this.attr('data-remove-text'));
				$this.attr('data-val', 'true');
				$this.parent().parent().parent().parent().find('.tl_event[data-event='+evt+'] .tl_event_program_indicator').addClass('tl_active').hide().fadeIn(250);

				//Add to cookie
				var eventid = $this.attr('data-eventid'),
					data = [];

				if($.cookie('program')) {
					var data = convertCookieToArray($.cookie('program'));
				}
				data.push(['0',eventid]);
				$.cookie('program', convertArrayToCookie(data), { path: '/' });
			}

			return false;
		});



		//Set the inner & outer widths for the timeline
		$tl.find(".tl_the_timeline").css('width', grid_width-1);
		$tl.find(".tl_the_timeline_content").css('width', num_blocks*50);

		//Set the width for the time slider
		$tl.find(".tl_slidable_slider").css('width', (grid_width)/50/increment*53);

		$tl.find(".tl_slidable").css('width', num_blocks*50);

		$tl.find(".tl_time_indicator ul li:first").css('border-left', 0);

		//Fix smaller widths
		
		if(too_wide) { //Smaller then max
			$tl.find('.tl_slidable_slider').css('width', '100%').remove();
			if(interval == 4) {
				$tl.find('.tl_time_indicator li:last').remove();
			}
		}

		//Scrolling code
		$tl.find(".tl_next").click(function(){

			//Scroll to the next location
			scroll_blocks = scrollToNext(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, false);

			//Hide or show the buttons
			updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);

			//Return the link false
			return false;

		}).hide(); //Hide the button

		$tl.find(".tl_previous").click(function(){

			//Scroll to the next location
			scroll_blocks = scrollToPrevious(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, false);

			//Hide or show the buttons
			updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);

			//Return the link false
			return false;

		}).hide(); //Hide the button

		if(scroll_blocks == 0) {

			//Hide the previous button
			$tl.find(".tl_previous").hide();
		}

		if(scroll_blocks == max_scroll_blocks) {

			//Hide the next button
			$tl.find(".tl_next").hide();
		}

		//When someone hovers over the timeline
		$tl.hover(function(){

			//Set hover to true
			hover = true;

			//Hide or show the buttons
			updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);
		}, function(){

			//Set hover to true
			hover = false;

			//Hide or show the buttons
			updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);
		});

		//When someone clicks on an event
		$tl.find(".tl_event").click(function(){

			//If there is an animation currently going on, return false
			if(animating) { return; }

			//Cache the element
			var $this = $(this);

			if($this.attr('data-show-description') == 'false') {
				return;
			}

			//Update the data-info-showing attribute
			if($this.attr('data-info-showing') === 'true') {

				//Hide the info
				slideInfoUp($this, $tl);

			}else {

				//Hide all the info
				slideAllInfoUp($tl);

	             if (autoscroll) {
	                //Scroll to position
	                var bp = parseFloat($this.css('left'))/50;

	                scroll_blocks = bp;
	                if(scroll_blocks >= max_scroll_blocks) {
	                    scroll_blocks = max_scroll_blocks;
	                }
	                if(scroll_blocks <= 0) {
	                    scroll_blocks = 0;
	                }
	              }
				//Update the position
				updateScrollBlocks(scroll_blocks, increment, $tl, false);
				updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover);

				//Slide the info box down
				slideInfoDown($this, $tl);
			}

		});
	});

	//Function to hide or view the next and previous buttons
	function updateNavigationButtons($tl, scroll_blocks, max_scroll_blocks, hover) {

		//Cache next and previous buttons
		var $next = $tl.find(".tl_next"),
			$previous = $tl.find(".tl_previous");

		//If user is not hovered
		if(!hover) {

			//Hide both buttons
			$next.fadeOut(150);
			$previous.fadeOut(150);
			return;
		}

		//If at the end
		if(scroll_blocks >= max_scroll_blocks) {

			//Hide the next button
			$next.fadeOut(150);
		}else {

			//Dhow the next button
			$next.fadeIn(150);
		}

		//If at beginning
		if(scroll_blocks <= 0) {

			//Hide previous button
			$previous.fadeOut(150);
		}else {

			//Show previous button
			$previous.fadeIn(150);
		}
	}


	//Function to scroll to the right
	function scrollToNext(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, quick) {

		//Add the interval to the scroll blocks
		scroll_blocks += scroll_blocks_interval;

		//If bigger than max
		if(scroll_blocks >= max_scroll_blocks) {

			//It is max
			scroll_blocks = max_scroll_blocks;
		}

		//Update the position
		updateScrollBlocks(scroll_blocks, increment, $tl, quick);

		//Hide all the info
		slideAllInfoUp($tl);

		return scroll_blocks;
	}

	//Function to scroll to the left
	function scrollToPrevious(scroll_blocks, max_scroll_blocks, scroll_blocks_interval, increment, $tl, quick) {

		//Subtract the interval to the scroll blocks
		scroll_blocks -= scroll_blocks_interval;

		//If smaller than 0
		if(scroll_blocks <= 0) {

			//It is 0
			scroll_blocks = 0;
		}

		//Update the position
		updateScrollBlocks(scroll_blocks, increment, $tl, quick);

		//Hide all the info
		slideAllInfoUp($tl);

		return scroll_blocks;
	}

	//Function to scroll
	function updateScrollBlocks(scroll_blocks, increment, $tl, quick) {
		var speed = 'medium';
		if(quick) {
			speed = 100;
		}
		//Find all the scrollers
		$tl
			.find(".tl_slidable")

			//Update the position
			.stop().animate({ left: -50*scroll_blocks }, speed);

		//Update indicator
		var left = scroll_blocks/increment*53;
		$tl.find(".tl_slidable_slider").stop().animate({'left': left}, speed);

	}

	//Function to hide all the info
	function slideAllInfoUp($tl) {
		//Find all infos
		var all = $tl.find(".tl_event");
		all.each(function(){

			//If the info is open
			if($(this).attr('data-info-showing') === 'true') {

				//Hide the info
				slideInfoUp($(this), $tl);

			}
		});
	}

	//Function to show the info box
	function slideInfoDown($this, $tl) {

		//Get the event id and location id
		var data_event = $this.attr('data-event'),
			data_location = $this.attr('data-location');

		//Set the showing to true
		$this.attr('data-info-showing', 'true');

		//Set the animating to true
		animating = true;

		$tl.attr('data-expand', 'false');

		//Find the info box and location box
		var $info = $tl.find(".tl_event_details[data-event="+data_event+"]"),
			$location = $tl.find(".tl_the_location[data-location="+data_location+"]");

		//Slide the info down
		$info.slideDown(200, function() {

			//Set the animating back to false
			animating = false;

		});
	}

	//Function to hide the info box
	function slideInfoUp($this, $tl) {

		//If the info is not showing
		if($this.attr('data-info-showing') == true) {

			//Stop
			return;
		}

		//Set the animating to true
		animating = true;

		$tl.attr('data-expand', 'true');

		//Get the event id and location id
		var data_event = $this.attr('data-event'),
			data_location = $this.attr('data-location');

		//Set the showing to false
		$this.attr('data-info-showing', 'false');

		//Find the info box and location box
		var $info = $tl.find(".tl_event_details[data-event="+data_event+"]"),
			$location = $tl.find(".tl_the_location[data-location="+data_location+"]");

		//Slide the info down
		$info.slideUp(200, function() {

			//Set the animating back to false
			animating = false;
		});

	}

	//Function to fix browser issues
	function fixBrowserCompatibilityIssues($tl) {

		//IE
		var ua = navigator.userAgent;
		var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null) {
			rv = parseFloat(RegExp.$1);
			if(rv == 8 || rv == 7) {
				$tl.find(".tl_previous").css('left', '180px');
			}
		}

	}

	function array2json(arr) {
	    var parts = [];
	    var is_list = (Object.prototype.toString.apply(arr) === '[object Array]');

	    for(var key in arr) {
	    	var value = arr[key];
	        if(typeof value == "object") { //Custom handling for arrays
	            if(is_list) parts.push(array2json(value)); /* :RECURSION: */
	            else parts[key] = array2json(value); /* :RECURSION: */
	        } else {
	            var str = "";
	            if(!is_list) str = '"' + key + '":';

	            //Custom handling for multiple data types
	            if(typeof value == "number") str += value; //Numbers
	            else if(value === false) str += 'false'; //The booleans
	            else if(value === true) str += 'true';
	            else str += '"' + value + '"'; //All other things
	            // :TODO: Is there any more datatype we should be in the lookout for? (Functions?)

	            parts.push(str);
	        }
	    }
	    var json = parts.join(",");

	    if(is_list) return '[' + json + ']';//Return numerical JSON
	    return '{' + json + '}';//Return associative JSON
	}

		function convertCookieToArray(data) {
			var data_array = data.split(',');
			var new_array = [];
			for(var i = 0; i < data_array.length; i++) {
				var x = data_array[i].split(':');
				new_array.push([x[0],x[1]]);
			}
			return new_array;
		}

		function convertArrayToCookie(data) {
			var str = '';
			for(var i = 0; i < data.length; i++) {
				var loop_data = data[i];
				str += loop_data[0] + ':' + loop_data[1] + ',';
			}
			return str.substring(0, str.length-1);
		}





	if($.cookie('program')) {
		var program = convertCookieToArray($.cookie('program'));
		
		for (var i = 0; i < program.length; i++) {
			var this_data = program[i];
			var event_prefix = this_data[0];
			var event_eventid = this_data[1];

			$("a[data-eventid="+event_eventid+"]").each(function(){
				var $this = $(this);
				if($this.attr('data-eventid') == event_eventid) {
					$this.html($this.attr('data-remove-text'));
					$this.attr('data-val', 'true');
					$this.parent().parent().parent().find('.tl_event[data-eventid='+event_eventid+'] .tl_event_program_indicator').addClass('tl_active');
				}else {

				}
			});
		};
		
	}

});

	//Plugin to detect a scrolldown and scrollup
	var types = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
	    for ( var i=types.length; i; ) {
	        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
	    }
	}

	$.event.special.mousewheel = {
	    setup: function() {
	        if ( this.addEventListener ) {
	            for ( var i=types.length; i; ) {
	                this.addEventListener( types[--i], handler, false );
	            }
	        } else {
	            this.onmousewheel = handler;
	        }
	    },

	    teardown: function() {
	        if ( this.removeEventListener ) {
	            for ( var i=types.length; i; ) {
	                this.removeEventListener( types[--i], handler, false );
	            }
	        } else {
	            this.onmousewheel = null;
	        }
	    }
	};

	$.fn.extend({
	    mousewheel: function(fn) {
	        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
	    },

	    unmousewheel: function(fn) {
	        return this.unbind("mousewheel", fn);
	    }
	});


	function handler(event) {
	    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
	    event = $.event.fix(orgEvent);
	    event.type = "mousewheel";

	    // Old school scrollwheel delta
	    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
	    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }

	    // New school multidimensional scroll (touchpads) deltas
	    deltaY = delta;

	    // Gecko
	    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
	        deltaY = 0;
	        deltaX = -1*delta;
	    }

	    // Webkit
	    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
	    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }

	    // Add event and delta to the front of the arguments
	    args.unshift(event, delta, deltaX, deltaY);

	    return ($.event.dispatch || $.event.handle).apply(this, args);
	}

	function isMobile(){
	    return (
	        (navigator.platform.indexOf("iPhone") != -1) ||
	        (navigator.platform.indexOf("iPad") != -1) ||
	        (navigator.platform.indexOf("iPod") != -1)
	    );
	}

})(jQuery);


