(function(window, angular, document){

	var app = angular.module('app', ['ui.events', 'ui.editor', 'controllers', 'services' ]);

    angular.bootstrap(document, ['app']);

})(window, window.angular, window.document);