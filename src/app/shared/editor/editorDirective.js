(function(window, angular){
	'use strict';

	var module = angular.module('ui.editor', []);

	module.directive('editor', function(){
		return {
			restrict: 'A'
		};
	});

})(window, window.angular);