(function(window, angular){
	'use strict';

	var module = angular.module('controllers', ['services']);

	module.controller('demoController', function($scope, events){
		$scope.events = events;
	});

})(window, window.angular);
