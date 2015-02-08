(function() {
    'use strict';

    angular
        .module('fidoApp')
        .controller('FidoController', [
            'CryptoService', 'FidoService', 'StorageService', function(CryptoService, FidoService, StorageService) {
                var vm = this;

                vm.isWebCryptoSupported = function() {
                    return CryptoService.isWebCryptoSupported();
                };

                vm.isWebStorageSupported = function() {
                    return StorageService.isSupported();
                };

                vm.isFidoU2FAddOnInstalled = function() {
                    return FidoService.isFidoU2FAddOnInstalled();
                };

                vm.generateChallenge = function() {
                    return CryptoService.generateChallenge();
                };

                vm.register = function(challenge, appId) {
                    return FidoService.register(challenge, appId);
                };
        }]);
})();
