/**
* Name: angular-events-panel 
* Version: 0.1.0
* License: GPL-3
* Author: Melnik A.v
*/

(function(window, angular, _, moment, doc){
	'use strict';

	var module = angular.module('ui.events', ['ngTouch']);


	module.constant('timeline', [
		'00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
		'13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
	]);


	module.constant('config', {
		animate: {
			delay:    10,
			duration: 300,
			delta:    function(progress){
				return Math.pow(progress, 2);
			}
		}
	});


	module.directive('eventsTable', function($swipe, $filter, config, animate){
		return {
			templateUrl: 'app/shared/events/eventsView.Table.html',
			restrict: 'E',
			scope: {
				model: '='
			},
			link: function(scope, element, attrs){

				var slider = angular.element(doc.getElementsByClassName("js-nav-slider")),
					tliner = angular.element(doc.getElementsByClassName("js-nav-tliner")),
					branch = angular.element(doc.getElementsByClassName("js-nav-branch")),
					brmenu = angular.element(doc.getElementsByClassName("js-nav-brmenu")),
					eventv = angular.element(doc.getElementsByClassName("js-nav-event"));

				var timeline = $filter('toTimeline')(scope.model.branches),
					events   = $filter('toListEvents')(scope.model.branches),
					time_min = +_.min(timeline),
					time_max = +_.max(timeline);		

				$filter('toExtEvents')(events, time_min);

				scope.api = {
					timeline: timeline,
					events:   events,
					navigate: {
						pos: time_min,
						min: time_min,
						max: time_max,
						show: false,
						view: false,
						left: false,

						next: function(){
							this.change(this.pos + 3600);
							return false;
						},
						prev: function(){
							this.change(this.pos - 3600);
							return false;
						},
						change: function(val){
							console.log(this.pos);

							if (this.pos < val){
								var linesize = this.max - (3600 * 4);
								this.pos = val < linesize ? val : linesize;
							} else {
								this.pos = val > this.min ? val : this.min;
							}

							console.log(this.pos);
						},
						menu: function(){
							this.show = !this.show;
							return false;
						},
						close: function(){
							this.show = false;
							return false;
						},	
						hide: function(){
							this.view = false;
							this.left = true;
							return false;
						},
						hide_left: function(){
							this.hide();
						},
						hide_right: function(){
							this.view = false;
							this.left = false;
							return false;
						}
					},
					join: function(event){
						event.joined = !event.joined;
						return false;
					},
					hideall: function(){
						_.each(this.events, function(event){
							event.ext.show = false;
						});
					},
					show: function(event){
						this.hideall();
						this.navigate.view = true;
						event.ext.show = true;
					}
				};
				

				scope.$watch("api.navigate.pos", function(nVal, oVal){
					var from = oVal - scope.api.navigate.min,
					    to   = nVal - scope.api.navigate.min;
					    
					animate(_.extend(config.animate, {
						step: function(delta){
							slider.css({
							    left:  (from+(to-from)*delta)/3600*50  + 'px'
							});
							tliner.css({
							    left: -(from+(to-from)*delta)/3600*200 + 'px'
							});
							branch.css({
								left: -(from+(to-from)*delta)/3600*200 + 'px'
							});				
						}
					}));
				});



				scope.$watch("api.navigate.show", function(nVal, oVal){
					if (nVal === oVal) return;

					var move = function(delta){
						return nVal ? (1-delta) * (-200) + 'px' : delta * (-200) + 'px';
					}; 

					animate(_.extend(config.animate, {
						step: function(delta){
							brmenu.css({
								left: move(delta)
							});
						}
					}));
				});



				scope.$watch("api.navigate.view", function(nVal, oVal){
					if (nVal === oVal) return;

					var move = function(delta){
						if (scope.api.navigate.left){
							return nVal ? (1-delta) * (-1024) + 'px' : delta * 1024 + 'px';
						} else {
							return nVal ? (1-delta) * (-1024) + 'px' : delta * (-1024) + 'px';
						}
						
					};

					animate(_.extend(config.animate, {
						step: function(delta){
							eventv.css({
								right: move(delta)
							});
						}
					}));
				});

				
			}
		};
	});


	module.factory('animate', function(){
		return function (opts){
			var start = new Date();
			var timer = setInterval(function(){
				var progress = (new Date() - start) / opts.duration;

    			if (progress > 1){
    				progress = 1;
    			} 

    			opts.step(opts.delta(progress));

    			if (progress === 1){
    				clearInterval(timer);
    			}

			}, opts.delay || 10);
		};
	});


	module.filter('toTimeline', function(){
		return function(obj){
			obj = obj || [];

			var lst = _.chain(obj)
				.map(function(el){
					return el.events;
				}).flatten()
				.map(function(el){
					return [moment(el.start).format('X'), moment(el.end).format('X')];
				}).flatten()
				.union().value();

			return lst;
		};
	});


	module.filter('toTrust', function($sce){
		return function(text) {
            return $sce.trustAsHtml(text);
        };
	});


	module.filter('toListEvents', function(){
		return function(obj){
			obj = obj || [];
			
			var lst = _.chain(obj)
				.map(function(el){
					return el.events;
				}).flatten()
				.map(function(ev){
					return ev;
				}).flatten()
				.value();

			return lst;
		};
	});


	module.filter('toExtEvents', function(){
		return function(arr, min){
			arr = arr || [];

			_.each(arr, function(ev){
				var unix_end   = moment(ev.end).format('X'),
					unix_start = moment(ev.start).format('X'),
					width      = (unix_end - unix_start) / 3600 * 200,
					position   = (unix_start - min) / (3600 * 2) * 400;

				ev.ext = {
					show:     false,
					width:    width,
					position: position
				};
			});
		};
	});


	module.filter('split', function(){
		return function(arr, step){
			arr = arr || [];

			var min = +_.min(arr),
				max = +_.max(arr),
				lst = [];

			min += min % (+step);

			while(min < max){
				lst.push(min);
				min = min + step;
			}

			return lst;
		};
	});


	module.filter('hhmm', function() {
		return function(val){
			if ((typeof val) === "number"){
				return moment.unix(val).utc().format('H:mm');
			} else{
				return moment(val).utc().format('H:mm');
			}		
		};
	});


})(window, window.angular, window._, window.moment, window.document);