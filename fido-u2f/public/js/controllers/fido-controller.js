'use strict';

angular
    .module('fidoApp')
    .controller('FidoController', ['FidoService', function(FidoService) {
        var self = this;

        self.isFidoU2FAddOnInstalled = function() {
            return FidoService.isFidoU2FAddOnInstalled();
        }
    }]);
