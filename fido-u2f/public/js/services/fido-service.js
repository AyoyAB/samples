'use strict';

angular
    .module('fidoApp')
    .factory('FidoService', ['$window', function($window) {
        function isFidoU2FAddOnInstalled() {
            return $window['u2f'] !== undefined;
        }

        return {
            isFidoU2FAddOnInstalled: isFidoU2FAddOnInstalled
        };
    }]);
