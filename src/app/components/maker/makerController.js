(function(window, angular){
	'use strict';

	var module = angular.module('controllers', ['services']);

	module.controllers('makerController', function($scope){
		$scope.events = {};
	});

	module.controllers('demoController', function($scope){
		$scope.events = {};
	});

})(window, window.angular);