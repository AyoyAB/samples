'use strict';

angular.module('fidoApp', ['ngRoute']).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/index'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
